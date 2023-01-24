import './App.css';
import GoodsList from "./GoodsList.js";
import ShoppingList from './ShoppingList';
import {addOrder} from "./Production";
import OperationList from "./OperationList";
import React, { useState, useEffect, useCallback } from 'react';
import buildingLimits from "./Production"
import Storage from "./Storage";

function App() {
  const [shoppingLists, setShoppingLists] = useState([])
  const [loaded, setLoaded] = useState(false)
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
    operation.slideTime = 0
    operation.runningId = newRunning[building].length - 1
    operation.runTime = Date.now()
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
    if (buildingOperations.length > 0) {
      newRunning[building] = buildingOperations
    } else {
      delete newRunning[building]
    }
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
    localStorage.setItem("simStorage", JSON.stringify(newInStorage))
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
    localStorage.setItem("simStorage", JSON.stringify(newInStorage))
    calculateOperations(shoppingLists, runningOperations, newInStorage)
    return newInStorage
  }


  function removeShoppingList(index) {
    let newShoppingLists = [...shoppingLists]
    const newStorage = removeStorage(shoppingLists[index])
    newShoppingLists.splice(index, 1)
    setShoppingLists(newShoppingLists)
    localStorage.setItem("simShoppingLists", JSON.stringify(newShoppingLists))
    calculateOperations(newShoppingLists, runningOperations, newStorage)
  }

  function addShoppingList(goodsNeeded) {
    if (Object.keys(goodsNeeded).length === 0) {
      return;
    }
    let newShoppingLists = [...shoppingLists]
    newShoppingLists.push(goodsNeeded);
    localStorage.setItem("simShoppingLists", JSON.stringify(newShoppingLists))
    calculateOperations(newShoppingLists, runningOperations, inStorage)
  }

  const cloneOperations = (operations) => {
    return JSON.parse(JSON.stringify(operations))
  }

  const sortShoppingLists = (shoppingLists, running, storage) => {
    let newLists = [...shoppingLists]
    newLists.sort((a, b) => {
      const aOps = addOrder(a, cloneOperations(running), 0, storage, cloneOperations(running))
      const bOps = addOrder(b, cloneOperations(running), 0, storage, cloneOperations(running))
      return aOps['timeOfCompletion'] - bOps['timeOfCompletion']
    })
    return newLists
  }

  // This function assumes lists are already priority sorted, and will pass the index as a priority to addOrder
  const scheduleLists = useCallback((shoppingLists, fixedOperations, storage) => {
    // the fixed operations serve two purposes, one is as a seed of the list of all operations running
    // the second is a list of which ones are unassigned, and will mutate as orders grab them
    let unassignedOperations = cloneOperations(fixedOperations)
    let scheduledOperations = cloneOperations(fixedOperations)
    let unassignedStorage = {...storage}

    let opsByList = []
    shoppingLists.forEach((list, index) => {
      const result = addOrder(list, scheduledOperations, index, unassignedStorage, unassignedOperations)
      scheduledOperations = result['allOperations']
      unassignedStorage = result['storage']
      opsByList[index] = result['operationsForOrder']
    })
    return {operations: scheduledOperations, operationsByList: opsByList}
  }, [])

  const calculateExpectedTimes = (operationsByList) => {
    let expected = []
    operationsByList.forEach((list, index) => {
      expected[index] = 0
      list.forEach(op => {
        if (op.end > expected[index]) {
          expected[index] = op.end
        }
      })
    })
    return expected
  }

  const calculateOperations = (shoppingLists, running, storage) => {
    const newShoppingLists = sortShoppingLists(shoppingLists, running, storage)
    setShoppingLists(newShoppingLists)
    const result = scheduleLists(newShoppingLists, running, storage)
    const newOperations = result.operations
    setOperationList(newOperations)
    setExpectedTimes(calculateExpectedTimes(result.operationsByList))
  }

  useEffect(() => {
    if (!loaded) {
      const loadedShoppingLists = JSON.parse(localStorage.getItem("simShoppingLists"))
      if (loadedShoppingLists) {
        setShoppingLists(loadedShoppingLists)
      }
      const storage = JSON.parse(localStorage.getItem("simStorage"))
      if (storage) {
        setInStorage(storage)
      }
      const result = scheduleLists(shoppingLists, {}, storage)
      const newOperations = result.operations
      setOperationList(newOperations)
      setExpectedTimes(calculateExpectedTimes(result.operationsByList))
      setLoaded(true)
    }
    const updateRunning = () => {
      let newRunning = cloneOperations(runningOperations)
      Object.keys(newRunning).forEach(building => {
        newRunning[building].forEach(op => {
          const currentTime = Date.now()
          op.end = Math.floor(op.end - (currentTime - op.runTime) / 1000)
          if (op.end < 0) {
            op.end = 0
          }
          op.runTime = currentTime
        })
      })
      return newRunning
    }
    const interval = setInterval(() => {
      const newRunning = updateRunning()
      const result = scheduleLists(shoppingLists, {}, inStorage)
      const newOperations = result.operations
      setOperationList(newOperations)
      setExpectedTimes(calculateExpectedTimes(result.operationsByList))
      setRunningOperations(newRunning)
    }, 10000)
    return () => clearInterval(interval)
  }, [loaded, scheduleLists, shoppingLists, inStorage, runningOperations])

  let visualOpList = {...operationList}
  return (
    <div>
      <GoodsList addShoppingList={addShoppingList} addStorage={addStorage} removeStorage={removeStorage}/>
      {shoppingLists.map((list, index) =>
          <ShoppingList list={list} key={index} index={index}
                        remove={() => removeShoppingList(index)}
                        end={expectedTimes[index]}
                        removeStorage={removeStorage}
          />)}
      <OperationList key={"oplist"} operations={visualOpList} startOp={startOperation} finishOp={finishOperation} />
      <Storage key={"storage"} goods={inStorage} />
    </div>
  )
}

export default App;
