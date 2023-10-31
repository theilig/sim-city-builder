import {useState} from "react";

export function useShoppingLists() {
    const [shoppingLists, setShoppingLists] = useState({})
    const [expectedTimes, setExpectedTimes] = useState([])
    const [actualTimes, setActualTimes] = useState([])
    const [listToOpMap, setListToOpMap] = useState([])
    const [stockingLists, setStockingLists] = useState({})
    const [prioritySwitches, setPrioritySwitches] = useState({})
    const [priorityOrder, setPriorityOrder] = useState({})

    const clearShoppingLists = (currentCity) => {
        return updateShoppingLists([], stockingLists[currentCity], [], currentCity)
    }

    const addList = (goodsNeeded, region, currentCity) => {
        let localShoppingLists = []
        if (shoppingLists[currentCity]) {
            localShoppingLists = [...shoppingLists[currentCity]]
        }
        localShoppingLists.push({items: goodsNeeded, region: region})
        updateShoppingLists(localShoppingLists, stockingLists[currentCity], prioritySwitches[currentCity], currentCity)
    }

    const removeList = (index, currentCity) => {
        let localShoppingLists = [...shoppingLists[currentCity]]
        let newPrioritySwitches = []
        if (prioritySwitches[currentCity]) {
            prioritySwitches[currentCity].forEach(s => {
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
        }
        localShoppingLists.splice(index, 1)
        updateShoppingLists(localShoppingLists, stockingLists[currentCity], newPrioritySwitches, currentCity)
    }

    const reorderList = (sourceIndex, destinationIndex, currentCity) => {
        let localShoppingLists = [...shoppingLists[currentCity]]

        const dragItemContent = localShoppingLists[sourceIndex];
        localShoppingLists.splice(sourceIndex, 1);
        localShoppingLists.splice(destinationIndex, 0, dragItemContent);

        let indexChanges = {sourceIndex: destinationIndex}
        if (sourceIndex < destinationIndex) {
            for (let i = sourceIndex + 1; i <= destinationIndex; i += 1) {
                indexChanges[i] = i - 1
            }
        } else {
            for (let i = sourceIndex - 1; i >= destinationIndex; i -= 1) {
                indexChanges[i] = i + 1
            }
        }
        let localPrioritySwitches = []
        prioritySwitches[currentCity].forEach(prioritySwitch => {
            let newBelow = prioritySwitch.below
            let newAbove = prioritySwitch.above
            if (indexChanges[newBelow] !== undefined) {
                newBelow = indexChanges[newBelow]
            }
            if (indexChanges[newAbove] !== undefined) {
                newAbove = indexChanges[newAbove]
            }
            localPrioritySwitches.push({above: newAbove, below: newBelow})
        })
        return updateShoppingLists(localShoppingLists, stockingLists[currentCity], localPrioritySwitches, currentCity)
    }

    const changePriorityInList = (sourceIndex, destinationIndex, currentCity) => {
        const currentPriorityOrder = priorityOrder[currentCity]
        const sourcePriorityIndex = currentPriorityOrder.indexOf(sourceIndex)
        const destinationPriorityIndex = currentPriorityOrder.indexOf(destinationIndex)
        let pairs = []
        if (sourcePriorityIndex > destinationPriorityIndex) {
            // we are making the source higher priority, mark it as the above for every list it moved past
            for (let priorityIndex = destinationPriorityIndex; priorityIndex < sourcePriorityIndex; priorityIndex += 1) {
                pairs.push({above: sourceIndex, below: currentPriorityOrder[priorityIndex]})
            }
        } else {
            for (let priorityIndex = sourcePriorityIndex + 1; priorityIndex <= destinationPriorityIndex; priorityIndex += 1) {
                pairs.push({above: currentPriorityOrder[priorityIndex], below: sourceIndex})
            }
        }
        let localPrioritySwitches = prioritySwitches[currentCity]
        pairs.forEach(newSwitch => {
            // remove existing switches if they are superseded by this new one
            let newPrioritySwitches = []
            localPrioritySwitches.forEach(existingSwitch => {
                if (newSwitch.below !== existingSwitch.above || newSwitch.above !== existingSwitch.below) {
                    newPrioritySwitches.push(existingSwitch)
                }
            })
            newPrioritySwitches.push(newSwitch)
            localPrioritySwitches = newPrioritySwitches
        })
        updateShoppingLists(shoppingLists[currentCity], stockingLists[currentCity], localPrioritySwitches, currentCity)
    }

    const updateShoppingLists = (lists, stockingLists, switches, currentCity) => {
        let allShoppingLists = {...shoppingLists}
        let allPrioritySwitches = {...prioritySwitches}
        let allPriorityOrder = {...priorityOrder}
        const totalList = lists.concat(stockingLists)
        const order = sortLists(totalList, switches)
        allShoppingLists[currentCity] = lists
        setShoppingLists(allShoppingLists)
        allPrioritySwitches[currentCity] = switches
        setPrioritySwitches(allPrioritySwitches)
        allPriorityOrder[currentCity] = order
        setPriorityOrder(allPriorityOrder)
        localStorage.setItem("simShoppingLists", JSON.stringify(allShoppingLists))
        return order
    }

    const allShoppingLists = (currentCity) => {
        if (shoppingLists[currentCity] !== undefined && stockingLists[currentCity] !== undefined) {
            return shoppingLists[currentCity].concat(stockingLists[currentCity])
        }
        return shoppingLists[currentCity] || stockingLists[currentCity] || []
    }

    const sortLists = (lists, switches) => {
        let localLists = [...lists]
        let priorityMap = {}
        let indexes = []
        for (let i = 0; i < localLists.length; i += 1) {
            indexes.push(i)
            priorityMap[i] = {}
        }
        if (switches) {
            switches.forEach(listSwitch => {
                priorityMap[listSwitch.above][listSwitch.below] = true
            })
        }
        indexes.sort((a, b) => {
            if (priorityMap[a][b]) {
                return -1
            }
            if (priorityMap[b][a]) {
                return 1
            }
            if (expectedTimes[a]) {
                if (expectedTimes[b] && expectedTimes[b] < expectedTimes[a]) {
                    return 1
                } else {
                    return -1
                }
            }
            if (expectedTimes[b]) {
                return 1
            }
            if (localLists[a].region === 'sim.stocking') {
                return 1
            }
            if (localLists[b].region === 'sim.stocking') {
                return -1
            }
            return a - b
        })
        return indexes
    }

    const updateStockingLists = (citySettings, currentCity) => {
        let newStockingLists = {...stockingLists}
        newStockingLists[currentCity] = calculateStockingList(citySettings[currentCity])
        setStockingLists(newStockingLists)
    }

    const calculateStockingList = (citySettings) => {
        let stockingList = []
        if (citySettings && citySettings.goods) {
            Object.keys(citySettings.goods).forEach(good => {
                const data = citySettings.goods[good]
                if (data.stockAmount > 0) {
                    let items = {}
                    items[good] = data.stockAmount
                    stockingList.push({items: items, region: 'sim.stocking'})
                }
            })
        }
        return stockingList
    }
    const loadShoppingLists = (citySettings) => {
        let loadedShoppingLists = {}
        let loadedShoppingListsJson = localStorage.getItem("simShoppingLists")
        if (loadedShoppingListsJson) {
            try {
                loadedShoppingLists = JSON.parse(loadedShoppingListsJson)
            } catch {
                alert("Can't load shopping lists")
            }
        }
        Object.keys(loadedShoppingLists).forEach(city => {
            if (citySettings[city] === undefined) {
                delete loadedShoppingLists[city]
            }
        })

        let allPrioritySwitches = {}
        let allPriorityOrder = {}
        let stockingLists = {}
        Object.keys(citySettings).forEach(city => {
            const stockingList = calculateStockingList(citySettings[city])
            stockingLists[city] = stockingList
            let order = updateShoppingLists(loadedShoppingLists[city] || [], stockingList, [], city)
            allPrioritySwitches[city] = []
            allPriorityOrder[city] = order
        })
        setPriorityOrder(allPriorityOrder)
        setPrioritySwitches(allPrioritySwitches)
        setShoppingLists(loadedShoppingLists)
        setStockingLists(stockingLists)
        localStorage.setItem("simShoppingLists", JSON.stringify(loadedShoppingLists))
    }
    return {
        allShoppingLists,
        prioritySwitches,
        priorityOrder,
        clearShoppingLists,
        addList,
        removeList,
        reorderList,
        changePriorityInList,
        loadShoppingLists,
        updateStockingLists
    }
}
