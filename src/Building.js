import React from 'react';
import Operation from "./Operation";

function Building(props) {
    let visualPipeline = []
    let lastOp = undefined
    let needOne = true
    props.pipeline.running.forEach((op, index) => {
        let visualOp = {...op}
        if (op.duration > 0 && op.lastUpdateTime !== undefined) {
            if (lastOp && lastOp.good === op.good) {
                lastOp.count += 1
            } else {
                visualOp.count = 1
                lastOp = visualOp
                visualPipeline.push(visualOp)
            }
        } else if (needOne) {
            needOne = false
            visualOp.count = 1
            visualPipeline.push(visualOp)
        }
    })
    return (<div style={{display: "flex", flexDirection: "column", marginRight: "5px", marginBottom: "10px"}}>
                    <div style={{height: "40px", width: "150px"}}>{props.name}</div>
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
