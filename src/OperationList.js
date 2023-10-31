import React from 'react';
import Building from "./Building";

function OperationList(props) {
    const sortPipeline = (pipeline) => {
        pipeline.sort((a, b) => {
            if (a.runningId === undefined && b.runningId === undefined) {
                if (a.start !== b.start) {
                    return a.start - b.start
                } else {
                    return a.slideTime - b.slideTime
                }
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
                <Building key={building} name={building} pipeline={[]}
                          startOp={props.startOp} finishOp={props.finishOp}
                          speedUp={props.speedUp}
                          buildingSettings={props.buildingSettings}
                />
            )}
        </div>
    )
}

export default OperationList;
