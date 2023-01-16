import React, { useState } from 'react';
import Good from './Good';
function GoodsList(props) {
    const [currentList, setCurrentList] = useState({});
    function updateCount(goodName, total) {
        var newList = {...currentList};
        newList[goodName] = total;
        setCurrentList(newList)
    }
    function goodWasClicked(goodName) {
        updateCount(goodName, (currentList[goodName] || 0) + 1)
    }
    var goods = {
        'metal': {},
        'wood': {},'plastic': {},'seeds': {},'mineral': {},'chemical': {},
        'toilet paper': {},
        'sugar&spices': {},'glass': {},'animal feed': {},'nails': {},
        'wood planks': {},
        'bricks': {},'cement': {},'glue': {},'paint': {},'hammer': {},
        'measuring tape': {},'shovel': {},
        'utensils': {},'ladder': {},'vegetables': {},'flour': {},'fruit': {},
        'cream': {},'chairs': {},
        'tables': {},'grass': {},'trees': {},'outdoor furniture': {},
        'reusable bags': {},
        'beef': {},
        'cherry cheesecake': {},
        'donuts': {},'smoothes': {},'bread rolls': {},'corn': {},'cheese': {},'fabric': {},
    };
    function makeShoppingList(e) {
        props.addShoppingList(currentList);
        setCurrentList({})
    }
    return (
        <div>
            <div style={{"display": "flex", "flexWrap": "wrap"}}>
                {Object.keys(goods).map(good => (
                    <Good goodWasClicked={goodWasClicked} count={currentList[good] || 0} key={good} name={good} />
                ))}
            </div>
            <div style={{"marginTop": "25px", "display":"flex", "justifyContent": "center"}}>
                <button onClick={makeShoppingList} style={{"display": "grid", "width": "100px", "backgroundColor":"goldenrod"}}>
                make
                </button>
            </div>
        </div>   
    )
}
export default GoodsList;