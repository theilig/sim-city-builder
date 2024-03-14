import React from 'react';
import Building from "./Building";

function OperationList(props) {
    const commercialBuildings = Object.keys(props.pipelines).filter(building => {
        return props.pipelines[building].isParallel === false
    })
    return (
        <div style={{display: "flex", flexWrap: "wrap"}}>
            {commercialBuildings.map(building =>
                <Building key={building} name={building} pipeline={props.pipelines[building]}
                          finishOp={props.finishOp}
                          startOp={props.startOp}
                          speedUp={props.speedUp}
                />
            )}
        </div>
    )
}

export default OperationList;
