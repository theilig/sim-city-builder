import {useProduction} from "./ProductionHook";
import {buildingData, deepCopy, goodsData, randomGeneratorKey} from "./BuildingSettings";
import good from "./Good";

export const EPHEMERAL_LIST_INDEX = -1
export function useRecommendations() {
    const {
        addOrder
    } = useProduction()

    const calculateUtility = (currentStorage, currentTimes, goodsData) => {

        return []
    }
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

    const createStockingRecommendations = (unassignedStorage, running, purchases, stockingLists, goodsOrdered) => {
        const factoryGood = (goodName) => {
            const building = goodsData[goodName].building
            const data = buildingData[building]
            return data.isParallel === true
        }
        let currentRunning = running
        let currentStorage = unassignedStorage
        const getDescendantGoods = (good) => {
            const allDescendents = {...goodsData[good].ingredients}
            Object.keys(allDescendents).forEach(key => {
                const addedDescendents = getDescendantGoods(key)
                Object.keys(addedDescendents).forEach(descendant => {
                    if (allDescendents[descendant] === undefined) {
                        allDescendents[descendant] = allDescendents[key] * addedDescendents[descendant]
                    } else {
                        allDescendents[descendant] += allDescendents[key] * addedDescendents[descendant]
                    }
                })
            })
            return allDescendents
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

        Object.keys(goodsOrdered).forEach(orderedGood => {
            if (alreadyHave[orderedGood] === undefined) {
                alreadyHave[orderedGood] = -goodsOrdered[orderedGood]
            } else {
                alreadyHave[orderedGood] -= goodsOrdered[orderedGood]
            }
        })
        let neededTotals = {}
        let stockingTotals = {}
        stockingLists.forEach(list => {
            const good = Object.keys(list.items)[0]
            const needed = list.items[good]
            const missing = Math.max(0, needed - (alreadyHave[good] || 0))
            stockingTotals[good] = needed
            if (neededTotals[good] === undefined) {
                 neededTotals[good] = needed
            } else {
                neededTotals[good] += needed
            }
            const descendants = getDescendantGoods(good)
            for (let k = 0; k < Object.keys(descendants).length; k += 1) {
                const descendant = Object.keys(descendants)[k]
                const numberNeeded = descendants[descendant]
                if (neededTotals[descendant] === undefined) {
                    neededTotals[descendant] = numberNeeded * missing
                } else {
                    neededTotals[descendant] += numberNeeded * missing
                }
            }
        })
        let added = []
        let addedTimes = {}
        let addedUsed = {}
        let done = false
        while (!done) {
            done = true
            let need = {}
            let pct = {}
            let stockingPct = {}

            const neededGoods = Object.keys(neededTotals)
            for (let i = 0; i < neededGoods.length; i += 1) {
                const good = neededGoods[i]
                const scheduled = (addedTimes[good] || []).length + (alreadyHave[good] || 0)
                need[good] = neededTotals[good] - alreadyHave[good] - (addedTimes[good] || []).length
                if (need[good] > 0 && !factoryGood(good)) {
                    done = false
                }
                pct[good] = scheduled / neededTotals[good]
                stockingPct[good] = scheduled / (stockingTotals[good] || 1)
            }
            neededGoods.sort((a, b) => {
                if (factoryGood(a) && !factoryGood(b)) {
                    return 1
                }
                if (factoryGood(b)) {
                    return -1
                }
                if (buildingCounts[goodsData[a].building] === 11) {
                    return 1
                }
                if (buildingCounts[goodsData[b].building] === 11) {
                    return -1
                }
                if (alreadyHave[a] >= 10) {
                    return 1
                }
                if (alreadyHave[b] >= 10) {
                    return -1
                }
                if (pct[a] !== pct[b]) {
                    return pct[a] - pct[b]
                } else {
                    return goodsData[a].duration - goodsData[b].duration
                }
            })
            if (!done) {
                let goodNeeded = neededGoods[0]
                const descendants = getDescendantGoods(goodNeeded)
                let waitUntil = 0
                for (let k = 0; k < Object.keys(descendants).length; k += 1) {
                    const descendant = Object.keys(descendants)[k]
                    const alreadyAdded = (addedTimes[descendant] || []).length
                    const descendentsNeeded = descendants[descendant]
                    const pctDone = pct[descendant] - (alreadyAdded - (addedUsed[descendant] || 0)) / neededTotals[descendant]
                    if (stockingPct[descendant] < stockingPct[goodNeeded] && factoryGood(descendant) === false) {
                        goodNeeded = descendant
                        k = Object.keys(descendants).length
                    } else if (factoryGood(descendant) === false && pctDone < pct[goodNeeded]) {
                        const numberToWaitFor = Math.ceil((pct[goodNeeded] - pctDone) * neededTotals[descendant]) + descendentsNeeded + (addedUsed[descendant] || 0)
                        if (addedTimes[descendant] === undefined || numberToWaitFor > addedTimes[descendant].length) {
                            goodNeeded = descendant
                            k = Object.keys(descendants).length
                        } else if (numberToWaitFor > 0) {
                            const neededIndex = numberToWaitFor - 1
                            const localWait = addedTimes[descendant][neededIndex]
                            if (localWait > waitUntil) {
                                waitUntil = localWait
                            }
                        }
                    }
                }
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
                const usedDescendants = getDescendantGoods(goodNeeded)
                for (let k = 0; k < Object.keys(usedDescendants).length; k += 1) {
                    const descendant = Object.keys(usedDescendants)[k]
                    const numberNeeded = usedDescendants[descendant]
                    addedUsed[descendant] = (addedUsed[descendant] || 0) + numberNeeded
                }
                const newOp = result.itemsAdded[0]
                if (buildingCounts[newOp.building]) {
                    buildingCounts[newOp.building] += 1
                } else {
                    buildingCounts[newOp.building] = 1
                }
                currentRunning = result.updatedPipelines

                added.push({items: kickoffList, listIndex: EPHEMERAL_LIST_INDEX, waitUntil: waitUntil})
                if (addedTimes[goodNeeded]) {
                    addedTimes[goodNeeded].push(result.expectedTime)
                } else {
                    addedTimes[goodNeeded] = [result.expectedTime]
                }
                if (added.length > 200) {
                    done = true
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
