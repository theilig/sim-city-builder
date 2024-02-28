import {goodsData} from "./BuildingSettings";
import {grabFromRunning} from "./OperationsHook";
import {grabFromStorage} from "./StorageHook";
import {deepCopy} from "./BuildingSettings";
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
        const savedStorage = deepCopy(storage, 0)
        const savedPipelines = deepCopy(pipelines, 2)
        const result = addOrderInternal(order, savedStorage, savedPipelines, finishBy, waitUntil, listIndex, forceProduction)
        result.updatedStorage = savedStorage
        result.updatedPipelines = savedPipelines
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

    function getMaxConcurrentOps(changes, changeTimes, changeIndex, duration, waitUntil) {
        let initialChangeTime = changeTimes[changeIndex]
        let maxConcurrentOps = changes[changeTimes[changeIndex]]
        changeIndex += 1
        while (changeIndex < changeTimes.length && changeTimes[changeIndex] < initialChangeTime + duration + waitUntil) {
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
            const opDuration = adjustDuration(op.start, op.duration, pipeline)
            const start = op.start
            const end = op.start + opDuration
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

    const produce = (goodName, amount, storage, pipelines, finishBy, waitUntil, listIndex, forceProduction) => {
        const findBest = (localWaitUntil) => {
            let bestTimesResult = undefined
            const buildings = Object.keys(pipelines)
            for (let i = 0; i < buildings.length; i += 1) {
                const building = buildings[i]
                const pipeline = pipelines[building]
                if (pipeline.goods[goodName]) {
                    const expectedTimes = bestTime(pipeline, goodName, finishBy, localWaitUntil)
                    if (bestTimesResult === undefined || expectedTimes.end <= bestTimesResult.end) {
                        bestTimesResult = expectedTimes
                        bestTimesResult.pipeline = building
                    }
                }
            }
            return bestTimesResult
        }
        let latestTime = 0
        let itemsAdded = []
        let ingredients = goodsData[goodName].ingredients
        if (!forceProduction) {
            amount -= grabFromStorage(storage, goodName, amount)
            if (amount > 0) {
                const result = grabFromRunning(pipelines, goodName, amount)
                amount -= result.amount
                if (latestTime < result.end) {
                    latestTime = result.end
                }
            }
        }

         for (let i = 0; i < amount; i += 1) {
             const preliminary = findBest(waitUntil)
             let final = preliminary
             let ingredientItemsAdded = []
             if (Object.keys(ingredients).length > 0) {
                 const ingredientResult = addOrderInternal(ingredients, storage, pipelines, preliminary.start, waitUntil, listIndex, false, false)
                 ingredientItemsAdded = ingredientResult.itemsAdded
                 final = findBest(ingredientResult.expectedTime)

             }
            const newItem = addToPipeline(pipelines[final.pipeline], goodName, final.pipeline, final.start)
            newItem.children = ingredientItemsAdded
            newItem.listIndex = listIndex
            itemsAdded.push(newItem)
            if (final.start + final.duration > latestTime) {
                latestTime = final.duration + final.start
            }
        }
        return {expectedTime: latestTime, itemsAdded: itemsAdded}
    }

    const addToPipeline = (pipeline, good, building, startTime) => {
        const goodData = pipeline.goods[good]
        let op = {good: good, duration: goodData.duration, start: startTime, building: building}
        pipeline.running.push(op)
        return op
    }

    return {
        addOrder
    }
}
