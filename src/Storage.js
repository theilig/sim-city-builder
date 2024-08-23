import React, {useCallback, useEffect, useState} from 'react';
import {goodsData} from "./BuildingSettings";

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

    function makeGoods(removeFromStorage, randomBuilding) {
        props.makeGoods(adjustments, removeFromStorage, randomBuilding)
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
            return (<div style={style}>{before + value + after}</div>)
        } else {
            return (<div style={style}>{showZero && 0}</div>)
        }
    }

    const sortStorage = () => {
        const localStorage = props.storage || {}
        const groups = [['Factory'], [], ['Green Factory', 'Eco Shop'], ['Coconut Farm', 'Tropical Products Store'], ['Fishery', 'Fish Marketplace'], ['Mulberry Grove', 'Silk Store']]
        let storageSorted = []
        groups.forEach(group => {
            let goodsToAdd = []
            Object.keys(localStorage).forEach(good => {
                if (goodsData[good]) {
                    const building = goodsData[good].building
                    const hasGroup = groups.find(g => g.includes(building))
                    const thisGroup = group.includes(building)
                    if ((hasGroup && thisGroup) || (!hasGroup && group.length === 0)) {
                        goodsToAdd.push(good)
                    }
                }
            })
            goodsToAdd.sort((a, b) => {
                if (localStorage[a] !== localStorage[b]) {
                    return localStorage[b] - localStorage[a]
                }
                if (a < b) {
                    return -1
                } else {
                    return 1
                }
            })
            goodsToAdd.forEach(good => {
                storageSorted.push(<div title={goodsData[good].shortcut} key={good}
                            onClick={() => goodWasClicked(good, false)}
                            onContextMenu={() => goodWasClicked(good, true)} style={{display: 'flex', width: '175px', alignItems: 'center'}}>
                    <div style={{display: 'flex', width: '100px'}}>{good}</div>
                    {wrap(localStorage[good], undefined, {width: '20px', alignItems: 'center'}, '', '', true)}
                    {wrap(props.unassignedStorage[good], undefined, {width: '30px', textAlign: 'right'}, '(', ')', false)}
                    {wrap(adjustments[good], undefined, {width: '10px'}, '+', '', false)}
                </div>)
            })
        })
        return storageSorted
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
                Object.keys(goodsData).forEach(good => {
                    if (goodsData[good].shortcut === shortcut) {
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

    return (
        <div style={{display: "flex", flexDirection: 'column'}}>
            <div style={{display: "flex"}}>
                <div key={'storageStuff'} style={{display: "flex", flexDirection: 'column', flexWrap: 'wrap', height: '200px'}}>
                    {sortStorage()}
                </div>
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
                <button onClick={(e) => makeGoods(true, e.shiftKey)} onContextMenu={(e) => makeGoods(false, e.shiftKey)} style={{"display": "grid", "width": "100px", "backgroundColor":"darksalmon"}}>
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
