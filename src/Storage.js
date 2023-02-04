import React from 'react';
import goods from "./Production";
function Storage(props) {
    function display(good) {
        if (props.unused && props.unused[good] > 0) {
            return <div>{good + ': ' + props.goods[good] + ' (' + props.unused[good] + ')'}</div>
        } else {
            return <div>{good + ': ' + props.goods[good]}</div>
        }
    }
    return (
        <div style={{display: "flex"}}>
            {Object.keys(goods).map(key =>
                props.goods[key] && <div style={{marginRight: "5px"}} key={key}>{display(key)}</div>)}
        </div>
    )
}
export default Storage;
