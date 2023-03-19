import React from 'react';
import { displayName, secondsToTime } from './Production';

function Operation(props) {
    function startOne() {
        props.startOp(props.operation, 1)
    }

    function startAll() {
        props.startOp(props.operation, props.operation.count)
    }

    function speedUp(e) {
        let amount = 60
        if (e.altKey) {
            amount = 3600
        } else if (e.shiftKey) {
            amount = 300
        }
        props.speedUp(props.operation, amount)
    }

    function finishOne() {
        props.finishOp(props.operation, 1)
    }

    function finishAll() {
        props.finishOp(props.operation, props.operation.count)
    }

    function showButton() {
        if (props.operation.runningId !== undefined) {
            if (props.operation.end > 0) {
                return <button
                    onClick={speedUp}
                    onContextMenu={finishOne}
                >done</button>
            } else {
                return <button
                    onClick={finishOne}
                    onContextMenu={finishAll}
                >done</button>
            }
        } else {
            return <button onClick={startOne} onContextMenu={startAll}>start</button>
        }
    }
    let goodToGo = true
    if (props.operation.childOperations) {
        props.operation.childOperations.forEach(op => {
            if (op.fromStorage !== true && op.end > 0) {
                goodToGo = false
            }
        })
    }
    let style = {boxShadow: "0px 0px 0px 3px rgb(130, 130, 130)"}
    if (props.operation.end === 0) {
        style = {boxShadow: "0px 0px 0px 3px rgb(0, 255, 0)"}
    }
    if (goodToGo === true && Object.keys(props.operation.ingredients).length > 0 && props.operation.runningId === undefined) {
        style = {boxShadow: "0px 0px 0px 3px rgb(255, 255, 0)"}
    }
    if (props.operation.nextUp === true && Object.keys(props.operation.ingredients).length === 0 && props.operation.runningId === undefined) {
        style = {boxShadow: "0px 0px 0px 3px rgb(255, 255, 0)"}
    }
    if (props.operation.start === 0) {
        style = {boxShadow: "0px 0px 0px 3px rgb(255, 255, 0)"}
    }
    if (props.operation.start === 0 && props.operation.runningId === undefined && props.operation.nextUp) {
        style = {boxShadow: "0px 0px 0px 3px rgb(255, 0, 0)"}
    }
    if (props.operation.runningId !== undefined) {
        style = {background: "#eeeeee"}
    }
    let displayTime = secondsToTime(props.operation.start)
    if (props.operation.runningId !== undefined) {
        displayTime = secondsToTime(props.operation.end)
    }


    return (
        <tr style={style} >
            <td style={{textAlign: "left"}}>{props.operation.count + " " + displayName(props.operation.name, props.operation.count)}</td>
            <td style={{textAlign: "right"}}>{displayTime}</td>
            <td>{showButton()}</td>
        </tr>
    )
}
export default Operation;
