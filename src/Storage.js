import React from 'react';
function Storage(props) {
    return (
        <div style={{display: "flex"}}>
            {Object.keys(props.goods).map(key => <div key={key}>{props.goods[key] + " " + key}</div>)}
        </div>
    )
}
export default Storage;
