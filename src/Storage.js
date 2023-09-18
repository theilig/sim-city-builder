import React, {useCallback, useEffect, useState} from 'react';
export function removeGood(storage, good) {
    let newStorage = {...storage}
    let found = newStorage[good] && newStorage[good] > 0
    if (newStorage[good] > 1) {
        newStorage[good] -= 1
    } else {
        delete newStorage[good]
    }
    return {found: found, storage: newStorage}
}

export function addStorage(storage, goods) {
    let newStorage = {...storage}
    Object.keys(goods).forEach(good => {
        if (newStorage[good] === undefined) {
            newStorage[good] = goods[good]
        } else {
            newStorage[good] += goods[good]
        }
    })
    return newStorage
}

function Storage(props) {
    const [adjustments, setAdjustments] = useState({})
    const [storedKeys, setStoredKeys] = useState([0])

    const updateCount = useCallback((goodName, delta) => {
        let newList = {...adjustments};
        const total = (adjustments[goodName] || 0) + delta
        if (total > 0) {
            newList[goodName] = total
        } else {
            delete newList[goodName]
        }
        setAdjustments(newList)
    }, [adjustments])

    function goodWasClicked(goodName, rightButton) {
        if (rightButton) {
            updateCount(goodName,-1)
        } else {
            updateCount(goodName,1)
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

    function makeGoods(removeFromStorage) {
        props.makeGoods(adjustments, removeFromStorage)
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
        const localStorage = props.storage || {}
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
                {Object.keys(props.goodsSettings).map((good, index) => {
                    if (props.goodsSettings[good].building === building) {
                        return (
                            <tr key={index} style={rowStyle} onClick={() => goodWasClicked(good, false)}
                                onContextMenu={() => goodWasClicked(good, true)}>
                                <td><div style={nameStyle}>{good}</div></td>
                                {wrap(localStorage[good], undefined, {}, '', '', true)}
                                {wrap(props.unassignedStorage[good], undefined, {}, '(', ')', false)}
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
    useEffect(() => {
        function updateKeys(event) {
            let newStoredKeys = [...storedKeys]
            const key = event.key
            if (key >= '0' && key <= '9') {
                const value = parseInt(key)
                if (newStoredKeys.length !== 1) {
                    newStoredKeys = [value]
                } else {
                    newStoredKeys = [newStoredKeys[0] * 10 + value]
                }
            } else {
                newStoredKeys.push(key)
            }
            if (newStoredKeys.length === 3) {
                if (newStoredKeys[0] === 0) {
                    newStoredKeys[0] = 1
                }
                const shortcut = newStoredKeys[1] + newStoredKeys[2]
                Object.keys(props.goodsSettings).forEach(good => {
                    if (props.goodsSettings[good].shortcut === shortcut) {
                        updateCount(good, newStoredKeys[0])
                    }
                })
                newStoredKeys = [0]
            }
            setStoredKeys(newStoredKeys)
        }
        document.addEventListener('keydown', updateKeys);

        // Don't forget to clean up
        return function cleanup() {
            document.removeEventListener('keydown', updateKeys);
        }
    }, [storedKeys, updateCount, props.goodsSettings]);
    const layout = [
        ['Factory'],
        ["Farmer's Market", 'Gardening Supplies'],
        ['Building Supplies Store', 'Hardware Store'],
        ['Fashion Store', 'Chocolate Factory'],
        ['Furniture Store', 'Home Appliances'],
        ['Donut Shop', 'Fast Food Restaurant'],
        ['Green Factory', 'Eco Shop'],
        ['Coconut Farm', 'Tropical Products Store'],
        ['Fishery', 'Fish Marketplace']
    ]
    return (
        <div style={{display: "flex", flexDirection: 'column'}}>
            <div style={{display: "flex"}}>
                {layout.map((group, index) => {
                    return (<div key={'group.' + index} style={{display: "flex", flexDirection: 'column'}}>
                        {group.map(building => {
                            if (props.buildingSettings && props.buildingSettings[building] && props.buildingSettings[building].haveBuilding) {
                                return display(building)
                            } else {
                                return ''
                            }
                        })}
                    </div>)
                })}
            </div>
            <div style={{"marginTop": "25px", "display":"flex"}}>
                <button onClick={() => makeShoppingList('Capital City')} style={{"display": "grid", "width": "100px", "backgroundColor":"#6699ff"}}>
                    order
                </button>
                <button onClick={addGoods} style={{"display": "grid", "width": "100px", "backgroundColor":"aqua"}}>
                    have
                </button>
                <button onClick={removeGoods} style={{"display": "grid", "width": "100px", "backgroundColor":"rosybrown"}}>
                    gone
                </button>
                <button onClick={() => makeGoods(true)} onContextMenu={() => makeGoods(false)} style={{"display": "grid", "width": "100px", "backgroundColor":"darksalmon"}}>
                    make goods
                </button>
                <button onClick={() => props.clear(false)} onContextMenu={() => props.clear(true)} style={{"display": "grid", "width": "100px", "backgroundColor":"tomato"}}>
                    reset
                </button>
            </div>
        </div>
    )
}
export default Storage;
