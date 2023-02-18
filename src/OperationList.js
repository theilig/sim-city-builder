import React from 'react';
import Building from "./Building";

function OperationList(props) {
    const sortPipeline = (pipeline) => {
        pipeline.sort((a, b) => {
            if (a.runningId === undefined && b.runningId === undefined) {
                return a.start - b.start
            } else if (a.runningId === undefined) {
                return 1
            } else if (b.runningId === undefined) {
                return -1
            } else {
                return a.runningId - b.runningId
            }
        })
        return pipeline
    }
    return (
        <div style={{display: "flex"}}>
            {Object.keys(props.operations).map(building =>
                <Building key={building} name={building} pipeline={sortPipeline(props.operations[building])}
                          startOp={props.startOp} finishOp={props.finishOp}
                          speedUp={props.speedUp}
                          pauseUpdates={props.pauseUpdates}
                />
            )}
        </div>
    )
}

export default OperationList;
