import React from 'react';
import OperationCollection from "./OperationCollection";
import {buildingData, goodsData} from "./BuildingSettings";

function FactoryRecommendations(props) {
    let opCollections = []
    const factories = Object.keys(buildingData).filter(f => buildingData[f].isParallel)
    factories.forEach(building => {
        if (props.pipelines && props.pipelines[building]) {
            if (building === 'Factory') {
                let factoryCollections = {}
                const pipeline = props.pipelines[building].running
                let runningCount = 0
                let maxChanges = 0
                pipeline.forEach(op => {
                    let start = Math.floor(op.start)
                    if (op.lastUpdateTime !== undefined) {
                        runningCount += 1
                    } else if (start === 0) {
                        if (factoryCollections[op.good] === undefined) {
                            factoryCollections[op.good] = {
                                goodToGo: true,
                                ops: [op],
                                good: op.good,
                                done: op.duration < 0,
                                start: op.start,
                                factory: true,
                                firstCollection: true
                            }
                        } else {
                            factoryCollections[op.good].ops.push(op)
                        }
                        maxChanges += 1
                    }
                })
                let purchaseIndex = 0
                while (maxChanges + runningCount < props.pipelines[building].slots && purchaseIndex < props.purchases.length) {
                    const good = props.purchases[purchaseIndex].good
                    if (goodsData[good].building === 'Factory') {
                        const op = {
                            start: 0,
                            duration: goodsData[good].duration,
                            building: building,
                            good: good
                        }
                        if (factoryCollections[op.good] === undefined) {
                            factoryCollections[op.good] = {
                                goodToGo: true,
                                ops: [op],
                                good: op.good,
                                done: op.duration < 0,
                                start: op.start,
                                factory: true,
                                firstCollection: true
                            }
                        } else {
                            factoryCollections[op.good].ops.push(op)
                        }
                        maxChanges += 1
                    }
                    purchaseIndex += 1
                }
                Object.keys(factoryCollections).forEach(good => opCollections.push(factoryCollections[good]))
            } else {
                let runningCount = 0
                props.pipelines[building].running.forEach(op => {
                    if (op.lastUpdateTime !== undefined) {
                        runningCount = 1
                    }
                })
                if (props.pipelines[building].slots > runningCount) {
                    const good = Object.keys(props.pipelines[building].goods)[0]
                    let collection = {
                        goodToGo: true,
                        ops: [],
                        good: good,
                        done: false,
                        start: 0,
                        factory: true,
                        firstCollection: true
                    }
                    for (let i = 0; i < (props.pipelines[building].slots - runningCount); i += 1) {
                        collection.ops.push({
                            start: 0,
                            duration: goodsData[good].duration,
                            building: building,
                            good: good
                        })
                    }
                    opCollections.push(collection)
                }
            }
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
