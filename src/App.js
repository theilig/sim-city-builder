import './App.css';
import GoodsList from "./GoodsList.js";
import ShoppingList from './ShoppingList';
import {addOrder} from "./Production";
import OperationList from "./OperationList";
import React, { useState } from 'react';
import buildingLimits from "./Production"
import Storage from "./Storage";

function getLength(operations) {
  let maxEnd = 0
  Object.keys(operations).forEach(building => {
    operations[building].forEach(operation => {
      if (operation['end'] > maxEnd) {
        maxEnd = operation['end']
      }
    })
  })
  return maxEnd
}

function App() {
  const [shoppingLists, setShoppingLists] = useState([])
  const [operationList, setOperationList] = useState({})
  const [expectedTimes, setExpectedTimes] = useState([])
  const [inStorage, setInStorage] = useState({})
  const [runningOperations, setRunningOperations] = useState({})
  function startOperation(operation) {
    const building = operation.building
    let newRunning = cloneOperations(runningOperations)
    if (newRunning[building] === undefined) {
      newRunning[building] = [operation]
    } else {
      newRunning[building].push(operation)
    }
    delete operation.nonce
    operation.slideTime = 0
    operation.runningId = newRunning[building].length - 1
    let startTime = 0
    let buildingLimit = buildingLimits[operation.building] || 1
    if (buildingLimit === 1 && runningOperations[building]) {
      runningOperations[building].forEach(op => startTime = op.end)
    }
    operation.start = startTime
    operation.end = operation.duration + operation.start
    setRunningOperations(newRunning)
    const newStorage = removeStorage(operation.ingredients)
    calculateOperations(shoppingLists, newRunning, newStorage)
  }

  function finishOperation(operation) {
    const building = operation.building
    let newRunning = cloneOperations(runningOperations)
    let buildingOperations = []
    let startTime = 0
    let buildingLimit = buildingLimits[operation.building] || 1
    runningOperations[building].forEach(op => {
      if (op.runningId !== operation.runningId) {
        buildingOperations.push(op)
        if (buildingLimit === 1) {
          op.start = startTime
          op.end = op.start + op.duration
          startTime = op.end
        }
      }
    })
    let newGoods = {}
    newGoods[operation.name] = 1
    const newInStorage = addStorage(newGoods)
    newRunning[building] = buildingOperations
    setRunningOperations(newRunning)
    calculateOperations(shoppingLists, newRunning, newInStorage)
  }

  function addStorage(goods) {
    let newInStorage = {...inStorage}
    Object.keys(goods).forEach((good) => {
      if (newInStorage[good] === undefined) {
        newInStorage[good] = goods[good]
      } else {
        newInStorage[good] += goods[good]
      }
      if (newInStorage[good] <= 0) {
        delete newInStorage[good]
      }
    })
    setInStorage(newInStorage)
    calculateOperations(shoppingLists, runningOperations, newInStorage)
    return newInStorage
  }

  function removeStorage(goods) {
    let newInStorage = {...inStorage}
    Object.keys(goods).forEach((good) => {
      if (newInStorage[good] !== undefined) {
        newInStorage[good] -= goods[good]
      }
      if (newInStorage[good] <= 0) {
        delete newInStorage[good]
      }
    })
    setInStorage(newInStorage)
    calculateOperations(shoppingLists, runningOperations, newInStorage)
    return newInStorage
  }


  function removeShoppingList(index) {
    let newShoppingLists = [...shoppingLists]
    const newStorage = removeStorage(shoppingLists[index])
    newShoppingLists.splice(index, 1)
    setShoppingLists(newShoppingLists)
    calculateOperations(newShoppingLists, runningOperations, newStorage)
  }

  function addShoppingList(goodsNeeded) {
    if (Object.keys(goodsNeeded).length === 0) {
      return;
    }
    let newShoppingLists = [...shoppingLists]
    newShoppingLists.push(goodsNeeded);
    calculateOperations(newShoppingLists, runningOperations, inStorage)
  }

  function cloneOperations(operations) {
    return JSON.parse(JSON.stringify(operations))
  }

  function calculateOperations(shoppingLists, running, storage) {
    let totalOperations = cloneOperations(running)
    let remainingStorage = {...storage}
    shoppingLists.sort((a, b) => {
      const aOps = addOrder(a, cloneOperations(running), 0, storage, cloneOperations(running))
      const bOps = addOrder(b, cloneOperations(running), 0, storage, cloneOperations(running))
      return aOps['timeOfCompletion'] - bOps['timeOfCompletion']
    })
    setShoppingLists(shoppingLists)
    let newExpectedTimes = []
    shoppingLists.forEach((list, index) => {
      const result = addOrder(list, totalOperations, index, remainingStorage, cloneOperations(running))
      totalOperations = result['operations']
      remainingStorage = result['remainingStorage']
      newExpectedTimes[index] = {start: 0, end: 0} // will get populated below unless all items are in storage
    })
    setOperationList(totalOperations)
    Object.keys(totalOperations).forEach(building => {
      totalOperations[building].forEach(op => {
        const current = newExpectedTimes[op['priority']]
        if ( current === undefined) {
          newExpectedTimes[op['priority']] = {'start': op['start'], 'end': op['end']}
        } else {
          if (current['start'] > op['start']) {
            newExpectedTimes[op['priority']]['start'] = op['start']
          }
          if (current['end'] < op['end']) {
            newExpectedTimes[op['priority']]['end'] = op['end']
          }
        }
      })
    })
    setExpectedTimes(newExpectedTimes)
  }

  let visualOpList = {...operationList}
  delete visualOpList['nonceRegistry']
  return (
    <div>
      <GoodsList addShoppingList={addShoppingList} addStorage={addStorage} removeStorage={removeStorage}/>
      {shoppingLists.map((list, index) =>
          <ShoppingList list={list} key={index} index={index}
                        remove={() => removeShoppingList(index)}
                        start={expectedTimes[index]['start']}
                        end={expectedTimes[index]['end']}
                        removeStorage={removeStorage}
          />)}
      <OperationList key={"oplist"} operations={visualOpList} startOp={startOperation} finishOp={finishOperation} />
      <Storage key={"storage"} goods={inStorage} />
    </div>
  )
}

export default App;
