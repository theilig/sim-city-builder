import React, {useState} from 'react';
import {cloneOperations, createOperation} from "./Production";
import goods from "./Goods"
export function removeGood(storage, good) {
    let removed = false
    let buildingStorage = []
    let operation = createOperation(good)
    if (storage.byBuilding[operation.building]) {
        storage.byBuilding[operation.building].forEach(op => {
            if (!removed && op.name === operation.name) {
                removed = true
            } else {
                buildingStorage.push(op)
            }
        })
        let newStorage = cloneOperations(storage)
        newStorage.byBuilding[operation.building] = buildingStorage
        return {found: removed, storage: newStorage}
    } else {
        return {found: false, storage: storage}
    }
}

export function addStorage(storage, goods) {
    let newStorage = cloneOperations(storage)
    Object.keys(goods).forEach(good => {
        for (let i = 0; i < goods[good]; i += 1) {
            let op = createOperation(good)
            if (newStorage.byBuilding[op.building] === undefined) {
                newStorage.byBuilding[op.building] = []
            }
            op.reserved = false
            op.fromStorage = true
            op.start = 0
            op.end = 0
            newStorage.byBuilding[op.building].push(op)
        }
    })
    return newStorage
}

function Storage(props) {
    const [adjustments, setAdjustments] = useState({})

    function updateCount(goodName, total) {
        let newList = {...adjustments};
        if (total > 0) {
            newList[goodName] = total
        } else {
            delete newList[goodName]
        }
        setAdjustments(newList)
    }

    function goodWasClicked(goodName, rightButton) {
        if (rightButton) {
            updateCount(goodName, (adjustments[goodName] || 1) - 1)
        } else {
            updateCount(goodName, (adjustments[goodName] || 0) + 1)
        }
    }

    function addGoods() {
        props.addStorage(adjustments)
        setAdjustments({})
    }

    function removeGoods() {
        props.removeStorage(adjustments)
        setAdjustments({})
    }

    function makeGoods() {
        props.makeGoods(adjustments)
        setAdjustments({})
    }
    function makeShoppingList(region) {
        setAdjustments({})
        props.addShoppingList(adjustments, region);
    }

    function wrap(list, key, style, before, after, showZero) {
        let value = list
        if (list && key !== undefined) {
            value = list[key]
        }
        if (list && value) {
            return (<td><div style={style}>{before + value + after}</div></td>)
        } else {
            return (<td><div style={style}>{showZero && 0}</div></td>)
        }
    }
    function display(building) {
        let counts = {}
        if (props.storage.byBuilding[building]) {
            props.storage.byBuilding[building].forEach(op => {
                if (counts[op.name] === undefined) {
                    counts[op.name] = {count: 0, unused: 0}
                }
                counts[op.name].count += 1
                if (op.reserved === false) {
                    counts[op.name].unused += 1
                }
            })
        }
        const nameStyle = {}
        const rowStyle = {}
        const adjustmentStyle = {width: '10px'}
        return (
            <table key={building} style={{height: '0px'}}>
                <thead><tr><th style={rowStyle}>
                    {building}
                </th></tr>
                </thead>
                <tbody>
                {Object.keys(goods).map((good, index) => {
                    if (goods[good].building === building) {
                        return (
                            <tr key={index} style={rowStyle} onClick={() => goodWasClicked(good, false)}
                                onContextMenu={() => goodWasClicked(good, true)}>
                                <td><div style={nameStyle}>{good}</div></td>
                                {wrap(counts[good], 'count', {}, '', '', true)}
                                {wrap(counts[good], 'unused', {adjustmentStyle}, '(', ')', false)}
                                {wrap(adjustments[good], undefined, {adjustmentStyle}, '+', '', false)}
                            </tr>
                        )
                    } else {
                        return ("")
                    }
                })}
                </tbody>
            </table>
        )
    }
    return (
        <div style={{display: "flex", flexWrap: "wrap"}}>
            {['Factory', "Farmer's Market", 'Building Supplies Store', 'Hardware Store', 'Fashion Store',
                'Furniture Store', 'Gardening Supplies', 'Donut Shop', 'Fast Food Restaurant', 'Home Appliances',
                'Green Factory', 'Eco Shop', 'Coconut Farm', 'Tropical Products Store'].map(key =>
                display(key)
            )}
            <div style={{"marginTop": "25px", "display":"flex", "justifyContent": "center"}}>
                <button onClick={() => makeShoppingList('Capital City')} style={{"display": "grid", "width": "100px", "backgroundColor":"#6699ff"}}>
                    Capital City
                </button>
                <button onClick={() => makeShoppingList('Green Valley')} style={{"display": "grid", "width": "100px", "backgroundColor":"greenyellow"}}>
                    Green Valley
                </button>
                <button onClick={() => makeShoppingList('Sunny Isles')} style={{"display": "grid", "width": "100px", "backgroundColor":"palegoldenrod"}}>
                    Sunny Isles
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
                <button onClick={makeGoods} style={{"display": "grid", "width": "100px", "backgroundColor":"darksalmon"}}>
                    make goods
                </button>
                <button onClick={props.clear} style={{"display": "grid", "width": "100px", "backgroundColor":"tomato"}}>
                    clear
                </button>
            </div>
        </div>
    )
}
export default Storage;
