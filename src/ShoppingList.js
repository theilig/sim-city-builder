import React from 'react';
import {displayName, secondsToTime} from './Production'
function ShoppingList(props) {
    let timeString = " in " + secondsToTime(props.end)
    if (props.end <= 0) {
        timeString = " now"
    }

    let style = {color: "#6699ff"}
    if (props.list.region === 'Design') {
        style = {color: "khaki"}
    } else if (props.list.region === 'Green Valley') {
        style = {color: "greenyellow"}
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
