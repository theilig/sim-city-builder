import React from 'react';
import OperationCollection from "./OperationCollection";
import {buildingData} from "./BuildingSettings";
import {EPHEMERAL_LIST_INDEX} from "./RecommendationHook";

function RecommendationList(props) {
    let maxCombine = 5;
    let opCollections = []
    const factories = Object.keys(buildingData).filter(f => buildingData[f].isParallel)
    const haveCollections = {}
    let remainingSlots = {}
    factories.forEach(building => {
        if (props.pipelines[building]) {
            let available = props.pipelines[building].slots
            props.pipelines[building].running.forEach(op => {
                if (op.lastUpdateTime) {
                    available -= 1
                }
            })
            remainingSlots[building] = available
        }
    })
    props.recommendations.forEach(op => {
        let collection = undefined
        let goodToGo = op.children.length === 0
        const factory = factories.includes(op.building)
        opCollections.forEach(possibleCollection => {
            if (Math.abs(possibleCollection.start - op.start) < 600 && possibleCollection.good === op.good &&
                possibleCollection.ops.length < maxCombine) {
                collection = possibleCollection
            }
        })
        if (!factory) {
            if (collection) {
                collection.ops.push(op)
            } else {
                const firstCollection = !(haveCollections[op.building] || false)
                haveCollections[op.building] = true
                opCollections.push({
                    goodToGo: goodToGo,
                    ops: [op],
                    good: op.good,
                    done: op.duration < 0,
                    start: op.start,
                    factory: factory,
                    firstCollection: firstCollection
                })
            }
        }
    })
    opCollections = opCollections.slice(0, 49)
    return (
        <div style={{display: 'flex', flexDirection: 'column', flexWrap: 'wrap', height: '300px', width: '200px'}}>
            {opCollections.map((collection, index) => {
                return <OperationCollection key={index} collection={collection} startOp={props.startOp} finishOp={props.finishOp} />
            })}
        </div>
    )
}

export default RecommendationList;
