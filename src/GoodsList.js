import React, { useState } from 'react';
import Good from './Good';
import goods from "./Production"
function GoodsList(props) {
    const [currentList, setCurrentList] = useState({});
    function updateCount(goodName, total) {
        let newList = {...currentList};
        newList[goodName] = total;
        setCurrentList(newList)
    }
    function goodWasClicked(goodName) {
        updateCount(goodName, (currentList[goodName] || 0) + 1)
    }

    function addGoods() {
        props.addStorage(currentList)
        setCurrentList({})
    }

    function removeGoods() {
        props.removeStorage(currentList)
        setCurrentList({})
    }
    function makeShoppingList(region) {
        props.addShoppingList(currentList, region);
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
                <button onClick={() => makeShoppingList('Capital City')} style={{"display": "grid", "width": "100px", "backgroundColor":"goldenrod"}}>
                    Capital City
                </button>
                <button onClick={() => makeShoppingList('Green Valley')} style={{"display": "grid", "width": "100px", "backgroundColor":"goldenrod"}}>
                    Green Valley
                </button>
                <button onClick={() => makeShoppingList('Design')} style={{"display": "grid", "width": "100px", "backgroundColor":"goldenrod"}}>
                    Design
                </button>
                <button onClick={addGoods} style={{"display": "grid", "width": "100px", "backgroundColor":"aqua"}}>
                    have
                </button>
                <button onClick={removeGoods} style={{"display": "grid", "width": "100px", "backgroundColor":"rosybrown"}}>
                    gone
                </button>
            </div>
        </div>
    )
}
export default GoodsList;
