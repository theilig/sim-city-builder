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
    function makeShoppingList() {
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
                <button onClick={addGoods} style={{"display": "grid", "width": "100px", "backgroundColor":"goldenrod"}}>
                    have
                </button>
                <button onClick={removeGoods} style={{"display": "grid", "width": "100px", "backgroundColor":"goldenrod"}}>
                    gone
                </button>
            </div>
        </div>
    )
}
export default GoodsList;
