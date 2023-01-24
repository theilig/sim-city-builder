import React from 'react';
import { displayName, secondsToTime } from './Production';

function Operation(props) {
    function showButton() {
        if (props.operation.runningId !== undefined) {
            return <button onClick={() => props.finishOp(props.operation, props.building)}>done</button>
        } else {
            return <button onClick={() => props.startOp(props.operation, props.building)}>start</button>
        }
    }
    let style = {}
    if (props.operation.end === 0) {
        style = {boxShadow: "0px 0px 0px 3px rgb(0, 255, 0)"}
    }
    if (props.operation.slideTime === 0 && props.operation.start === 0 && props.operation.runningId === undefined) {
        style = {boxShadow: "0px 0px 0px 3px rgb(255, 0, 0)"}
    }

    return (
        <tr style={style}>
            <td style={{textAlign: "left"}}>{props.operation.count + " " + displayName(props.operation.name, props.operation.count)}</td>
            <td style={{textAlign: "right"}}>{secondsToTime(props.operation.end)}</td>
            <td>{showButton()}</td>
        </tr>
    )
}
export default Operation;
