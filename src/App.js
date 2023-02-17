import './App.css';
import GoodsList from "./GoodsList.js";
import ShoppingList from './ShoppingList';
import {addOrder, calculateBuildingCosts, createOperation} from "./Production";
import OperationList from "./OperationList";
import React, {useState, useEffect, useCallback, useRef, useMemo} from 'react';
import {buildingLimits} from "./Production"
import ShoppingLists from "./ShoppingLists";
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
  const [prioritySwitches, setPrioritySwitches] = useState([])
  const [priorityOrder, setPriorityOrder] = useState([])
  const [pauseUpdate, setPauseUpdate] = useState(false)

  document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  const pipelineSizes = useMemo(() => {return {
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
  }}, [])

  function pauseUpdates(newValue) {
    setPauseUpdate(newValue)
  }

  function clear() {
    setShoppingLists([])
    setOperationList({})
    setRunningOperations({})
    setPrioritySwitches([])
    setInStorage({})
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
    operation.runningId = running[building].length
    operation.scheduledId = undefined
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
        let runningOperations = running[op.building]
        if (runningOperations !== undefined) {
          let newRunningOperations = []
          runningOperations.forEach(runningOp => {
            if (op.name === runningOp.name && needToRemove > 0 && runningOp.end <= 60) {
              needToRemove -= 1
            } else {
              newRunningOperations.push(runningOp)
            }
          })
          running[op.building] = newRunningOperations
        }
      }
    })
    return ({running: running, storage: removeStorage(pulledFromStorage)})
  }

  function startOperations(operation, count) {
    let newRunning = cloneOperations(runningOperations)
    let newStorage = {...inStorage}
    for (let i = 0; i < count; i += 1) {
      let runningOperation = createOperation(operation.name)
      addToRunning(runningOperation, newRunning)
      const result = removeStorageOrRunning(operation.ingredients, newStorage, newRunning)
      newRunning = result.running
      newStorage = result.storage
    }
    setRunningOperations(newRunning)
    updateLists(shoppingLists, newRunning, newStorage, prioritySwitches)
  }

  function speedUpOperation(operation, event) {
    let newRunning = cloneOperations(runningOperations)
    let amount = 60
    if (event.ctrlKey) {
      amount = 3600
    } else if (event.shiftKey) {
      amount = 300
    }
    newRunning[operation.building].forEach(op => {
      if (op.runningId === operation.runningId) {
        op.start -= amount
        op.end -= amount
      }
    })
    setRunningOperations(newRunning)
    updateLists(shoppingLists, newRunning, inStorage, prioritySwitches)
  }

  function finishOperations(operation, count) {
    let newGoods = {}
    newGoods[operation.name] = count
    let newRunning = cloneOperations(runningOperations)
    let building = operation.building
    let buildingOperations = []
    newRunning[building].forEach(op => {
      if (count <= 0 || op.name !== operation.name) {
        buildingOperations.push(op)
      } else {
        count -= 1
      }
    })
    if (buildingOperations.length > 0) {
      newRunning[building] = buildingOperations
    } else {
      delete newRunning[building]
    }
    const newInStorage = addStorage(newGoods)
    setRunningOperations(newRunning)
    updateLists(shoppingLists, newRunning, newInStorage, prioritySwitches)
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
    updateLists(shoppingLists, newRunning, inStorage, prioritySwitches)
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
    updateLists(shoppingLists, newRunning, newInStorage, prioritySwitches)
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
    updateLists(shoppingLists, runningOperations, newInStorage, prioritySwitches)
    return newInStorage
  }

  function finishShoppingList(index) {
    let newRunning = cloneOperations(runningOperations)
    const result = removeStorageOrRunning(shoppingLists[index].items, inStorage, newRunning)
    setRunningOperations(result.running)
    removeShoppingList(index)
  }

  function removeShoppingList(index, running, storage) {
    let newPrioritySwitches = []
    prioritySwitches.forEach(s => {
      if (s.above !== index && s.below !== index) {
        let newAbove = s.above
        let newBelow = s.below
        if (newAbove > index) {
          newAbove -= 1
        }
        if (newBelow > index) {
          newBelow -= 1
        }
        newPrioritySwitches.push({above: newAbove, below: newBelow})
      }
    })
    setPrioritySwitches(newPrioritySwitches)
    if (running === undefined) {
      running = runningOperations
    }
    if (storage === undefined) {
      storage = inStorage
    }
    let newShoppingLists = [...shoppingLists]
    newShoppingLists.splice(index, 1)
    setShoppingLists(newShoppingLists)
    localStorage.setItem("simShoppingLists", JSON.stringify(newShoppingLists))
    updateLists(newShoppingLists, running, storage, [])
  }

  function addShoppingList(goodsNeeded, region) {
    if (Object.keys(goodsNeeded).length === 0) {
      return;
    }
    let newShoppingLists = [...shoppingLists]
    newShoppingLists.push({items: goodsNeeded, region: region});
    localStorage.setItem("simShoppingLists", JSON.stringify(newShoppingLists))
    updateLists(newShoppingLists, runningOperations, inStorage, [])
  }

  const sortShoppingLists = shoppingLists => {
    let operationsNeeded = {}
    let operationsByOrder = []
    for (let i = 0; i < shoppingLists.length; i += 1) {
      const result = addOrder(shoppingLists[i].items, operationsNeeded, i, {}, {})
      operationsNeeded = result.allOperations
      operationsByOrder.push(result.operationsForOrder)
    }
    const costs = calculateBuildingCosts(operationsNeeded)
    let indexes = []
    const costsPerOrder = operationsByOrder.map((opList, index) => {
      let cost = 0
      opList.forEach(op => cost += op.duration * costs[op.building])
      indexes.push(index)
      return cost
    })

    indexes.sort((a, b) => costsPerOrder[a] - costsPerOrder[b])
    return indexes
  }

  const replaceOp = useCallback((opsByList, scheduledOp, op) => {
    let newListOperationsForIndex = []
    let replaced = false
    opsByList[scheduledOp.listIndex].forEach(listOp => {
      if (listOp.name === scheduledOp.name && listOp.start === scheduledOp.start && !replaced) {
        newListOperationsForIndex.push(op)
        replaced = true
      } else {
        newListOperationsForIndex.push(listOp)
      }
    })

    opsByList[scheduledOp.listIndex] = newListOperationsForIndex
  }, [])

  const removeFlatOp = (scheduledOperation, scheduledOperations, unassignedStorage, unassignedOperations) => {
    const building = scheduledOperation.building
    const item = scheduledOperation.name
    if (scheduledOperation.fromStorage === true) {
      if (unassignedStorage[item] === undefined) {
        unassignedStorage[item] = 0
      }
      unassignedStorage[item] += 1
    } else if (scheduledOperation.runningId !== undefined) {
      if (unassignedOperations[building] === undefined) {
        unassignedOperations[building] = []
      }
      unassignedOperations[building].push(scheduledOperation)
    } else {
      let removed = false
      let newOperations = []
      scheduledOperations[building].forEach(op => {
        if (!removed && op.name === item && op.start === scheduledOperation.start && op.runningId === undefined && op.fromStorage !== true) {
          removed = true
        } else {
          newOperations.push(op)
        }
      })
      scheduledOperations[building] = newOperations
    }
    return {scheduledOperations: scheduledOperations, storage: unassignedStorage, unassignedOperations: unassignedOperations}
  }

  const removeOp = useCallback((scheduledOperation, scheduledOperations, unassignedStorage, unassignedOperations) => {
    let localStorage = {...unassignedStorage}
    let localOps = cloneOperations(scheduledOperations)
    let localUnassignedOps = cloneOperations(unassignedOperations)
    // we need to clear out child operations that might have grabbed storage or other running operations and add them back
    // we don't want to use recursion here because each op has all it's descendents in the poorly named childOperations list
    scheduledOperation.childOperations.forEach(op => {
      const result = removeFlatOp(op, localOps, localStorage, localUnassignedOps)
      localOps = result.scheduledOperations
      localStorage = result.storage
      localUnassignedOps = result.unassignedOperations
    })
    return removeFlatOp(scheduledOperation, localOps, localStorage, localUnassignedOps)
  }, [])

  // This function assumes lists are already priority sorted, and will pass the index as a priority to addOrder
  // We also randomly try to flip two to see if the total throughput would be better if they were swapped, and
  // track improvements in priority switches
  const scheduleLists = useCallback((shoppingLists, fixedOperations, storage, priorityOrder) => {
    // the fixed operations serve two purposes, one is as a seed of the list of all operations running
    // the second is a list of which ones are unassigned, and will mutate as orders grab them
    let unassignedOperations = cloneOperations(fixedOperations)
    let unassignedStorage = {...storage}

    let opsByList = []
    Object.keys(unassignedOperations).forEach(building => {
      let startTime = 0
      unassignedOperations[building].forEach(op => {
        op.listIndex = undefined
        if (op.start > startTime) {
          op.start = startTime
          op.end = startTime + op.duration
        }
        if (pipelineSizes[building] > 1) {
          startTime = op.end
        }
      })
    })
    let scheduledOperations = cloneOperations(unassignedOperations)
    priorityOrder.forEach(order => {
      const listIndex = order
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
    let done = false
    while (!done) {
      done = true
      let newUnassignedStorage = {...unassignedStorage}
      let newScheduledOperations = cloneOperations(scheduledOperations)
      const unassignedStorageItems = Object.keys(unassignedStorage)
      for (let storageIndex = 0; storageIndex < unassignedStorageItems.length; storageIndex += 1) {
        const item = unassignedStorageItems[storageIndex]
        let remaining = unassignedStorage[item]
        let op = createOperation(item)
        if (scheduledOperations[op.building] !== undefined) {
          for (let scheduleIndex = 0; scheduleIndex < scheduledOperations[op.building].length; scheduleIndex += 1) {
            const scheduledOp = scheduledOperations[op.building][scheduleIndex]
            if (remaining > 0 && scheduledOp.name === item && scheduledOp.runningId === undefined && scheduledOp.fromStorage !== true) {
              op.end = 0
              op.fromStorage = true
              replaceOp(opsByList, scheduledOp, op)
              const result = removeOp(scheduledOp, newScheduledOperations, newUnassignedStorage, unassignedOperations)
              newScheduledOperations = result.scheduledOperations
              newUnassignedStorage = result.storage
              unassignedOperations = result.unassignedOperations
              op = createOperation(item)
              remaining -= 1
              newUnassignedStorage[item] = remaining
              done = false
            }
          }
        }
        scheduledOperations = newScheduledOperations
      }
      unassignedStorage = newUnassignedStorage
      let newUnassignedOperations = cloneOperations(unassignedOperations)
      const buildings = Object.keys(unassignedOperations)
      for (let buildingIndex = 0; buildingIndex < buildings.length; buildingIndex += 1) {
        const building = buildings[buildingIndex]
        for (let unassignedOpIndex = 0; unassignedOpIndex < unassignedOperations[building].length; unassignedOpIndex += 1) {
          const runningOp = unassignedOperations[building][unassignedOpIndex]
          let replaced = false
          if (scheduledOperations[building] !== undefined) {
            for (let scheduledOpIndex = 0; scheduledOpIndex < scheduledOperations[building].length; scheduledOpIndex += 1) {
              const scheduledOp = scheduledOperations[building][scheduledOpIndex]
              if (!replaced && scheduledOp.name === runningOp.name && scheduledOp.runningId === undefined && scheduledOp.fromStorage !== true) {
                replaceOp(opsByList, scheduledOp, runningOp)
                const result = removeOp(scheduledOp, newScheduledOperations, unassignedStorage, newUnassignedOperations)
                unassignedStorage = result.storage
                newUnassignedOperations = result.unassignedOperations
                done = false
                newScheduledOperations = result.scheduledOperations
                runningOp.listIndex = scheduledOp.listIndex
                let removalList = []
                for (let removalIndex = 0; removalIndex < newUnassignedOperations[building].length; removalIndex += 1) {
                  if (!replaced && newUnassignedOperations[building][removalIndex].runningId === runningOp.runningId) {
                    replaced = true
                  } else {
                    removalList.push(newUnassignedOperations[building][removalIndex])
                  }
                }
                newUnassignedOperations[building] = removalList
              }
            }
          }
          scheduledOperations = newScheduledOperations
        }
      }
      unassignedOperations = newUnassignedOperations
    }
    return {operations: scheduledOperations, operationsByList: opsByList, unassignedStorage: unassignedStorage}
  }, [replaceOp, removeOp, pipelineSizes])

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

  const updateLists = (shoppingLists, running, storage) => {
    if (running === undefined) {
      running = runningOperations
    }
    if (storage === undefined) {
      storage = inStorage
    }
    setShoppingLists(shoppingLists)
    return calculateOperations(shoppingLists, running, storage, prioritySwitches)
  }

  const updatePrioritySwitches = (newPrioritySwitches, newShoppingLists) => {
    setShoppingLists(newShoppingLists)
    setPrioritySwitches(newPrioritySwitches)
    calculateOperations(newShoppingLists, runningOperations, inStorage, newPrioritySwitches)
  }

  const calculateOperations = useCallback((shoppingLists, running, storage, localPrioritySwitches) => {
    let localPriorityOrder = sortShoppingLists(shoppingLists, running, storage)
    let remainingSwitches = [...localPrioritySwitches]
    let index = 0
    while (index < localPriorityOrder.length) {
      let target = undefined
      for (let switchIndex = 0; switchIndex < remainingSwitches.length; switchIndex += 1) {
        if (target === undefined && remainingSwitches[switchIndex].below === localPriorityOrder[index]) {
          target = remainingSwitches[switchIndex].above
        }
      }
      if (target !== undefined) {
        let newPriorityOrder = []
        for (let pi = 1; pi < localPriorityOrder.length; pi += 1) {
          newPriorityOrder.push(localPriorityOrder[pi])
          if (localPriorityOrder[pi] === target) {
            newPriorityOrder.push(localPriorityOrder[0])
          }
        }
        localPriorityOrder = newPriorityOrder
      } else {
        let newRemainingSwitches = []
        const placed = localPriorityOrder[index]
        remainingSwitches.forEach(s => {
          if (s.above !== placed) {
            newRemainingSwitches.push(s)
          }
        })
        remainingSwitches = newRemainingSwitches
        index += 1

      }
    }

    let result = scheduleLists(shoppingLists, running, storage, localPriorityOrder)
    const currentExpected = calculateExpectedTimes(result.operationsByList)
    if (shoppingLists.length <= 1) {
      setPrioritySwitches([])
    }
    setOperationList(result.operations)
    setExpectedTimes(currentExpected)
    // we have to unwind this back to original indexes
    setListToOpMap(result.operationsByList)
    setUnassignedStorage(result.unassignedStorage)
    setPriorityOrder(localPriorityOrder)
  }, [scheduleLists])

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
      calculateOperations(shoppingLists, {}, storage, prioritySwitches)
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
      if (!pauseUpdate) {
        const newRunning = updateRunning()
        setRunningOperations(newRunning)
        calculateOperations(shoppingLists, newRunning, inStorage, prioritySwitches)
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [loaded, calculateOperations, scheduleLists, shoppingLists, inStorage, runningOperations, prioritySwitches, pauseUpdate])

  let visualOpList = {...operationList}
  return (
    <div>
      <Storage key={"storage"} goods={inStorage} unused={unassignedStorage} />
      <GoodsList addShoppingList={addShoppingList} addStorage={haveStorage} removeStorage={removeStorage}
                 makeGoods={makeGoods} clear={clear}/>
      <ShoppingLists prioritySwitches={prioritySwitches} updatePrioritySwitches={updatePrioritySwitches}
                     lists={shoppingLists} priorityOrder={priorityOrder}
                     expectedTimes={expectedTimes} removeShoppingList={removeShoppingList}
                     finishShoppingList={finishShoppingList} listToOpMap={listToOpMap}
        />
      <OperationList key={"oplist"} operations={visualOpList} pipelineSizes={pipelineSizes}
                     startOp={startOperations} finishOp={finishOperations} speedUp={speedUpOperation}
                      pauseUpdates={pauseUpdates}/>
    </div>
  )
}

export default App;
