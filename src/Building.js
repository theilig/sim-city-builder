import React from 'react';
import Operation from "./Operation";
import {buildingLimits} from "./Production"

function Building(props) {
    let visualPipeline = []
    let combiners = {}
    const limit = buildingLimits[props.name]
    props.pipeline.forEach((op, index) => {
        if ((index < (props.pipelineSize || 1) || index < (limit || 1)) && op.runningId === undefined) {
            op.nextUp = true
        }
        let canCombine = true
        if (combiners[op.name] !== undefined) {
            let combiningOp = combiners[op.name]
            canCombine = canCombine && !(combiningOp.runningId !== undefined && op.runningId === undefined)
            canCombine = canCombine && !(combiningOp.runningId === undefined && op.runningId !== undefined)
            canCombine = canCombine && !(combiningOp.nextUp !== op.nextUp)
            canCombine = canCombine && !(combiningOp.runningId !== undefined && combiningOp.end <= 0 && op.end > 0)
        } else {
            canCombine = false
        }
        if (canCombine) {
            combiners[op.name].count += 1
        } else {
            op.count = 1
            visualPipeline.push(op)
            combiners[op.name] = op
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
                            startOp={props.startOp} finishOp={props.finishOp} building={props.name}
                            speedUp={props.speedUp}
                        />
                    )
                })}
            </tbody>
        </table>
    </div>)
}
export default Building;
