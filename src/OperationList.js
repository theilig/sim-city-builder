import React from 'react';
import Building from "./Building";
function OperationList(props) {
    let combined = {}
    Object.keys(props.operations).forEach(building => {
        const alteredBuilding = building.replace(/\d+$/, '')
        if (combined[alteredBuilding] === undefined) {
            combined[alteredBuilding] = props.operations[building]
        } else {
            combined[alteredBuilding] = combined[alteredBuilding].concat(props.operations[building])
            combined[alteredBuilding].sort((a, b) => {
                if (a.start === b.start) {
                    if (a.runningId === undefined) {
                        return 1
                    } else if (b.runningId === undefined) {
                        return -1
                    } else {
                        return a.runningId - b.runningId
                    }
                } else {
                    return a.start - b.start
                }
            })
        }
    })
    return (
        <div style={{display: "flex"}}>
            {Object.keys(combined).map(building =>
                <Building key={building} name={building} pipeline={combined[building]}
                            startOp={props.startOp} finishOp={props.finishOp} />
            )}
        </div>
    )
}

export default OperationList;
