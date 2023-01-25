import React from 'react';
import {displayName, secondsToTime} from './Production'
function ShoppingList(props) {
    let timeString = " in " + secondsToTime(props.end)
    if (props.end <= 0) {
        timeString = " now"
    }

    let style = {color: "purple"}
    if (props.list.region === 'Design') {
        style = {color: "blue"}
    } else if (props.list.region === 'Green Valley') {
        style = {color: "green"}
    }
    return (
        <div style={style}>
            {"You want " + Object.keys(props.list.items).map(key =>{
                return props.list.items[key] + " " + displayName(key, props.list.items[key])
            }).join(" and ") + " ready" + timeString
            }
            <button onClick={() => props.remove()}>done</button>
        </div>
    )
}
export default ShoppingList;
