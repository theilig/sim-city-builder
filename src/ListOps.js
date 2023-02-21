import React from 'react';

function ListOps(props) {
    function opList(ops) {
        return (<ul>
            {ops.map((op, index) => {
                return (<li key={index}>
                    {[op.name, op.start, op.fromStorage, op.runningId, op.slideTime].join(" ")}
                    {op.childOperations && op.childOperations.length > 0 && opList(op.childOperations)}
                </li>)
            })}
            </ul>
        )
    }
    return opList(props.operations)
}

export default ListOps
