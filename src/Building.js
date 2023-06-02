import React from 'react';
import Operation from "./Operation";

export const allBuildings = {
    Factory: {pipelineSize: 1, parallelLimit: 49},
    "Farmer's Market": {pipelineSize: 6, parallelLimit: 1},
    'Building Supplies Store': {pipelineSize: 6, parallelLimit: 1},
    'Hardware Store': {pipelineSize: 6, parallelLimit: 1},
    'Fashion Store': {pipelineSize: 4, parallelLimit: 1},
    'Furniture Store': {pipelineSize: 4, parallelLimit: 1},
    'Gardening Supplies': {pipelineSize: 3, parallelLimit: 1},
    'Donut Shop': {pipelineSize: 3, parallelLimit: 1},
    'Fast Food Restaurant': {pipelineSize: 2, parallelLimit: 1},
    'Home Appliances': {pipelineSize: 4, parallelLimit: 1},
    'Green Factory': {pipelineSize: 1, parallelLimit: 5},
    'Eco Shop': {pipelineSize: 4, parallelLimit: 1},
    'Coconut Farm': {pipelineSize: 1, parallelLimit: 5},
    'Tropical Products Store': {pipelineSize: 4, parallelLimit: 1},
    'Chocolate Factory': {pipelineSize: 2, parallelLimit: 1},
    'Fishery': {pipelineSize: 1, parallelLimit: 5},
    'Fish Marketplace': {pipelineSize: 2, parallelLimit: 1}
};

function Building(props) {
    let visualPipeline = []
    let combiners = {}
    const limit = allBuildings[props.name].parallelLimit
    const pipelineSize = allBuildings[props.name].pipelineSize
    props.pipeline.forEach((op, index) => {
        let visualOp = {...op}
        if ((index < (pipelineSize || 1) || index < limit) && op.runningId === undefined) {
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
            if (visualOp.nextUp && limit === 1) {
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
