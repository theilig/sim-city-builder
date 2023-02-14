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
        operationsPerGood[good] = result.operationsForOrder
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
            bestAvailableTime = Math.max(gapStart, neededBy - duration)
        }
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
        let changeTimes = Object.keys(changes)
        changeTimes.sort((a, b) => a - b)

        let windows = []
        let windowStart = changeTimes[0]
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

function addOperation(operation, operations, waitUntil, finishBy = 0) {
    let currentOperation = operation
    let scheduleTime = findBestTime(operations, operation.building, waitUntil, finishBy, operation.duration)
    currentOperation.start = scheduleTime
    currentOperation.end = scheduleTime + currentOperation.duration
    return insertOperation(operations, currentOperation, operation.building)
}

export function addOrder(order, operations, listIndex, remainingStorage, running, finishBy = 0) {
    let maxTimeOffset = 0
    let goodsAdded = []
    let childOperations = []
    let existingOperations = []
    let localStorage = {...remainingStorage}
    Object.keys(order).forEach(key => {
        for (let count=0; count < order[key]; count += 1) {
            let good = {...goods[key]}
            let scheduleTime = findBestTime(operations, good.building, 0, finishBy, good.duration)
            if (goods[key] === undefined) { alert(key)}
            let addOrderResult = addOrder(goods[key]['ingredients'], operations, listIndex, localStorage, running, scheduleTime)
            const checkForExistingOperation = addOrderResult.timeOfCompletion + good.duration > finishBy
            let foundRunning = undefined
            let updatedRunning = cloneOperations(running)
            if (checkForExistingOperation) {
                let foundIndex = undefined
                if (running[good.building] !== undefined) {
                    running[good.building].forEach((op, index) => {
                        if (op.name === key && (foundIndex === undefined || op.end <= finishBy)) {
                            foundIndex = index
                        }
                    })
                    if (foundIndex !== undefined) {
                        foundRunning = running[good.building][foundIndex]
                        updatedRunning[good.building].splice(foundIndex, 1)
                    }
                }
            }
            const checkForStorage = checkForExistingOperation && (foundRunning === undefined || foundRunning.end > finishBy)
            if (checkForStorage && localStorage[key] && localStorage[key] > 0) {
                localStorage[key] -= 1
                let pseudoOp = createOperation(key)
                pseudoOp.end = 0
                existingOperations.push({name: key, end: 0, start: 0, fromStorage: true})
            } else if (checkForExistingOperation && foundRunning !== undefined) {
                foundRunning.listIndex = listIndex
                childOperations[goodsAdded.length] = []
                goodsAdded.push(foundRunning)
                running = updatedRunning
            } else {
                childOperations[goodsAdded.length] = addOrderResult.operationsForOrder
                let waitingOn = ""
                addOrderResult.operationsForOrder.forEach(op => {
                    if (op.end === addOrderResult.timeOfCompletion) {
                        waitingOn = op.name
                    }
                })
                operations = addOrderResult['allOperations']
                localStorage = addOrderResult['storage']
                running = addOrderResult['running']
                good.name = key
                good.listIndex = listIndex
                good.waitingOn = waitingOn
                good.childOperations = addOrderResult.operationsForOrder
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
