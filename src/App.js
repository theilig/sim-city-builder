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
import {goodsData} from "./BuildingSettings";

function App() {
  const [loaded, setLoaded] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState({})
  const [currentCity, setCurrentCity] = useState(undefined)
  const [updatedTime, setUpdatedTime] = useState(0)

  const {
    inStorage, addStorage, clearStorage, getUnusedStorage,
    removeGoods, loadStorage, updateUnassignedStorage
  } = useStorage()

  const {
    getPrioritySwitches,
    clearShoppingLists,
    addList,
    removeList,
    reorderList,
    changePriorityInList,
    getPriorityOrder,
    loadShoppingLists,
    allShoppingLists,
    updateExpectedTimes,
    clearExpectedTimes,
    getExpectedTimes,
    getUnscheduledLists,
    calculateStockingList
  } = useShoppingLists()

  const {
    addOrder
  } = useProduction()

  const {
    getRunning,
    getRecommended,
    clearRecommendations,
    changeRunningOperations,
    speedUpOperations,
    updateAllRunningOps,
    createRecommendations,
    updatePipelines,
    getRecommendedLists,
    updateOperations
  } = useOperations()

  const {
    calculateRecommendations,
    calculateStockingRecommendations
  } = useRecommendations()

  document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  function recalculateRecommendations(resetRecommendations = true) {
    updateUnassignedStorage({...inStorage[currentCity]}, currentCity)
    clearExpectedTimes(currentCity)
    if (resetRecommendations) {
      clearRecommendations(currentCity)
    }
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
      const found = storageResult[good]
      const needed = itemsNeeded[good]
      if (!found || needed > found) {
          itemsToRemoveFromOperations[good] = needed - (found || 0)
      }
    })
    const unexpectedOp = changeRunningOperations(newRunningOps, itemsToRemoveFromOperations, true, currentCity)
    if (unexpectedOp) {
      recalculateRecommendations(false)
    }
  }

  function startOperations(operations, pullFromStorage = true) {
    let allIngredients = {}
    operations.forEach(op => {
      const ingredients = goodsData[op.good].ingredients
      if (pullFromStorage) {
        Object.keys(ingredients).forEach(ingredient => {
          allIngredients[ingredient] = (allIngredients[ingredient] || 0) + ingredients[ingredient]
        })
      }
    })
    updateStorageAndRunningForNewOps(allIngredients, operations)
  }

  function speedUp(operation, amount) {
    speedUpOperations([operation], amount, currentCity);
    recalculateRecommendations()
  }

  function finishOperations(operations) {
    let newGoods = {}
    operations.forEach(op => {
      newGoods[op.good] = (newGoods[op.good] || 0) + 1
    })
    changeRunningOperations([], newGoods, true, currentCity)
    addStorage(newGoods, currentCity)
  }

  function makeGoods(goods, pullFromStorage) {
    let operationsToAdd = []
    Object.keys(goods).forEach((good) => {
      for (let i = 0; i < goods[good]; i += 1) {
        operationsToAdd.push({
          good: good,
          building: goodsData[good].building
        })
      }
    })
    startOperations(operationsToAdd, pullFromStorage)
  }

  function haveStorage(goods, clickedDone = false) {
    addStorage(goods, currentCity)
    recalculateRecommendations()
  }

  function removeStorage(goods) {
    recalculateRecommendations()
    removeGoods(goods, currentCity)
  }

  function finishShoppingList(index) {
    const lists = allShoppingLists(currentCity)
    updateStorageAndRunningForNewOps(lists[index].items, [])
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
        let newPipelines = {}
        for (let i = 0; i < cities.length; i += 1) {
          newPipelines = updatePipelines(loadedSettings.cities, cities[i], newPipelines)
        }
      }
     setLoaded(true)
    }
    const interval = setInterval(() => {
      const countRunning = (pipelines) => {
        let sum = 0
        Object.keys(pipelines).forEach(pipe => {
          sum += pipelines[pipe].running.length
        })
        return sum
      }
      const recommendedLists = getRecommendedLists()
      if (currentCity) {
        const running = getRunning(currentCity)
        let updatedRunning = running
        let updatedTimes = {}
        let updatedStorage = getUnusedStorage(currentCity) || {}
        const original = countRunning(running)
        let finished = 0
        let storageUpdated = false
        if (Date.now() - updatedTime > 10000) {
          setUpdatedTime(Date.now())
          const updateResult = updateAllRunningOps(currentCity)
          Object.keys(updateResult.addToStorage[currentCity]).forEach(item => {
            finished += updateResult.addToStorage[currentCity][item]
            storageUpdated = true
          })
          updatedStorage = addStorage(updateResult.addToStorage[currentCity], currentCity)
          updatedRunning = updateResult.running[currentCity]
          recommendedLists.forEach(list => {
            const addOrderResult = addOrder(list.items, updatedStorage, updatedRunning, 0, 0, list.index, false)
            updatedStorage = addOrderResult.updatedStorage
            updatedRunning = addOrderResult.updatedPipelines
            updatedTimes[list.index] = addOrderResult.expectedTime
          })
        }
        const unscheduledLists = getUnscheduledLists(currentCity)
        let recommendedList = undefined
        if (unscheduledLists !== undefined && unscheduledLists.length > 0) {
          const result = calculateRecommendations(updatedStorage, updatedRunning, unscheduledLists)
          if (result.shoppingList) {
            recommendedList = result.shoppingList
            updatedRunning = result.updatedPipelines
            updatedStorage = result.updatedStorage
          }
          updatedTimes[result.shoppingList.index] = result.expectedTime
        } else {
          const stockingLists = calculateStockingList(settings.cities[currentCity])
          const result = calculateStockingRecommendations(updatedStorage, updatedRunning, stockingLists)
          if (result.shoppingList) {
            recommendedList = result.shoppingList
            updatedRunning = result.updatedPipelines
            updatedStorage = result.updatedStorage
          }
        }
        // There's a race condition where we don't get the updated recommended list and drop some recommendations
        // to protect against this we will not update if we drop more ops than expected unless we've already changed storage
        const final = countRunning(updatedRunning)
        if (final >= original - finished || storageUpdated) {
          if (recommendedList) {
            createRecommendations(updatedRunning, recommendedList, recommendedLists, currentCity)
          } else {
            updateOperations(updatedRunning, currentCity)
          }
          updateUnassignedStorage(updatedStorage, currentCity)
          updateExpectedTimes(updatedTimes, currentCity)
        } else {
          if (recommendedList) {
            window.alert("WWWTTTFFF")
          } else {
            window.alert('wwwwtttffff')
          }
        }
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [addOrder, addStorage, calculateRecommendations, calculateStockingRecommendations, calculateStockingList,
            createRecommendations, currentCity, getRecommendedLists, getUnscheduledLists, getUnusedStorage,
            loadShoppingLists, loadStorage, loaded, getRunning, settings.cities, updateAllRunningOps,
            updateExpectedTimes, updatePipelines, updateUnassignedStorage, updatedTime, updateOperations]
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
    if (currentCity) {
      displayLists = allShoppingLists(currentCity)
    }
    let displayPipelines = []
    const running = getRunning(currentCity)
    if (running) {
      displayPipelines = running
    }
    let displayExpectedTimes = getExpectedTimes(currentCity)
    const unusedStorage = getUnusedStorage(currentCity)
    const prioritySwitches = getPrioritySwitches(currentCity)
    const priorityOrder = getPriorityOrder(currentCity)
    return (
        <div style={{color: "white", backgroundColor: "lightsteelblue", width: "1700px"}}>
          <div style={{display: "flex"}}>
            {settings.cities && Object.keys(settings.cities).map(city => {
                if (city === currentCity) {
                  return <div style={{fontSize: '3em'}} key={city + '.tab'}>{city}</div>
                } else {
                  return <div key={city + '.tab'} style={{opacity: "50%", fontSize: "1.5em"}} onClick={() => {
                    setCurrentCity(city)
                    updatePipelines(settings.cities, city)
                    clearRecommendations(city)
                  }}>{city}</div>
              }
            })}
            <button onClick={() => setShowSettings(true)}>Settings</button>
          </div>
          <Storage key={"storage"} storage={inStorage[currentCity]} addShoppingList={addShoppingList} addStorage={haveStorage} removeStorage={removeStorage}
                   makeGoods={makeGoods} clear={clear} unassignedStorage={unusedStorage} goodsSettings={goodsSettings} buildingSettings={buildingSettings}/>
          <div style={{height: '20px'}} />
          <RecommendationList key={"reclist"} recommendations={getRecommended(currentCity)}
                              startOp={(opList) => startOperations(opList)}
                              finishOp={(opList) => finishOperations(opList)}
          />
          <div style={{display: "flex", width: "100%"}}>
            <div style={{display: "flex", flexDirection: "column"}}>
              <div>Shopping Lists</div>
              <ShoppingLists prioritySwitches={prioritySwitches}
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
          <div>
            {getRecommendedLists().map(list => {
                  return (<div style={{display: 'flex', flexDirection: 'row'}}>
                    {Object.keys(list.items).map(i => {return (<div>{i}</div>)})}
                  </div>)
                })}
              </div>
        </div>
    )
  }
}

export default App;
