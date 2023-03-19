import React from 'react';
import {displayName, secondsToTime} from './Production'
import ListOps from "./ListOps";
function ShoppingList(props) {
    let timeString = " in " + secondsToTime(props.end)
    if (props.end <= 0) {
        timeString = " now"
    }

    let style = {color: "#6699ff"}
    if (props.list.region === 'Design') {
        style = {color: "darkblue"}
    } else if (props.list.region === 'Green Valley') {
        style = {color: "greenyellow"}
    } else if (props.list.region === 'Sunny Isles') {
        style = {color: "palegoldenrod"}
    }
    return (
        <div draggable
             onDragStart={props.dragStart} onDragEnter={props.dragEnter} onDragEnd={props.dragEnd}>
            <div style={style}>
                <span onClick={() => props.expandOrCollapse(props.index, props.expanded)}>
                    {"You want " + Object.keys(props.list.items).map(key =>{
                        return props.list.items[key] + " " + displayName(key, props.list.items[key])
                    }).join(" and ") + " ready" + timeString
                    }
                </span>
                <button onClick={() => props.finish()} onContextMenu={() => props.remove()}>done</button>
            </div>
            <div>
                {props.expanded && <ListOps operations={props.operations} />}
            </div>
        </div>
    )
}
export default ShoppingList;
