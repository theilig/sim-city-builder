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
                if (op.listIndex === undefined || (op.listIndex === EPHEMERAL_LIST_INDEX && op.topLevel)) {
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
                if (goodsData[good] && list.items[good] > alreadyHave[good]) {
                    neededLists.push(list)
                    need[good] = list.items[good] - alreadyHave[good]
                }
            })
            let kickoffTimes = {}
            let durations = {}
            neededLists = neededLists.filter(l => {
                const item = Object.keys(l.items)[0]
                let shortOnIngredients = false
                Object.keys(goodsData[item].ingredients).forEach(ingredient => {
                        if (need[ingredient] > need[item]) {
                            shortOnIngredients = true
                        }
                    }
                )
                return !shortOnIngredients
            })
            neededLists.forEach(list => {
                const good = Object.keys(list.items)[0]
                let kickoffList = {}
                kickoffList[good] = 1
                const preliminary = addOrder(kickoffList, unassignedStorage, running, 0, 0, EPHEMERAL_LIST_INDEX, true)
                // redo with finishBy to just in time everything, otherwise we end up making a bunch of metal that sits there
                const result = addOrder(kickoffList, unassignedStorage, running, preliminary.expectedTime, 0, EPHEMERAL_LIST_INDEX, true)
                kickoffTimes[good] = lowestStart(result.itemsAdded[0])
                durations[good] = result.expectedTime
            })

            neededLists.sort((a, b) => {
                const aItem = Object.keys(a.items)[0]
                const aAmount = a.items[aItem]
                const bItem = Object.keys(b.items)[0]
                const bAmount = b.items[bItem]
                const aPct = (alreadyHave[aItem] || 0) / aAmount
                const bPct = (alreadyHave[bItem] || 0) / bAmount
                const aWait = kickoffTimes[aItem] / durations[aItem]
                const bWait = kickoffTimes[bItem] / durations[bItem]
                if (aPct !== bPct) {
                    return aPct - bPct
                }
                if (aWait !== bWait) {
                    return aWait - bWait;
                }
                if (aAmount !== bAmount) {
                    return bAmount - aAmount
                }
                return durations[bItem] - durations[aItem]
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
