import {useState} from "react";
import {goodsData, randomGeneratorKey} from "./BuildingSettings";
import {deepCopy} from "./BuildingSettings";

export const createOperation = (good, building) => {
    return {
        name: good,
        building: building
    }
}

export function useOperations() {
    const [running, setRunning] = useState({})
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
        updateOperations(newRunning, currentCity)
    }

    const changeRunningOperations = (opsToAdd, opsToRemove, forcePull, currentCity) => {
        let newRunning = {}
        let maxId = 0
        if (running && running[currentCity]) {
            newRunning = {...running[currentCity]}
            Object.keys(running[currentCity]).forEach(building => {
                let newBuilding = {...running[currentCity][building]}
                newBuilding.running = []
                running[currentCity][building].running.forEach(op => {
                    if (maxId < op.id) {
                        maxId = op.id
                    }
                    if (opsToRemove[op.name]
                        && opsToRemove[op.name] > 0
                        && (forcePull || op.duration <= 50)) {
                        opsToRemove[op.name] -= 1
                    } else {
                        newBuilding.running.push(op)
                    }
                })
                newRunning[building] = newBuilding
            })
        }

        opsToAdd.forEach(op => {
            op.lastUpdateTime = Date.now()

            if (newRunning[op.building] === undefined) {
                newRunning[op.building] = running[currentCity][op.building]
            }
            newRunning[op.building].running.push(op)
        })
        updateOperations(newRunning, currentCity);
    }

    const updateOperations = (newRunning, currentCity) => {
        let allRunning = {...running}
        allRunning[currentCity] = newRunning
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

    const createRecommendations = (pipelines, currentCity) => {
        updateOperations(
            pipelines,
            currentCity
        )
    }

    const updateAllRunningOps = () => {
        let newRunningOps = {}
        Object.keys(running).forEach(city => {
            let newCityRunning = {...running[city]}
            Object.keys(newCityRunning).forEach(building => {
                let newBuilding = {...newCityRunning[building]}
                newBuilding.running = []
                running[city][building].running.forEach(op => {
                    let newOp = {...op}
                    if (op.lastUpdateTime !== undefined) {
                        const timeDelta = Date.now() - op.lastUpdateTime
                        newOp.lastUpdateTime += timeDelta
                        newOp.duration -= timeDelta
                    }
                    newBuilding.running.push(newOp)
                })
                newCityRunning[building] = newBuilding
            })
            newRunningOps[city] = newCityRunning
        })
        setRunning(newRunningOps)
    }

    const updatePipelines = (cities, currentCity) => {
        const oldPipelines = running[currentCity] || []
        let newPipelines = {}
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
                        newPipe.goods[good] = goodsData[good]
                    }
                })
                newPipelines[building] = newPipe
            })
        }
        let allRunning = {...running}
        allRunning[currentCity] = newPipelines
        setRunning(allRunning)
    }

    const grabFromRunning = (pipelines, goodName, amount, listIndex) => {
        let possibles = []
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
                }
            })
        }
        return amountTaken
    }

    const flatten = (operations) => {
        let flattened = []
        for (let i = 0; i < operations.length; i += 1) {
            flattened.push(operations[i])
            if (operations[i].children.length > 0) {
                flattened = flattened.concat(flatten(operations[i].children))
            }
        }
        flattened.sort((a, b) => {
            return a.start - b.start
        })
        return flattened
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
        running,
        createRecommendations,
        changeRunningOperations,
        clearRecommendations,
        speedUpOperations,
        updateAllRunningOps,
        updatePipelines,
        getRecommended,
        grabFromRunning
    }
}
