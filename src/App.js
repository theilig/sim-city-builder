import './App.css';
import GoodsList from "./GoodsList.js";
import ShoppingList from './ShoppingList';
import {addOrder} from "./Production";
import OperationList from "./OperationList";
import React, { useState } from 'react';
import goods from "./Production"
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
  function startOperation(operation, building) {
    let newRunning = {...runningOperations}
    if (newRunning[building] === undefined) {
      newRunning[building] = [operation]
    } else {
      newRunning[building].push(operation)
    }
    delete operation.nonce
    operation.runningId = newRunning[building].length - 1
    setRunningOperations(newRunning)
    calculateOperations(shoppingLists, newRunning)
  }

  function finishOperation(operation, building) {
    let newRunning = {...runningOperations}
    let buildingOperations = []
    runningOperations[building].forEach(op => {
      if (op.runningId !== operation.runningId) {
        buildingOperations.push(op)
      }
    })
    let newGoods = {}
    newGoods[operation.name] = 1
    addStorage(newGoods)
    newRunning[building] = buildingOperations
    setRunningOperations(newRunning)
    calculateOperations(shoppingLists, newRunning)
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
  }


  function removeShoppingList(index) {
    let newShoppingLists = [...shoppingLists]
    newShoppingLists.splice(index, 1)
    setShoppingLists(newShoppingLists)
  }

  function addShoppingList(goodsNeeded) {
    if (Object.keys(goodsNeeded).length === 0) {
      return;
    }
    let newShoppingLists = [...shoppingLists]
    newShoppingLists.push(goodsNeeded);
    calculateOperations(newShoppingLists, runningOperations)
  }

  function calculateOperations(shoppingLists, running) {
    let totalOperations = {...running}
    let remainingStorage = {...inStorage}
    shoppingLists.sort((a, b) => {
      const aOps = addOrder(a, {...running}, inStorage)
      const bOps = addOrder(b, {...running}, inStorage)
      return aOps['timeOfCompletion'] - bOps['timeOfCompletion']
    })
    setShoppingLists(shoppingLists)
    shoppingLists.forEach((list, index) => {
      const result = addOrder(list, totalOperations, index, remainingStorage)
      totalOperations = result['operations']
      remainingStorage = result['remainingStorage']
    })
    setOperationList(totalOperations)
    let newExpectedTimes = []
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
