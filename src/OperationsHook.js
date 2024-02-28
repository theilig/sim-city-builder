import {useState} from "react";
import {goodsData, randomGeneratorKey} from "./BuildingSettings";
import {deepCopy} from "./BuildingSettings";
import {adjustedDuration} from "./ProductionHook";

export const createOperation = (good, start, building, buildingSettings) => {
    return {
        name: good,
        start: start,
        building: building,
        duration:  adjustedDuration(start, good, buildingSettings),
        children: []
    }
}

export const grabFromRunning = (pipelines, goodName, amount, listIndex) => {
    let possibles = []
    let latestTime = 0
    Object.keys(pipelines).forEach(building => {
        if (
            pipelines[building].running &&
            pipelines[building].goods[goodName] !== undefined &&
            pipelines[building].running.length > 0) {
            pipelines[building].running.forEach(op => {
                if (op.good === goodName && op.listIndex === undefined) {
                    possibles.push(op)
                }
            })
        }
    })
    const amountTaken = Math.min(possibles.length, amount)
    if (possibles.length > 0) {
        possibles.sort((a, b) => {
            return a.start - b.start
        })
        possibles.forEach(op => {
            if (amount > 0) {
                amount -= 1
                op.listIndex = listIndex
                latestTime = op.start + op.duration
            }
        })
    }
    return {amount: amountTaken, end: latestTime}
}

