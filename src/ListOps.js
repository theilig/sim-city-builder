import React from 'react';

function ListOps(props) {
    function opList(ops) {
        if (ops === undefined) {
            ops = []
        }
        return (<ul>
            {ops.map((op, index) => {
                return (<li key={index}>
                    {[op.good, op.start, op.end, op.runningId].join(" ")}
                    {op.childOperations && op.childOperations.length > 0 && opList(op.childOperations)}
                </li>)
            })}
            </ul>
        )
    }
    return opList(props.operations)
}

export default ListOps
