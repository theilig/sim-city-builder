import React from "react";
function Good(props) {
    return (<button title={props.shortcut}
        onClick={() => props.goodWasClicked(props.name, false)}
        onContextMenu={() => props.goodWasClicked(props.name, true)}
    >{props.name + props.count}</button>)
}

export default Good;
