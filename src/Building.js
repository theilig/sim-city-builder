import React, {useState} from 'react';
import Operation from "./Operation";

function Building(props) {
    let visualPipeline = []
    let lastOp = undefined
    const [tokenSettings, setTokenSettings] = useState(false)
    function toggleTokenSettings() {
        setTokenSettings(true)
    }
    function checkForEscape(e) {
        if (e.key === 'Escape') {
            setTokenSettings(false)
        }
    }
    function addToken(e) {
        props.changeToken(props.name, e.target.value)
        setTokenSettings(false)
    }
    let taken = undefined
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
        } else if (taken === undefined || taken.start > visualOp.start) {
            taken = visualOp
        }
    })
    if (taken) {
        visualPipeline.push(taken)
    }
    const style = {height: "20px", width: "170px"}
    let displayName = props.name
    let altText = ''
    let defaultValue = ''
    const token = props.pipeline.speedUp
    if (token) {
        if (token.remaining > 0) {
            altText = Math.floor(token.remaining) + " seconds left"
        }
        switch (token.speed) {
            case 2: style.color = '#CD7F32'
                style.backgroundColor = 'white'
                defaultValue = 'Turtle'
                break
            case 4: style.color = 'silver'
                style.backgroundColor = 'white'
                defaultValue = 'Llama'
                break
            case 12: style.color = 'gold'
                style.backgroundColor = 'white'
                defaultValue = 'Cheetah'
                break
            case 1:
            default:
                break
        }
    }
    const select =
        <select
            onChange={(e) => addToken(e)}
            onKeyDown={checkForEscape}
            style={style}
            defaultValue={defaultValue}
        >
        {displayName}
        <option onKeyDown={checkForEscape}>none</option>
        <option onKeyDown={checkForEscape}>Turtle</option>
        <option onKeyDown={checkForEscape}>Llama</option>
        <option onKeyDown={checkForEscape}>Cheetah</option>
    </select>
    return (<div style={{display: "flex", flexDirection: "column", marginRight: "5px", marginBottom: "10px"}}>
        {tokenSettings && select}
        {!tokenSettings && <div style={style} title={altText} onClick={toggleTokenSettings}>{displayName}</div>}
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
