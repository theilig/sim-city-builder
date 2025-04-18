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
import Reminders from "./Reminders";

function App() {
  const [loaded, setLoaded] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState({})
  const [currentCity, setCurrentCity] = useState(undefined)
  const [updatedTime, setUpdatedTime] = useState(0)
  const [reminders, setReminders] = useState({})

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
    getPurchases,
    updateToken
  } = useOperations()

  const {
    calculateRecommendations,
    createStockingRecommendations
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

  function changeToken(building, tokenType) {
    const speeds = {
      none: 1,
      Turtle: 2,
      Llama: 4,
      Cheetah: 12
    }
    const newPipelines = updateToken(currentCity, building, speeds[tokenType])
    recalculateRecommendations(newPipelines)
  }

  function stopSettings() {
    if (Object.keys(settings.cities).length > 0) {
      setShowSettings(false)
      let newCity = currentCity
      if (currentCity === undefined || settings.cities[currentCity] === undefined) {
        newCity = Object.keys(settings.cities)[0]
        setCurrentCity(newCity)
        getReminders(newCity)
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
    return {
      pipes: changeRunningOperations(newRunningOps, itemsToRemoveFromOperations, true, currentCity),
      storage: storageResult.storage
    }
  }

  function startOperations(operations, pullFromStorage = true) {
    let allIngredients = {}
    const truncated = operations.slice(0, 5)
    truncated.forEach(op => {
      const ingredients = goodsData[op.good].ingredients
      if (pullFromStorage) {
        Object.keys(ingredients).forEach(ingredient => {
          allIngredients[ingredient] = (allIngredients[ingredient] || 0) + ingredients[ingredient]
        })
      }
    })
    updateStorageAndRunningForNewOps(allIngredients, truncated)
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
    const newPipes = changeRunningOperations([], newGoods, true, currentCity)
    const newStorage = addStorage(newGoods, currentCity)
    return {pipes: newPipes, storage: newStorage}
  }

  function makeGoods(goods, pullFromStorage, randomGenerator = false) {
    let operationsToAdd = []
    Object.keys(goods).forEach((good) => {
      let building = goodsData[good].building
      if (randomGenerator) {
        building = randomGeneratorKey
      }
      for (let i = 0; i < goods[good]; i += 1) {
        operationsToAdd.push({
          good: good,
          building: building
        })
      }
    })
    startOperations(operationsToAdd, pullFromStorage)
  }

  function haveStorage(goods, clickedDone = false) {
    const newStorage = addStorage(goods, currentCity)
    const newPipes = changeRunningOperations([], goods, clickedDone, currentCity)
    return {pipes: newPipes, storage: newStorage}
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

  const getReminders = (city) => {
    let newReminders = {}
    if (settings && settings.cities && settings.cities[city] && settings.cities[city].currentReminders) {
      settings.cities[city].currentReminders.forEach(reminder => {
        newReminders[reminder.name] = {
          period: reminder.period,
          remaining: 0
        }
      })
    }
    setReminders(newReminders)
  }

  const updateReminders = (timeDelta) => {
    let newReminders = {...reminders}
    Object.keys(newReminders).forEach(name => {
      newReminders[name].remaining -= Math.round(timeDelta / 1000)
      if (newReminders[name].remaining <= 0) {
        newReminders[name].remaining = 0
      }
    })
    setReminders(newReminders)
  }

  const resetReminder = (name) => {
    let newReminders = {...reminders}
    newReminders[name].remaining = newReminders[name].period
    setReminders(newReminders)
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
      const newStorage = loadStorage(Object.keys(loadedSettings.cities))
      const cities = Object.keys(loadedSettings.cities)

      if (cities.length === 0) {
        setShowSettings(true)
      } else {
        const currentCity = Object.keys(loadedSettings.cities)[0]
        setCurrentCity(currentCity)
        getReminders(currentCity)
        const newPipelines = updatePipelines(loadedSettings.cities)
        updateStorageItems(newPipelines, newStorage)
      }
     setLoaded(true)
    }
    const interval = setInterval(() => {
      if (currentCity) {
        let allStorage
        let allPipes
        let updatedRunning = getPipelines(currentCity)
        let recommendedLists = getRecommendedLists(currentCity)
        let updatedTimes = {}
        let unusedStorage = getStorage(currentCity)
        let newPurchases = []
        let unscheduledLists = getUnscheduledLists(recommendedLists, currentCity)
        if (Date.now() - updatedTime > 10000 || recommendedLists.length === 0 || (unscheduledLists && unscheduledLists.length > 0)) {
          const updateResult = updateAllRunningOps()
          const timeDelta = Date.now() - updatedTime
          updateReminders(timeDelta)
          setUpdatedTime(Date.now())
          allPipes = updateResult.pipelines
          Object.keys(updateResult.addToStorage).forEach(city => {
            allStorage = addStorage(updateResult.addToStorage[city], city, allStorage)
          })
          unusedStorage = getStorage(currentCity, allStorage)
          updatedRunning = getPipelines(currentCity, allPipes)
          if (unscheduledLists && unscheduledLists.length > 0) {
            for (let i=0; i<5 && i<unscheduledLists.length; i++) {
              const result = calculateRecommendations(unusedStorage, updatedRunning, unscheduledLists)
              if (result.listIndex !== undefined) {
                recommendedLists.push(result)
                unscheduledLists = unscheduledLists.filter(l => l.index !== result.listIndex)
              } else {
                i = unscheduledLists.length
              }
            }
          } else {
            const stockingLists = calculateStockingList(settings.cities[currentCity], allStorage, allPipes)
            const stockingRecommendations = createStockingRecommendations(unusedStorage, updatedRunning, getPurchases(currentCity), stockingLists, updateResult.ordered)
            recommendedLists = recommendedLists.filter(l => l.listIndex !== EPHEMERAL_LIST_INDEX)
            recommendedLists = recommendedLists.concat(stockingRecommendations)
          }
          recommendedLists.forEach((list, index) => {
            const addOrderResult = addOrder(list.items, unusedStorage, updatedRunning, 0, list.waitUntil || 0, list.listIndex, list.listIndex === EPHEMERAL_LIST_INDEX)
            unusedStorage = addOrderResult.updatedStorage
            updatedRunning = addOrderResult.updatedPipelines
            newPurchases = newPurchases.concat(addOrderResult.addedPurchases)
            updatedTimes[index] = addOrderResult.expectedTime
          })

          let newLists = deepCopy(recommendedLists)
          Object.keys(updatedTimes).forEach(key => {
            if (newLists[parseInt(key)]) {
              newLists[parseInt(key)].expectedTime = updatedTimes[key]
            }
          })
          updateOperations(updatedRunning, newLists, newPurchases, currentCity, allPipes)
          updateUnassignedStorage(unusedStorage, currentCity, allStorage)
        }
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [addOrder, addStorage, calculateRecommendations, calculateStockingList,
            createRecommendations, currentCity, getRecommendedLists, getUnscheduledLists, getUnusedStorage,
            loadShoppingLists, loadStorage, loaded, settings.cities, updateAllRunningOps, getPipelines,
            updatePipelines, updateUnassignedStorage, updatedTime, updateOperations, getPurchases,
            getStorage, updateStorageItems, createStockingRecommendations
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

    if (settings.cities && buildings && buildings[randomGeneratorKey] && buildings[randomGeneratorKey].haveBuilding === true) {
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
                    getReminders(city)
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
          <div style={{display: 'flex'}}>
            <FactoryRecommendations key={"faclist"} recommendations={getRecommended(currentCity)} pipelines={running}
                                    purchases={purchases}
                                    startOp={(opList) => startOperations(opList)}
                                    finishOp={(opList) => finishOperations(opList)}
            />
            <Reminders key={"reminders"} reminders={reminders} reset={(name) => resetReminder(name)} />
          </div>
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
                         changeToken={changeToken}
          />
        </div>
    )
  }
}

export default App;
