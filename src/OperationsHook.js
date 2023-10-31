import {useState} from "react";

export const createOperation = (good) => {
    return {
        name: good,
    }
}

export function useOperations() {
    const [running, setRunning] = useState({})
    const [recommended, setRecommended] = useState({})

    const clearOperations = (currentCity) => {
        updateOperations([], [], currentCity)
    }

    const changeRunningOperations = (opsToAdd, opsToRemove, forcePull, currentCity) => {
        let newRunning = []
        let newRecommended = []
        let maxId = 0
        running[currentCity].forEach(op => {
            if (maxId < op.id) {
                maxId = op.id
            }
            if (opsToRemove[op.name]
                && opsToRemove[op.name] > 0
                && (forcePull || op.end <= 50)) {
                opsToRemove[op.name] -= 1
            } else {
                newRunning.push(op)
            }
        })
        opsToAdd.forEach(op => {
            op.lastUpdateTime = Date.now()
        })
        newRunning = newRunning.concat(opsToAdd)
        let recommendedToRemove = {}
        opsToAdd.forEach(op => {
            recommendedToRemove[op.name] = (recommendedToRemove[op.name] || 0) + 1
            maxId += 1
            op.id = maxId
            op.end = op.duration
        })

        recommended[currentCity].forEach(op => {
            if (recommendedToRemove[op.name]
                && recommendedToRemove[op.name] > 0) {
                recommendedToRemove[op.name] -= 1
            } else {
                newRecommended.push(op)
            }
        })

        updateOperations(newRunning, newRecommended, currentCity);
    }

    const updateOperations = (newRunning, newRecommended, currentCity) => {
        let allRunning = {...running}
        allRunning[currentCity] = newRunning
        setRunning(allRunning)

        let allRecommended = {...recommended}
        allRecommended[currentCity] = newRecommended
        setRecommended(allRecommended)
    }

    const speedUpOperations = (operations, amount, currentCity) => {
        let newRunning = []
        let idsToSpeedUp = {}
        operations.forEach(op => {
            idsToSpeedUp[op.id] = true;
        })
        running[currentCity].forEach(op => {
            if (idsToSpeedUp[op.id]) {
                let newOp = {...op}
                newOp.end -= amount
                newRunning.push(newOp)
            } else {
                newRunning.push(op)
            }
        })
        updateOperations(newRunning, recommended[currentCity], currentCity)
    }

    const createRecommendations = (operations, currentCity) => {
        updateOperations(
            running[currentCity] || [],
            (recommended[currentCity] || []).concat(operations),
            currentCity
        )
    }

    const updateAllRunningOps = () => {
        let newRunningOps = {}
        Object.keys(running).forEach(city => {
            let newCityOps = []
            running[city].forEach(op => {
                let newOp = {...op}
                if (op.lastUpdateTime !== undefined) {
                    const timeDelta = Date.now() - op.lastUpdateTime
                    newOp.lastUpdateTime += timeDelta
                    newOp.end -= timeDelta
                }
                newCityOps.push(newOp)
            })
            newRunningOps[city] = newCityOps
        })
        setRunning(newRunningOps)
    }

    return {
        running,
        recommended,
        clearOperations,
        createRecommendations,
        changeRunningOperations,
        speedUpOperations,
        updateAllRunningOps,
    }
}
