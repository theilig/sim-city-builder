import {cloneOperations, createOperation} from "./Production";

export function addToRunning(operation, running, cityBuildings) {
    let localRunning = cloneOperations(running)
    let localOperation = {...operation}
    let building = localOperation.building
    let buildingLimit = 1
    if (cityBuildings[building] && cityBuildings[building].isParallel) {
        buildingLimit = cityBuildings[building].slots
    }

    let startTime = 0
    if (localRunning.byBuilding[building] === undefined) {
        localRunning.byBuilding[building] = [localOperation]
    } else {
        if (buildingLimit === 1 && localRunning.byBuilding[building].length > 0) {
            startTime = localRunning.byBuilding[building][localRunning.byBuilding[building].length - 1].end
        }
        localRunning.byBuilding[building].push(localOperation)
    }
    if (startTime < 0) {
        startTime = 0
    }
    localOperation.runningId = localRunning.byBuilding[building].length
    localOperation.scheduledId = undefined
    localOperation.placeInList = localRunning.byBuilding[building].length
    localOperation.runTime = Date.now()
    localOperation.start = startTime
    localOperation.end = operation.duration + localOperation.start
    return localRunning
}

export function finishRunning(good, running, cityGoods) {
    let localRunning = cloneOperations(running)
    let operation = createOperation(good, cityGoods)
    let removed = false
    let buildingRunning = []
    if (localRunning.byBuilding[operation.building]) {
        localRunning.byBuilding[operation.building].forEach(op => {
            if (!removed && op.good === operation.good) {
                removed = true
            } else {
                buildingRunning.push(op)
            }
        })
        localRunning.byBuilding[operation.building] = buildingRunning
    }
    return {found: removed, running: localRunning}
}

export function speedUpOperation(running, operation, amount) {
    let newRunning = cloneOperations(running)
    let found = false
    let startTime = 0
    newRunning.byBuilding[operation.building].forEach(op => {
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

export function finishOperation(running, operation, onlyComplete) {
/*    let newRunning = cloneOperations(running)
    const building = operation.building
    const newBuildingOps = []
    let found = false
    let startTime = 0
    if (newRunning.byBuilding[building] !== undefined) {
        newRunning.byBuilding[building].forEach(op => {
            if (found || op.name !== operation.name || (onlyComplete && op.end > 60)) {
                if (op.start > startTime) {
                    op.start = startTime
                    op.end = startTime + op.duration
                }
                newBuildingOps.push(op)
                op.runningId = newBuildingOps.length
                startTime = op.end
            } else {
                found = true
            }
        })
        newRunning.byBuilding[building] = newBuildingOps

    }
    return newRunning */
}

export function updateRunning(runningOperations) {
    let newRunning = cloneOperations(runningOperations)
    Object.keys(newRunning.byBuilding).forEach(building => {
        newRunning.byBuilding[building].forEach(op => {
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
