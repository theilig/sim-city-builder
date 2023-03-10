import React, {useState} from 'react';
import { displayName, secondsToTime } from './Production';

function Operation(props) {
    let startClicks = 0
    let doneClicks = 0
    function submitWhenDoneStarting(targetClicks) {
        if (startClicks <= targetClicks) {
            props.pauseUpdates(false)
            props.startOp(props.operation, targetClicks)
            startClicks = 0
        }
    }
    function submitWhenDoneFinishing(targetClicks) {
        if (doneClicks <= targetClicks) {
            props.pauseUpdates(false)
            props.finishOp(props.operation, targetClicks)
            doneClicks = 0
        }
    }
    function startOne() {
        props.startOp(props.operation, 1)
    }

    function startAll() {
        props.startOp(props.operation, props.operation.count)
    }

    function speedUp(e) {
        let amount = 60
        if (e.ctrlKey) {
            amount = 3600
        } else if (e.shiftKey) {
            amount = 300
        }
        props.speedUp(props.operation, amount)
    }

    function clickedDone() {
        const targetClicks = doneClicks + 1
        doneClicks = targetClicks
        props.pauseUpdates(true)
        setTimeout(() => submitWhenDoneFinishing(targetClicks), 500)
    }
    function showButton() {
        if (props.operation.runningId !== undefined) {
            return <button
                onClick={clickedDone}
                onContextMenu={speedUp}
            >done</button>
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
    if (props.operation.start === 0 && props.operation.slideTime === 0 && props.operation.runningId === undefined && props.operation.nextUp) {
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
