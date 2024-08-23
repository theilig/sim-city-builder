import React from 'react';
function Reminders(props) {
    let keys = Object.keys(props.reminders)
    keys.sort((a, b) => {
        if (props.reminders[a].remaining !== props.reminders[b].remaining) {
            return props.reminders[a].remaining - props.reminders[b].remaining
        }
        if (a < b) {
            return -1
        } else {
            return 1
        }
    })
    return <div style={{display: 'flex', flexDirection: 'column'}}>
        {keys.map((name, index) => {
            if (props.reminders[name].remaining <= 0) {
                return (<div key={index}>
                    {name}
                    <button onClick={() => props.reset(name)}>Reset</button>
                </div>)
            }

            return (<div key={index}>
                {name} {props.reminders[name].remaining}
            </div>)
        })}
    </div>
}
export default Reminders
