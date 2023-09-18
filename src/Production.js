export function cloneOperations(operations) {
    if (operations) {
        return JSON.parse(JSON.stringify(operations))
    } else {
        return {byBuilding: {}}
    }
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

export function displayName(good, count) {
    if (count === 1) {
        if (good.singular) {
            return good.singular
        } else {
            if (good.name.charAt(good.name.length - 1) === "s") {
                return good.name.substring(0, good.name.length - 1);
            }
        }
    }
    return good.name
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

function findBestTime(operations, operation, waitUntil, finishBy, cityBuildings) {
    const duration = operation.duration
    const building = operation.building
    let limit = 1
    if (cityBuildings[building].isParallel) {
        limit = cityBuildings[building].slots
    }
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
    let startTime = Math.max(changeTimes[changeTimes.length - 1], waitUntil)
    for (let changeIndex = changeTimes.length - 1; changeIndex >= 0 && changeTimes[changeIndex] >= waitUntil; changeIndex -= 1) {
        const maxConcurrentOps = getMaxConcurrentOps(changes, changeTimes, changeIndex, duration, waitUntil)
        if (maxConcurrentOps < limit) {
            startTime = changeTimes[changeIndex]
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

function insertOperation(operations, operation, building, liveTokens, cityBuildings) {
    let pipeline = operations.byBuilding[building]
    let newPipeline = []
    let inserted = false
    let limit = 1
    if (cityBuildings[building] && cityBuildings[building].isParallel) {
        limit = cityBuildings[building].slots
    }

    let startTime = operation.start
    operation['building'] = building
    let token
    if (liveTokens && liveTokens[building]) {
        token = liveTokens[building]
    }

    if (pipeline) {
        for (let index = 0; index < pipeline.length; index += 1) {
            let existingOperation = pipeline[index]
            if (!inserted && operation.start <= existingOperation.start) {
                newPipeline[index] = operation
                inserted = true
                if (limit === 1 && operation.start > 0 && operation.start < startTime) {
                    adjustStartTime(operation, startTime)
                }
                if (token) {
                    const remainingSpeedup = token.endTime - Date.now() - startTime
                    if (remainingSpeedup > 0) {
                        if (operation.duration > remainingSpeedup) {
                            operation.end -= remainingSpeedup * token.speedMultiplier
                        } else {
                            let newDuration = operation.duration / token.speedMultiplier
                            operation.end = startTime + newDuration
                        }
                    }
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
            if (limit === 1) {
                startTime = Math.max(existingOperation.end, operation.startTime)
            }
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

export function createOperation(goodName, cityGoods) {
    let good = {...cityGoods[goodName]}
    good['start'] = 0
    good['end'] = good['duration']
    good['name'] = goodName
    return good
}

function addOperation(operation, buildingPipelines, waitUntil, finishBy, tokens, cityBuildings) {
    let currentOperation = operation
    let scheduleTime = findBestTime(buildingPipelines, operation, waitUntil, finishBy, cityBuildings)
    currentOperation.start = scheduleTime
    currentOperation.end = scheduleTime + currentOperation.duration
    currentOperation.fromStorage = false
    currentOperation.runningId = undefined
    insertOperation(buildingPipelines, currentOperation, operation.building, tokens, cityBuildings)
}

export function addOrder(order, buildingPipelines, existingOps, finishBy, waitUntil, liveTokens, cityGoods, cityBuildings) {
    let maxTimeOffset = 0
    let goodsAdded = []
    let allItems = []
    let buildingTimes = {}
    let expectedTimes = []
    let indexes = []
    let factoryGoodIsBottleneck = false
    Object.keys(order).forEach(key => {
        for (let count = 0; count < order[key]; count += 1) {
            if (cityGoods[key] === undefined) {
                alert(key)
            }
            let newOperation = createOperation(key, cityGoods)
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
    let skippedList = {}
    indexes.forEach(index => {
        let newOperation = allItems[index]
        const good = newOperation.name
        const building = newOperation.building
        buildingTimes[building] -= newOperation.duration
        let buildingLimit = 1
        if (cityBuildings[building] && cityBuildings[building].isParallel) {
            buildingLimit = cityBuildings[building].slots
        }
        let localFinishBy = finishBy
        if (buildingLimit === 1) {
            localFinishBy = Math.max(finishBy, (buildingWaits[building] || 0) + newOperation.duration)
        }
        let localExistingOps = cloneOperations(existingOps)
        let localBuildingPipelines = cloneOperations(buildingPipelines)
        delete localExistingOps[good] // We want to make one from scratch
        let singleOrder = {}
        singleOrder[good] = 1
        let useNewOp = true
        skippedList = scheduleNewOperation(newOperation, localBuildingPipelines, localExistingOps, waitUntil, localFinishBy, liveTokens, cityGoods, cityBuildings)

        if (existingOps[good] && existingOps[good].length > 0) {
            if (newOperation.end <= localFinishBy) {
                /** We don't need to grab a running op so we won't, however if nobody takes it
                 * we want to signal to use it instead of creating another
                 */
                skippedList[good] = true
            } else {
                skippedList = {} // we aren't going to use the result from above because it's too late
                useNewOp = false
                // Take the last one from the list that still meets our needs
                let existingIndex = existingOps[good].length - 1
                while (existingIndex > 0 && existingOps[good][existingIndex].end > localFinishBy) {
                    existingIndex -= 1;
                }
                let existingOp = existingOps[good][existingIndex]
                if (existingOp.count > 1) {
                    existingOp.count -= 1
                    newOperation = {...existingOp}
                } else {
                    newOperation = existingOp
                    existingOps[good].splice(existingIndex, 1)
                }
            }
        }

        if (useNewOp) {
            scheduleNewOperation(newOperation, buildingPipelines, existingOps, waitUntil, localFinishBy, liveTokens, cityGoods, cityBuildings)
        }

        buildingWaits[newOperation.building] = Math.max(buildingWaits[newOperation.building] || 0, newOperation.end)
        if (newOperation.end > maxTimeOffset) {
            maxTimeOffset = newOperation.end
            if (newOperation.runningId === undefined && (newOperation.childOperations === undefined || newOperation.childOperations.length === 0)) {
                factoryGoodIsBottleneck = newOperation.name
            } else {
                factoryGoodIsBottleneck = undefined
            }
        }
        goodsAdded.push(newOperation)
    })

    return {timeOfCompletion: maxTimeOffset, added: goodsAdded, factoryGoodIsBottleneck: factoryGoodIsBottleneck, runningSkipped: skippedList}
}

function scheduleNewOperation(operation, buildingPipelines, existingOps, waitUntil, finishBy, tokens, cityGoods, cityBuildings) {
    let addOrderResult = addOrder(
        cityGoods[operation.name]['ingredients'],
        buildingPipelines,
        existingOps,
        Math.max(0, finishBy - operation.duration),
        waitUntil,
        {},
        cityGoods,
        cityBuildings
    )
    operation.childOperations = addOrderResult.added
    addOperation(operation, buildingPipelines, Math.max(waitUntil, addOrderResult.timeOfCompletion), finishBy, tokens, cityBuildings)
    return addOrderResult.runningSkipped
}
