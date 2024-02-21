import React from 'react';
import OperationCollection from "./OperationCollection";

function RecommendationList(props) {
    let maxCombine = 5;
    let opCollections = []
    let lastOps = {}
    props.recommendations.forEach(op => {
        let combined = false
        let goodToGo = true
        op.children.forEach(child => {
            if (child.duration > 0) {
                goodToGo = false
            }
        })
        if (lastOps[op.building] && lastOps[op.building].ops.length < maxCombine) {
            let lastOp = lastOps[op.building].ops[0]
            if (lastOp.good === op.good && lastOps[op.building].goodToGo === goodToGo) {
                lastOps[op.building].ops.push(op)
                combined = true
            }
        }
        if (!combined) {
            opCollections.push({
                goodToGo: goodToGo,
                ops: [op]
            })
            lastOps[op.building] = opCollections[opCollections.length - 1]
        }
    })
    opCollections = opCollections.slice(0, 49)
    return (
        <div style={{display: 'flex', flexDirection: 'column', flexWrap: 'wrap', height: '300px', width: '200px'}}>
            {opCollections.map((collection, index) => {
                return <OperationCollection key={index} collection={collection} startOp={props.startOp} />
            })}
        </div>
    )
}

export default RecommendationList;
