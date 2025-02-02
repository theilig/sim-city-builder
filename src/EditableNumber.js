function EditableNumber(props) {
    let style = {...props.style}
    style.userSelect = 'none'
    style.display = 'flex'
    return <div key={'editable.' + props.name} style={style}
                onClick={() => props.updateCallback(parseInt(props.value) + 1)}
                onContextMenu={() => props.updateCallback(parseInt(props.value) - 1)}
    >
        <div style={{marginRight: '5px'}}>{props.name}</div>
        <div style={{marginLeft: 'auto', marginRight: '5px'}}>{props.value}</div>
    </div>
}

export default EditableNumber
