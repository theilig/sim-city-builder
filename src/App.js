import './App.css';
import GoodsList from "./GoodsList.js";
import ShoppingList from './ShoppingList';
import {addOrder, createOperation} from "./Production";
import OperationList from "./OperationList";
import React, { useState, useEffect, useCallback } from 'react';
import {buildingLimits} from "./Production"
import Storage from "./Storage";
import {cloneOperations} from "./Production"

function App() {
  const [shoppingLists, setShoppingLists] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [operationList, setOperationList] = useState({})
  const [expectedTimes, setExpectedTimes] = useState([])
  const [inStorage, setInStorage] = useState({})
  const [unassignedStorage, setUnassignedStorage] = useState({})
  const [listToOpMap, setListToOpMap] = useState([])
  const [runningOperations, setRunningOperations] = useState({})
  const [expandedList, setExpandedList] = useState(-1)
  const [validatedPrioritySwitches, setPrioritySwitches] = useState([])
  const [priorityOrder, setPriorityOrder] = useState([])

  document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  const pipelineSizes = {
    'Factory': 1,
    'Green Factory': 1,
    'Home Appliances': 2,
    'Building Supplies Store': 5,
    'Hardware Store': 5,
    'Fast Food Restaurant': 2,
    'Furniture Store': 3,
    'Donut Shop': 3,
    'Fashion Store': 3,
    'Farmer\'s Market': 5,
    'Gardening Supplies': 3,
    'Eco Shop': 3,
  }

  function clear() {
    setShoppingLists([])
    setOperationList({})
    setRunningOperations({})
    setPrioritySwitches([])
    setInStorage({})
  }

  function expandOrCollapse(index, expanded) {
      if (expanded === true) {
          setExpandedList(-1)
      } else {
          setExpandedList(index)
      }
  }

  function addToRunning(operation, running) {
    let building = operation.building
    building = building.replace(/\d+$/, '')
    let buildingLimit = buildingLimits[building] || 1
    let startTime = 0
    if (running[building] === undefined) {
      running[building] = [operation]
    } else {
      if (buildingLimit === 1 && running[building].length > 0) {
        startTime = running[building][running[building].length - 1].end
      }
      running[building].push(operation)
    }
    if (startTime < 0) {
      startTime = 0
    }
    operation.slideTime = 0
    operation.runningId = running[building].length
    operation.placeInList = running[building].length
    operation.runTime = Date.now()
    operation.start = startTime
    operation.end = operation.duration + operation.start
  }

  function removeStorageOrRunning(itemsNeeded, storage, running) {
    let pulledFromStorage = {}
    Object.keys(itemsNeeded).forEach((good) => {
      const op = createOperation(good)
      let needToRemove = itemsNeeded[good]
      if (storage[good] !== undefined) {
        needToRemove -= storage[good]
        pulledFromStorage[good] = Math.min(storage[good], itemsNeeded[good])
      }
      if (needToRemove > 0) {
        Object.keys(running).forEach(building => {
          if (building.startsWith(op.building)) {
            let runningOperations = running[building]
            if (runningOperations !== undefined) {
              let newRunningOperations = []
              runningOperations.forEach(runningOp => {
                if (op.name === runningOp.name && needToRemove > 0) {
                  needToRemove -= 1
                } else {
                  newRunningOperations.push(runningOp)
                }
              })
              running[building] = newRunningOperations
            }
          }
        })
      }
    })
    return ({running: running, storage: removeStorage(pulledFromStorage)})
  }

  function startOperation(operation) {
    let newRunning = cloneOperations(runningOperations)
    addToRunning(operation, newRunning)
    const result = removeStorageOrRunning(operation.ingredients, inStorage, newRunning)
    setRunningOperations(result.running)
    updateLists(shoppingLists, result.running, result.storage, validatedPrioritySwitches)
  }

  function speedUpOperation(operation) {
    let newRunning = cloneOperations(runningOperations)
    newRunning[operation.building].forEach(op => {
      if (op.runningId === operation.runningId) {
        op.start -= 60
        op.end -= 60
      }
    })
    setRunningOperations(newRunning)
    updateLists(shoppingLists, newRunning, inStorage, validatedPrioritySwitches)
  }

  function finishOperation(operation) {
    let building = operation.building
    let newRunning = cloneOperations(runningOperations)
    building = building.replace(/\d+$/, '')
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
    updateLists(shoppingLists, newRunning, newInStorage, validatedPrioritySwitches)
  }

  function makeGoods(goods) {
    let newRunning = cloneOperations(runningOperations)
    Object.keys(goods).forEach((good) => {
      for (let i = 0; i < goods[good]; i += 1) {
        const newOperation = createOperation(good)
        addToRunning(newOperation, newRunning)
      }
    })
    setRunningOperations(newRunning)
    updateLists(shoppingLists, newRunning, inStorage, validatedPrioritySwitches)
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
    updateLists(shoppingLists, newRunning, newInStorage, validatedPrioritySwitches)
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
    updateLists(shoppingLists, runningOperations, newInStorage, validatedPrioritySwitches)
    return newInStorage
  }


  function removeShoppingList(index) {
    let newShoppingLists = [...shoppingLists]
    let newRunning = cloneOperations(runningOperations)
    const result = removeStorageOrRunning(shoppingLists[index].items, inStorage, newRunning)
    setPrioritySwitches([])
    setRunningOperations(result.running)
    newShoppingLists.splice(index, 1)
    setShoppingLists(newShoppingLists)
    localStorage.setItem("simShoppingLists", JSON.stringify(newShoppingLists))
    updateLists(newShoppingLists, result.running, result.storage, [])
  }

  function addShoppingList(goodsNeeded, region) {
    if (Object.keys(goodsNeeded).length === 0) {
      return;
    }
    let newShoppingLists = [...shoppingLists]
    setPrioritySwitches([])
    newShoppingLists.push({items: goodsNeeded, region: region});
    localStorage.setItem("simShoppingLists", JSON.stringify(newShoppingLists))
    updateLists(newShoppingLists, runningOperations, inStorage, [])
  }

  const sortShoppingLists = (shoppingLists, running, storage) => {
    let priorityOrder = []
    shoppingLists.forEach((list, index) =>  {
      const result = addOrder(list.items, cloneOperations(running), 0, storage, cloneOperations(running))
      priorityOrder.push({index: index, timeOfCompletion: result.timeOfCompletion})
    })
    priorityOrder.sort((a, b) => {
      return a.timeOfCompletion - b.timeOfCompletion
    })
    return priorityOrder
  }

  // This function assumes lists are already priority sorted, and will pass the index as a priority to addOrder
  // We also randomly try to flip two to see if the total throughput would be better if they were swapped, and
  // track improvements in priority switches
  const scheduleLists = useCallback((shoppingLists, fixedOperations, storage, priorityOrder) => {
    // the fixed operations serve two purposes, one is as a seed of the list of all operations running
    // the second is a list of which ones are unassigned, and will mutate as orders grab them
    let unassignedOperations = cloneOperations(fixedOperations)
    let scheduledOperations = cloneOperations(fixedOperations)
    let unassignedStorage = {...storage}

    let opsByList = []
    priorityOrder.forEach(order => {
      const listIndex = order.index
      // first see what's the fasted we could do it (finishBy == 0)
      let copyOfRunning = cloneOperations(unassignedOperations)
      let result = addOrder(shoppingLists[listIndex].items, scheduledOperations, listIndex, unassignedStorage, copyOfRunning, 0)
      // then do it again where we just-in-time everything
      result = addOrder(shoppingLists[listIndex].items, scheduledOperations, listIndex, unassignedStorage, unassignedOperations, result.timeOfCompletion)
      scheduledOperations = result.allOperations
      unassignedStorage = result.storage
      opsByList[listIndex] = result.operationsForOrder
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

  const updateLists = (shoppingLists, running, storage, prioritySwitches) => {
    setShoppingLists(shoppingLists)
    return calculateOperations(shoppingLists, running, storage, prioritySwitches)
  }

  const calculateOperations = useCallback((shoppingLists, running, storage, prioritySwitches) => {
    const priorityOrder = sortShoppingLists(shoppingLists, running, storage)
    // first try with our existing switches
    let switchedOrder = [...priorityOrder]
    prioritySwitches.forEach(prioritySwitch => {
      const tmp = switchedOrder[prioritySwitch.to]
      switchedOrder[prioritySwitch.to] = switchedOrder[prioritySwitch.from]
      switchedOrder[prioritySwitch.from] = tmp
    })

    let result = scheduleLists(shoppingLists, running, storage, switchedOrder)
    const currentExpected = calculateExpectedTimes(result.operationsByList)
    if (shoppingLists.length > 1) {
      // now give it a shot with a random switch
      const switchIndex = Math.floor(Math.random() * (shoppingLists.length - 1))
      const tmp = switchedOrder[switchIndex]
      switchedOrder[switchIndex] = switchedOrder[switchIndex + 1]
      switchedOrder[switchIndex + 1] = tmp
      const switchedResult = scheduleLists(shoppingLists, running, storage, switchedOrder)
      const switchedExpected = calculateExpectedTimes(switchedResult.operationsByList)
      let delta = 0
      for (let i = 0; i < currentExpected.length; i += 1) {
        delta += currentExpected[i] - switchedExpected[i]
      }
      if (delta > 0) {
        result = switchedResult
        let newSwitches = prioritySwitches
        newSwitches.push({from: switchIndex, to: switchIndex + 1})
        setPrioritySwitches(newSwitches)
      }
    } else {
      setPrioritySwitches([])
    }
    setOperationList(result.operations)
    setExpectedTimes(currentExpected)
    // we have to unwind this back to original indexes
    setListToOpMap(result.operationsByList)
    setUnassignedStorage(result.unassignedStorage)
    setPriorityOrder(switchedOrder)
  }, [scheduleLists, validatedPrioritySwitches])

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
      calculateOperations(shoppingLists, {}, storage, validatedPrioritySwitches)
      setLoaded(true)
    }
    const updateRunning = () => {
      let newRunning = cloneOperations(runningOperations)
      Object.keys(newRunning).forEach(building => {
        newRunning[building].forEach(op => {
          const currentTime = Date.now()
          op.end = Math.round(op.end - (currentTime - op.runTime) / 1000)
          op.start = op.end - op.duration
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
      setRunningOperations(newRunning)
      calculateOperations(shoppingLists, newRunning, inStorage, validatedPrioritySwitches)
    }, 1000)
    return () => clearInterval(interval)
  }, [loaded, calculateOperations, scheduleLists, shoppingLists, inStorage, runningOperations])

  let visualOpList = {...operationList}
  return (
    <div>
      <Storage key={"storage"} goods={inStorage} unused={unassignedStorage} />
      <GoodsList addShoppingList={addShoppingList} addStorage={haveStorage} removeStorage={removeStorage}
                 makeGoods={makeGoods} clear={clear}/>
      {shoppingLists.map((list, index) =>
          <ShoppingList list={list} key={index} index={index}
                        remove={() => removeShoppingList(index)}
                        end={expectedTimes[index]}
                        removeStorage={removeStorage}
                        operations={listToOpMap[index]}
                        expandOrCollapse={expandOrCollapse}
                        expanded={index === expandedList}
                        order={priorityOrder}
          />)}
      <OperationList key={"oplist"} operations={visualOpList} pipelineSizes={pipelineSizes}
                     startOp={startOperation} finishOp={finishOperation} speedUp={speedUpOperation} />
    </div>
  )
}

export default App;
