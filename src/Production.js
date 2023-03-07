import goods from "./Goods.js"
export const buildingLimits = {
    'Factory': 33,
    'Green Factory': 5,
    'Coconut Farm': 5
}
let values = undefined

export function calculateBuildingCosts(operations) {
    let totalTimePerBuilding = {}
    let minTime = undefined
    Object.keys(operations.byBuilding).forEach(building => {
        totalTimePerBuilding[building] = 0
        operations.byBuilding[building].forEach(op => totalTimePerBuilding[building] += op.duration)
        if (minTime === undefined || (totalTimePerBuilding[building] < minTime && totalTimePerBuilding[building] > 0)) {
            minTime = totalTimePerBuilding[building]
        }
    })
    if (minTime === undefined || minTime === 0) {
        minTime = 1
    }
    Object.keys(totalTimePerBuilding).forEach(building => {
        const limit = buildingLimits[building] || 1
        totalTimePerBuilding[building] /= limit * minTime
    })

    return totalTimePerBuilding
}
export function calculateValues() {
    if (values !== undefined) {
        return values
    }
    let operationsPerGood = {}
    let operations = {}
    Object.keys(goods).forEach(good => {
        let order = {}
        order[good] = 1
        const result = addOrder(order, operations, 0, {}, {}, 0, 0)
        operationsPerGood[good] = result.added
        operations = result.allOperations
    })
    const buildingCosts = calculateBuildingCosts(operations)

    let aggregateValueSum = {}
    let aggregateCost = {}
    let aggregateCount = {}
    Object.keys(operationsPerGood).forEach(good => {
        aggregateCost[good] = 0
        if (aggregateCount[good] === undefined) {
            aggregateCount[good] = 0
            aggregateValueSum[good] = 0
        }
        operationsPerGood[good].forEach(op => {
            aggregateCost[good] += op.duration * buildingCosts[op.building]
        })
        const value = goods[good].prices[1]
        operationsPerGood[good].forEach(op => {
            const addedValue = value * op.duration * buildingCosts[op.building] / aggregateCost[good]
            if (aggregateCount[op.name] === undefined) {
                aggregateCount[op.name] = 0
                aggregateValueSum[op.name] = 0
            }
            aggregateCount[op.name] += 1
            aggregateValueSum[op.name] += addedValue
        })
    })
    let results = {}
    Object.keys(goods).forEach(good => {
        results[good] = {
            name: good,
            cost: aggregateCost[good],
            value: aggregateValueSum[good] / aggregateCount[good],
            valuePerCost: aggregateValueSum[good] / aggregateCount[good] / aggregateCost[good]
        }
    })
    values = results
    return results
}

export function cloneOperations(operations) {
    return JSON.parse(JSON.stringify(operations))
}

export function secondsToTime(timeInSeconds) {
    const hours = Math.floor(timeInSeconds / 3600)
    const minutes = Math.floor((timeInSeconds - hours * 3600) / 60)
    const seconds = timeInSeconds - minutes * 60 - hours * 3600

    let timeString = ""
    if (hours > 1) {
        timeString = hours + " hrs "
    } else if (hours === 1) {
        timeString = hours + " hr "
    }
    if (minutes > 1) {
        timeString += minutes + " min "
    } else if (minutes === 1) {
        timeString += minutes + " min "
    }
    if (hours === 0 && seconds > 1) {
        timeString += seconds + " secs"
    } else if (hours === 0 && seconds === 1) {
        timeString += seconds + " sec"
    }
    return timeString
}

export function displayName(key, count) {
    if (count === 1) {
        if (goods[key].singular) {
            return goods[key].singular
        } else {
            if (key.charAt(key.length - 1) === "s") {
                return key.substring(0, key.length - 1);
            }
        }
    }
    return key
}

function reserveExistingOperation(existing, good, reserve = true) {
    let foundOp = undefined
    let buildingOps = []
    let operation = createOperation(good)
    let newOps = cloneOperations(existing)
    if (newOps.byBuilding[operation.building]) {
        newOps.byBuilding[operation.building].forEach(op => {
            if (foundOp === undefined && op.name === operation.name && op.reserved !== reserve) {
                op.reserved = reserve
                foundOp = op
                buildingOps.push(op)
            } else {
                buildingOps.push(op)
            }
        })
        newOps.byBuilding[operation.building] = buildingOps
    }
    return {found: foundOp, updated: newOps}
}

function getMaxConcurrentOps(changes, changeTimes, changeIndex, duration) {
    let initialChangeTime = changeTimes[changeIndex]
    let maxConcurrentOps = changes[changeTimes[changeIndex]]
    changeIndex += 1
    while (changeIndex < changeTimes.length && changeTimes[changeIndex] - initialChangeTime < duration) {
        if (changes[changeTimes[changeIndex]] > maxConcurrentOps) {
            maxConcurrentOps = changes[changeTimes[changeIndex]]
        }
        changeIndex += 1
    }
    return maxConcurrentOps
}

