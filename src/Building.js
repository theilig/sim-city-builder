import React from 'react';
import Operation from "./Operation";
import {buildingLimits} from "./Production"

function Building(props) {
    let visualPipeline = []
    let combiners = {}
    const limit = buildingLimits[props.name]
    props.pipeline.forEach((op, index) => {
        let visualOp = {...op}
        if ((index < (props.pipelineSize || 1) || index < (limit || 1)) && op.runningId === undefined) {
            visualOp.nextUp = true
        }
        let canCombine = true
        if (combiners[visualOp.name] !== undefined) {
            let combiningOp = combiners[op.name]
            canCombine = canCombine && !(combiningOp.runningId && props.pipelineSize > 1)
            canCombine = canCombine && !(combiningOp.runningId !== undefined && visualOp.runningId === undefined)
            canCombine = canCombine && !(combiningOp.runningId === undefined && visualOp.runningId !== undefined)
            canCombine = canCombine && !(combiningOp.nextUp !== visualOp.nextUp)
            canCombine = canCombine && !(combiningOp.start !== 0 && visualOp.nextUp && visualOp.start === 0)
            canCombine = canCombine && !(visualOp.start !== 0 && combiningOp.nextUp && combiningOp.start === 0)
            canCombine = canCombine && !(combiningOp.runningId !== undefined && Math.max(visualOp.end, 0) - Math.max(combiningOp.end) > 60)
        } else {
            canCombine = false
        }
        if (canCombine) {
            combiners[visualOp.name].count += 1
        } else {
            op.count = 1
            visualPipeline.push(visualOp)
            combiners[op.name] = visualOp
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
                            speedUp={props.speedUp} pauseUpdates={props.pauseUpdates}
                        />
                    )
                })}
            </tbody>
        </table>
    </div>)
}
export default Building;
