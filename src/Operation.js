import React from 'react';
import { displayName, secondsToTime } from './Production';

function Operation(props) {
    function showButton() {
        if (props.operation.runningId !== undefined) {
            return <button
                onClick={() => props.finishOp(props.operation, props.building)}
                onContextMenu={() => props.speedUp(props.operation)}
            >done</button>
        } else {
            return <button onClick={() => props.startOp(props.operation, props.building)}>start</button>
        }
    }
    let style = {boxShadow: "0px 0px 0px 3px rgb(130, 130, 130)"}
    if (props.operation.end === 0) {
        style = {boxShadow: "0px 0px 0px 3px rgb(0, 255, 0)"}
    }
    if (props.operation.goodToGo === 0 && Object.keys(props.operation.ingredients).length > 0 && props.operation.runningId === undefined) {
        style = {boxShadow: "0px 0px 0px 3px rgb(255, 255, 0)"}
    }
    if (props.operation.nextUp === true && Object.keys(props.operation.ingredients).length === 0 && props.operation.runningId === undefined) {
        style = {boxShadow: "0px 0px 0px 3px rgb(255, 255, 0)"}
    }
    if (props.operation.start === 0 && props.operation.runningId === undefined && props.operation.nextUp) {
        style = {boxShadow: "0px 0px 0px 3px rgb(255, 0, 0)"}
    }
    if (props.operation.runningId !== undefined) {
        style = {background: "#eeeeee"}
    }
    let displayTime = secondsToTime(props.operation.start)
    if (props.operation.runningId !== undefined || props.operation.start === 0) {
        displayTime = secondsToTime(props.operation.end)
    }


    return (
        <tr style={style} >
            <td style={{textAlign: "left"}} title={props.operation.goodToGo} >{props.operation.count + " " + displayName(props.operation.name, props.operation.count)}</td>
            <td style={{textAlign: "right"}}>{displayTime}</td>
            <td>{showButton()}</td>
        </tr>
    )
}
export default Operation;
