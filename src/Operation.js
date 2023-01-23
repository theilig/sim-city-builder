import React from 'react';
import { displayName } from './Production';

function Operation(props) {
    function showButton() {
        if (props.operation.runningId !== undefined) {
            return <button onClick={() => props.finishOp(props.operation, props.building)}>done</button>
        } else {
            return <button onClick={() => props.startOp(props.operation, props.building)}>start</button>
        }
    }
    return (
        <tr>
            <td style={{textAlign: "left"}}>{props.operation.count + " " + displayName(props.operation.name, props.operation.count)}</td>
            <td style={{textAlign: "right"}}>{props.operation.end}</td>
            <td>{showButton()}</td>
        </tr>
    )
}
export default Operation;
