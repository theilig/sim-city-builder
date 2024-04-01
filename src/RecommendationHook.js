import {useProduction} from "./ProductionHook";
import {goodsData} from "./BuildingSettings";

export const EPHEMERAL_LIST_INDEX = -1
export function useRecommendations() {
    const {
        addOrder
    } = useProduction()

    const MAX_RECOMMENDATIONS_FOR_STOCKING = 300

    const calculateRecommendations = (unassignedStorage, running, unscheduledLists) => {
        const possibleLists = unscheduledLists
        if (possibleLists.length > 0) {
            let bestExpectedTime
            let bestExpectedIndex
            for (let i = 0; i < possibleLists.length; i += 1) {
                const result = addOrder(possibleLists[i].items, unassignedStorage, running, 0, 0, EPHEMERAL_LIST_INDEX)
                if ((bestExpectedTime === undefined) || (bestExpectedTime > result.expectedTime)) {
                    bestExpectedTime = result.expectedTime
                    bestExpectedIndex = i
                }
            }
            const shoppingListIndex = possibleLists[bestExpectedIndex].index
            const result = addOrder(possibleLists[bestExpectedIndex].items, unassignedStorage, running, bestExpectedTime, 0, shoppingListIndex)
            return {
                expectedTime: result.expectedTime,
                shoppingList: {items: possibleLists[bestExpectedIndex].items, index: shoppingListIndex},
                updatedStorage: result.updatedStorage,
                updatedPipelines: result.updatedPipelines,
                addedPurchases: result.addedPurchases
            }
        }
        return {}
    }

    const calculateStockingRecommendations = (unassignedStorage, running, purchases, stockingLists) => {
        const lowestStart = (item) => {
            let low = item.start
            if (item.lastUpdateTime) {
                low = item.start + item.duration
            } else {
                item.children.forEach(child => {
                    // exclude factory items start times,we want to prioritize starting commercial buildings
                    if (Object.keys(goodsData[child.good].ingredients).length > 0) {
                        const childLow = lowestStart(child)
                        if (childLow < low) {
                            low = childLow
                        }
                    }
                })
            }
            return low
        }
        let alreadyHave = {...unassignedStorage}
        let need = {}
        let recommendationCount = 0
        Object.keys(running).forEach(building => {
            running[building].running.forEach(op => {
                if (
                    op.listIndex === undefined
                    || (op.listIndex === EPHEMERAL_LIST_INDEX && op.topLevel && op.lastUpdateTime !== undefined)
                ) {
                    if (alreadyHave[op.good] === undefined) {
                        alreadyHave[op.good] = 1
                    } else {
                        alreadyHave[op.good] += 1
                    }
                }
                if (op.lastUpdateTime === undefined) {
                    recommendationCount += 1
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
        let result
        let stockingList
        if (recommendationCount <= MAX_RECOMMENDATIONS_FOR_STOCKING && stockingLists.length > 0) {
            let neededLists = []
            stockingLists.forEach(list => {
                const good = Object.keys(list.items)[0]
                if (alreadyHave[good] === undefined) {
                    alreadyHave[good] = 0
                }
                if (goodsData[good] && (list.items[good] > alreadyHave[good])) {
                    neededLists.push(list)
                    need[good] = list.items[good] - alreadyHave[good]
                }
            })
            neededLists = neededLists.filter(l => {
                const item = Object.keys(l.items)[0]
                let shortOnIngredients = false
                Object.keys(goodsData[item].ingredients).forEach(ingredient => {
                    if (need[ingredient] > need[item]) {
                        shortOnIngredients = true
                    }
                })
                return !shortOnIngredients
            })

            let kickoffTimes = {}
            let durations = {}
            let neededTimes = {}
            // Can't use forEach here because we are adding to the list in the loop
            for (let i = 0; i < neededLists.length; i += 1) {
                const list = neededLists[i]
                const good = Object.keys(list.items)[0]
                let kickoffList = {}
                kickoffList[good] = 1
                const preliminary = addOrder(kickoffList, unassignedStorage, running, 0, 0, EPHEMERAL_LIST_INDEX, true)
                // redo with finishBy to just in time everything, otherwise we end up making a bunch of metal that sits there
                const result = addOrder(kickoffList, unassignedStorage, running, preliminary.expectedTime, 0, EPHEMERAL_LIST_INDEX, true)
                kickoffTimes[good] = Math.max(neededTimes[good] || 0, result.itemsAdded[0].start)
                durations[good] = result.expectedTime
                let descendants = [...result.itemsAdded[0].children]
                for (let j = 0; j < descendants.length; j += 1) {
                    const good = descendants[j].good
                    if (!descendants[j].purchase && goodsData[good].ingredients.length > 0) {
                        if (need[good]) {
                            need[good] += 1
                        } else {
                            need[good] = 1
                            let neededList = {items: {}}
                            neededList.items[good] = 1
                            neededLists.push(neededList)
                        }
                        if (neededTimes[good] === undefined || neededTimes[good] > descendants[j].start) {
                            neededTimes[good] = descendants[j].start
                        }
                        descendants = descendants.concat(descendants[j].children)
                    }
                }
            }

            neededLists.sort((a, b) => {
                const aItem = Object.keys(a.items)[0]
                const aAmount = a.items[aItem]
                const bItem = Object.keys(b.items)[0]
                const bAmount = b.items[bItem]
                const aPct = (alreadyHave[aItem] || 0) / aAmount
                const bPct = (alreadyHave[bItem] || 0) / bAmount
                const aWait = kickoffTimes[aItem]
                const bWait = kickoffTimes[bItem]
                const aNeeded = need[aItem]
                const bNeeded = need[bItem]
                if (bWait === 0 && bNeeded >= aNeeded) {
                    return 1
                }
                if (aWait === 0 && aNeeded >= bNeeded) {
                    return -1
                }

                if (aWait === 0 && bWait > 0 && bWait / bNeeded > 600) {
                    return -1
                }
                if (bWait === 0 && aWait > 0 && aWait / aNeeded > 600) {
                    return 1
                }
                if (aNeeded !== bNeeded) {
                    return bNeeded - aNeeded
                }
                if (bWait !== aWait) {
                    return aWait - bWait
                }
                return durations[aItem] - durations[bItem]
            })
            let done = false
            let index = 0
            while (!done && index < neededLists.length) {
                stockingList = {}
                stockingList[Object.keys(neededLists[index].items)[0]] = 1
                result = addOrder(stockingList, unassignedStorage, running, 0, 0, EPHEMERAL_LIST_INDEX, true)
                if (result.itemsAdded.filter(op => {return !op.purchase}).length > 0) {
                    done = true
                } else {
                    result = undefined
                    index = index + 1
                }
            }
        }
        if (result) {
            return {
                expectedTime: result.expectedTime,
                shoppingList: {items: stockingList, index: EPHEMERAL_LIST_INDEX},
                updatedStorage: result.updatedStorage,
                updatedPipelines: result.updatedPipelines,
                addedPurchases: result.addedPurchases
            }
        } else {
            return {
                expectedTime: 0,
                updatedStorage: unassignedStorage,
                updatedPipelines: running,
                addedPurchases: []
            }
        }
    }
    return {
        calculateRecommendations,
        calculateStockingRecommendations
    }
}
