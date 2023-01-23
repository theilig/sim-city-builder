import React from 'react';
import {displayName, secondsToTime} from './Production'
function ShoppingList(props) {
    let timeString = " in " + secondsToTime(props.end)
    if (props.end <= 0) {
        timeString = " now"
    }

    return (
        <div>
            {"You want " + Object.keys(props.list).map(key =>{
                return props.list[key] + " " + displayName(key, props.list[key])
            }).join(" and ") + " ready" + timeString
            }
            <button onClick={() => props.remove()}>done</button>
        </div>
    )
}
export default ShoppingList;
