import goods from "./Goods.js"
export const buildingLimits = {
    'Factory': 30,
    'Green Factory': 5
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
        timeString += minutes + " mins "
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

function canSlide(currentOperation, amount) {
    return currentOperation.runningId === undefined && currentOperation.slideTime >= amount
}

function bestTime(possibleTime, bestSoFar, neededBy, duration) {
    if (bestSoFar === undefined) {
        return possibleTime
    } else if (possibleTime <= neededBy - duration) {
        if ((possibleTime > bestSoFar) || (bestSoFar > neededBy - duration)) {
            return possibleTime
        }
    } else if (possibleTime < bestSoFar) {
        return possibleTime
    }
    return bestSoFar
}

function findBestTime(operations, building, waitUntil, neededBy, duration) {
    let limit = buildingLimits[building] || 1
    let bestAvailableTime = undefined
    let buildingTime = undefined
    if (operations[building] === undefined) {
        bestAvailableTime = Math.max(waitUntil, neededBy - duration)
    } else if (operations[building].length < limit) {
        bestAvailableTime = Math.max(waitUntil, neededBy - duration)
    } else if (limit === 1) {
        const operationList = operations[building]
        let gapStart = waitUntil
        for (let index = 0; index < operationList.length; index++) {
            const operation = operationList[index]
            if (gapStart + duration <= operation.start) {
                buildingTime = operation.start - duration
                bestAvailableTime = bestTime(buildingTime, bestAvailableTime, neededBy, duration)
                bestAvailableTime = bestTime(gapStart, bestAvailableTime, neededBy, duration)
            }
            gapStart = Math.max(operation.end, gapStart)
        }
        if (bestAvailableTime === undefined) {
            bestAvailableTime = gapStart
        }
    } else {
        let changes = {}
        operations[building].forEach(op => {
            if (changes[op.end] === undefined) {
                changes[op.end] = -1
            } else {
                changes[op.end] -= 1
            }
            if (changes[op.end - op.duration] === undefined) {
                changes[op.end - op.duration] = 1
            } else {
                changes[op.end - op.duration] += 1
            }
        })
        let changeTimes = Object.keys(changes)
        changeTimes.sort((a, b) => a - b)

        let windows = []
        let windowStart = changes[changeTimes[0]]
        let numberInWindow = 0

        changeTimes.forEach((changeTime) => {
            const delta = changes[changeTime]
            if (numberInWindow + delta >= limit && numberInWindow < limit) {
                if (changeTime > 0) {
                    windows.push({start: windowStart, end: changeTime})
                }
                if (numberInWindow >= limit) {
                    windowStart = changeTime
                }
                numberInWindow += delta
            }
        })
        windows.forEach(window => {
            if (window.end - window.start >= duration) {
                bestAvailableTime = bestTime(window.end - duration, bestAvailableTime, neededBy, duration)
                bestAvailableTime = bestTime(window.start, bestAvailableTime, neededBy, duration)
            }
        })
        if (bestAvailableTime === undefined) {
            bestAvailableTime = Math.max(windowStart, neededBy - duration)
        }
    }
    return bestAvailableTime
}

function insertOperation(operations, operation, building, startTime) {
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
    good['slideTime'] = 0
    return good
}

function addOperation(operation, operations, waitUntil, finishBy = 0) {
    let currentOperation = operation
    let newOperations = {...operations}
    let scheduleTime = findBestTime(operations, operation.building, waitUntil, finishBy, operation.duration)
    currentOperation.start = scheduleTime
    currentOperation.end = scheduleTime + currentOperation.duration
    currentOperation.goodToGo = waitUntil === 0
    newOperations = insertOperation(operations, currentOperation, operation.building, scheduleTime)
    return newOperations
}

export function addOrder(order, operations, priority, remainingStorage, running, finishBy = 0) {
    let maxTimeOffset = 0
    let goodsAdded = []
    let childOperations = []
    let existingOperations = []
    let localStorage = {...remainingStorage}
    Object.keys(order).forEach(key => {
        for (let i=0; i < order[key]; i += 1) {
            let good = {...goods[key]}
            let scheduleTime = findBestTime(operations, good.building, 0, finishBy, good.duration)
            let addOrderResult = addOrder(goods[key]['ingredients'], operations, priority, localStorage, running, scheduleTime)
//            const checkForExistingOperation = Object.keys(good.ingredients).length !== 0 || addOrderResult.timeOfCompletion + good.duration > finishBy
            const checkForExistingOperation = true
            let foundRunning = undefined
            let updatedRunning = cloneOperations(running)
            if (checkForExistingOperation) {
                Object.keys(running).forEach(building => {
                    if (foundRunning === undefined) {
                        let foundIndex = undefined
                        running[building].forEach((op, index) => {
                            if (foundIndex === undefined && op.name === key) {
                                foundIndex = index
                            }
                        })
                        if (foundIndex !== undefined) {
                            foundRunning = running[building][foundIndex]
                            updatedRunning[building].splice(foundIndex, 1)
                        }
                    }
                })
            }
            const checkForStorage = checkForExistingOperation && (foundRunning === undefined || foundRunning.end > finishBy)
            if (checkForStorage && localStorage[key] && localStorage[key] > 0) {
                localStorage[key] -= 1
                existingOperations.push({name: key, end: 0, start: 0, slideTime: 0, fromStorage: true})
            } else if (checkForExistingOperation && foundRunning !== undefined) {
                foundRunning.priority = priority
                childOperations[goodsAdded.length] = []
                goodsAdded.push(foundRunning)
                running = updatedRunning
            } else {
                childOperations[goodsAdded.length] = addOrderResult.operationsForOrder
                operations = addOrderResult['allOperations']
                localStorage = addOrderResult['storage']
                running = addOrderResult['running']
                good['name'] = key
                good['slideTime'] = 0
                good['priority'] = priority
                goodsAdded.push(good)
                operations = addOperation(good, operations, addOrderResult.timeOfCompletion, finishBy)
            }
        }
    })
    if (goodsAdded.length === 0) {
        return {allOperations: operations, timeOfCompletion: 0, storage: localStorage, operationsForOrder: existingOperations, running: running}
    }
    goodsAdded.forEach(good => {
        if (good['end'] > maxTimeOffset) {
            maxTimeOffset = good['end']
        }
    })

    let allMatchedOperations = existingOperations
    for (let index = 0; index < goodsAdded.length; index += 1) {
        allMatchedOperations = allMatchedOperations.concat(childOperations[index])
        allMatchedOperations.push(goodsAdded[index])
    }
    return {allOperations: operations, timeOfCompletion: maxTimeOffset, storage: localStorage, operationsForOrder: allMatchedOperations, running: running}
}

export default goods;
