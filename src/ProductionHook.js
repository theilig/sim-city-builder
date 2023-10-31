import {useState} from "react";

export function useProduction() {
    const [pipelines, setPipelines] = useState({})
    function deepCopy(source, depth) {
        let copyResult = {}
        if (depth === 0) {
            if (Array.isArray(source)) {
                copyResult = [...source]
            } else {
                copyResult = {...source}
            }
        } else {
            Object.keys(source).forEach(key => {
                copyResult[key] = deepCopy(source[key], depth - 1)
            })
        }
        return copyResult
    }
    const bestProductionTime = (order, storage, running, goods, buildings, pipelines) => {
        // need to make a local copy of everything since this function is intended to not mutate the lists
        let localStorage = deepCopy(storage)
        let localRunning = deepCopy(running)
        let localPipelines = deepCopy(pipelines)
        let result = addOrder(0, order, localStorage, localRunning, goods, buildings, localPipelines)
        return result.expectedTime
    }
    const addOrder = (priority, order, storage, running, goods, buildings, pipelines) => {
        return {expectedTime: 0}
    }
    return {
        bestProductionTime,
        addOrder,
        pipelines
    }
}
