import './App.css';
import {addOrder, createOperation} from "./Production";
import OperationList from "./OperationList";
import React, {useState, useEffect, useCallback} from 'react';
import ShoppingLists, {addList, removeList, updatePriorityOrder} from "./ShoppingLists";
import Storage, {addStorage, removeGood} from "./Storage";
import {cloneOperations} from "./Production"
import Suggestions from "./Suggestions";
import {addToRunning, finishOperation, finishRunning, speedUpOperation, updateRunning} from "./Running";
import Settings from "./Settings";

function App() {
  const [shoppingLists, setShoppingLists] = useState({})
  const [loaded, setLoaded] = useState(false)
  const [operationList, setOperationList] = useState({byBuilding: {}})
  const [expectedTimes, setExpectedTimes] = useState([])
  const [actualTimes, setActualTimes] = useState([])
  const [inStorage, setInStorage] = useState({})
  const [unassignedStorage, setUnassignedStorage] = useState({})
  const [listToOpMap, setListToOpMap] = useState([])
  const [runningOperations, setRunningOperations] = useState({byBuilding: {}})
  const [prioritySwitches, setPrioritySwitches] = useState({})
  const [priorityOrder, setPriorityOrder] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [takenSuggestions, setTakenSuggestions] = useState([])
  const [liveTokens] = useState({})
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState({})
  const [currentCity, setCurrentCity] = useState('')

  document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  function clear(clearLists) {
    setOperationList({byBuilding: {}})
    let newRunningOperations = {...runningOperations}
    newRunningOperations[currentCity] = {byBuilding: {}}
    setRunningOperations(newRunningOperations)
    let newPrioritySwitches = {...prioritySwitches}
    newPrioritySwitches[currentCity] = []
    setPrioritySwitches(newPrioritySwitches)
    let newStorage = {...inStorage}
    newStorage[currentCity] = {}
    setInStorage(newStorage)
    calculateOperations([], {byBuilding: {}}, {}, [], takenSuggestions)
  }

  function removeStorageOrRunning(itemsNeeded, storage, running) {
    Object.keys(itemsNeeded).forEach((good) => {
      for (let i = 0; i < itemsNeeded[good]; i += 1) {
        let result = removeGood(storage, good)
        if (result.found) {
          storage = result.storage
        } else {
          result = finishRunning(good, running, settings.cities[currentCity].goods)
          if (result.found) {
            running = result.running
          }
        }
      }
    })
    return {running: running, storage: storage}
  }

  function startOperations(operation, count) {
    // We don't need to clone here because it will be done in addToRunning, and cloning operation lists is not cheap
    let newRunningForCity = runningOperations[currentCity]
    let newStorage = {...inStorage[currentCity]}
    for (let i = 0; i < count; i += 1) {
      let runningOperation = createOperation(operation.name, settings.cities[currentCity].goods)
      newRunningForCity = addToRunning(runningOperation, newRunningForCity, settings.cities[currentCity].buildings)
      const result = removeStorageOrRunning(operation.ingredients, newStorage, newRunningForCity)
      newRunningForCity = result.running
      newStorage = result.storage
    }
    let allRunning = {...runningOperations}
    allRunning[currentCity] = newRunningForCity
    setRunningOperations(allRunning)
    let newSuggestions = []
    let found = false
    takenSuggestions.forEach(suggestion => {
      if (found || suggestion.good !== operation) {
        newSuggestions.push(suggestion)
      } else {
        found = true
      }
    })
    setTakenSuggestions(newSuggestions)
    calculateOperations(shoppingLists[currentCity], newRunningForCity, newStorage, prioritySwitches[currentCity], newSuggestions)
  }

  function speedUp(operation, amount) {
    const newRunning = speedUpOperation(runningOperations[currentCity], operation, amount)
    let allRunning = {...runningOperations}
    allRunning[currentCity] = newRunning
    setRunningOperations(allRunning)

    calculateOperations(shoppingLists, newRunning, inStorage, prioritySwitches, takenSuggestions)
  }

  function finishOperations(operation, count) {
    let newGoods = {}
    newGoods[operation.name] = count
    haveStorage(newGoods, true)
  }

  function makeGoods(goods, pullFromStorage) {
    const cityGoods = settings.cities[currentCity].goods
    const cityBuildings = settings.cities[currentCity].buildings
    let newRunning = runningOperations[currentCity]
    Object.keys(goods).forEach((good) => {
      if (pullFromStorage) {
        startOperations(createOperation(good, cityGoods), goods[good])
      } else {
        for (let i = 0; i < goods[good]; i += 1) {
          const newOperation = createOperation(good, cityGoods)
          newRunning = addToRunning(newOperation, newRunning, cityBuildings)
        }
        let allRunning = {...runningOperations}
        allRunning[currentCity] = newRunning
        setRunningOperations(allRunning)
        calculateOperations(shoppingLists, newRunning, inStorage[currentCity], prioritySwitches[currentCity], takenSuggestions)
      }
    })
  }

  // in case you hit have instead of hitting done below
  function haveStorage(goods, clickedDone = false) {
    let newRunning = runningOperations[currentCity]
    const cityGoods = settings.cities[currentCity].goods
    Object.keys(goods).forEach((good) => {
      for (let i = 0; i < goods[good]; i += 1) {
        let operation = createOperation(good, cityGoods)
        newRunning = finishOperation(newRunning, operation, !clickedDone)
      }
    })
    const newInStorage = addStorage(inStorage[currentCity], goods)
    let allRunning = {...runningOperations}
    allRunning[currentCity] = newRunning
    setRunningOperations(allRunning)
    calculateOperations(shoppingLists[currentCity], newRunning, newInStorage, prioritySwitches[currentCity], takenSuggestions)
  }

  function removeStorage(goods) {
    let storage = inStorage[currentCity]
    Object.keys(goods).forEach((good) => {
      for (let i = 0; i < goods[good]; i += 1) {
        const result = removeGood(storage, good)
        storage = result.storage
      }
    })
    calculateOperations(shoppingLists[currentCity], runningOperations[currentCity], storage, prioritySwitches[currentCity], takenSuggestions)
  }

  function finishShoppingList(index) {
    let newRunning = cloneOperations(runningOperations[currentCity])
    const result = removeStorageOrRunning(shoppingLists[currentCity][index].items, inStorage[currentCity], newRunning)
    const shoppingListsResult = removeList(shoppingLists[currentCity], index, prioritySwitches[currentCity])
    let allRunning = {...runningOperations}
    allRunning[currentCity] = result.running
    setRunningOperations(allRunning)
    calculateOperations(shoppingListsResult.shoppingLists, result.running, result.storage, shoppingListsResult.prioritySwitches, takenSuggestions)
  }

  function removeShoppingList(index) {
    const shoppingListsResult = removeList(shoppingLists[currentCity], index, prioritySwitches[currentCity])
    calculateOperations(shoppingListsResult.shoppingLists, runningOperations[currentCity], inStorage[currentCity], shoppingListsResult.prioritySwitches, takenSuggestions)
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
    const result = addList(shoppingLists[currentCity], filteredGoods, region, prioritySwitches[currentCity])
    calculateOperations(result.shoppingLists, runningOperations[currentCity], inStorage[currentCity], result.prioritySwitches, takenSuggestions)
  }

  function addSuggestion(suggestion) {
    let newTaken = [...takenSuggestions]
    let newSuggestion = {...suggestion}
    newSuggestion.added = true
    newTaken.push(newSuggestion)
    setTakenSuggestions(newTaken)
    calculateOperations(shoppingLists[currentCity], runningOperations[currentCity], inStorage[currentCity], prioritySwitches[currentCity], newTaken)
  }

  function removeSuggestion(suggestionToRemove) {
    let newTaken = [...takenSuggestions]
    let foundIndex
    newTaken.forEach((suggestion, index) => {
      if (suggestion.good === suggestionToRemove.good) {
        foundIndex = index
      }
    })
    if (foundIndex !== undefined) {
      newTaken.splice(foundIndex)
    }
    setTakenSuggestions(newTaken)
    calculateOperations(shoppingLists[currentCity], runningOperations[currentCity], inStorage[currentCity], prioritySwitches[currentCity], newTaken)
  }

  const updateUnused = useCallback((newOps, unusedStorage) => {
    newOps.forEach(op => {
      if (op.childOperations) {
        unusedStorage = updateUnused(op.childOperations, unusedStorage)
      }
      if (op.fromStorage && unusedStorage[op.name] !== undefined && unusedStorage[op.name] > 0) {
        unusedStorage[op.name] -= 1
      }
    })
    return unusedStorage
  }, [])

  const updateOpPriority = useCallback((priority, ops, opPriorities, existingOps) => {
    for (let i = 0; i < ops.length; i += 1) {
      const op = ops[i]
      if (existingOps[op.name] !== undefined && existingOps[op.name].length > 0) {
        if (existingOps[op.name][0].count !== undefined && existingOps[op.name][0].count > 1) {
          existingOps[op.name][0].count -= 1
        } else {
          existingOps[op.name] = existingOps[op.name].slice(1)
        }
      } else {
        if (opPriorities[op.name] === undefined) {
          opPriorities[op.name] = {}
        }
        if (opPriorities[op.name][priority] === undefined) {
          opPriorities[op.name][priority] = 1
        } else {
          opPriorities[op.name][priority] += 1
        }
        if (op.childOperations && op.childOperations.length > 0) {
          updateOpPriority(priority, op.childOperations, opPriorities, existingOps)
        }
      }
    }
  }, [])

  const sortShoppingLists = useCallback((shoppingLists, opsByGood, running, liveTokens, storage) => {
    let indexes = []
    let timesPerOrder = []
    let listToOpMap = []
    let factoryGoodIsBottleneck = []
    let unusedStorage = cloneOperations(storage)
    const cityGoods = settings.cities[currentCity].goods
    const cityBuildings = settings.cities[currentCity].buildings
    for (let i = 0; i < shoppingLists.length; i += 1) {
      let localOpsByGood = cloneOperations(opsByGood)
      let localRunning = cloneOperations(running)
      const result = addOrder(shoppingLists[i].items, localRunning, localOpsByGood, 0,0, liveTokens, cityGoods, cityBuildings)
      timesPerOrder.push(result.timeOfCompletion)
      indexes.push(i)
      factoryGoodIsBottleneck.push(result.factoryGoodIsBottleneck)
      listToOpMap.push(result.added)
      unusedStorage = updateUnused(result.added, unusedStorage)
    }
    indexes.sort((a, b) => {
      if ((shoppingLists[a].region === undefined || shoppingLists[a].region === 'Design') && shoppingLists[b].region && shoppingLists[b] !== 'Design') {
        return 1
      } else if (shoppingLists[a].region !== 'Design' && shoppingLists[b].region === 'Design') {
        return -1
      } else if (shoppingLists[b].region === undefined && shoppingLists[a].region !== undefined) {
        return -1
      } else if (shoppingLists[a].region === undefined && shoppingLists[b].region === undefined) {
        // if we are restocking inventory we want to prioritize the longer ops
        return timesPerOrder[b] - timesPerOrder[a]
      } else {
        return timesPerOrder[a] - timesPerOrder[b]
      }
    })
    let opPriorities = {}
    let existingOps = cloneOperations(opsByGood)
    indexes.forEach((index, priority) => {
      updateOpPriority(priority, listToOpMap[index], opPriorities, existingOps)
    })
    if (unusedStorage === undefined) {
      unusedStorage = {}
    }
    return {priorityOrder: indexes, bestTimes: timesPerOrder, listToOpMap: listToOpMap, unusedStorage: unusedStorage, opPriorities: opPriorities, factoryGoodIsBottleneck: factoryGoodIsBottleneck}
  }, [updateOpPriority, updateUnused, currentCity, settings.cities])

  const updatePrioritySwitches = (newPrioritySwitches, newShoppingLists) => {
    calculateOperations(newShoppingLists, runningOperations[currentCity], inStorage[currentCity], newPrioritySwitches, takenSuggestions)
  }

  const getPriority = (good, opPriorities) => {
    let result = undefined
    if (opPriorities && opPriorities[good]) {
      Object.keys(opPriorities[good]).forEach(priorityKey => {
        const priority = parseInt(priorityKey)
        if (opPriorities[good][priority] > 0 && (result === undefined || priority < result)) {
          result = priority
        }
      })
    }
    return result
  }

  const updateBestGood = useCallback((goodDefinition, existingOps, buildingPipelines, bestGoodByBuilding, opPriorities) => {
    const building = goodDefinition.building
    const goodName = goodDefinition.name
    let localExistingOps = cloneOperations(existingOps)
    let localBuildingPipelines = cloneOperations(buildingPipelines)
    delete localExistingOps[goodName] // We want to see how long it would take to make one from scratch, so removed stored/running versions
    let order = {}
    order[goodName] = 1
    const cityGoods = settings.cities[currentCity].goods
    const cityBuildings = settings.cities[currentCity].buildings
    const ourDuration = cityGoods[goodName].duration
    const addGoodResult = addOrder(order, localBuildingPipelines, localExistingOps, 0, 0, liveTokens, cityGoods, cityBuildings)
    const startTime = addGoodResult.added[0].start
    let replace
    let ingredientValue = 0
    const ourPriority = getPriority(goodName, opPriorities)
    Object.keys(cityGoods[goodName].ingredients).forEach(good => {
      ingredientValue += cityGoods[goodName].ingredients[good] * cityGoods[good].price
    })
    const ourValue = (cityGoods[goodName].prices - ingredientValue) / (startTime + cityGoods[goodName].duration)
    if (bestGoodByBuilding[building] === undefined) {
      replace = true
    } else {
      const existing = bestGoodByBuilding[building]
      // if we are higher priority (lower number) and can start sooner we are better
      let betterStart = startTime < existing.startTime
      const betterPriority =  ourPriority && opPriorities[goodName] < existing.priority
      replace = betterStart && betterPriority
      // if we should be prioritized we will jump ahead of an earlier start time if the other item would be less than 1/3 done when we are ready
      if (betterPriority && !betterStart) {
        const existingDuration = cityGoods[existing.good].duration
        if ((startTime - existing.startTime) / existingDuration < .33) {
          replace = true
        }
      } else if (betterStart && !betterPriority) {
        if ((existing.startTime - startTime) / ourDuration > .33) {
          replace = true
        }
      } else if (ourPriority === undefined && existing.priority === undefined) {
        // Use the highest value per time (including wait time).  Value is defined as what we can sell for, minus what the ingredients sell for
        replace = ourValue > existing.value
      }
    }
    if (replace) {
      bestGoodByBuilding[building] = {good: goodName, startTime: startTime, ourPriority, duration: startTime + ourDuration, value: ourValue}
    }
  }, [liveTokens, currentCity, settings.cities])

  const removePriorities = useCallback((goodList, opPriorities) => {
    goodList.forEach(op => {
      if (op.childOperations) {
        removePriorities(op.childOperations, opPriorities)
      }
      const goodName = op.name
      let priority = getPriority(goodName, opPriorities)
      if (priority !== undefined) {
        opPriorities[goodName][priority] -= 1
      }
    })
  }, [])

  const scheduleOperations = useCallback((shoppingLists, listPriority, opPriorities, existingOps, buildingPipelines, usedSuggestions, startFactoryGoods) => {
    /**
     *  We are going to loop until we've decided we've done enough planning for now.
     *
     *  first start all factory items for lists that have everything else going/ready
     *
     *  then go across all buildings, find best op to start in building with the following criteria:
     *   1. No op if building pipeline is full, or is going for desired full scheduling time
     *   2. highest priority op (based on shopping priority) that can be started before current building op ends
     *   3. fastest op to get started out of ops on lists
     *   4. fastest op to get started
     *
     *  Schedule all such ops, and call it a day.  Once some ops are kicked off this will go back in and try
     *  more.
     */
    const computeNeeded = (needed, existingOps) => {
      if (existingOps) {
        existingOps.forEach(op => {
          if (op.fromStorage || op.runningId !== undefined) {
            if (op.count && op.count > 1) {
              needed -= op.count
            } else {
              needed -= 1
            }
          }
        })
      }
      return needed
    }

    let finishedBuildings = {}
    let done = false
    let endingTimes = []
    let count = 0
    let listToOpMap = []
    const cityGoods = settings.cities[currentCity].goods
    const cityBuildings = settings.cities[currentCity].buildings

    function startFactoryItemsForFinishedLists(lowestPriorityEvaluated, priority) {
      while (lowestPriorityEvaluated < priority - 1) {  // we don't want to evaluate ourselves until we start everything
        const priorityIndex = lowestPriorityEvaluated + 1
        const listIndex = listPriority[priorityIndex]
        if (endingTimes[listIndex] === undefined) {
          const list = shoppingLists[listIndex]
          const items = Object.keys(list.items)
          let allCommercialItemsStarted = true
          for (let itemIndex = 0; allCommercialItemsStarted && itemIndex < items.length; itemIndex += 1) {
            const good = items[itemIndex]
            const op = createOperation(good, cityGoods)
            if (op.ingredients && Object.keys(op.ingredients).length > 0) {
              let needed = computeNeeded(list.items[good], existingOps[good])
              allCommercialItemsStarted = needed <= 0
            }
          }
          if (allCommercialItemsStarted) {
            const result = addOrder(list.items, buildingPipelines, existingOps, 0, 0, liveTokens, cityGoods, cityBuildings)
            endingTimes[listIndex] = result.timeOfCompletion
            listToOpMap[listIndex] = result.added
          } else if (startFactoryGoods[listIndex]) {
            const goodToStart = startFactoryGoods[listIndex]
            startFactoryGoods[listIndex] = undefined
            let orderItems = {}
            orderItems[goodToStart] = list.items[goodToStart]
            addOrder(orderItems, buildingPipelines, existingOps, 0, 0, liveTokens, cityGoods, cityBuildings)
          }
        }
        lowestPriorityEvaluated = priorityIndex
      }
      return lowestPriorityEvaluated;
    }

    while (!done) {
      done = true
      count += 1
      // first only look at goods we need to make
      let bestGoodByBuilding = {}
      let goodNames = Object.keys(opPriorities)
      for (let goodNameIndex = 0; goodNameIndex < goodNames.length; goodNameIndex += 1) {
        const goodName = goodNames[goodNameIndex]
        const good = cityGoods[goodName]
        const building = good.building
        good.name = goodName
        const priority = getPriority(good.name, opPriorities)
        let buildings = {}
        if (settings && settings.cities && settings.cities[currentCity]) {
          buildings = settings.cities[currentCity].buildings || {}
        }
        if (buildings && buildings[building] && buildings[building].haveBuilding &&
            !buildings[building].isParallel && finishedBuildings[building] !== true && priority !== undefined) {
          // We only want to start commercial buildings, factories will take care of themselves
          updateBestGood(good, existingOps, buildingPipelines, bestGoodByBuilding, opPriorities)
        }
      }
      let buildingsToStart = Object.keys(bestGoodByBuilding)
      buildingsToStart.sort((buildingA, buildingB) => {
        if (bestGoodByBuilding[buildingA].startTime === bestGoodByBuilding[buildingB].startTime) {
          return bestGoodByBuilding[buildingA].ourPriority - bestGoodByBuilding[buildingB].ourPriority
        } else {
          return bestGoodByBuilding[buildingA].startTime - bestGoodByBuilding[buildingB].startTime
        }
      })
      let lowestPriorityEvaluated = -1
      for (let buildingsToStartIndex = 0; buildingsToStartIndex < buildingsToStart.length; buildingsToStartIndex += 1) {
        const building = buildingsToStart[buildingsToStartIndex]
        const goodName = bestGoodByBuilding[building].good
        const priority = getPriority(goodName, opPriorities)
        lowestPriorityEvaluated = startFactoryItemsForFinishedLists(lowestPriorityEvaluated, priority);
        let order = {}
        order[goodName] = 1
        const expectedStartTime = bestGoodByBuilding[buildingsToStart[buildingsToStartIndex]].startTime
        let expectedFinishBy = expectedStartTime + cityGoods[goodName].duration
        let keepGoing = true // add as long as item is still needed on the current prioritized list
        while (keepGoing) {
          let localExistingOps = cloneOperations(existingOps)
          let localBuildingPipelines = cloneOperations(buildingPipelines)
          delete localExistingOps[goodName] // We want to make one from scratch
          let addOrderResult = addOrder(order, localBuildingPipelines, localExistingOps, expectedFinishBy, 0, liveTokens, cityGoods, cityBuildings)
          // We want to make all of the goods of this type for the given priority as long as they aren't bottle-necked
          // tell the loop to keep going as long as we haven't gone through too many times
          keepGoing = priority !== undefined && getPriority(goodName, opPriorities) === priority && addOrderResult.timeOfCompletion <= expectedFinishBy
          if (keepGoing) {
            if (count < 10) {
              done = false
            }
            // add the newly created op to the list so others can use it
            if (existingOps[goodName]) {
              localExistingOps[goodName] = existingOps[goodName]
              localExistingOps[goodName].push(addOrderResult.added[0])
            } else {
              localExistingOps[goodName] = [addOrderResult.added[0]]
            }
            buildingPipelines = localBuildingPipelines
            existingOps = localExistingOps
            // we don't really need to queue anything else for a building with a 6 hour+ backlog
            if (addOrderResult.timeOfCompletion > 6 * 3600) {
              finishedBuildings[building] = true
            }
            removePriorities(addOrderResult.added, opPriorities) // Adjust priority list for the fact this would be kicked off
            expectedFinishBy += cityGoods[goodName].duration
          }
        }
      }
      // start factory items for any list that hasn't been evaluated yet
      startFactoryItemsForFinishedLists(lowestPriorityEvaluated, shoppingLists.length)
      if (buildingPipelines.byBuilding['Factory'] && buildingPipelines.byBuilding['Factory'].length > 100) {
        done = true
      }
    }
    let takenSuggestionsByBuilding = {}
    usedSuggestions.forEach(suggestion => {
      takenSuggestionsByBuilding[cityGoods[suggestion.name].building] = suggestion
    })
    let newSuggestions = {}
    let buildings = {}
    if (settings && settings.cities && settings.cities[currentCity]) {
      buildings = settings.cities[currentCity].buildings || {}
    }
    // add suggestions for buildings that are empty
    const buildingsToStart = Object.keys(buildings).filter(building =>
        settings.cities[currentCity].buildings[building].haveBuilding &&
        (buildingPipelines.byBuilding[building] === undefined || buildingPipelines.byBuilding[building].length === 0) &&
        takenSuggestionsByBuilding[building] === undefined
    )
    let goodNames = Object.keys(cityGoods)
    for (let goodNameIndex = 0; goodNameIndex < goodNames.length; goodNameIndex += 1) {
      const goodName = goodNames[goodNameIndex]
      const good = cityGoods[goodName]
      const building = good.building
      good.name = goodName
      if (buildings && buildings[building] && !buildings[building].isParallel && buildingsToStart.find(b => b === building)) {
        // We only want to start commercial buildings, factories will take care of themselves
        updateBestGood(good, existingOps, buildingPipelines, newSuggestions, opPriorities)
      }
    }
    const suggestionList = Object.keys(newSuggestions).map(building => {
      const suggestion = newSuggestions[building]
      return {name: suggestion.good, startTime: suggestion.startTime, valuePerHour: suggestion.value * 3600}
    })
    setSuggestions(suggestionList)
    usedSuggestions.forEach(suggestion => {
      let order = {}
      order[suggestion.name] = 1
      let localExistingOps = cloneOperations(existingOps)
      delete localExistingOps[suggestion.name] // We want to see how long it would take to make one from scratch, so removed stored/running versions
      addOrder(order, buildingPipelines, localExistingOps, 0, 0, liveTokens, cityGoods, cityBuildings)
      if (existingOps[suggestion.name]) {
        localExistingOps[suggestion.name] = existingOps[suggestion.name]
      }
      existingOps = localExistingOps
    })
    // lastly we replace new operations with any running ones that weren't assigned
    Object.keys(existingOps).forEach(good => {
      if (existingOps[good]) {
        let opsToReplace = existingOps[good].filter(op => op.runningId !== undefined).length
        if (opsToReplace > 0) {
          const opBuilding = existingOps[good][0].building
          let newPipeline = []
          buildingPipelines.byBuilding[opBuilding].forEach(op => {
            if (op.runningId !== undefined || !opsToReplace) {
              newPipeline.push(op)
            } else {
              opsToReplace -= 1
            }
          })
          buildingPipelines.byBuilding[opBuilding] = newPipeline
        }
      }
    })
    return {listTimes: endingTimes, operations: buildingPipelines, listToOpMap: listToOpMap}
  }, [liveTokens, removePriorities, updateBestGood, currentCity, settings])

  const calculateOperations = useCallback((updatedShoppingLists, running, storage, localPrioritySwitches, usedSuggestions) => {
    let existingOps = cloneOperations(running)
    let allStorage = {...inStorage}
    allStorage[currentCity] = storage
    setInStorage(allStorage)
    localStorage.setItem("simStorage", JSON.stringify(allStorage))
    let cityGoods = {}
    if (settings && settings.cities && settings.cities && settings.cities[currentCity]) {
      cityGoods = settings.cities[currentCity].goods || {}
    }
    let allShoppingLists = {...shoppingLists}
    allShoppingLists[currentCity] = updatedShoppingLists
    setShoppingLists(allShoppingLists)
    localStorage.setItem("simShoppingLists", JSON.stringify(allStorage))
    let opsByGood = {}
    Object.keys(storage).forEach(good => {
      let op = createOperation(good, cityGoods)
      op.count = storage[good]
      op.fromStorage = true
      op.end = 0
      op.start = 0
      opsByGood[good] = [op]
    })

    Object.keys(existingOps.byBuilding).forEach(building => {
      existingOps.byBuilding[building].forEach(runningOp => {
        const good = runningOp.name
        if (opsByGood[good] === undefined) {
          opsByGood[good] = [runningOp]
        } else {
          opsByGood[good].push(runningOp)
        }
      })
    })
    let localLists = [...updatedShoppingLists]

    Object.keys(cityGoods).forEach(good => {
      const data = cityGoods[good]
      if (data.stockAmount > 0) {
        let items = {}
        items[good] = data.stockAmount
        localLists.push({items: items})
      }
    })

    let sortResult = sortShoppingLists(localLists, opsByGood, existingOps)
    let localPriorityOrder = sortResult.priorityOrder
    setExpectedTimes(sortResult.bestTimes)
    setListToOpMap(sortResult.listToOpMap)
    if (localLists.length <= 1) {
      localPrioritySwitches = []
    }
    localPriorityOrder = updatePriorityOrder(localPriorityOrder, localPrioritySwitches)
    let allPrioritySwitches = {...prioritySwitches}
    prioritySwitches[currentCity] = localPrioritySwitches
    setPrioritySwitches(allPrioritySwitches)
    setPriorityOrder(localPriorityOrder)

    const scheduleResult = scheduleOperations(localLists, localPriorityOrder, sortResult.opPriorities, opsByGood, existingOps, usedSuggestions, sortResult.factoryGoodIsBottleneck)
    setOperationList(scheduleResult.operations)
    setActualTimes(scheduleResult.listTimes)
    let listToOpMap = sortResult.listToOpMap
    scheduleResult.listToOpMap.forEach((ops, index) => {
      listToOpMap[index] = ops
    })
    setListToOpMap(listToOpMap)
    setUnassignedStorage(sortResult.unusedStorage)
  }, [sortShoppingLists, scheduleOperations, currentCity, settings, inStorage, prioritySwitches, shoppingLists])

  useEffect(() => {
    if (!loaded) {
      let loadedShoppingLists = JSON.parse(localStorage.getItem("simShoppingLists"))
      let storage = JSON.parse(localStorage.getItem("simStorage"))
      let loadedSettings = JSON.parse(localStorage.getItem("simSettings"))

      if (loadedShoppingLists === undefined || loadedShoppingLists === null) {
        loadedShoppingLists = {}
      }

      if (loadedShoppingLists && loadedShoppingLists['']) {
        delete loadedShoppingLists['']
      }
      if (storage && storage['']) {
        delete storage['']
      }

      if (storage === undefined || storage === null) {
        storage = []
      }

      if (loadedSettings === undefined || loadedSettings === null) {
        loadedSettings = {}
      }
      delete loadedSettings['']
      setSettings(loadedSettings)

      if (!loadedSettings.cities || loadedSettings.cities.length === 0) {
        setShowSettings(true)
      } else {
        setCurrentCity(Object.keys(loadedSettings.cities)[0])
      }

      const newRunning = {byBuilding: {}}
      if (currentCity !== '') {
        calculateOperations(loadedShoppingLists[currentCity] || [], newRunning, storage[currentCity] || {}, prioritySwitches[currentCity], takenSuggestions)
      }
      setLoaded(true)
    }
    const interval = setInterval(() => {
      const newRunning = updateRunning(runningOperations[currentCity] || {byBuilding: {}})
      let allRunning = {...runningOperations}
      allRunning[currentCity] = newRunning
      setRunningOperations(allRunning)
      calculateOperations(shoppingLists[currentCity] || [], newRunning, inStorage[currentCity] || {}, prioritySwitches[currentCity], takenSuggestions)
    }, 10000)
    return () => clearInterval(interval)
  }, [loaded, calculateOperations, shoppingLists, inStorage, runningOperations, prioritySwitches, takenSuggestions, currentCity])

  let visualOpList = {...operationList}
  if (showSettings) {
    return <Settings exit={() => setShowSettings(false)} settings={settings} setSettings={(newSettings) => {
      setSettings(newSettings)
      localStorage.setItem('simSettings', JSON.stringify(newSettings))
    }}/>
  } else {
    let buildingSettings = {}
    if (settings && settings.cities && settings.cities[currentCity]) {
      buildingSettings = settings.cities[currentCity].buildings || {}
    }
    let goodsSettings = {}
    if (settings && settings.cities && settings.cities[currentCity]) {
      goodsSettings = settings.cities[currentCity].goods || {}
    }
    return (
        <div style={{color: "white", backgroundColor: "lightsteelblue", width: "1700px"}}>
          <div style={{display: "flex"}}>
            {settings.cities && Object.keys(settings.cities).map(city => {
                if (city === currentCity) {
                  return <div style={{fontSize: '3em'}} key={city + '.tab'}>{city}</div>
                } else {
                  return <div key={city + '.tab'} style={{opacity: "50%", fontSize: "1.5em"}} onClick={() => setCurrentCity(city)}>{city}</div>
              }
            })}
            <button onClick={() => setShowSettings(true)}>Settings</button>
          </div>
          <Storage key={"storage"} storage={inStorage[currentCity]} addShoppingList={addShoppingList} addStorage={haveStorage} removeStorage={removeStorage}
                   makeGoods={makeGoods} clear={clear} unassignedStorage={unassignedStorage} goodsSettings={goodsSettings} buildingSettings={buildingSettings}/>
          <div style={{display: "flex", width: "100%"}}>
            <div style={{display: "flex", flexDirection: "column"}}>
              <div>Shopping Lists</div>
              <ShoppingLists prioritySwitches={prioritySwitches[currentCity]} updatePrioritySwitches={updatePrioritySwitches}
                             lists={shoppingLists[currentCity]} priorityOrder={priorityOrder}
                             expectedTimes={expectedTimes} actualTimes={actualTimes} removeShoppingList={removeShoppingList}
                             finishShoppingList={finishShoppingList} listToOpMap={listToOpMap}
                             cityGoods={goodsSettings}
              />
            </div>
            <div style={{display: "flex", flexDirection: "column"}}>
              <div>Suggestions</div>
              <Suggestions suggestions={suggestions} added={takenSuggestions}
                           removeSuggestion={removeSuggestion} addSuggestion={addSuggestion} />
            </div>
          </div>
          <OperationList key={"oplist"} operations={visualOpList}
                         buildingSettings={buildingSettings}
                         startOp={startOperations} finishOp={finishOperations} speedUp={speedUp}
          />
        </div>
    )
  }
}

export default App;
