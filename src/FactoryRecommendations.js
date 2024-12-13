import React from 'react';
import OperationCollection from "./OperationCollection";
import {buildingData} from "./BuildingSettings";

function FactoryRecommendations(props) {
    let opCollections = []
    const factories = Object.keys(buildingData).filter(f => buildingData[f].isParallel)
    let emptySlots = {}
    let currentBuildingIndex = {}
    let running = {}
    factories.forEach(building => {
        let runningCount = 0
        if (props.pipelines && props.pipelines[building]) {
            const pipeline = props.pipelines[building].running
            pipeline.forEach(op => {
                if (op.lastUpdateTime !== undefined) {
                    runningCount += 1
                    const oldValue = running[op.good] || []
                    oldValue.push(op)
                    running[op.good] = [...oldValue]
                }
            })
        }
        emptySlots[building] = 0
        if (props.pipelines && props.pipelines[building]) {
            emptySlots[building] = props.pipelines[building].slots - runningCount
        }
    })
    let done = false
    const runningKeys = Object.keys(running).sort()
    const runningStuff = runningKeys.map((good) => {
        return <OperationCollection key={good} collection={{goodToGo: false, ops: [...running[good]], good: good, done: false, start: 0, factory: true, firstCollection: true, parentStart: 0}} startOp={props.startOp} finishOp={props.finishOp} />
    })
    while (done === false && Object.keys(emptySlots).find(key => emptySlots[key] > 0)) {
        done = true
        const buildings = Object.keys(props.pipelines)
        for (let i= 0; i<buildings.length; i+=1) {
            const building = buildings[i]
            if (emptySlots[building] === undefined) {
                let currentIndex = currentBuildingIndex[building] || 0
                while (props.pipelines[building].running[currentIndex] && props.pipelines[building].running[currentIndex].lastUpdateTime !== undefined) {
                    currentIndex += 1
                }
                currentBuildingIndex[building] = currentIndex + 1
                if (props.pipelines[building].running[currentIndex]) {
                    done = false
                    let op = props.pipelines[building].running[currentIndex]
                    for (let j=0; j<op.children.length; j+=1) {
                        const child = op.children[j]
                        const childBuilding = child.building
                        if (running[child.good] === undefined || running[child.good].length === 0) {
                            if (child.lastUpdateTime === undefined) {
                                if (!child.purchase && emptySlots[childBuilding] && emptySlots[childBuilding] > 0) {
                                    emptySlots[childBuilding] -= 1
                                    if (opCollections[child.good] === undefined) {
                                        child.start = 0
                                        opCollections[child.good] = {
                                            goodToGo: true,
                                            ops: [child],
                                            good: child.good,
                                            done: false,
                                            start: 0,
                                            factory: true,
                                            firstCollection: true,
                                            parentStart: op.start
                                        }
                                    } else {
                                        opCollections[child.good].ops.push(child)
                                        if (op.start < opCollections[child.good].parentStart) {
                                            opCollections[child.good].parentStart = op.start
                                        }
                                    }
                                }
                            }
                        } else {
                            running[child.good].pop()
                        }
                    }
                }
            }
        }
    }
    let opCollectionKeys = Object.keys(opCollections)
    opCollectionKeys.sort((a, b) => {
        return opCollections[a].parentStart - opCollections[b].parentStart
    })
    return (
        <div style={{display: 'flex', flexDirection: 'column', flexWrap: 'wrap', height: '300px', width: '200px'}}>
            {opCollectionKeys.map((good) => {
                const collection = opCollections[good]
                return <OperationCollection key={good} collection={collection} startOp={props.startOp} finishOp={props.finishOp} />
            })}
            <div>{runningStuff}</div>
        </div>
    )
}

export default FactoryRecommendations;
