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

    const createStockingRecommendations = (unassignedStorage, running, purchases, stockingLists, goodsOrdered) => {
        let currentRunning = running
        let currentStorage = unassignedStorage
        const getDescendantGoods = (good) => {
            return {...goodsData[good].ingredients}
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
                if (need[goodNeeded] <= 0) {
                    neededLists.splice(0, 1)
                    continue
                }
                let blocked = goodNeeded
                while (blocked !== undefined) {
                    blocked = undefined
                    const descendants = getDescendantGoods(goodNeeded)
                    let waitUntil = 0
                    for (let k = 0; k < Object.keys(descendants).length; k += 1) {
                        const descendant = Object.keys(descendants)[k]
                        const alreadyAdded = (addedTimes[descendant] || []).length
                        const numberNeeded = descendants[descendant]
                        const descendentList = stockingLists.find(list => Object.keys(list.items)[0] === descendant)
                        if (descendentList) {
                            const descendentsNeeded = descendentList.items[descendant]
                            const pctLeft = pct[descendant] - numberNeeded / descendentsNeeded
                            if (pctLeft < pct[goodNeeded]) {
                                blocked = descendant
                            } else if (pctLeft - (alreadyAdded / descendentsNeeded) < pct[goodNeeded]) {
                                const numberToWaitFor = alreadyAdded - Math.ceil((pct[goodNeeded] - pctLeft) * descendentsNeeded)
                                if (numberToWaitFor > addedTimes[descendant].length) {
                                    blocked = descendant
                                } else if (numberToWaitFor > 0) {
                                    const neededIndex = numberToWaitFor - 1
                                    const localWait = addedTimes[descendant][neededIndex]
                                    if (localWait > waitUntil) {
                                        waitUntil = localWait
                                    }
                                }
                            }
                        }
                    }
                    if (blocked) {
                        goodNeeded = blocked
                        if (need[blocked] === undefined) {
                            need[blocked] = 1
                        } else {
                            need[blocked] += 1
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

                    added.push({items: kickoffList, listIndex: EPHEMERAL_LIST_INDEX, waitUntil: waitUntil})
                    if (addedTimes[goodNeeded]) {
                        addedTimes[goodNeeded].push(result.expectedTime)
                    } else {
                        addedTimes[goodNeeded] = [result.expectedTime]
                    }
                    const listDescendants = getDescendantGoods(goodNeeded)
                    for (let k = 0; k < Object.keys(listDescendants).length; k += 1) {
                        const descendant = Object.keys(listDescendants)[k]
                        const numberNeeded = listDescendants[descendant]
                        stockingLists.forEach(list => {
                            if (Object.keys(list.items)[0] === descendant) {
                                let added = false
                                for (let neededKey = 0; neededKey < neededLists.length; neededKey += 1) {
                                    if (Object.keys(neededLists[neededKey].items)[0] === descendant) {
                                        neededLists[neededKey].items[descendant] += numberNeeded
                                        added = true
                                        break
                                    }
                                }
                                if (!added) {
                                    let newNeed = {}
                                    newNeed[descendant] = numberNeeded
                                    neededLists.push({items: newNeed, region: 'sim.stocking'})
                                }
                            }
                        })
                        if (numberNeeded > 0) {
                            if (need[descendant] === undefined) {
                                need[descendant] = numberNeeded
                            } else {
                                need[descendant] += numberNeeded
                            }
                        }
                    }

                }

                if (added.length > 50) {
                    // only do buildings where running is empty, and we have something we sort of need
                    let newNeeded = []
                    for (let k = 0; k < neededLists.length; k += 1) {
                        const good = Object.keys(neededLists[k].items)[0]
                        const building = goodsData[good].building
                        if (pct[good] > 2) {
                            continue
                        }
                        if (buildingCounts[building] === 0 ||
                            (buildingCounts[randomGeneratorKey] === 0 && running[randomGeneratorKey].currentBuilding === building)) {
                            newNeeded.push(neededLists[k])
                        }
                    }
                    neededLists = newNeeded
                }
                if (added.length > 500) {
                    neededLists = []
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
