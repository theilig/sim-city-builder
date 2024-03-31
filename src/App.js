import './App.css';
import OperationList from "./OperationList";
import React, {useState, useEffect} from 'react';
import ShoppingLists from "./ShoppingLists";
import Storage from "./Storage";
import Settings from "./Settings";
import {useStorage} from "./StorageHook";
import {useShoppingLists} from "./ShoppingListHook";
import {useOperations} from "./OperationsHook";
import {EPHEMERAL_LIST_INDEX, useRecommendations} from "./RecommendationHook";
import {useProduction} from "./ProductionHook";
import RecommendationList from "./RecommendationList";
import {deepCopy, goodsData, randomGeneratorKey} from "./BuildingSettings";
import FactoryRecommendations from "./FactoryRecommendations";

function App() {
  const [loaded, setLoaded] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState({})
  const [currentCity, setCurrentCity] = useState(undefined)
  const [updatedTime, setUpdatedTime] = useState(0)

  const {
    getStorage, addStorage, clearStorage, getUnusedStorage,
    removeGoods, loadStorage, updateUnassignedStorage, updateStorageItems
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
    getUnscheduledLists,
    calculateStockingList
  } = useShoppingLists()

  const {
    addOrder
  } = useProduction()

  const {
    getPipelines,
    getRecommended,
    clearRecommendations,
    changeRunningOperations,
    speedUpOperations,
    updateAllRunningOps,
    createRecommendations,
    updatePipelines,
    getRecommendedLists,
    updateOperations,
    getExpectedTimes,
    getPurchases
  } = useOperations()

  const {
    calculateRecommendations,
    calculateStockingRecommendations
  } = useRecommendations()

  document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  function recalculateRecommendations() {
    updateUnassignedStorage({...getStorage(currentCity)}, currentCity)
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
      const newPipelines = updatePipelines(settings.cities)
      updateStorageItems(newPipelines)
    }
  }

  function reorder(source, destination) {
    reorderList(source, destination, currentCity)
  }

  function changePriority(source, destination) {
    changePriorityInList(source, destination, currentCity)
    recalculateRecommendations()
  }

  function handleVuChange(building) {
    settings.cities[currentCity].buildings[randomGeneratorKey].currentBuilding = building
    settings.cities[currentCity].buildings[randomGeneratorKey].level =
        settings.cities[currentCity].buildings[building].level
    updatePipelines(settings.cities)
    setSettings(settings)
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
    const newStorage = addStorage(newGoods, currentCity)
    return {pipes: undefined, storage: newStorage}
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
    const newStorage = addStorage(goods, currentCity)
    changeRunningOperations([], goods, clickedDone, currentCity)
    return {pipes: undefined, storage: newStorage}
  }

  function removeStorage(goods) {
    recalculateRecommendations()
    let result = removeGoods(goods, currentCity)
    return result.storage
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
        const newPipelines = updatePipelines(loadedSettings.cities)
        updateStorageItems(newPipelines)
      }
     setLoaded(true)
    }
    const interval = setInterval(() => {
      if (currentCity) {
        let allStorage
        let allPipes
        let updatedRunning = getPipelines(currentCity)
        const recommendedLists = getRecommendedLists(currentCity)
        let updatedTimes = {}
        let unusedStorage = getStorage(currentCity)
        let newPurchases = []
        if (Date.now() - updatedTime > 10000) {
          setUpdatedTime(Date.now())
          const updateResult = updateAllRunningOps()
          allPipes = updateResult.pipelines
          Object.keys(updateResult.addToStorage).forEach(city => {
            allStorage = addStorage(updateResult.addToStorage[city], city, allStorage)
          })
          unusedStorage = getStorage(currentCity, allStorage)
          updatedRunning = getPipelines(currentCity, allPipes)
          recommendedLists.forEach((list, index) => {
            const addOrderResult = addOrder(list.items, unusedStorage, updatedRunning, 0, 0, list.listIndex, list.listIndex === EPHEMERAL_LIST_INDEX)
            unusedStorage = addOrderResult.updatedStorage
            updatedRunning = addOrderResult.updatedPipelines
            newPurchases = newPurchases.concat(addOrderResult.addedPurchases)
            updatedTimes[index] = addOrderResult.expectedTime
          })
          let newLists = deepCopy(recommendedLists)
          Object.keys(updatedTimes).forEach(key => {
            newLists[parseInt(key)].expectedTime = updatedTimes[key]
          })
          allPipes = updateOperations(updatedRunning, newLists, newPurchases, currentCity, allPipes)
        } else {
          unusedStorage = getUnusedStorage(currentCity)
        }
        const unscheduledLists = getUnscheduledLists(recommendedLists, currentCity)
        if (unscheduledLists !== undefined && unscheduledLists.length > 0) {
          const result = calculateRecommendations(unusedStorage, updatedRunning, unscheduledLists)
          if (result.shoppingList) {
            updatedRunning = result.updatedPipelines
            unusedStorage = result.updatedStorage
            createRecommendations(updatedRunning, result.shoppingList, result.expectedTime, result.addedPurchases, currentCity, allPipes)
          }
          updatedTimes[result.shoppingList.index] = result.expectedTime
        } else {
          const stockingLists = calculateStockingList(settings.cities[currentCity], allStorage, allPipes)
          const result = calculateStockingRecommendations(unusedStorage, updatedRunning, getPurchases(currentCity), stockingLists)
          if (result.shoppingList) {
            updatedRunning = result.updatedPipelines
            unusedStorage = result.updatedStorage
            createRecommendations(updatedRunning, result.shoppingList, result.expectedTime, result.addedPurchases, currentCity, allPipes)
          }
        }
        updateUnassignedStorage(unusedStorage, currentCity, allStorage)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [addOrder, addStorage, calculateRecommendations, calculateStockingRecommendations, calculateStockingList,
            createRecommendations, currentCity, getRecommendedLists, getUnscheduledLists, getUnusedStorage,
            loadShoppingLists, loadStorage, loaded, settings.cities, updateAllRunningOps, getPipelines,
            updatePipelines, updateUnassignedStorage, updatedTime, updateOperations, getPurchases,
            getStorage, updateStorageItems
      ]
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
    const running = getPipelines(currentCity)
    if (running) {
      displayPipelines = running
    }
    let displayExpectedTimes = getExpectedTimes(currentCity)
    const unusedStorage = getUnusedStorage(currentCity)
    const prioritySwitches = getPrioritySwitches(currentCity)
    const priorityOrder = getPriorityOrder(currentCity)
    const purchases = getPurchases(currentCity)
    let purchasesDisplay = {}
    purchases.forEach(purchase => {
      if (purchasesDisplay[purchase.good]) {
        purchasesDisplay[purchase.good].count += 1
        if (purchasesDisplay[purchase.good].start > purchase.start) {
          purchasesDisplay[purchase.good].start = purchase.start
        }
      } else {
        purchasesDisplay[purchase.good] = {count: 1, start: purchase.start}
      }
    })
    let purchaseKeys = Object.keys(purchasesDisplay)
    purchaseKeys.sort((a, b) => {
      if (purchasesDisplay[a].start !== purchasesDisplay[b].start) {
        return purchasesDisplay[a].start - purchasesDisplay[b].start
      }
      return purchasesDisplay[b].count - purchasesDisplay[a].count
    })

    let vuDisplay = ''
    let buildings = {}
    if (settings && settings.cities && settings.cities[currentCity]) {
      buildings = settings.cities[currentCity].buildings
    }

    if (settings.cities && buildings && buildings[randomGeneratorKey].haveBuilding === true) {
      vuDisplay = <div>Random Generator: <select onChange={(e) => handleVuChange(e.target.value)}>
        <option key='nothing'> Not Selected</option>
        {Object.keys(buildings).map(building => {
          return buildings[building].haveBuilding
              && building !== randomGeneratorKey
              && !buildings[building].isParallel
              && <option key={building}>{building}</option>
        })}
      })</select> </div>
    }

    return (
        <div style={{color: "white", backgroundColor: "lightsteelblue", width: "1700px"}}>
          <div style={{display: "flex"}}>
            {settings.cities && Object.keys(settings.cities).map(city => {
                if (city === currentCity) {
                  return <div style={{fontSize: '3em'}} key={city + '.tab'}>{city}</div>
                } else {
                  return <div key={city + '.tab'} style={{opacity: "50%", fontSize: "1.5em"}} onClick={() => {
                    setCurrentCity(city)
                    const newPipelines = updatePipelines(settings.cities)
                    updateStorageItems(newPipelines)
                  }}>{city}</div>
              }
            })}
            <button onClick={() => setShowSettings(true)}>Settings</button>
            {vuDisplay}
          </div>
          <Storage key={"storage"} storage={getStorage(currentCity)} addShoppingList={addShoppingList} addStorage={haveStorage} removeStorage={removeStorage}
                   makeGoods={makeGoods} clear={clear} unassignedStorage={unusedStorage} buildingSettings={buildingSettings}/>
          <div key={"spacer"} style={{height: '20px'}} />
          <RecommendationList key={"reclist"} recommendations={getRecommended(currentCity)} pipelines={running}
                              startOp={(opList) => startOperations(opList)}
                              finishOp={(opList) => finishOperations(opList)}
          />
          <FactoryRecommendations key={"faclist"} recommendations={getRecommended(currentCity)} pipelines={running}
                                  purchases={purchases}
                                  startOp={(opList) => startOperations(opList)}
                                  finishOp={(opList) => finishOperations(opList)}
          />
          <div>Purchases</div>
          <div style={{display: 'flex'}}>
            {purchaseKeys.map(purchaseKey => {
              let style = {marginRight: '5px'}
              if (purchasesDisplay[purchaseKey].start <= 0) {
                style.backgroundColor = 'white'
                style.color = 'steelblue'
              }
              return <div key={purchaseKey} style={style}>{purchasesDisplay[purchaseKey].count + ' ' + purchaseKey}</div>
            })}
          </div>
          <div>&nbsp;</div>
          <div style={{display: "flex", width: "100%"}}>
            <div style={{display: "flex", flexDirection: "column"}}>
              <div>Shopping Lists</div>
              <ShoppingLists key={"slists"} prioritySwitches={prioritySwitches}
                             lists={displayLists} priorityOrder={priorityOrder}
                             expectedTimes={displayExpectedTimes}
                             removeShoppingList={removeShoppingList}
                             finishShoppingList={finishShoppingList} reorderList={reorder}
                             changePriority={changePriority} cityGoods={goodsSettings}
              />
            </div>
          </div>
          <OperationList key={"oplist"} pipelines={displayPipelines}
                         startOp={(opList) => startOperations(opList)}
                         finishOp={finishOperations} speedUp={speedUp}
          />
        </div>
    )
  }
}

export default App;
