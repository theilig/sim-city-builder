import React, {useMemo} from 'react';
import Operation from "./Operation";
import {buildingLimits} from "./Production"

function Building(props) {
    const pipelineSizes = useMemo(() => {return {
        'Factory': 1,
        'Green Factory': 1,
        'Coconut Farm': 1,
        'Home Appliances': 2,
        'Building Supplies Store': 5,
        'Hardware Store': 6,
        'Fast Food Restaurant': 2,
        'Furniture Store': 4,
        'Donut Shop': 3,
        'Fashion Store': 4,
        'Farmer\'s Market': 6,
        'Gardening Supplies': 3,
        'Eco Shop': 4,
        'Tropical Products Store': 4
    }}, [])



    let visualPipeline = []
    let combiners = {}
    const limit = buildingLimits[props.name]
    const pipelineSize = pipelineSizes[props.name] || 1
    props.pipeline.forEach((op, index) => {
        let visualOp = {...op}
        if ((index < (pipelineSize || 1) || index < (limit || 1)) && op.runningId === undefined) {
            visualOp.nextUp = true
        }
        let canCombine = true
        if (combiners[visualOp.name] !== undefined) {
            let combiningOp = combiners[op.name]
            canCombine = canCombine && !(combiningOp.runningId && pipelineSize > 1)
            canCombine = canCombine && !(combiningOp.runningId !== undefined && visualOp.runningId === undefined)
            canCombine = canCombine && !(combiningOp.runningId === undefined && visualOp.runningId !== undefined)
            canCombine = canCombine && !(combiningOp.nextUp !== visualOp.nextUp)
            canCombine = canCombine && !(combiningOp.start === 0 && combiningOp.slideTime === 0 && visualOp.slideTime > 0)
            canCombine = canCombine && !(combiningOp.start !== 0 && visualOp.nextUp && visualOp.start === 0)
            canCombine = canCombine && !(visualOp.start !== 0 && combiningOp.nextUp && combiningOp.start === 0)
            canCombine = canCombine && !(combiningOp.runningId !== undefined && Math.max(visualOp.end, 0) - Math.max(combiningOp.end) > 60)
        } else {
            canCombine = false
        }
        if (canCombine) {
            combiners[visualOp.name].count += 1
        } else {
            // when we still are in operations that can start or go in the pipeline, don't combine out of order
            // we do this be clearing out all combiners other than the one we are about to add
            if (visualOp.nextUp) {
                combiners = {}
            }
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
