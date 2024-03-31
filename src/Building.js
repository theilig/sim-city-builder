import React, {useState} from 'react';
import Operation from "./Operation";

function Building(props) {
    let visualPipeline = []
    let lastOp = undefined
    let needOne = true
    const [tokenSettings, setTokenSettings] = useState(false)
    function toggleTokenSettings(e) {
        setTokenSettings(true)
    }
    function checkForEscape(e) {
        if (e.key === 'Escape') {
            setTokenSettings(false)
        }
    }
    function addToken(e) {
        props.changeToken(props.name, e.target.value)
    }
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
    let displayName = props.name
    const token = props.pipeline.speedUp
    if (token && token.speed > 1 && token.remaining > 0) {
        displayName += " " + token.speed + "x"
    }
    const style = {height: "40px", width: "170px"}
    const select =
        <select
            onChange={(e) => addToken(e)}
            onKeyDown={checkForEscape}
            style={style}
            defaultValue={''}
        >
        {displayName}
        <option onKeyDown={checkForEscape}>none</option>
        <option onKeyDown={checkForEscape}>Turtle</option>
        <option onKeyDown={checkForEscape}>Llama</option>
        <option onKeyDown={checkForEscape}>Cheetah</option>
    </select>
    return (<div style={{display: "flex", flexDirection: "column", marginRight: "5px", marginBottom: "10px"}}>
        {tokenSettings && select}
        {!tokenSettings && <div style={style} onClick={toggleTokenSettings}>{displayName}</div>}
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
