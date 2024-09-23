import React from 'react';
import OperationCollection from "./OperationCollection";
import {buildingData} from "./BuildingSettings";

function FactoryRecommendations(props) {
    let opCollections = []
    const factories = Object.keys(buildingData).filter(f => buildingData[f].isParallel)
    const SlotSize = 600
    factories.forEach(building => {
        if (props.pipelines && props.pipelines[building]) {
            let slotPipelines = []
            const pipeline = props.pipelines[building].running
            let runningCount = 0
            pipeline.forEach(op => {
                if (op.lastUpdateTime !== undefined) {
                    runningCount += 1
                } else {
                    if (Math.floor(op.start) === 0) {
                        let landed = false
                        for (let i = 0; landed === false && i < slotPipelines.length; i += 1) {
                            if (slotPipelines[i].end + op.duration < SlotSize) {
                                slotPipelines[i].ops.push(op)
                                slotPipelines[i].end += op.duration
                                landed = true
                            }
                        }
                        if (landed === false) {
                            slotPipelines.push({
                                end: op.duration,
                                ops: [op]
                            })
                        }
                    }
                }
            })
            let factoryCollections = {}
            let spaces = props.pipelines[building].slots - runningCount
            while (spaces > 0 && slotPipelines.length > 0) {
                for (let i = 0; i < slotPipelines.length; i += 1) {
                    let slotPipeline = slotPipelines[i]
                    let op = slotPipeline.ops.shift()
                    if (slotPipeline.ops.length === 0) {
                        slotPipelines.splice(i, 1)
                    }
                    if (factoryCollections[op.good] === undefined) {
                        factoryCollections[op.good] = {
                            goodToGo: true,
                            ops: [op],
                            good: op.good,
                            done: false,
                            start: 0,
                            factory: true,
                            firstCollection: true
                        }
                    } else {
                        factoryCollections[op.good].ops.push(op)
                    }
                    spaces -= 1
                }
            }
            Object.keys(factoryCollections).forEach(good => opCollections.push(factoryCollections[good]))
        }
    })
    return (
        <div style={{display: 'flex', flexDirection: 'column', flexWrap: 'wrap', height: '300px', width: '200px'}}>
            {opCollections.map((collection, index) => {
                return <OperationCollection key={index} collection={collection} startOp={props.startOp} finishOp={props.finishOp} />
            })}
        </div>
    )
}

export default FactoryRecommendations;
