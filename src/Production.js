import goods from "./Goods.js"
export const buildingLimits = {
    'Factory': 33,
    'Green Factory': 5,
    'Coconut Farm': 5
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

function getMaxConcurrentOps(changes, changeTimes, changeIndex, duration, waitUntil) {
    let initialChangeTime = changeTimes[changeIndex]
    let maxConcurrentOps = changes[changeTimes[changeIndex]]
    changeIndex += 1
    while (changeIndex < changeTimes.length && changeTimes[changeIndex] - initialChangeTime < duration + waitUntil) {
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
    let startTime = undefined
    for (let changeIndex = changeTimes.length - 1; changeIndex >= 0; changeIndex -= 1) {
        const maxConcurrentOps = getMaxConcurrentOps(changes, changeTimes, changeIndex, duration, waitUntil)
        if (maxConcurrentOps < limit) {
            startTime = Math.max(changeTimes[changeIndex], waitUntil)
            if (startTime + duration < finishBy ) {
                startTime = changeTimes[changeIndex]
                if (limit > 1) {
                    // if we are in a factory we want the latest time that fits our requirements
                    return startTime
                }
            }
        }
    }
    return startTime
}

function adjustStartTime(operation, startTime) {
    operation.start = startTime
    operation.end = operation.start + operation.duration
}

function insertOperation(operations, operation, building) {
    let pipeline = operations.byBuilding[building]
    let newPipeline = []
    let inserted = false
    const limit = buildingLimits[building] || 1
    let startTime = operation.start
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
            if (limit === 1 && inserted && existingOperation.start > 0 && existingOperation.start < startTime ) {
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

function addOperation(operation, buildingPipelines, waitUntil, finishBy, deadline) {
    let currentOperation = operation
    let scheduleTime = findBestTime(buildingPipelines, operation, waitUntil, finishBy)
    currentOperation.start = scheduleTime
    currentOperation.end = scheduleTime + currentOperation.duration
    currentOperation.fromStorage = false
    currentOperation.runningId = undefined
    if (deadline === undefined || scheduleTime < deadline) {
        insertOperation(buildingPipelines, currentOperation, operation.building)
    }
}

export function addOrder(order, buildingPipelines, existingOps, finishBy, waitUntil, deadline) {
    let maxTimeOffset = 0
    let goodsAdded = []
    let allItems = []
    let buildingTimes = {}
    let expectedTimes = []
    let indexes = []
    Object.keys(order).forEach(key => {
        for (let count = 0; count < order[key]; count += 1) {
            if (goods[key] === undefined) {
                alert(key)
            }
            let newOperation = createOperation(key)
            if (buildingTimes[newOperation.building] === undefined) {
                buildingTimes[newOperation.building] = 0
            }
            buildingTimes[newOperation.building] += newOperation.duration
            indexes.push(allItems.length)
            allItems.push(newOperation)
            expectedTimes.push(buildingTimes[newOperation.building])
        }
    })
    indexes.sort((a, b) => {
        return expectedTimes[b] - expectedTimes[a]
    })
    let buildingWaits = {}
    indexes.forEach(index => {
        let newOperation = allItems[index]
        const good = newOperation.name
        buildingTimes[newOperation.building] -= newOperation.duration
        const buildingLimit = buildingLimits[newOperation.building] || 1
        if (existingOps[good] && existingOps[good].length > 0) {
            let existingOp = existingOps[good][0]
            if (existingOp.count > 1) {
                existingOp.count -= 1
                newOperation = {...existingOp}
            } else {
                newOperation = existingOp
                existingOps[good] = existingOps[good].slice(1)
            }
        } else {
            let localFinishBy = finishBy
            if (buildingLimit === 1) {
                localFinishBy = Math.max(0, localFinishBy - buildingTimes[newOperation.building])
            }
            scheduleNewOperation(newOperation, buildingPipelines, existingOps, waitUntil, localFinishBy, deadline)
        }
        buildingWaits[newOperation.building] = Math.max(buildingWaits[newOperation.building] || 0, newOperation.end)
        if (newOperation.end > maxTimeOffset) {
            maxTimeOffset = newOperation.end
        }
        goodsAdded.push(newOperation)
    })

    return {timeOfCompletion: maxTimeOffset, added: goodsAdded}
}

function scheduleNewOperation(operation, buildingPipelines, existingOps, waitUntil, finishBy, deadline) {
    let addOrderResult = addOrder(goods[operation.name]['ingredients'], buildingPipelines, existingOps, Math.max(0, finishBy - operation.duration), waitUntil, deadline)
    operation.childOperations = addOrderResult.added
    addOperation(operation, buildingPipelines, Math.max(waitUntil, addOrderResult.timeOfCompletion), finishBy, deadline)
}
