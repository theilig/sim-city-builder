import './App.css';
import {addOrder, calculateBuildingCosts, createOperation} from "./Production";
import OperationList from "./OperationList";
import React, {useState, useEffect, useCallback} from 'react';
import ShoppingLists, {addList, removeList, updatePriorityOrder} from "./ShoppingLists";
import Storage, {addStorage, removeGood} from "./Storage";
import {cloneOperations} from "./Production"
import {addToRunning, finishOperation, finishRunning, speedUpOperation, updateRunning} from "./Running";

function App() {
  const [shoppingLists, setShoppingLists] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [operationList, setOperationList] = useState({byBuilding: {}})
  const [expectedTimes, setExpectedTimes] = useState([])
  const [inStorage, setInStorage] = useState({})
  const [unassignedStorage, setUnassignedStorage] = useState({byBuilding: {}})
  const [listToOpMap, setListToOpMap] = useState([])
  const [runningOperations, setRunningOperations] = useState({byBuilding: {}})
  const [prioritySwitches, setPrioritySwitches] = useState([])
  const [priorityOrder, setPriorityOrder] = useState([])
  const [pauseUpdate, setPauseUpdate] = useState(false)

  document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  function pauseUpdates(newValue) {
    setPauseUpdate(newValue)
  }

  function clear() {
    setShoppingLists([])
    setOperationList({byBuilding: {}})
    setRunningOperations({byBuilding: {}})
    setPrioritySwitches([])
    setInStorage({byBuilding: {}})
    calculateOperations([], {byBuilding: {}}, {byBuilding: {}}, [])
  }

  function removeStorageOrRunning(itemsNeeded, storage, running) {
    Object.keys(itemsNeeded).forEach((good) => {
      for (let i = 0; i < itemsNeeded[good]; i += 1) {
        let result = removeGood(storage, good)
        if (result.found) {
          storage = result.storage
        } else {
          result = finishRunning(good, running)
          if (result.found) {
            running = result.running
          }
        }
      }
    })
    return {running: running, storage: storage}
  }

  function startOperations(operation, count) {
    let newRunning = runningOperations
    let newStorage = {...inStorage}
    for (let i = 0; i < count; i += 1) {
      let runningOperation = createOperation(operation.name)
      newRunning = addToRunning(runningOperation, newRunning)
      const result = removeStorageOrRunning(operation.ingredients, newStorage, newRunning)
      newRunning = result.running
      newStorage = result.storage
    }
    calculateOperations(shoppingLists, newRunning, newStorage, prioritySwitches)
  }

  function speedUp(operation, amount) {
    const newRunning = speedUpOperation(runningOperations, operation, amount)
    calculateOperations(shoppingLists, newRunning, inStorage, prioritySwitches)
  }

  function finishOperations(operation, count) {
    let newGoods = {}
    newGoods[operation.name] = count
    haveStorage(newGoods, true)
  }

  function makeGoods(goods) {
    let newRunning = runningOperations
    Object.keys(goods).forEach((good) => {
      for (let i = 0; i < goods[good]; i += 1) {
        const newOperation = createOperation(good)
        newRunning = addToRunning(newOperation, newRunning)
      }
    })
    calculateOperations(shoppingLists, newRunning, inStorage, prioritySwitches)
  }

  // in case you hit have instead of hitting done below
  function haveStorage(goods, clickedDone = false) {
    let newRunning = runningOperations
    Object.keys(goods).forEach((good) => {
      for (let i = 0; i < goods[good]; i += 1) {
        let operation = createOperation(good)
        newRunning = finishOperation(newRunning, operation, !clickedDone)
      }
    })
    const newInStorage = addStorage(inStorage, goods)
    calculateOperations(shoppingLists, newRunning, newInStorage, prioritySwitches)
  }

  function removeStorage(goods) {
    let storage = inStorage
    Object.keys(goods).forEach((good) => {
      for (let i = 0; i < goods[good]; i += 1) {
        const result = removeGood(storage, good)
        storage = result.storage
      }
    })
    calculateOperations(shoppingLists, runningOperations, storage, prioritySwitches)
  }

  function finishShoppingList(index) {
    let newRunning = cloneOperations(runningOperations)
    const result = removeStorageOrRunning(shoppingLists[index].items, inStorage, newRunning)
    const shoppingListsResult = removeList(shoppingLists, index, prioritySwitches)
    calculateOperations(shoppingListsResult.shoppingLists, result.running, result.storage, shoppingListsResult.prioritySwitches)
  }

  function removeShoppingList(index) {
    const shoppingListsResult = removeList(shoppingLists, index, prioritySwitches)
    calculateOperations(shoppingListsResult.shoppingLists, runningOperations, inStorage, shoppingListsResult.prioritySwitches)
  }

  function addShoppingList(goodsNeeded, region) {
    let filteredGoods = {}
    Object.keys(goodsNeeded).forEach(good => {
      if (goodsNeeded[good] > 0) {
        filteredGoods[good] = goodsNeeded[good]
      }
    })
    if (Object.keys(filteredGoods).length === 0) {
      return;
    }
    const result = addList(shoppingLists, filteredGoods, region, prioritySwitches)
    calculateOperations(result.shoppingLists, runningOperations, inStorage, result.prioritySwitches)
  }

  const sumOrderCost = useCallback((costs, opList) => {
    let cost = 0
    let duration = 0
    opList.forEach(op => {
      if (op.childOperations) {
        const childCost = sumOrderCost(costs, op.childOperations)
        cost += childCost.cost
        duration += childCost.duration
      }
      cost += (op.start + op.duration) * (costs[op.building] || 1)
      duration += (op.start + op.duration)
    })
    return {cost: cost, duration: duration}
  }, [])

  const sortShoppingLists = useCallback(shoppingLists => {
    let operationsNeeded = {byBuilding: {}}
    let operationsByOrder = []
    let timesPerOrder = []
    for (let i = 0; i < shoppingLists.length; i += 1) {
      let storage = cloneOperations(inStorage)
      let running = cloneOperations(runningOperations)
      const result = addOrder(shoppingLists[i].items, operationsNeeded, storage, running, 0,0, i)
      operationsNeeded = result.allOperations
      operationsByOrder.push(result.added)
      timesPerOrder.push(result.timeOfCompletion)
    }
    const costs = calculateBuildingCosts(operationsNeeded)
    let indexes = []
    let durationsPerOrder = []
    let costsPerOrder = []
    operationsByOrder.forEach((opList, index) => {
      const cost = sumOrderCost(costs, opList)
      indexes.push(index)
      costsPerOrder[index] = cost.cost
      durationsPerOrder[index] = cost.duration
    })

    for (let i = 0; i < shoppingLists.length; i += 1) {
      costsPerOrder[i] = costsPerOrder[i] / durationsPerOrder[i]
    }

    indexes.sort((a, b) => timesPerOrder[a] * costsPerOrder[a] -
        timesPerOrder[b] * costsPerOrder[b])
    return indexes
  }, [inStorage, runningOperations, sumOrderCost])

  // This function assumes lists are already priority sorted, and will pass the index as a priority to addOrder
  // We also randomly try to flip two to see if the total throughput would be better if they were swapped, and
  // track improvements in priority switches
  const scheduleLists = useCallback((shoppingLists, fixedOperations, storage, priorityOrder) => {
    // the fixed operations serve two purposes, one is as a seed of the list of all operations running
    // the second is a list of which ones are unassigned, and will mutate as orders grab them
    let unassignedOperations = cloneOperations(fixedOperations)
    let unassignedStorage = {...storage}

    let opsByList = []
    let scheduledOperations = cloneOperations(unassignedOperations)
    priorityOrder.forEach(order => {
      const listIndex = order
      // first see what's the fasted we could do it (finishBy == 0)
      let copyOfRunning = cloneOperations(unassignedOperations)
      let copyOfStorage = cloneOperations(unassignedStorage)
      let fastestScheduledOperations = cloneOperations(scheduledOperations)
      let result = addOrder(shoppingLists[listIndex].items, fastestScheduledOperations, copyOfStorage, copyOfRunning, 0, 0, listIndex)
      // then do it again where we just-in-time everything
      result = addOrder(shoppingLists[listIndex].items, scheduledOperations, unassignedStorage, unassignedOperations, result.timeOfCompletion, 0, listIndex)
      scheduledOperations = result.allOperations
      unassignedStorage = result.storage
      opsByList[listIndex] = result.added
      unassignedOperations = result.running
    })

    return {operations: scheduledOperations, operationsByList: opsByList, unassignedStorage: unassignedStorage}
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

  const updatePrioritySwitches = (newPrioritySwitches, newShoppingLists) => {
    calculateOperations(newShoppingLists, runningOperations, inStorage, newPrioritySwitches)
  }

  const calculateOperations = useCallback((shoppingLists, running, storage, localPrioritySwitches) => {
    setInStorage(storage)
    localStorage.setItem("simStorage", JSON.stringify(storage))
    return
    setRunningOperations(running)
    setShoppingLists(shoppingLists)
    localStorage.setItem("simShoppingLists", JSON.stringify(shoppingLists))
    let localPriorityOrder = sortShoppingLists(shoppingLists, running, storage)
    localPriorityOrder = updatePriorityOrder(localPriorityOrder, localPrioritySwitches)
    let result = scheduleLists(shoppingLists, running, storage, localPriorityOrder)
    const currentExpected = calculateExpectedTimes(result.operationsByList)
    if (shoppingLists.length <= 1) {
      localPrioritySwitches = []
    }
    setOperationList(result.operations)
    setExpectedTimes(currentExpected)
    // we have to unwind this back to original indexes
    setPrioritySwitches(localPrioritySwitches)
    setListToOpMap(result.operationsByList)
    setUnassignedStorage(result.unassignedStorage)
    setPriorityOrder(localPriorityOrder)
  }, [scheduleLists, sortShoppingLists])

  useEffect(() => {
    if (!loaded) {
      const loadedShoppingLists = JSON.parse(localStorage.getItem("simShoppingLists"))
      const storage = JSON.parse(localStorage.getItem("simStorage"))
      calculateOperations(loadedShoppingLists, {byBuilding: {}}, storage, prioritySwitches)
      setLoaded(true)
    }
    const interval = setInterval(() => {
      if (!pauseUpdate) {
        const newRunning = updateRunning(runningOperations)
        calculateOperations(shoppingLists, newRunning, inStorage, prioritySwitches)
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [loaded, calculateOperations, scheduleLists, shoppingLists, inStorage, runningOperations, prioritySwitches, pauseUpdate])

  let visualOpList = {...operationList}
  return (
    <div>
      <Storage key={"storage"} storage={inStorage} addShoppingList={addShoppingList} addStorage={haveStorage} removeStorage={removeStorage}
               makeGoods={makeGoods} clear={clear} />
      <ShoppingLists prioritySwitches={prioritySwitches} updatePrioritySwitches={updatePrioritySwitches}
                     lists={shoppingLists} priorityOrder={priorityOrder}
                     expectedTimes={expectedTimes} removeShoppingList={removeShoppingList}
                     finishShoppingList={finishShoppingList} listToOpMap={listToOpMap}
        />
      <OperationList key={"oplist"} operations={visualOpList}
                     startOp={startOperations} finishOp={finishOperations} speedUp={speedUp}
                      pauseUpdates={pauseUpdates}/>
    </div>
  )
}

export default App;
