import React, { useState } from 'react';
import Building from "./Building";
function OperationList(props) {
    return (
        <div style={{display: "flex"}}>
            {Object.keys(props.operations).map(building =>
                <Building key={building} name={building} pipeline={props.operations[building]}
                            startOp={props.startOp} finishOp={props.finishOp} />
            )}
        </div>
    )
}

export default OperationList;
