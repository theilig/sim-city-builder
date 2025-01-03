import React from 'react';
import {displayName, secondsToTime} from "./Production";
import {randomGeneratorKey} from "./BuildingSettings";

function OperationCollection(props) {
    function startOne() {
        props.startOp([props.collection.ops[0]])
    }
    function startAll() {
        props.startOp(props.collection.ops)
    }

    function finishOne() {
        props.finishOp([props.collection.ops[0]])
    }

    function showButton(op) {
        if (op.lastUpdateTime !== undefined) {
            return <button
                onClick={finishOne}
                style={{align: "right"}}
            >done</button>
        } else {
            return <button
                onClick={startOne}
                onContextMenu={startAll}
            >started</button>
        }
    }

    let style = {display: 'inline', boxShadow: "0px 0px 0px 1px rgb(0, 0, 0)", marginBottom: '3px'}
    if (props.collection.goodToGo) {
        if (props.collection.ops[0].start === 0) {
            style.boxShadow = "0px 0px 0px 1px rgb(255, 0, 0)"
        } else if (!props.collection.factory && props.collection.firstCollection && props.collection.goodToGo) {
            style.boxShadow = "0px 0px 0px 1px rgb(255, 255, 0)"
        }
    }
    if (props.collection.ops[0].lastUpdateTime !== undefined) {
        style = {background: "#909090"}
    }
    if (props.collection.ops[0].building === randomGeneratorKey) {
        style.backgroundColor = 'blue'
    }
    const displayTime = secondsToTime(props.collection.ops[0].start)

    return (
        <div style={style}>
            <div style={{width: '150px', display: 'flex', flexDirection: 'column'}}>
                <div style={{display: 'flex'}}>
                    <div>{props.collection.ops.length}</div>
                    <div style={{marginLeft: '5px'}}>{displayName(props.collection.ops[0].good, props.collection.ops.length)}</div>
                </div>
                <div style={{display: 'flex'}}>
                    <div>{displayTime}</div>
                    <div style={{marginLeft: 'auto'}}>{showButton(props.collection.ops[0])}</div>
                </div>
            </div>
        </div>
    )
}
export default OperationCollection;
