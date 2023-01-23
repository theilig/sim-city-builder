import React, { useState } from 'react';
import Operation from "./Operation";
function Building(props) {
    let visualPipeline = []
    props.pipeline.forEach(op => {
        let compress = false
        let last = visualPipeline.length - 1
        if (last >= 0 && op.name === visualPipeline[last].name) {
            let lastOp = visualPipeline[last]
            if (lastOp.runningId !== undefined && op.runningId !== undefined) {
                compress = true
            } else if (lastOp.runningId === op.runningId) {
                compress = true
            }
        }
        if (compress) {
            visualPipeline[last].count += 1
        } else {
            visualPipeline.push(op)
            op.count = 1
        }
    })
    return (<div style={{display: "flex", flexDirection: "column"}}>
        <table>
            <thead>
                <tr>
                    <td colSpan={3} style={{textAlign: "center"}}>{props.name}</td>
                </tr>
            </thead>
            <tbody>
                {visualPipeline.map((op, index) => {
                    return (
                        <Operation operation={op} key={index}
                            startOp={props.startOp} finishOp={props.finishOp} building={props.name} />
                    )
                })}
            </tbody>
        </table>
    </div>)
}
export default Building;
