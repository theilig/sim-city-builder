import {useState} from "react";
import {goodsData, randomGeneratorKey} from "./BuildingSettings";
import {deepCopy} from "./BuildingSettings";
import {adjustedDuration} from "./ProductionHook";
import {EPHEMERAL_LIST_INDEX} from "./RecommendationHook";

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
    let itemsTaken = []
    Object.keys(pipelines).forEach(building => {
        if (
            pipelines[building].running &&
            pipelines[building].goods[goodName] !== undefined &&
            pipelines[building].running.length > 0) {
            pipelines[building].running.forEach(op => {
                if (op.good === goodName &&
                    (op.listIndex === undefined ||
                        (listIndex !== EPHEMERAL_LIST_INDEX && op.listIndex === EPHEMERAL_LIST_INDEX))) {
                    possibles.push(op)
                }
            })
        }
    })
    if (possibles.length > 0) {
        possibles.sort((a, b) => {
            return a.start - b.start
        })
        possibles.forEach(op => {
            if (amount > 0) {
                amount -= 1
                op.listIndex = listIndex
                latestTime = op.start + op.duration
                itemsTaken.push(op)
            }
        })
    }
    return {end: latestTime, items: itemsTaken}
}

export function useOperations() {
    const [running, setRunning] = useState({})
    const clearRecommendations = (currentCity) => {
        const pipelines = getPipelines(currentCity)
        let newRunning = deepCopy(pipelines, 2)
        Object.keys(pipelines).forEach(building => {
            let newBuildingRunning = []
            pipelines[building].running.forEach(op => {
                if (op.lastUpdateTime !== undefined) {
                    newBuildingRunning.push(op)
                }
            })
            newRunning[building].running = newBuildingRunning
        })
        updateOperations(newRunning, [], [], currentCity)
    }

    const getRecommendedLists = (currentCity) => {
        if (!running || !running.targets || !running.targets[currentCity]) {
            return []
        }
        return running.targets[currentCity]
    }

    const getPurchases = (currentCity) => {
        if (!running || !running.purchases || !running.purchases[currentCity]) {
            return []
        }
        return running.purchases[currentCity]
    }

    const getPipelines = (currentCity) => {
        if (!running || !running.pipelines || !running.pipelines[currentCity]) {
            return {}
        }
        return running.pipelines[currentCity]
    }

    const changeRunningOperations = (opsToAdd, opsToRemove, forcePull, currentCity) => {
        let newRunning = {}
        let remainingRemovals = {...opsToRemove}
        let maxId = 0
        let timesToStart = {}
        const pipelines = getPipelines(currentCity)
        newRunning = {...pipelines}
        let allFound = true
        Object.keys(pipelines).forEach(building => {
            let newBuilding = {...pipelines[building]}
            newBuilding.running = []
            pipelines[building].running.forEach(op => {
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
                    && (forcePull || op.duration <= 50 || op.lastUpdateTime === undefined)) {
                    remainingRemovals[op.good] -= 1
                } else {
                    newBuilding.running.push(op)
                }
            })
            newRunning[building] = newBuilding
        })
        opsToAdd.forEach(op => {
            if (newRunning[op.building] === undefined) {
                newRunning[op.building] = deepCopy(pipelines[op.building].running)
            }
            let finalOp;
            newRunning[op.building].running.forEach(existingOp => {
                if (!finalOp && existingOp.good === op.good && existingOp.lastUpdateTime === undefined) {
                    finalOp = existingOp
                } else if (!finalOp && existingOp.lastUpdateTime === undefined && newRunning[op.building].isParallel === false) {
                    // we skipped an op that was supposed to go first, recalculate
                    allFound = false
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
                finalOp.duration = adjustedDuration(finalOp.good, finalOp.start, newRunning[op.building])
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
        if (allFound) {
            updateOperations(newRunning, getRecommendedLists(currentCity), getPurchases(currentCity), currentCity);
        } else {
            // We started an op that wasn't on the board, we want to re-evaluate recommendations
            updateOperations(newRunning, [], [], currentCity)
        }
    }

    const updateOperations = (newRunning, newTargets, newPurchases, currentCity) => {
        let allRunning = deepCopy(running, 2)
        allRunning.pipelines[currentCity] = newRunning
        allRunning.targets[currentCity] = newTargets
        allRunning.purchases[currentCity] = newPurchases
        setRunning(allRunning)
    }

    const speedUpOperations = (operations, amount, currentCity) => {
        const pipelines = getPipelines(currentCity)
        let newRunning = {...pipelines}
        let idsToSpeedUp = {}
        operations.forEach(op => {
            idsToSpeedUp[op.id] = true;
        })
        Object.keys(pipelines).forEach(building => {
            let newBuilding = {...pipelines[building]}
            newBuilding.running = []
            pipelines[building].running.forEach(op => {
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
        updateOperations(newRunning, getRecommendedLists(currentCity), getPurchases(currentCity), currentCity)
    }

    const createRecommendations = (pipelines, newList, expectedTime, addedPurchases, currentCity) => {
        let newTargets = getRecommendedLists(currentCity)
        newTargets.push({
            items: newList.items,
            listIndex: newList.index,
            expectedTime: expectedTime
        })
        let newPurchases = getPurchases(currentCity)
        newPurchases = newPurchases.concat(addedPurchases)
        updateOperations(
            pipelines,
            newTargets,
            newPurchases,
            currentCity
        )
    }

    const updateAllRunningOps = () => {
        let newRunningOps = {}
        let addToStorage = {}
        Object.keys(running.pipelines).forEach(city => {
            let localAdd = {}
            const pipelines = getPipelines(city)
            let newCityRunning = {...pipelines}
            Object.keys(newCityRunning).forEach(building => {
                let timeToStart = 0
                let newBuilding = {...newCityRunning[building]}
                newBuilding.running = []
                pipelines[building].running.forEach(op => {
                    let newOp = {...op}
                    if (op.lastUpdateTime !== undefined) {
                        const timeDelta = (Date.now() - op.lastUpdateTime) / 1000
                        newOp.lastUpdateTime = Date.now()
                        if (op.start <= 0) {
                            newOp.duration -= timeDelta
                        } else {
                            newOp.start = timeToStart
                        }
                        timeToStart = Math.max(0, newOp.start + newOp.duration)
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
        return {pipelines: newRunningOps, addToStorage: addToStorage};
    }

    const getExpectedTimes = (currentCity) => {
        let times = []
        if (running && running.targets && running.targets[currentCity]) {
            running.targets[currentCity].forEach(t => {
                times[t.listIndex] = t.expectedTime
            })
        }
        return times
    }

    const updatePipelines = (cities) => {
        let allPipelines = {}
        let allTargets = {}
        let allPurchases = {}
        Object.keys(cities).forEach(currentCity => {
            const currentCitySettings = cities[currentCity]
            const oldPipelines = getPipelines(currentCity)
            let newPipelines = {}
            if (currentCitySettings.buildings) {
                Object.keys(currentCitySettings.buildings).forEach(building => {
                    if (currentCitySettings.buildings[building].haveBuilding) {
                        const oldPipe = oldPipelines[building] || {running: []}
                        let newPipe = {...oldPipe}
                        newPipe.running = []
                        oldPipe.running.filter(op => op.lastUpdateTime !== undefined).forEach(op => {
                            newPipe.running.push(op)
                        })
                        newPipe.slots = currentCitySettings.buildings[building].slots
                        newPipe.isParallel = currentCitySettings.buildings[building].isParallel
                        newPipe.goods = {}
                        Object.keys(goodsData).forEach(good => {
                            let canMake =
                                goodsData[good].building === building ||
                                (building === randomGeneratorKey &&
                                    currentCitySettings.buildings[building].currentBuilding === goodsData[good].building)
                            canMake = canMake && goodsData[good].requiredLevel <= currentCitySettings.level
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
                    }
                })
                allPipelines[currentCity] = newPipelines
                allTargets[currentCity] = []
                allPurchases[currentCity] = []
            }
        })

        setRunning({
            pipelines: allPipelines,
            targets: allTargets,
            purchases: allPurchases
        })
        return allPipelines
    }

    const getRecommended = (currentCity) => {
        const cityRunning = getPipelines(currentCity)
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
        getPipelines,
        getExpectedTimes,
        getPurchases
    }
}
