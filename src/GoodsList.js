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
    const buildingStyles = {
        'Factory': {width: '306px'}, 'Building Supplies Store': {width: "207px"}, 'Hardware Store': {width: '256px'},
        'Farmer\'s Market': {width: '226px'}, 'Furniture Store': {width: "234px"}, 'Gardening Supplies': {},
        'Donut Shop': {width: '281px'}, 'Fashion Store': {}, 'Fast Food Restaurant': {},
        'Eco Shop': {}, 'Green Factory': {}
    }
    return (
        <div>
            <div style={{display: 'flex', flexWrap: 'wrap'}}>
                {Object.keys(buildingStyles).map((building, index) => {
                    let style = {display: 'flex', flexWrap:'wrap', width: '277px', borderWidth: '2px', borderStyle: 'double' }
                    style.width = buildingStyles[building].width
                    return (
                        <div key={index} style={style}>
                            {Object.keys(goods).map(good => (
                                goods[good].building === building && <Good goodWasClicked={goodWasClicked} count={currentList[good] || 0} key={good} name={good} />
                            ))}
                        </div>
                    )
                })}
            </div>
            <div style={{"marginTop": "25px", "display":"flex", "justifyContent": "center"}}>
                <button onClick={() => makeShoppingList('Capital City')} style={{"display": "grid", "width": "100px", "backgroundColor":"#6699ff"}}>
                    Capital City
                </button>
                <button onClick={() => makeShoppingList('Green Valley')} style={{"display": "grid", "width": "100px", "backgroundColor":"greenyellow"}}>
                    Green Valley
                </button>
                <button onClick={() => makeShoppingList('Design')} style={{"display": "grid", "width": "100px", "backgroundColor":"khaki"}}>
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