export function useOperations() {
    const [running, setRunning] = useState({})
    const [recommendations, setRecommendations] = useState([])
    const clearRecommendations = (currentCity) => {
        let newRunning = deepCopy(running[currentCity], 2)
        Object.keys(running[currentCity]).forEach(building => {
            let newBuildingRunning = []
            running[currentCity][building].running.forEach(op => {
                if (op.lastUpdateTime !== undefined) {
                    newBuildingRunning.push(op)
                }
            })
            newRunning[building].running = newBuildingRunning
        })
        setRecommendations([])
        updateOperations(newRunning, currentCity)
    }

    const getRecommendedLists = () => {
        return recommendations
    }

    const getRunning = (currentCity) => {
        return running[currentCity]
    }

    const changeRunningOperations = (opsToAdd, opsToRemove, forcePull, currentCity) => {
        let newRunning = {}
        let remainingRemovals = {...opsToRemove}
        let maxId = 0
        let timesToStart = {}
        if (running && running[currentCity]) {
            newRunning = {...running[currentCity]}
            Object.keys(running[currentCity]).forEach(building => {
                let newBuilding = {...running[currentCity][building]}
                newBuilding.running = []
                running[currentCity][building].running.forEach(op => {
                    if (maxId < op.id) {
                        maxId = op.id
                    }
                    if (op.lastUpdateTime !== undefined && op.duration > 0) {
                        const finishTime = op.start + op.duration
                        if (timesToStart[building] === undefined || timesToStart[building] < finishTime) {
                            timesToStart[building] = finishTime
                        }
                    }
                    if (remainingRemovals[op.good]
                        && remainingRemovals[op.good] > 0
                        && (forcePull || op.duration <= 50)) {
                        remainingRemovals[op.good] -= 1
                    } else {
                        newBuilding.running.push(op)
                    }
                })
                newRunning[building] = newBuilding
            })
        }
        let allFound = true
        opsToAdd.forEach(op => {
            if (newRunning[op.building] === undefined) {
                newRunning[op.building] = deepCopy(running[currentCity][op.building].running)
            }
            let finalOp;
            newRunning[op.building].running.forEach(existingOp => {
                if (!finalOp && existingOp.good === op.good && existingOp.lastUpdateTime === undefined) {
                    finalOp = existingOp
                }
            })
            if (!finalOp) {
                allFound = false;
                finalOp = op
                newRunning[op.building].running.push(op)
            }
            finalOp.lastUpdateTime = Date.now()
            if (newRunning[op.building].isParallel) {
                finalOp.start = 0
            } else {
                finalOp.start = timesToStart[finalOp.building] || 0
                finalOp.duration = adjustedDuration(finalOp.good, finalOp.start, newRunning[finalOp.building])
                timesToStart[finalOp.building] = finalOp.start + finalOp.duration
            }
        })
        if (!allFound) {
            // We kicked off an unexpected op, need to reset recommendations
            Object.keys(newRunning).forEach(building => {
                newRunning[building].running = newRunning[building].running.filter(op => op.lastUpdateTime !== undefined)
            })
        }
        updateOperations(newRunning, currentCity);
        return allFound
    }

    const updateOperations = (newRunning, currentCity) => {
        let allRunning = {...running}
        allRunning[currentCity] = newRunning
        const countRunning = (pipelines) => {
            let sum = 0
            Object.keys(pipelines).forEach(pipe => {
                sum += pipelines[pipe].running.length
            })
            return sum
        }
        const newCount = countRunning(newRunning)
        setRunning(allRunning)
    }

    const speedUpOperations = (operations, amount, currentCity) => {
        let newRunning = {...running[currentCity]}
        let idsToSpeedUp = {}
        operations.forEach(op => {
            idsToSpeedUp[op.id] = true;
        })
        Object.keys(running[currentCity]).forEach(building => {
            let newBuilding = {...running[currentCity][building]}
            newBuilding.running = []
            running[currentCity][building].running.forEach(op => {
                if (idsToSpeedUp[op.id]) {
                    let newOp = {...op}
                    newOp.duration -= amount
                    newBuilding.running.push(newOp)
                } else {
                    newBuilding.running.push(op)
                }
            })
            newRunning[building] = newBuilding
        })
        updateOperations(newRunning, currentCity)
    }

    const createRecommendations = (pipelines, newList, currentRecommendations, currentCity) => {
        updateOperations(
            pipelines,
            currentCity
        )
        let newRecommendations = [...currentRecommendations]
        newRecommendations.push(newList)
        setRecommendations(newRecommendations)
    }

    const updateAllRunningOps = () => {
        let newRunningOps = {}
        let addToStorage = {}
        Object.keys(running).forEach(city => {
            let localAdd = {}
            let newCityRunning = {...running[city]}
            Object.keys(newCityRunning).forEach(building => {
                let newBuilding = {...newCityRunning[building]}
                newBuilding.running = []
                running[city][building].running.forEach(op => {
                    let newOp = {...op}
                    if (op.lastUpdateTime !== undefined) {
                        const timeDelta = (Date.now() - op.lastUpdateTime) / 1000
                        newOp.lastUpdateTime = Date.now()
                        if (op.start <= 0) {
                            newOp.duration -= timeDelta
                        } else {
                            newOp.start -= timeDelta
                        }
                        newOp.listIndex = undefined
                        if (newOp.duration > 0) {
                            newBuilding.running.push(newOp)
                        } else {
                            if (localAdd[newOp.good] === undefined) {
                                localAdd[newOp.good] = 0
                            }
                            localAdd[newOp.good] += 1
                        }
                    }
                })
                newCityRunning[building] = newBuilding
            })
            newRunningOps[city] = newCityRunning
            addToStorage[city] = localAdd
        })
        return {running: newRunningOps, addToStorage: addToStorage};
    }

    const updatePipelines = (cities, currentCity, updatedSoFar) => {
        const oldPipelines = running[currentCity] || []
        let newPipelines = {}

        if (updatedSoFar === undefined) {
            updatedSoFar = {...running}
        }
        const currentCitySettings = cities[currentCity]
        if (currentCitySettings.buildings) {
            Object.keys(currentCitySettings.buildings).forEach(building => {
                const oldPipe = oldPipelines.building || {running: []}
                let newPipe = {...oldPipe}
                newPipe.slots = currentCitySettings.buildings[building].slots
                newPipe.isParallel = currentCitySettings.buildings[building].isParallel
                newPipe.goods = {}
                Object.keys(goodsData).forEach(good => {
                    let canMake =
                        goodsData[good].building === building ||
                        (building === randomGeneratorKey &&
                            currentCitySettings.buildings[building].currentBuilding === goodsData[good].building)
                    if (canMake) {
                        let multiplier = 1
                        const level = currentCitySettings.buildings[building].level
                        if (level > 0) {
                            multiplier -= .05 + .05 * level
                        }
                        newPipe.goods[good] = {...goodsData[good]}
                        newPipe.goods[good].duration = multiplier * goodsData[good].duration
                    }
                })
                newPipelines[building] = newPipe
            })
        }
        updatedSoFar[currentCity] = newPipelines
        const countRunning = (pipelines) => {
            let sum = 0
            Object.keys(pipelines).forEach(pipe => {
                sum += pipelines[pipe].running.length
            })
            return sum
        }
        const newCount = countRunning(newPipelines)
        setRunning(updatedSoFar)
        return updatedSoFar
    }

    const getRecommended = (currentCity) => {
        let cityRunning = {}
        if (running && running[currentCity]) {
            cityRunning = running[currentCity]
        }
        let allRecommended = []
        Object.keys(cityRunning).forEach(building => {
            cityRunning[building].running.forEach(op => {
                if (op.lastUpdateTime === undefined) {
                    allRecommended.push(op)
                }
            })
        })
        allRecommended.sort((a, b) => {
            return a.start - b.start
        })
        return allRecommended
    }

    return {
        createRecommendations,
        changeRunningOperations,
        clearRecommendations,
        speedUpOperations,
        updateAllRunningOps,
        updatePipelines,
        getRecommended,
        getRecommendedLists,
        updateOperations,
        getRunning
    }
}
