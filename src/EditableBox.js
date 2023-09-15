import {useState} from "react";


function EditableBox(props) {
    const [editing, setEditing] = useState(false)
    const [value, setValue] = useState(props.value);

    function checkForEnter(e) {
        if (e.code === 'Enter' || e.code === 'NumpadEnter') {
            props.updateValue(value)
            setEditing(false)
        } else if (e.code === 'Escape') {
            props.resetValue(value)
        }
    }

    function checkForClickOut(e) {
        setEditing(false)
    }
    let style = {...props.style}
    style.display = 'flex'
    let valueStyle = {...props.valueStyle}

    if (editing) {
        return <div style={style} id={'valueBox.' + props.name} onMouseDown={checkForClickOut} >
            <div>{!props.noField && props.name}</div>
            <input autoFocus={true} name={'valueBox' + props.name} style={valueStyle} value={value} size={props.size}
                   onBlur={checkForClickOut} onKeyDown={checkForEnter}
                   onChange={(e) => setValue(e.target.value)}/>
        </div>
    } else {
        valueStyle.marginRight = '5px'
        return <div onClick={() => setEditing(true)} style={style}>
            <div style={{marginRight: '5px'}}>{!props.noField && props.name}</div>
            <div style={valueStyle}>{value}</div>
        </div>
    }
}

export default EditableBox;
