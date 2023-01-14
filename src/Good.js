import React, { useState } from 'react';
function Good(props) {
    const [timesClicked, setTimesClicked] = useState(0)
    function goodWasClicked() {
        setTimesClicked(timesClicked+1);
        alert('You clicked ' + props.name);
    }
    
    return (<button onClick={() => goodWasClicked()}>{props.name + timesClicked}</button>)
}

export default Good;
