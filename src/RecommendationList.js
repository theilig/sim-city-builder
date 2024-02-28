import React from 'react';
import OperationCollection from "./OperationCollection";
import {buildingData} from "./BuildingSettings";

function RecommendationList(props) {
    let maxCombine = 5;
    let opCollections = []
    const factories = Object.keys(buildingData).filter(f => buildingData[f].isParallel)
    const haveCollections = {}
    props.recommendations.forEach(op => {
        let collection = undefined
        let goodToGo = true
        const factory = factories.includes(op.building)
        op.children.forEach(child => {
            if (child.duration > 0) {
                goodToGo = false
            }
        })
        opCollections.forEach(possibleCollection => {
            if (Math.abs(possibleCollection.start - op.start) < 600 && possibleCollection.good === op.good &&
                possibleCollection.ops.length < maxCombine) {
                collection = possibleCollection
            }
        })
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
