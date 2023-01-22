import React from 'react';
function ShoppingList(props) {
    return (
        <div>
            {"You want " + Object.keys(props.list).map(key =>{
                if (key.charAt(key.length - 1) === "s" && props.list[key] === 1) {
                    return props.list[key] + " " + key.substring(0, key.length - 1);
                } else {
                    return props.list[key] + " " + key;
                }
            }).join(" and ") + " ready in " + props.end + " seconds"
            }
            <button onClick={() => props.remove()}>done</button>
        </div>
    )
}
export default ShoppingList;
