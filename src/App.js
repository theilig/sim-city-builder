import './App.css';
import OperationList from "./OperationList";
import React, {useState, useEffect} from 'react';
import ShoppingLists from "./ShoppingLists";
import Storage from "./Storage";
import Settings from "./Settings";
import {useStorage} from "./StorageHook";
import {useShoppingLists} from "./ShoppingListHook";
import {useOperations} from "./OperationsHook";
import {useRecommendations} from "./RecommendationHook";
import {useProduction} from "./ProductionHook";
import RecommendationList from "./RecommendationList";

function App() {
  const [loaded, setLoaded] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState({})
  const [currentCity, setCurrentCity] = useState(undefined)
  const [updatedTime, setUpdatedTime] = useState(0)
  const [recommendationPriority, setRecommendationPriority] = useState(0)

  const {
    inStorage, addStorage, clearStorage, getUnusedStorage,
    removeGoods, loadStorage, updateUnassignedStorage
  } = useStorage()

  const {
    shoppingLists,
    prioritySwitches,
    clearShoppingLists,
    addList,
    removeList,
    reorderList,
    changePriorityInList,
    priorityOrder,
    loadShoppingLists,
    allShoppingLists,
    updateExpectedTimes,
    clearExpectedTimes,
    getExpectedTimes,
    getUnscheduledLists,
    calculateStockingList
  } = useShoppingLists()

  const {
    running,
    getRecommended,
    clearRecommendations,
    createOperation,
    changeRunningOperations,
    speedUpOperations,
    updateAllRunningOps,
    createRecommendations,
    updatePipelines
  } = useOperations()

  const {
    calculateRecommendations,
    calculateStockingRecommendations
  } = useRecommendations()

  const {
    bestProductionTime,
    pipelines
  } = useProduction()

  document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  function recalculateRecommendations() {
    updateUnassignedStorage({...inStorage[currentCity]}, currentCity)
    clearExpectedTimes(currentCity)
    clearRecommendations(currentCity)
  }

  function clear(clearLists) {
    clearRecommendations(currentCity)
    clearStorage(currentCity)
    if (clearLists) {
      clearShoppingLists(currentCity, settings.cities[currentCity].goods)
    }
    recalculateRecommendations()
  }

  function stopSettings() {
    if (Object.keys(settings.cities).length > 0) {
      setShowSettings(false)
      let newCity = currentCity
      if (currentCity === undefined || settings.cities[currentCity] === undefined) {
        newCity = Object.keys(settings.cities)[0]
        setCurrentCity(newCity)
      }
      updatePipelines(settings.cities, newCity)
      recalculateRecommendations()
    }
  }

  function reorder(source, destination) {
    reorderList(source, destination, currentCity)
  }

  function changePriority(source, destination) {
    changePriorityInList(source, destination, currentCity)
    recalculateRecommendations()
  }


  function updateStorageAndRunningForNewOps(itemsNeeded, newRunningOps) {
    let storageResult = removeGoods(itemsNeeded, currentCity)
    let itemsToRemoveFromOperations = {}
    Object.keys(itemsNeeded).forEach((good) => {
      const found = storageResult.found[good]
      const needed = itemsNeeded[good]
      if (!found || needed > found) {
          itemsToRemoveFromOperations[good] = needed - (found || 0)
      }
    })
    changeRunningOperations(newRunningOps, itemsToRemoveFromOperations, true, currentCity)
  }

  function startOperations(operations) {
    let opsToCreate = []
    let allIngredients = {}
    Object.keys(operations).forEach(good => {
      for (let i = 0; i < operations[good]; i += 1) {
        let operation = createOperation(good)
        opsToCreate.push(operation)
        Object.keys(operation.ingredients).forEach(ingredient => {
          allIngredients[ingredient] = (allIngredients[ingredient] || 0) + operation.ingredients[ingredient]
        })
      }
    })
    updateStorageAndRunningForNewOps(allIngredients, opsToCreate)
  }

  function speedUp(operation, amount) {
    speedUpOperations([operation], amount, currentCity);
    recalculateRecommendations()
  }

  function finishOperations(operation, count) {
    let newGoods = {}
    newGoods[operation.name] = count
    haveStorage(newGoods, true)
    recalculateRecommendations()
  }

  function makeGoods(goods, pullFromStorage) {
    const cityGoods = settings.cities[currentCity].goods
    let operationsToAdd = []
    Object.keys(goods).forEach((good) => {
      for (let i = 0; i < goods[good]; i += 1) {
        operationsToAdd.push(createOperation(good, cityGoods))
      }
    })
    startOperations(operationsToAdd, pullFromStorage)
    recalculateRecommendations()
  }

  function haveStorage(goods, clickedDone = false) {
    // in case you hit have instead of hitting done below
    changeRunningOperations([], goods, !clickedDone, currentCity)
    addStorage(goods, currentCity)
    recalculateRecommendations()
  }

  function removeStorage(goods) {
    recalculateRecommendations()
    return removeGoods(goods, currentCity)
  }

  function finishShoppingList(index) {
    updateStorageAndRunningForNewOps(shoppingLists[currentCity][index].items, inStorage[currentCity], [])
    removeList(index, currentCity)
    recalculateRecommendations()
  }

  function removeShoppingList(index) {
    removeList(index, currentCity)
    recalculateRecommendations()
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
    addList(filteredGoods, region, currentCity)
    recalculateRecommendations()
  }

  useEffect(() => {
    if (!loaded) {
      let loadedSettings = {cities: {}}
      const loadedSettingsJson = localStorage.getItem("simSettings")
      if (loadedSettingsJson) {
        try {
          loadedSettings = JSON.parse(loadedSettingsJson)
        } catch {
          alert('Failed to load settings')
        }
      }
      setSettings(loadedSettings)
      loadShoppingLists(loadedSettings.cities)
      loadStorage(Object.keys(loadedSettings.cities))

      const cities = Object.keys(loadedSettings.cities)

      if (cities.length === 0) {
        setShowSettings(true)
      } else {
        setCurrentCity(Object.keys(loadedSettings.cities)[0])
        for (let i = 0; i < cities.length; i += 1) {
          updatePipelines(loadedSettings.cities, cities[i])
        }
      }
     setLoaded(true)
    }
    const interval = setInterval(() => {
      if (Date.now() - updatedTime > 10) {
        setUpdatedTime(Date.now())
        updateAllRunningOps(currentCity)
      }
      if (currentCity) {
        const unscheduledLists = getUnscheduledLists(currentCity)
        if (unscheduledLists !== undefined && unscheduledLists.length > 0) {
          const result = calculateRecommendations(getUnusedStorage(currentCity) || {}, running[currentCity], unscheduledLists)
          updateUnassignedStorage(result.updatedStorage, currentCity)
          createRecommendations(result.updatedPipelines, currentCity)
          updateExpectedTimes(result.shoppingListIndex, result.expectedTime, currentCity)
        } else {
          const stockingLists = calculateStockingRecommendations(settings[currentCity])
          const result = calculateStockingRecommendations(getUnusedStorage(currentCity) || {}, running[currentCity], stockingLists)
          updateUnassignedStorage(result.updatedStorage, currentCity)
          createRecommendations(result.updatedPipelines, currentCity)
          updateExpectedTimes(result.shoppingListIndex, result.expectedTime, currentCity)
        }
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [allShoppingLists, calculateRecommendations, createRecommendations, updateAllRunningOps, updatedTime, currentCity, inStorage, loadShoppingLists,
      loadStorage, loaded, running, getUnscheduledLists, getUnusedStorage, updateUnassignedStorage, updateExpectedTimes, updatePipelines]
  )

  if (showSettings) {
    return <Settings exit={stopSettings} settings={settings} setSettings={(newSettings) => {
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
    let displayLists = []
    if (currentCity && shoppingLists && shoppingLists[currentCity]) {
      displayLists = shoppingLists[currentCity]
    }
    let displayPipelines = []
    if (pipelines && pipelines[currentCity]) {
      displayPipelines = pipelines[currentCity]
    }
    let displayExpectedTimes = getExpectedTimes(currentCity)
    const unusedStorage = getUnusedStorage(currentCity)
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
                   makeGoods={makeGoods} clear={clear} unassignedStorage={unusedStorage} goodsSettings={goodsSettings} buildingSettings={buildingSettings}/>
          <div style={{height: '20px'}}></div>
          <RecommendationList key={"reclist"} recommendations={getRecommended(currentCity)}
                              startOp={(opList) => startOperations(opList)} />
          <div style={{display: "flex", width: "100%"}}>
            <div style={{display: "flex", flexDirection: "column"}}>
              <div>Shopping Lists</div>
              <ShoppingLists prioritySwitches={prioritySwitches[currentCity]}
                             lists={displayLists} priorityOrder={priorityOrder}
                             expectedTimes={displayExpectedTimes}
                             removeShoppingList={removeShoppingList}
                             finishShoppingList={finishShoppingList} reorderList={reorder}
                             changePriority={changePriority} cityGoods={goodsSettings}
              />
            </div>
          </div>
          <OperationList key={"oplist"} pipelines={displayPipelines}
                         finishOp={finishOperations} speedUp={speedUp}
          />
        </div>
    )
  }
}

export default App;
