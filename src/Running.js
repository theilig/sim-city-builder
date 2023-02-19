import {buildingLimits, cloneOperations, createOperation} from "./Production";

export function addToRunning(operation, running) {
    let localRunning = cloneOperations(running)
    let localOperation = {...operation}
    let building = localOperation.building
    let buildingLimit = buildingLimits[building] || 1
    let startTime = 0
    if (localRunning[building] === undefined) {
        localRunning[building] = [localOperation]
    } else {
        if (buildingLimit === 1 && localRunning[building].length > 0) {
            startTime = localRunning[building][localRunning[building].length - 1].end
        }
        localRunning[building].push(localOperation)
    }
    if (startTime < 0) {
        startTime = 0
    }
    localOperation.runningId = localRunning[building].length
    localOperation.scheduledId = undefined
    localOperation.placeInList = localRunning[building].length
    localOperation.runTime = Date.now()
    localOperation.start = startTime
    localOperation.end = operation.duration + operation.start
    return localRunning
}

export function finishRunning(good, running) {
    let localRunning = cloneOperations(running)
    let operation = createOperation(good)
    let removed = false
    let buildingRunning = []
      localRunning[operation.building].forEach(op => {
        if (!removed && op.name === operation.name) {
            removed = true
        } else {
            buildingRunning.push(op)
        }
    })
    localRunning[operation.building] = buildingRunning
    return {found: removed, running: localRunning}
}

export function speedUpOperation(running, operation, amount) {
    let newRunning = cloneOperations(running)
    let found = false
    let startTime = 0
    newRunning[operation.building].forEach(op => {
        if (op.runningId === operation.runningId) {
            op.start -= amount
            op.end -= amount
            found = true
            startTime = Math.max(0, op.end)
        } else if (found && op.start > startTime) {
            op.start = startTime
            op.end = startTime + op.duration
            startTime = op.end
        }
    })
    return newRunning
}

export function finishOperation(running, operation) {
    let newRunning = cloneOperations(running)
    const building = operation.building
    const newBuildingOps = []
    let found = false
    let startTime = 0
    newRunning[building].forEach(op => {
        if (found || op.name !== operation.name) {
            if (op.start > startTime) {
                op.start = startTime
                op.end = startTime + op.duration
            }
            newBuildingOps.push(op)
            startTime = op.end
        } else {
            found = true
        }
    })
    newRunning[building] = newBuildingOps
    return newRunning
}

export function updateRunning(runningOperations) {
    let newRunning = cloneOperations(runningOperations)
    Object.keys(newRunning).forEach(building => {
        newRunning[building].forEach(op => {
            const currentTime = Date.now()
            op.end = Math.round(op.end - (currentTime - op.runTime) / 1000)
            op.start = op.end - op.duration
            if (op.end < 0) {
                op.end = 0
            }
            op.runTime = currentTime
        })
    })
    return newRunning
}
