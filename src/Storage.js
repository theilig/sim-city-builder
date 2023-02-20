import React from 'react';
import {cloneOperations, createOperation} from "./Production";
import goods from "./Goods"
export function removeGood(storage, good) {
    let removed = false
    let buildingStorage = []
    let operation = createOperation(good)
    storage[operation.building].forEach(op => {
        if (!removed && op.name === operation.name) {
            removed = true
        } else {
            buildingStorage.push(op)
        }
    })
    let newStorage = cloneOperations(storage)
    newStorage[operation.building] = buildingStorage
    return {found: removed, storage: newStorage}
}

export function addStorage(storage, goods) {
    let newStorage = cloneOperations(storage)
    Object.keys(goods).forEach(good => {
        for (let i = 0; i < goods[good]; i += 1) {
            let op = createOperation(good)
            if (newStorage[op.building] === undefined) {
                newStorage[op.building] = []
            }
            op.reserved = false
            op.fromStorage = true
            op.start = 0
            op.end = 0
            newStorage[op.building].push(op)
        }
    })
    return newStorage
}

function Storage(props) {
    function display(good) {
        if (props.unused && props.unused[good] > 0) {
            return <div>{good + ': ' + props.goods[good] + ' (' + props.unused[good] + ')'}</div>
        } else {
            return <div>{good + ': ' + props.goods[good]}</div>
        }
    }
    return (
        <div style={{display: "flex", flexWrap: "wrap"}}>
            {Object.keys(goods).map(key =>
                props.goods[key] && <div style={{marginRight: "5px"}} key={key}>{display(key)}</div>)}
        </div>
    )
}
export default Storage;
