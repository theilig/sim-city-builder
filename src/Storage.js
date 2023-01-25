import React from 'react';
import goods from "./Production";
function Storage(props) {
    return (
        <div style={{display: "flex"}}>
            {Object.keys(goods).map(key =>
                props.goods[key] && <div style={{marginRight: "5px"}} key={key}>{key + ": " + props.goods[key]}</div>)}
        </div>
    )
}
export default Storage;
