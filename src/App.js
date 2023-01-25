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

  // in case you hit have instead of hitting done below
  function haveStorage(goods) {
    let newRunning = {...runningOperations}
    Object.keys(goods).forEach((good) => {
      let remainingToFind = goods[good]
      if (newRunning[good.building !== undefined]) {
        let remainingRunningInBuilding = []
        newRunning[good.building].forEach(op => {
          if (remainingToFind > 0 && op.name === good) {
            remainingToFind -= 1
          } else {
            remainingRunningInBuilding.push(op)
          }
        })
        newRunning[good.building] = remainingRunningInBuilding
      }
    })
    setRunningOperations(newRunning)
    addStorage(goods, newRunning)
  }

  function addStorage(goods, newRunning = undefined) {
    if (newRunning === undefined) {
      newRunning = runningOperations
    }

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
    setRunningOperations(newRunning)
    calculateOperations(shoppingLists, newRunning, newInStorage)
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
    const newStorage = removeStorage(shoppingLists[index].items)
    newShoppingLists.splice(index, 1)
    setShoppingLists(newShoppingLists)
    localStorage.setItem("simShoppingLists", JSON.stringify(newShoppingLists))
    calculateOperations(newShoppingLists, runningOperations, newStorage)
  }

  function addShoppingList(goodsNeeded, region) {
    if (Object.keys(goodsNeeded).length === 0) {
      return;
    }
    let newShoppingLists = [...shoppingLists]
    newShoppingLists.push({items: goodsNeeded, region: region});
    localStorage.setItem("simShoppingLists", JSON.stringify(newShoppingLists))
    calculateOperations(newShoppingLists, runningOperations, inStorage)
  }

  const cloneOperations = (operations) => {
    return JSON.parse(JSON.stringify(operations))
  }

  const sortShoppingLists = (shoppingLists, running, storage) => {
    let newLists = [...shoppingLists]
    let buildingsStarted = []
    let cumulativeStartTime = []
    let priorityKeys = []
    newLists.forEach((list, index) => {
      buildingsStarted[index] = 0
      cumulativeStartTime[index] = 0
      const ops = addOrder(list.items, cloneOperations(running), 0, storage, cloneOperations(running))
      Object.keys(ops).forEach(building => {
        if (!building.includes('Factory') && ops[building].length > 0) {
          buildingsStarted[index] += 1
          cumulativeStartTime[index] += ops[building][0].start
        }
      })
      priorityKeys.push(index)
    })
    priorityKeys.sort((a, b) => {
      if (buildingsStarted[a] !== buildingsStarted[b]) {
        return buildingsStarted[b] - buildingsStarted[a]
      } else {
        return cumulativeStartTime[a] - cumulativeStartTime[b]
      }
    })
    const sortedList = []
    priorityKeys.forEach(key => sortedList.push(newLists[key]))
    return sortedList
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
      const result = addOrder(list.items, scheduledOperations, index, unassignedStorage, unassignedOperations)
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
          op.end = Math.round(op.end - (currentTime - op.runTime) / 1000)
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
      const result = scheduleLists(shoppingLists, newRunning, inStorage)
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
      <Storage key={"storage"} goods={inStorage} />
      <GoodsList addShoppingList={addShoppingList} addStorage={haveStorage} removeStorage={removeStorage}/>
      {shoppingLists.map((list, index) =>
          <ShoppingList list={list} key={index} index={index}
                        remove={() => removeShoppingList(index)}
                        end={expectedTimes[index]}
                        removeStorage={removeStorage}
          />)}
      <OperationList key={"oplist"} operations={visualOpList} startOp={startOperation} finishOp={finishOperation} />
    </div>
  )
}

export default App;
