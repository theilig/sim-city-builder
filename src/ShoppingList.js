import React from 'react';
import {displayName, secondsToTime} from './Production'
import ListOps from "./ListOps";
function ShoppingList(props) {
    let timeString = '()'
    if (props.actualEnd !== undefined) {
        if (props.actualEnd <= 0) {
            timeString = " now"
        } else {
            timeString = " in " + secondsToTime(props.actualEnd)
        }
    }

    let style = {color: "#6699ff"}
    if (props.list.region === 'Design') {
        style = {color: "khaki"}
    } else if (props.list.region === 'Green Valley') {
        style = {color: "greenyellow"}
    } else if (props.list.region === 'Sunny Isles') {
        style = {color: "palegoldenrod"}
    } else if (props.list.region === 'Frosty Fjords') {
        style = {color: "honeydew"}
    }
    return (
        <div draggable
             onDragStart={props.dragStart} onDragEnter={props.dragEnter} onDragEnd={props.dragEnd}>
            <div style={style} title={props.delta + " seconds delayed"}>
                <span onClick={() => props.expandOrCollapse(props.index, props.expanded)}>
                    {"You want " + Object.keys(props.list.items).map(key =>{
                        return props.list.items[key] + " " + displayName(key, props.cityGoods[key], props.list.items[key])
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
