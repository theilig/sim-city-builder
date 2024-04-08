import {useProduction} from "./ProductionHook";
import {goodsData} from "./BuildingSettings";

export const EPHEMERAL_LIST_INDEX = -1
export function useRecommendations() {
    const {
        addOrder
    } = useProduction()

    const MAX_RECOMMENDATIONS_FOR_STOCKING = 1000

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
        let alreadyHave = {...unassignedStorage}
        let alreadyRecommended = {}
        let need = {}
        let recommendationCount = 0
        Object.keys(running).forEach(building => {
            running[building].running.forEach(op => {
                if (op.listIndex === undefined || op.listIndex === EPHEMERAL_LIST_INDEX) {
                    if (op.lastUpdateTime) {
                        if (alreadyHave[op.good] === undefined) {
                            alreadyHave[op.good] = 1
                        } else {
                            alreadyHave[op.good] += 1
                        }
                    } else {
                        if (alreadyRecommended[op.good] === undefined) {
                            alreadyRecommended[op.good] = 1
                        } else {
                            alreadyRecommended[op.good] += 1
                        }
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
                neededLists.push(list)
                need[good] = list.items[good] - alreadyHave[good]
            })

            let preliminaries = {}
            let blockedBuildings = {}
            let neededIngredients = {}
            // Can't use forEach here because we are adding to the list in the loop
            const blockBuildings = (items) => {
                if (items) {
                    items.forEach(item => {
                        blockedBuildings[item.building] = true
                        blockBuildings(item.children)
                    })
                }
            }

            for (let i = 0; i < neededLists.length; i += 1) {
                const list = neededLists[i]
                const good = Object.keys(list.items)[0]
                let kickoffList = {}
                kickoffList[good] = 1
                const preliminary = addOrder(kickoffList, unassignedStorage, running, 0, 0, EPHEMERAL_LIST_INDEX, true)
                preliminaries[good] = preliminary
                let descendants = [...preliminary.itemsAdded[0].children]
                for (let j = 0; j < descendants.length; j += 1) {
                    const good = descendants[j].good
                    if (!descendants[j].purchase && !descendants[j].lastUpdateTime && Object.keys(goodsData[good].ingredients).length > 0) {
                        if (need[good]) {
                            need[good] += 1
                        } else {
                            need[good] = 1
                            let neededList = {items: {}}
                            neededList.items[good] = 1
                            neededLists.push(neededList)
                        }
                        descendants = descendants.concat(descendants[j].children)
                    }
//                    blockBuildings(descendants)
                }
            }

            neededLists.forEach(list => {
                const good = Object.keys(list.items)[0]
                let descendants = Object.keys(goodsData[good].ingredients)
                for (let j = 0; j < descendants.length; j += 1) {
                    const ingredient = descendants[j]
                    if (need[ingredient] + goodsData[good].ingredients[ingredient] > need[good]) {
                        neededIngredients[ingredient] = true
                        neededIngredients[ingredient] = true
                    }
                }
            })
            let done = false
            while (!done) {
                let target;
                let bestTime;
                let mostNeeded;
                neededLists.forEach(list => {
                    let eligible = true
                    const good = Object.keys(list.items)[0]
                    let ingredients = goodsData[good].ingredients
                    if (blockedBuildings[goodsData[good].building] && !neededIngredients[good]) {
                        eligible = false
                    }
                    Object.keys(ingredients).forEach(ingredient => {
                        if (need[ingredient] >= need[good]) {
                            neededIngredients[ingredient] = true
                            eligible = false
                        }
                    })
                    if (eligible) {
                        const have = alreadyHave[good] || 0
                        const recommended = alreadyRecommended[good] || 0
                        let pct = 1
                        if (need[good]) {
                            pct = (have + 1 + recommended) / (need[good] + have)
                        }
                        if (target === undefined || mostNeeded > pct
                            || (mostNeeded === pct && preliminaries[good].expectedTime < bestTime)) {
                            target = good
                            bestTime = preliminaries[good].expectedTime
                            mostNeeded = pct
                        }
                    }
                })
                if (target) {
                    let kickoffList = {}
                    kickoffList[target] = 1
                    result = addOrder(kickoffList, unassignedStorage, running, preliminaries[target].expectedTime, 0, EPHEMERAL_LIST_INDEX, true)
                    if (alreadyRecommended[target] === undefined) {
                        alreadyRecommended[target] = 1
                    } else {
                        alreadyRecommended[target] += 1
                    }
                    if (result.itemsAdded.filter(op => {return !op.purchase}).length > 0) {
                        done = true
                        stockingList = kickoffList
                    }
                } else {
                    done = true
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
