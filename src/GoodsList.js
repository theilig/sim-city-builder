import React, { useState } from 'react';
import Good from './Good';
import goods from "./Goods"
function GoodsList(props) {
    const [currentList, setCurrentList] = useState({});
    const buildingStyles = {
        'Factory': {width: '306px'}, 'Building Supplies Store': {width: "207px"}, 'Hardware Store': {width: '256px'},
        'Farmer\'s Market': {width: '226px'}, 'Furniture Store': {width: "234px"}, 'Gardening Supplies': {},
        'Donut Shop': {width: '281px'}, 'Fashion Store': {}, 'Fast Food Restaurant': {},
        'Eco Shop': {}, 'Green Factory': {}, 'Home Appliances': {}
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
    )
}
export default GoodsList;