function findBestTime(operations, operation, waitUntil, finishBy) {
    const duration = operation.duration
    const building = operation.building
    let limit = buildingLimits[building] || 1
    if (operations.byBuilding[building] === undefined || operations.byBuilding[building].length === 0) {
        return Math.max(waitUntil, 0)
    }
    if (limit === 1) {
        const operationList = operations.byBuilding[building]
        let gapStart = waitUntil
        for (let index = 0; index < operationList.length; index++) {
            const op = operationList[index]
            if (gapStart + duration <= op.start) {
                return gapStart
            } else if (gapStart + duration <= op.start + op.slideTime && (operation.requestorId !== op.requestorId) &&
                (index === operationList.length - 1 || gapStart + duration + op.duration < operationList[index + 1].start)) {
                return gapStart
            }
            gapStart = Math.max(op.end, gapStart)
        }
        return gapStart
    } else {
        let changes = {}
        operations.byBuilding[building].forEach(op => {
            const end = Math.max(op.end, 0)
            const start = Math.max(op.end - op.duration, 0)
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
        let changeTimes = Object.keys(changes).map(s => parseInt(s))
        changeTimes.sort((a, b) => a - b)

        let runningTotal = 0
        changeTimes.forEach((changeTime) => {
            runningTotal += changes[changeTime]
            changes[changeTime] = runningTotal
        })
        let startTime = undefined
        for (let changeIndex = changeTimes.length - 1; changeIndex >= 0; changeIndex -= 1) {
            const maxConcurrentOps = getMaxConcurrentOps(changes, changeTimes, changeIndex, duration)
            if (maxConcurrentOps < limit) {
                startTime = changeTimes[changeIndex]
            }
            if (startTime + duration < finishBy) {
                return startTime
            }
        }
        return startTime
    }
}

function updateSlideTime(operation, finishBy) {
    operation.slideTime = Math.max(0, finishBy - (operation.start + operation.duration))
    if (operation.childOperations !== undefined) {
        operation.childOperations.forEach(op => updateSlideTime(op, finishBy - operation.duration))
    }
}

function adjustStartTime(operation, startTime) {
    operation.start = startTime
    operation.end = operation.start + operation.duration
    updateSlideTime(operation, startTime + operation.duration)
}

function insertOperation(operations, operation, building) {
    let pipeline = operations.byBuilding[building]
    let newPipeline = []
    let inserted = false
    const limit = buildingLimits[building] || 1
    let startTime = 0
    operation['building'] = building
    if (pipeline) {
        for (let index = 0; index < pipeline.length; index += 1) {
            let existingOperation = pipeline[index]
            if (!inserted && operation.start <= existingOperation.start) {
                newPipeline[index] = operation
                inserted = true
                if (limit === 1 && operation.start > 0 && operation.start < startTime) {
                    adjustStartTime(operation, startTime)
                }
                startTime = operation.end
            }
            if (inserted) {
                newPipeline[index + 1] = existingOperation
            } else {
                newPipeline[index] = existingOperation
            }
            if (limit === 1 && existingOperation.start > 0 && existingOperation.start < startTime ) {
                adjustStartTime(existingOperation, startTime)
            }
            startTime = existingOperation.end
        }
        if (!inserted) {
            newPipeline.push(operation)
            if (limit === 1 && operation.start > 0 && operation.start < startTime) {
                adjustStartTime(operation, startTime)
            }
        }
    } else {
        newPipeline = [operation]
        if (limit === 1 && operation.start > 0 && operation.start < startTime) {
            adjustStartTime(operation, startTime)
        }
    }
    operations.byBuilding[building] = newPipeline
}

export function createOperation(goodName) {
    let good = {...goods[goodName]}
    good['start'] = 0
    good['end'] = goods[goodName]['duration']
    good['name'] = goodName
    return good
}

function addOperation(operation, operations, waitUntil, finishBy) {
    let currentOperation = operation
    let scheduleTime = findBestTime(operations, operation, waitUntil, finishBy)
    currentOperation.start = scheduleTime
    currentOperation.end = scheduleTime + currentOperation.duration
    currentOperation.fromStorage = false
    currentOperation.runningId = undefined
    currentOperation.slideTime = Math.max(0, finishBy - currentOperation.end)
    insertOperation(operations, currentOperation, operation.building, currentOperation.slideTime)
}

export function addOrder(order, operations, remainingStorage, running, finishBy, waitUntil, requestorId) {
    let maxTimeOffset = 0
    let goodsAdded = []
    let storage = {...remainingStorage}
    let allItems = []
    let buildingTimes = {}
    Object.keys(order).forEach(key => {
        for (let count = 0; count < order[key]; count += 1) {
            if (goods[key] === undefined) {
                alert(key)
            }
            let newOperation = createOperation(key)
            newOperation.requestorId = requestorId + "." + key
            if (buildingTimes[newOperation.building] === undefined) {
                buildingTimes[newOperation.building] = 0
            }
            buildingTimes[newOperation.building] += newOperation.duration
            allItems.push(newOperation)
        }
    })
    allItems.sort((a, b) => {
        return b.duration - a.duration
    })
    let buildingWaits = {}
    allItems.forEach(newOperation => {
        let storageResult = reserveExistingOperation(storage, newOperation.name, true)
        let runningResult = reserveExistingOperation(running, newOperation.name, true)
        buildingTimes[newOperation.building] -= newOperation.duration
        const buildingLimit = buildingLimits[newOperation.building] || 1
        let addedOperation
        if (storageResult.found !== undefined) {
            storage = storageResult.updated
            storageResult.found.slideTime = finishBy
            addedOperation = storageResult.found
        } else if (runningResult.found !== undefined) {
            running = runningResult.updated
            runningResult.found.slideTime = Math.max(0, finishBy - runningResult.found.end)
            addedOperation = runningResult.found
        } else {
            let localFinishBy = finishBy
            if (buildingLimit === 1) {
                localFinishBy = Math.max(0, localFinishBy - buildingTimes[newOperation.building])
            }
            const scheduleResult = scheduleNewOperation(newOperation, operations, storage, running, waitUntil, localFinishBy, true)
            running = scheduleResult.running
            storage = scheduleResult.storage
            operations = scheduleResult.operations
            addedOperation = newOperation
        }
        buildingWaits[addedOperation.building] = Math.max(0, addedOperation.end)
        goodsAdded.push(addedOperation)
    })
    goodsAdded.forEach(good => {
        if (good['end'] > maxTimeOffset) {
            maxTimeOffset = good['end']
        }
    })

    return {allOperations: operations, timeOfCompletion: maxTimeOffset, storage: storage, added: goodsAdded, running: running}
}

function shuffleReservations(operations, operation, storage, running) {
    let scheduleResult = undefined
    let existingLists = [storage, running]
    let successful = false
    existingLists.forEach(existing => {
        if (existing.byBuilding[operation.building] !== undefined) {
            existing.byBuilding[operation.building].forEach(op => {
                if (!successful && op.name === operation.name && (op.runningId !== undefined || op.fromStorage)) {
                    if (scheduleResult === undefined) {
                        scheduleResult = scheduleNewOperation(operation, operations, storage, running, 0, 0, false)
                    }
                    if (op.slideTime > operation.end - op.end) {
                        // this operation can accept building from scratch, so make the new one into the running operation
                        scheduleResult = scheduleNewOperation(operation, operations, storage, running, 0, op.end + op.slideTime, false)
                        op.slideTime = op.slideTime - (operation.end - op.end)
                        operation.runningId = op.runningId
                        operation.fromStorage = op.fromStorage
                        op.runningId = undefined
                        op.fromStorage = false
                        op.childOperations = operation.childOperations
                        operation.childOperations = []
                        let tmp = operation.start
                        operation.start = op.start
                        op.start = tmp
                        operation.end = op.end
                        op.end = op.start + op.duration
                        successful = true
                        storage = scheduleResult.storage
                        running = scheduleResult.running
                        operations = scheduleResult.operations
                        for (let i = 0; i < operations.byBuilding[op.building].length; i += 1) {
                            if (operations.byBuilding[op.building][i] === op) {
                                operations.byBuilding[op.building][i] = operation
                            } else if (operations.byBuilding[op.building][i] === operation) {
                                operations.byBuilding[op.building][i] = op
                            }
                        }
                    }
                }
            })
        }
    })
    return {successful: successful, operations: operations, storage: storage, running: running}
}

function scheduleNewOperation(operation, operations, storage, running, waitUntil, finishBy, canShuffle, requestorId) {
    let shuffleOperations = cloneOperations(operations)
    let addOrderResult = addOrder(goods[operation.name]['ingredients'], operations, storage, running, Math.max(0, finishBy - operation.duration), waitUntil, operation.requestorId)
    let scheduleTime = findBestTime(operations, operation, addOrderResult.timeOfCompletion, finishBy)
    if (scheduleTime > finishBy - operation.duration && canShuffle && scheduleTime < 7200) {
        const shuffleResult = shuffleReservations(shuffleOperations, operation, storage, running, waitUntil, finishBy, true)
        if (shuffleResult.successful) {
            operation.slideTime = finishBy - operation.end
            return {operations: shuffleResult.operations, storage: shuffleResult.storage, running: shuffleResult.running}
        }
    }
    operation.childOperations = addOrderResult.added
    addOperation(operation, addOrderResult.allOperations, Math.max(waitUntil, addOrderResult.timeOfCompletion), finishBy)
    return {operations: addOrderResult.allOperations, storage: addOrderResult.storage, running: addOrderResult.running}
}
