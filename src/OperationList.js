import React from 'react';
import Building from "./Building";

function OperationList(props) {
    const activeBuildings = Object.keys(props.pipelines).filter(building => {
        return props.pipelines[building].running.filter(op => {
            return (op.lastUpdateTime !== undefined) && (op.duration > 0)
        }).length > 0
    })
    return (
        <div style={{display: "flex"}}>
            {activeBuildings.map(building =>
                <Building key={building} name={building} pipeline={props.pipelines[building]}
                          finishOp={props.finishOp}
                          speedUp={props.speedUp}
                />
            )}
        </div>
    )
}

export default OperationList;
