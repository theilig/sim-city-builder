import goods from "./Goods.js"
export const buildingLimits = {
    'Factory': 30,
    'Green Factory': 5
}
let values = undefined

export function calculateBuildingCosts(operations) {
    let totalTimePerBuilding = {}
    let minTime = undefined
    Object.keys(operations).forEach(building => {
        totalTimePerBuilding[building] = 0
        operations[building].forEach(op => totalTimePerBuilding[building] += op.duration)
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
        const result = addOrder(order, operations, 0, {}, {}, 0)
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
    if (newOps[operation.building]) {
        newOps[operation.building].forEach(op => {
            if (foundOp === undefined && op.name === operation.name && op.reserved !== reserve) {
                op.reserved = reserve
                foundOp = op
            } else {
                buildingOps.push(op)
            }
        })
        newOps[operation.building] = buildingOps
    }
    return {found: foundOp, updated: newOps}
}

function findBestTime(operations, building, waitUntil, duration) {
    let limit = buildingLimits[building] || 1
    if (operations[building] === undefined) {
        return Math.max(waitUntil, 0)
    } else if (operations[building].length < limit) {
        return Math.max(waitUntil, 0)
    }
    if (limit === 1) {
        const operationList = operations[building]
        let gapStart = waitUntil
        for (let index = 0; index < operationList.length; index++) {
            const operation = operationList[index]
            if (gapStart + duration <= operation.start) {
                return gapStart
            }
            gapStart = Math.max(operation.end, gapStart)
        }
        return gapStart
    } else {
        let changes = {}
        operations[building].forEach(op => {
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

        let windows = []
        let numberInWindow = 0
        let windowStart = 0
        changeTimes.forEach((changeTime) => {
            const delta = changes[changeTime]
            if (numberInWindow + delta >= limit && numberInWindow < limit) {
                if (windowStart !== undefined && changeTime > windowStart) {
                    windows.push({start: windowStart, end: changeTime})
                }
            }
            numberInWindow += delta
            if (numberInWindow >= limit) {
                windowStart = undefined
            } else if (windowStart === undefined) {
                windowStart = changeTime
            }
        })
        windows.forEach(window => {
            if (window.end - window.start >= duration) {
                return window.start
            }
        })
        // We missed all the windows, the last one starts on windowStart (but was not added to the window list)
        return windowStart
    }
}

function insertOperation(operations, operation, building) {
    let newOperations = {...operations}
    let pipeline = newOperations[building]
    let newPipeline = []
    let inserted = false
    operation['building'] = building
    if (pipeline) {
        for (let index = 0; index < pipeline.length; index += 1) {
            if (!inserted && operation.start <= pipeline[index].start) {
                newPipeline[index] = operation
                inserted = true
            }
            if (inserted) {
                newPipeline[index + 1] = pipeline[index]
            } else {
                newPipeline[index] = pipeline[index]
            }
        }
        if (!inserted) {
            newPipeline.push(operation)
        }
    } else {
        newPipeline = [operation]
    }
    newOperations[building] = newPipeline
    return newOperations
}

export function createOperation(goodName) {
    let good = {...goods[goodName]}
    good['start'] = 0
    good['end'] = goods[goodName]['duration']
    good['name'] = goodName
    return good
}

function addOperation(operation, operations, waitUntil) {
    let currentOperation = operation
    let scheduleTime = findBestTime(operations, operation.building, waitUntil, operation.duration)
    currentOperation.start = scheduleTime
    currentOperation.end = scheduleTime + currentOperation.duration
    currentOperation.fromStorage = false
    currentOperation.runningId = undefined
    return insertOperation(operations, currentOperation, operation.building)
}

export function addOrder(order, operations, listIndex, remainingStorage, running, finishBy = 0, waitUntil = 0) {
    let maxTimeOffset = 0
    let goodsAdded = []
    let storage = {...remainingStorage}
    Object.keys(order).forEach(key => {
        for (let count = 0; count < order[key]; count += 1) {
            if (goods[key] === undefined) {
                alert(key)
            }
            let newOperation = createOperation(key)
            newOperation.listIndex = listIndex
            let storageResult = reserveExistingOperation(storage, key, true)
            let runningResult = reserveExistingOperation(running, key, true)
            if (storageResult.found !== undefined) {
                storage = storageResult.updated
                storageResult.found.slideTime = finishBy - newOperation.duration
                goodsAdded.push(storageResult.found)
            } else if (runningResult.found !== undefined) {
                running = runningResult.updated
                runningResult.found.slideTime = Math.min(0, finishBy - runningResult.found.end)
                goodsAdded.push(runningResult.found)
            } else {
                const scheduleResult = scheduleNewOperation(newOperation, operations, storage, running, waitUntil, finishBy, true)
                running = scheduleResult.running
                storage = scheduleResult.storage
                operations = scheduleResult.operations
                goodsAdded.push(newOperation)
            }
        }
    })
    goodsAdded.forEach(good => {
        if (good['end'] > maxTimeOffset) {
            maxTimeOffset = good['end']
        }
    })

    return {allOperations: operations, timeOfCompletion: maxTimeOffset, storage: storage, added: goodsAdded, running: running}
}

function shuffleReservations(operations, operation, storage, running) {
    let scheduleResult = scheduleNewOperation(operation, operations, storage, running, 0, 0, false)
    if (operations[operation.building] !== undefined) {
        operations[operation.building].forEach(op => {
            if ((op.runningId !== undefined || op.fromStorage) && op.slideTime > operation.end - op.end) {
                // this operation can slide, so make the new one into the running operation
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
                scheduleResult.successful = true
                return scheduleResult
            }
        })
    }
    return {successful: false, operations: operations, storage: storage, running: running}
}

function scheduleNewOperation(operation, operations, storage, running, waitUntil, finishBy, canShuffle) {
    let scheduleTime = findBestTime(operations, operation.building, waitUntil, operation.duration)
    if (scheduleTime > finishBy - operation.duration && canShuffle) {
        const shuffleResult = shuffleReservations(operations, operation, storage, running, waitUntil, finishBy, true)
        if (shuffleResult.successful) {
            operation.slideTime = finishBy - operation.end
            return {operations: shuffleResult.operations, storage: shuffleResult.storage, running: shuffleResult.running}
        }
    }
    let addOrderResult = addOrder(goods[operation.name]['ingredients'], operations, operation.listIndex, storage, running, scheduleTime, waitUntil)
    operation.childOperations = addOrderResult.added
    operation.slideTime = Math.max(0, finishBy - operation.duration - addOrderResult.timeOfCompletion)
    operations = addOperation(operation, addOrderResult.allOperations, addOrderResult.timeOfCompletion)
    return {operations: operations, storage: addOrderResult.storage, running: addOrderResult.running}
}
