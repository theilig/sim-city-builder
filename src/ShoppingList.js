import React from 'react';
import {displayName} from './Production'
function ShoppingList(props) {
    return (
        <div>
            {"You want " + Object.keys(props.list).map(key =>{
                return props.list[key] + " " + displayName(key, props.list[key])
            }).join(" and ") + " ready in " + props.end + " seconds"
            }
            <button onClick={() => props.remove()}>done</button>
        </div>
    )
}
export default ShoppingList;
