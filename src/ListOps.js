import React from 'react';

function ListOps(props) {
    props.operations.sort((a, b) => {
        const aValues = [a.fromStorage, a.runningId, a.start]
        const bValues = [b.fromStorage, b.runningId, b.start]
        for (let i = 0; i < 3; i += 1) {
            if (aValues[i] === undefined && bValues[i] !== undefined) {
                return 1
            } else if (aValues[i] !== undefined && bValues[i] === undefined) {
                return -1
            } else if (aValues[i] !== bValues[i]) {
                return aValues[i] - bValues[i]
            }
        }
        return 0
    })
    return (
        <div>
            {props.operations.map((op, index) => <li key={index}>{[op.name, op.start, op.fromStorage, op.runningId].join(" ")}</li>)}
        </div>
    )
}

export default ListOps
