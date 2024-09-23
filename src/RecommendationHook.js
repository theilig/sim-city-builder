import {useProduction} from "./ProductionHook";
import {deepCopy, goodsData, randomGeneratorKey} from "./BuildingSettings";

export const EPHEMERAL_LIST_INDEX = -1
export function useRecommendations() {
    const {
        addOrder
    } = useProduction()

    const calculateRecommendations = (unassignedStorage, running, unscheduledLists) => {
        const possibleLists = unscheduledLists
        if (possibleLists.length > 0) {
            let bestExpectedTime = undefined
            let bestExpectedIndex
            for (let i = 0; i < possibleLists.length; i += 1) {
                const result = addOrder(possibleLists[i].items, unassignedStorage, running, 0, 0, EPHEMERAL_LIST_INDEX)
                if ((bestExpectedTime === undefined) || (bestExpectedTime > result.expectedTime)) {
                    bestExpectedTime = result.expectedTime
                    bestExpectedIndex = i
                }
            }
            const shoppingListIndex = possibleLists[bestExpectedIndex].index
            return {items: possibleLists[bestExpectedIndex].items, listIndex: shoppingListIndex}
        }
        return {}
    }

    const createStockingRecommendations = (unassignedStorage, running, purchases, stockingLists) => {
        let currentRunning = running
        let currentStorage = unassignedStorage
        const getDescendantGoods = (good) => {
            let descendants = {...goodsData[good].ingredients}
            const childKeys = Object.keys(descendants)
            for (let i = 0; i < childKeys.length; i += 1) {
                const children = getDescendantGoods(childKeys[i])
                Object.keys(children).forEach(child => {
                    descendants[child] = (descendants[child] || 0) + children[child]
                })
            }
            return descendants
        }
        let alreadyHave = {...unassignedStorage}
        let buildingCounts = {}
        Object.keys(running).forEach(building => {
            buildingCounts[building] = running[building].running.length
            running[building].running.forEach(op => {
                if (op.listIndex === undefined || op.listIndex === EPHEMERAL_LIST_INDEX) {
                    if (alreadyHave[op.good] === undefined) {
                        alreadyHave[op.good] = 1
                    } else {
                        alreadyHave[op.good] += 1
                    }
                }
            })
        })
        purchases.forEach(op => {
            if (alreadyHave[op.good] === undefined) {
                alreadyHave[op.good] = 1
            } else {
                alreadyHave[op.good] += 1
            }
        })
        let neededLists = deepCopy(stockingLists)
        let added = []
        let addedTimes = {}
        let need = {}
        let pct = {}
        while (neededLists.length > 0) {
            need = {}
            pct = {}
            stockingLists.forEach(list => {
                const good = Object.keys(list.items)[0]
                const needed = list.items[good]
                need[good] = needed - (alreadyHave[good] || 0) - (addedTimes[good] || []).length
                pct[good] = ((alreadyHave[good] || 0) + (addedTimes[good] || []).length + 1) / needed
            })
            neededLists.sort((a, b) => {
                const aGood = Object.keys(a.items)[0]
                const bGood = Object.keys(b.items)[0]
                if (pct[aGood] !== pct[bGood]) {
                    return pct[aGood] - pct[bGood]
                } else {
                    return goodsData[aGood].duration - goodsData[bGood].duration
                }
            })
            if (neededLists.length) {
                let goodNeeded = Object.keys(neededLists[0].items)[0]
                let blocked = goodNeeded
                while (blocked !== undefined) {
                    blocked = undefined
                    const descendants = getDescendantGoods(goodNeeded)
                    let waitUntil = 0
                    for (let k = 0; k < Object.keys(descendants).length; k += 1) {
                        const descendant = Object.keys(descendants)[k]
                        const alreadyAdded = (addedTimes[descendant] || []).length
                        const numberNeeded = descendants[descendant]
                        if (need[descendant] !== undefined && need[descendant] + numberNeeded > need[goodNeeded]) {
                            blocked = descendant
                        } else if (need[descendant] !== undefined && need[descendant] + numberNeeded + alreadyAdded > need[goodNeeded]) {
                            const neededIndex = need[descendant] + alreadyAdded + numberNeeded - need[goodNeeded] - 1
                            const localWait = addedTimes[descendant][neededIndex]
                            if (localWait > waitUntil) {
                                waitUntil = localWait
                            }
                        }
                    }
                    if (blocked) {
                        goodNeeded = blocked
                    } else {
                        let kickoffList = {}
                        kickoffList[goodNeeded] = 1
                        let adjustedStorage = {...currentStorage}
                        if (waitUntil > 0) {
                            const addedStuff = Object.keys(addedTimes)
                            for (let k = 0; k < addedStuff.length; k += 1) {
                                for (let l = 0; l < addedTimes[addedStuff[k]].length; l += 1) {
                                    if (addedTimes[addedStuff[k]][l] <= waitUntil) {
                                        adjustedStorage[addedStuff[k]] = (adjustedStorage[addedStuff[k]] || 0) + 1
                                    }
                                }
                            }
                        }
                        const result = addOrder(kickoffList, adjustedStorage, currentRunning, 0, waitUntil, EPHEMERAL_LIST_INDEX, true)
                        currentStorage = result.updatedStorage
                        if (waitUntil > 0) {
                            const addedStuff = Object.keys(addedTimes)
                            for (let k = 0; k < addedStuff.length; k += 1) {
                                let removeCount = 0
                                for (let l = 0; l < addedTimes[addedStuff[k]].length; l += 1) {
                                    if (addedTimes[addedStuff[k]][l] <= waitUntil) {
                                        if (currentStorage[addedStuff[k]] > 0) {
                                            currentStorage[addedStuff[k]] -= 1
                                        } else {
                                            // We took something we added, get it out of the added times list
                                            removeCount += 1
                                        }
                                    }
                                }
                                if (removeCount > 0) {
                                    addedTimes[addedStuff[k]] = addedTimes[addedStuff[k]].slice(removeCount)
                                }
                            }
                        }
                        const newOp = result.itemsAdded[0]
                        if (buildingCounts[newOp.building]) {
                            buildingCounts[newOp.building] += 1
                        } else {
                            buildingCounts[newOp.building] = 1
                        }
                        currentRunning = result.updatedPipelines
                        if (buildingCounts[newOp.building] > 11 && !running[newOp.building].isParallel) {
                            neededLists.splice(0, 1)
                        } else {
                            added.push({items: kickoffList, listIndex: EPHEMERAL_LIST_INDEX, waitUntil: waitUntil})
                            if (addedTimes[goodNeeded]) {
                                addedTimes[goodNeeded].push(result.expectedTime)
                            } else {
                                addedTimes[goodNeeded] = [result.expectedTime]
                            }
                        }
                    }
                }
                if (added.length > 50) {
                    // only do buildings where running is empty
                    neededLists = neededLists.filter(list => {
                        const good = Object.keys(list.items)[0]
                        const building = goodsData[good].building
                        return buildingCounts[building] === 0 ||
                            (buildingCounts[randomGeneratorKey] === 0 && running[randomGeneratorKey].currentBuilding === building)
                    })
                }
            }
        }
        return added
    }
    return {
        calculateRecommendations,
        createStockingRecommendations
    }
}
