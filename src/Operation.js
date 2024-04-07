import React from 'react';
import { displayName, secondsToTime } from './Production';

function Operation(props) {
    function startOne() {
        props.startOp([props.operation])
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
        props.finishOp([props.operation])
    }

    function finishAll() {
        const ops = []
        for (let i = 0; i < props.count; i += 1) {
            ops.push(props.operation)
        }
        props.finishOp(ops)
    }

    function showButton() {
        if (props.operation.lastUpdateTime !== undefined) {
            if (props.operation.end > 0) {
                return <button
                    onClick={speedUp}
                    onContextMenu={finishOne}
                    style={{align: "right"}}
                >done</button>
            } else {
                return <button
                    onClick={finishOne}
                    onContextMenu={finishAll}
                    style={{align: "right"}}
                >done</button>
            }
        } else {
            return <button onClick={startOne} style={{align: "right"}}>start</button>
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
    let style = {display: 'flex', boxShadow: "0px 0px 0px 3px rgb(130, 130, 130)"}
    if (props.operation.duration < 0) {
        style = {boxShadow: "0px 0px 0px 3px rgb(0, 255, 0)"}
    }
    if (props.operation.start === 0) {
        style = {boxShadow: "0px 0px 0px 1px rgb(255, 255, 0)"}
    }
    if (props.operation.start === 0 && props.operation.runningId === undefined && props.operation.nextUp) {
        style = {boxShadow: "0px 0px 0px 1px rgb(255, 0, 0)"}
    }
    if (props.operation.lastUpdateTime !== undefined) {
        style = {background: "#909090"}
    }
    let displayTime = secondsToTime(props.operation.start)
    if (props.operation.lastUpdateTime !== undefined) {
        displayTime = secondsToTime(props.operation.start + props.operation.duration)
    }


    return (
        <div style={style} >
            <div style={{textAlign: "left"}}>{props.operation.count}</div>
            <div style={{textAlign: "left", marginLeft: "3px"}}>{props.operation.good}</div>
            <div style={{textAlign: "right", marginLeft: "3px"}}>{displayTime}</div>
            <div style={{marginLeft: "auto"}}>{showButton()}</div>
        </div>
    )
}
export default Operation;
