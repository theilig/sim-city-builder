import React, {useRef, useState} from 'react';
import ShoppingList from "./ShoppingList";

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
            alert("Can't reorder when listed by estimated time completed")
        }
        if (listSortBy === 'index') {
            props.reorderList(dragItem.current, dragOverItem.current)
        } else if (listSortBy === 'priority') {
            props.changePriority(dragItem.current, dragOverItem.current)
        }
        dragItem.current = null;
        dragOverItem.current = null;
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
