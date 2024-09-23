import {goodsData} from "./BuildingSettings";
import {grabFromRunning} from "./OperationsHook";
import {grabFromStorage} from "./StorageHook";
import {deepCopy} from "./BuildingSettings";
import {EPHEMERAL_LIST_INDEX} from "./RecommendationHook";
// This is deprecated in favor of calling adjustedDuration (since we won't have to repeat the lookup of initial duration)
export const adjustDuration = (start, duration, building) => {
    let speedUp = building.speedUp
    if (speedUp === undefined) {
        speedUp = {
            remaining: 0,
            speed: 1
        }
    }
    const speedUpTime = Math.min(speedUp.remaining - start, duration)
    if (speedUpTime > 0) {
        return duration - speedUpTime + speedUpTime / speedUp.speed
    } else {
        return duration
    }
}

export const adjustedDuration = (good, start, buildingSettings) => {
    const initialDuration = buildingSettings.goods[good].duration
    return adjustDuration(start, initialDuration, buildingSettings)
}

export function useProduction() {
    // external entry point which avoids mutating storage and running
    const addOrder = (order, storage, pipelines, finishBy, waitUntil, listIndex, forceProduction = false) => {
        const allPurchases = (items) => {
            if (!items) {
                return []
            }
            let purchases = []
            items.forEach(item => {
                if (item.purchase) {
                    purchases.push(item)
                }
                purchases = purchases.concat(allPurchases(item.children))
            })
            return purchases
        }
        const savedStorage = deepCopy(storage, 0)
        const savedPipelines = deepCopy(pipelines, 2)
        const result = addOrderInternal(order, savedStorage, savedPipelines, finishBy, waitUntil, listIndex, forceProduction)
        result.itemsAdded.forEach(item => {item.topLevel = true})
        result.updatedStorage = savedStorage
        result.updatedPipelines = savedPipelines
        result.addedPurchases = allPurchases(result.itemsAdded)
        return result
    }

    const addOrderInternal = (order, storage, pipelines, finishBy, waitUntil, listIndex, forceProduction = false, topLevel = true) => {
        const itemsNeeded = Object.keys(order)
        if (itemsNeeded.length === 0) {
            return {expectedTime: 0, itemsAdded: []}
        }
        let itemsAdded = []
        itemsNeeded.forEach(item => {
            const result = produce(
                item,
                order[item],
                storage,
                pipelines,
                finishBy,
                waitUntil,
                listIndex,
                forceProduction
            )
            if (result.expectedTime > finishBy) {
                finishBy = result.expectedTime
            }

            itemsAdded = itemsAdded.concat(result.itemsAdded)
        })
        return {expectedTime: finishBy, itemsAdded: itemsAdded}
    }

    function getMaxConcurrentOps(changes, changeTimes, changeIndex, duration) {
        let initialChangeTime = changeTimes[changeIndex]
        let maxConcurrentOps = changes[changeTimes[changeIndex]]
        changeIndex += 1
        while (changeIndex < changeTimes.length && changeTimes[changeIndex] < initialChangeTime + duration) {
            if (changes[changeTimes[changeIndex]] > maxConcurrentOps) {
                maxConcurrentOps = changes[changeTimes[changeIndex]]
            }
            changeIndex += 1
        }
        return maxConcurrentOps
    }
    const bestTime = (pipeline, goodName, finishBy, waitUntil) => {
        let limit = 1
        if (pipeline.isParallel) {
            limit = pipeline.slots
        }
        let changes = {}
        pipeline.running.forEach(op => {
            const opDuration = op.duration
            const start = Math.floor(op.start)
            const end = Math.floor(op.start + opDuration)
            if (changes[end] === undefined) {
                changes[end] = -1
            } else {
                changes[end] -= 1
            }
            if (changes[start] === undefined) {
                changes[start] = 1
            } else {
                changes[start] += 1
            }
        })
        if (changes[0] === undefined) {
            changes[0] = 0
        }
        if (changes[Math.ceil(waitUntil)] === undefined) {
            changes[Math.ceil(waitUntil)] = 0
        }
        let changeTimes = Object.keys(changes).map(s => parseInt(s))
        changeTimes.sort((a, b) => a - b)

        let runningTotal = 0
        changeTimes.forEach((changeTime) => {
            runningTotal += changes[changeTime]
            changes[changeTime] = runningTotal
        })
        let startTime = Math.max(changeTimes[changeTimes.length - 1], waitUntil)
        for (let changeIndex = changeTimes.length - 1;
             changeIndex >= 0 && changeTimes[changeIndex] >= waitUntil;
             changeIndex -= 1) {
            const duration = adjustDuration(changeTimes[changeIndex], pipeline.goods[goodName].duration, pipeline)
            const maxConcurrentOps =
                getMaxConcurrentOps(
                    changes,
                    changeTimes,
                    changeIndex,
                    duration,
                    waitUntil
                )
            if (maxConcurrentOps < limit) {
                startTime = changeTimes[changeIndex]
                if (startTime + duration < finishBy) {
                    startTime = changeTimes[changeIndex]
                    return {start: startTime, duration: duration}
                }
            }
        }
        return {
            start: startTime,
            duration: adjustDuration(startTime, pipeline.goods[goodName].duration, pipeline)
        }
    }

    const getBuyingTime = (frequency) => {
        const times = [100000, 100000, 7200, 3600, 1500, 600]
        if (frequency) {
            return times[frequency]
        } else {
            return undefined
        }
    }

    const produce = (goodName, amount, storage, pipelines, finishBy, waitUntil, listIndex, forceProduction) => {
        const findBest = (localWaitUntil, localFinishBy) => {
            let bestTimesResult = undefined
            const buildings = Object.keys(pipelines)
            for (let i = 0; i < buildings.length; i += 1) {
                const building = buildings[i]
                const pipeline = pipelines[building]
                if (!pipeline.isParallel && listIndex === EPHEMERAL_LIST_INDEX) {
                    // For recommendations we want to kick off asap
                    localFinishBy = 0
                }
                if (pipeline.goods[goodName]) {
                    const expectedTimes = bestTime(pipeline, goodName, localFinishBy, localWaitUntil)
                    if (bestTimesResult === undefined || expectedTimes.start + expectedTimes.duration <= bestTimesResult.start + bestTimesResult.duration) {
                        bestTimesResult = expectedTimes
                        bestTimesResult.pipeline = building
                    }
                }
            }
            return bestTimesResult
        }
        let latestTime = 0
        let itemsAdded = []
        if (goodsData[goodName] === undefined) {
            window.alert(goodName)
        }
        let ingredients = goodsData[goodName].ingredients
        if (!forceProduction) {
            amount -= grabFromStorage(storage, goodName, amount)
            if (amount > 0) {
                const result = grabFromRunning(pipelines, goodName, amount, listIndex)
                amount -= result.items.length
                itemsAdded = itemsAdded.concat(result.items)
                if (latestTime < result.end) {
                    latestTime = result.end
                }
            }
        }

         for (let i = 0; i < amount; i += 1) {
             let localWaitUntil = waitUntil
             const preliminary = findBest(waitUntil, 0)
             if (preliminary === undefined) {
                 continue
             }
             const buyTime = getBuyingTime(goodsData[goodName].storeFrequency)
             let newItem
             let final = preliminary
             const finishTime = preliminary.start + preliminary.duration
             if (!forceProduction && buyTime && buyTime < finishTime && finishTime > finishBy && buyTime < goodsData[goodName].duration) {
                 newItem = {good: goodName, purchase: true, start: finishBy-buyTime, duration: buyTime, children: [], listIndex: listIndex}
                 final.duration = buyTime
                 final.start = 0
             } else {
                 let ingredientItemsAdded = []
                 if (Object.keys(ingredients).length > 0) {
                     const ingredientResult = addOrderInternal(ingredients, storage, pipelines, preliminary.start, waitUntil, listIndex, false, false)
                     ingredientItemsAdded = ingredientResult.itemsAdded
                     final = findBest(ingredientResult.expectedTime, finishBy)
                     localWaitUntil = ingredientResult.expectedTime
                 } else {
                     final = findBest(waitUntil, finishBy)
                 }
                 newItem = addToPipeline(pipelines[final.pipeline], goodName, final.pipeline, final.start, localWaitUntil)
                 newItem.children = ingredientItemsAdded
                 newItem.listIndex = listIndex
             }
            itemsAdded.push(newItem)
            if (final.start + final.duration > latestTime) {
                latestTime = final.duration + final.start
            }
        }
        return {expectedTime: latestTime, itemsAdded: itemsAdded}
    }

    const addToPipeline = (pipeline, good, building, startTime, waitUntil) => {
        const goodData = pipeline.goods[good]
        let op = {good: good, duration: goodData.duration, start: startTime, building: building, waitUntil: waitUntil}
        pipeline.running.push(op)
        return op
    }

    return {
        addOrder
    }
}
