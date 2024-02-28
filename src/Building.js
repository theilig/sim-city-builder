import React from 'react';
import Operation from "./Operation";

function Building(props) {
    let visualPipeline = []
    props.pipeline.running.forEach((op, index) => {
        let visualOp = {...op}
        if (op.duration > 0 && op.lastUpdateTime !== undefined) {
            visualPipeline.push(visualOp)
        }
    })
    return (<div style={{display: "flex", flexDirection: "column"}}>
                    <div>{props.name}</div>
            {visualPipeline.map((op, index) => {
                return (
                    <Operation operation={op} key={index}
                        startOp={props.startOp} finishOp={props.finishOp} building={props.name}
                        speedUp={props.speedUp}
                    />
                )
            })}
    </div>)
}
export default Building;
