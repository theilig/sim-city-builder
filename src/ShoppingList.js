import React, { useState } from 'react';
function ShoppingList(props) {
    return (
        <div>
            {"You want " + Object.keys(props.list).map(key => props.list[key] + " " + key).join(" and ")}
        </div>
    )
}
export default ShoppingList;
