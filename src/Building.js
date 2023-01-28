import React from 'react';
import Operation from "./Operation";
function Building(props) {
    let visualPipeline = []
    let combiners = {}
    props.pipeline.forEach(op => {
        let canCombine = true
        if (combiners[op.name] !== undefined) {
            let combiningOp = combiners[op.name]
            canCombine = canCombine && !(combiningOp.start <= 0 && op.start > 0)
            canCombine = canCombine && !(combiningOp.runningId !== undefined && op.runningId === undefined)
            canCombine = canCombine && !(combiningOp.runningId === undefined && op.runningId !== undefined)
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
                            startOp={props.startOp} finishOp={props.finishOp} building={props.name} />
                    )
                })}
            </tbody>
        </table>
    </div>)
}
export default Building;
