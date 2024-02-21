import {useProduction} from "./ProductionHook";

export function useRecommendations() {
    const {
        addOrder
    } = useProduction()

    const EPHEMERAL_LIST_INDEX = -1

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
                shoppingListIndex: shoppingListIndex,
                updatedStorage: result.updatedStorage,
                updatedPipelines: result.updatedPipelines
            }
        }
        return {}
    }

    const calculateStockingRecommendations = (unassignedStorage, running, stockingLists) => {
        if (stockingLists.length > 0) {
            stockingLists.sort((a, b) => -1)
            const result = addOrder(stockingLists[0].items, unassignedStorage, running, 0, 0, EPHEMERAL_LIST_INDEX)
            return {
                expectedTime: result.expectedTime,
                shoppingListIndex: EPHEMERAL_LIST_INDEX,
                updatedStorage: result.updatedStorage,
                updatedPipelines: result.updatedPipelines
            }
        }

    }
    return {
        calculateRecommendations,
        calculateStockingRecommendations
    }
}
