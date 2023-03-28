import React from 'react';
import {secondsToTime} from "./Production";

function Suggestions(props) {
    let sorted = props.suggestions.sort((a, b) => {
        return b.valuePerHour - a.valuePerHour
    })
    let combined = [...props.added]
    sorted.forEach(suggestion => {
        combined.push(suggestion)
    })
    return (<div>
        <table>
            <thead>
                <tr>
                    <th>Good</th>
                    <th>Start Time</th>
                    <th>Value</th>
                </tr>
            </thead>
            <tbody>
                {combined.map((suggestion, index) => {
                    return (
                        <tr key={index}>
                            <td>{suggestion.name}</td>
                            <td>{secondsToTime(suggestion.startTime) || "Now"}</td>
                            <td>{Math.round(suggestion.valuePerHour)}</td>
                            {suggestion.added && <td><button onClick={() => props.removeSuggestion(suggestion)}>Remove</button></td>}
                            {!suggestion.added && <td><button onClick={() => props.addSuggestion(suggestion)}>Add</button></td>}
                        </tr>
                    )
                })}
            </tbody>
        </table>
    </div>)
}

export default Suggestions
