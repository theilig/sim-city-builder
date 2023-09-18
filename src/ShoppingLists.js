import React, {useRef, useState} from 'react';
import ShoppingList from "./ShoppingList";

export function removeList(shoppingLists, index, prioritySwitches) {
    let newPrioritySwitches = []
    prioritySwitches.forEach(s => {
        if (s.above !== index && s.below !== index) {
            let newAbove = s.above
            let newBelow = s.below
            if (newAbove > index) {
                newAbove -= 1
            }
            if (newBelow > index) {
                newBelow -= 1
            }
            newPrioritySwitches.push({above: newAbove, below: newBelow})
        }
    })
    let newShoppingLists = [...shoppingLists]
    newShoppingLists.splice(index, 1)
    return {shoppingLists: newShoppingLists, prioritySwitches: newPrioritySwitches}
}

export function addList(shoppingLists, goodsNeeded, region, prioritySwitches) {
    let newShoppingLists = [...shoppingLists]
    newShoppingLists.push({items: goodsNeeded, region: region});
    return {shoppingLists: newShoppingLists, prioritySwitches: prioritySwitches}
}

export function updatePriorityOrder(localPriorityOrder, prioritySwitches) {
    let remaining = [...localPriorityOrder]
    let finalOrder = []
    let remainingSwitches = []
    if (prioritySwitches) {
        remainingSwitches = [...prioritySwitches]
    }
    for (let index = 0; index < localPriorityOrder.length; index += 1) {
        let target = undefined
        for (let targetIndex = 0; target === undefined && targetIndex < remaining.length; targetIndex += 1) {
            target = remaining[targetIndex]
            for (let switchIndex = 0; target !== undefined && switchIndex < remainingSwitches.length; switchIndex += 1) {
                if (remainingSwitches[switchIndex].below === target) {
                    target = undefined
                }
            }
        }
        if (target === undefined) {
            alert('unexpected circular dependency loop')
            target = remaining[0]
        }
        finalOrder.push(target)
        remaining = remaining.filter(i => i !== target)
        remainingSwitches = remainingSwitches.filter(s => s.above !== target)
    }
    return finalOrder
}

function ShoppingLists(props) {
    const [listSortBy, setListSortBy] = useState('time')
    const [expandedList, setExpandedList] = useState(-1)
    const dragItem = useRef()
    const dragOverItem = useRef()

    function changeListSortBy() {
        if (listSortBy === 'time') {
            setListSortBy('index')
        } else if (listSortBy === 'index') {
            setListSortBy('priority')
        } else {
            setListSortBy('time')
        }
    }

    function expandOrCollapse(index, expanded) {
        if (expanded === true) {
            setExpandedList(-1)
        } else {
            setExpandedList(index)
        }
    }

    const dragStart = (e, position) => {
        dragItem.current = position;
    }

    const dragEnter = (e, position) => {
        dragOverItem.current = position;
    };

    const dragEnd = () => {
        if (listSortBy === 'time') {
            return
        }
        let localPrioritySwitches = [...props.prioritySwitches]
        if (listSortBy === 'index') {
            const newShoppingLists = [...props.lists];
            const dragItemContent = newShoppingLists[dragItem.current];
            newShoppingLists.splice(dragItem.current, 1);
            newShoppingLists.splice(dragOverItem.current, 0, dragItemContent);
            dragItem.current = null;
            dragOverItem.current = null;
            let newPrioritySwitches = []
            localPrioritySwitches.forEach(sw => {
                let newBelow = sw.below
                let newAbove = sw.above
                if (dragItem.current < dragOverItem.current) {
                    if (newBelow === dragItem.current) {
                        newBelow = dragOverItem.current
                    } else if (newBelow <= dragOverItem.current && newBelow > dragItem.current) {
                        newBelow -= 1
                    }
                    if (newAbove === dragItem.current) {
                        newAbove = dragOverItem.current
                    } else if (newAbove <= dragOverItem.current && newAbove > dragItem.current) {
                        newAbove -= 1
                    }
                } else {
                    if (newBelow === dragItem.current) {
                        newBelow = dragOverItem.current
                    } else if (newBelow >= dragOverItem.current && newBelow < dragItem.current) {
                        newBelow += 1
                    }
                    if (newAbove === dragItem.current) {
                        newAbove = dragOverItem.current
                    } else if (newAbove >= dragOverItem.current && newAbove < dragItem.current) {
                        newAbove += 1
                    }

                }
                newPrioritySwitches.push({above: newAbove, below: newBelow})
            })
            localStorage.setItem("simShoppingLists", JSON.stringify(newShoppingLists))
            props.updatePrioritySwitches(newPrioritySwitches, newShoppingLists)
        } else if (listSortBy === 'priority') {
            const dragItemIndex = props.priorityOrder.indexOf(dragItem.current)
            const dragOverItemIndex = props.priorityOrder.indexOf(dragOverItem.current)
            let newPrioritySwitches = []
            let pairs = []
            if (dragItemIndex > dragOverItemIndex) {
                for (let pi = dragOverItemIndex; pi < dragItemIndex; pi += 1) {
                    pairs.push({above: dragItem.current, below: props.priorityOrder[pi]})
                }
            } else {
                for (let pi = dragItemIndex + 1; pi <= dragOverItemIndex; pi += 1) {
                    pairs.push({above: props.priorityOrder[pi], below: dragItem.current})
                }
            }
            pairs.forEach(s => {
                newPrioritySwitches = []
                localPrioritySwitches.forEach(ps => {
                    if (s.below !== ps.above || s.above !== ps.below) {
                        newPrioritySwitches.push(ps)
                    }
                })
                newPrioritySwitches.push(s)
                localPrioritySwitches = newPrioritySwitches
            })
            props.updatePrioritySwitches(localPrioritySwitches, props.lists)
        }
    }

    const createVisualList = () => {
        const lists = props.lists || []
        let visualShoppingListIndexes = []
        for (let i = 0; i < lists.length; i += 1) {
            visualShoppingListIndexes.push(i)
        }
        if (listSortBy === 'time') {
            visualShoppingListIndexes.sort((a, b) => props.expectedTimes[a] - props.expectedTimes[b])
        } else if (listSortBy === 'priority') {
            for (let i = 0; i < props.lists.length; i += 1) {
                visualShoppingListIndexes[i] = props.priorityOrder[i]
            }
        }
        return visualShoppingListIndexes
    }

    const visualShoppingListIndexes = createVisualList()

    return (
        <div>
            <div onClick={changeListSortBy}>Change Sort Order ({listSortBy})</div>
            {visualShoppingListIndexes.map(shoppingListIndex =>
                <ShoppingList list={props.lists[shoppingListIndex]} key={shoppingListIndex} index={shoppingListIndex}
                              remove={() => props.removeShoppingList(shoppingListIndex)}
                              finish={() => props.finishShoppingList(shoppingListIndex)}
                              actualEnd={props.actualTimes[shoppingListIndex]}
                              bestEnd={props.expectedTimes[shoppingListIndex]}
                              operations={props.listToOpMap[shoppingListIndex]}
                              expandOrCollapse={expandOrCollapse}
                              expanded={shoppingListIndex === expandedList}
                              dragStart={(e) => dragStart(e, shoppingListIndex)}
                              dragEnter={(e) => dragEnter(e, shoppingListIndex)}
                              dragEnd={dragEnd}
                              cityGoods = {props.cityGoods}
                />
            )}
        </div>
    )
}

export default ShoppingLists;
