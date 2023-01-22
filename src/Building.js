import React, { useState } from 'react';
import Operation from "./Operation";
function Building(props) {
    return (<div style={{display: "flex", flexDirection: "column"}}>
        <table>
            <thead>
                <tr>
                    <td colSpan={3} style={{textAlign: "center"}}>{props.name}</td>
                </tr>
            </thead>
            <tbody>
                {props.pipeline.map((op, index) => {
                    return (
                        <Operation operation={op} key={index}
                            startOp={props.startOp} finishOp={props.finishOp} building={props.name} />
                    )
                })}
            </tbody>
        </table>
    </div>)
}
export default Building;
