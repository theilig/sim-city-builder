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

function App() {
  const [loaded, setLoaded] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState({})
  const [currentCity, setCurrentCity] = useState(undefined)
  const [updatedTime, setUpdatedTime] = useState(0)
  const [recommendationPriority, setRecommendationPriority] = useState(0)

  const {
    inStorage, addStorage, clearStorage, unassignedStorage,
    removeGoods, loadStorage
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
  } = useShoppingLists()

  const {
    running,
    recommended,
    clearOperations,
    createOperation,
    changeRunningOperations,
    speedUpOperations,
    updateAllRunningOps,
    createRecommendations,
  } = useOperations()

  const {
    calculateRecommendations
  } = useRecommendations()

  document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  function clear(clearLists) {
    clearOperations(currentCity)
    clearStorage(currentCity)
    if (clearLists) {
      clearShoppingLists(currentCity, settings.cities[currentCity].goods)
    }
    setRecommendationPriority(0)
  }

  function stopSettings() {
    if (Object.keys(settings.cities).length > 0) {
      setShowSettings(false)
      if (currentCity === undefined || settings.cities[currentCity] === undefined) {
        setCurrentCity(Object.keys(settings.cities)[0])
      }
    }
    setRecommendationPriority(0)
  }

  function reorder(source, destination) {
    reorderList(source, destination, currentCity)
  }

  function changePriority(source, destination) {
    changePriorityInList(source, destination, currentCity)
    setRecommendationPriority(0)
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
    setRecommendationPriority(0)
  }

  function finishOperations(operation, count) {
    let newGoods = {}
    newGoods[operation.name] = count
    haveStorage(newGoods, true)
    setRecommendationPriority(0)
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
    setRecommendationPriority(0)
  }

  function haveStorage(goods, clickedDone = false) {
    // in case you hit have instead of hitting done below
    changeRunningOperations([], goods, !clickedDone, currentCity)
    addStorage(inStorage[currentCity], goods, currentCity)
    setRecommendationPriority(0)
  }

  function removeStorage(goods) {
    setRecommendationPriority(0)
    return removeGoods(goods, currentCity)
  }

  function finishShoppingList(index) {
    updateStorageAndRunningForNewOps(shoppingLists[currentCity][index].items, inStorage[currentCity], [])
    removeList(index, currentCity)
    setRecommendationPriority(0)
  }

  function removeShoppingList(index) {
    removeList(index, currentCity)
    setRecommendationPriority(0)
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
    setRecommendationPriority(0)
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

      if (Object.keys(loadedSettings.cities).length === 0) {
        setShowSettings(true)
      } else {
        setCurrentCity(Object.keys(loadedSettings.cities)[0])
      }
     setLoaded(true)
    }
    const interval = setInterval(() => {
      if (Date.now() - updatedTime > 10) {
        setUpdatedTime(Date.now())
        updateAllRunningOps(currentCity)
      }
      const result = calculateRecommendations(allShoppingLists(currentCity), inStorage[currentCity], running[currentCity], recommended[currentCity], recommendationPriority)
      createRecommendations(result.newRecommendations)
      setRecommendationPriority(recommendationPriority + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [loaded, loadShoppingLists, shoppingLists, inStorage,
    running, prioritySwitches, currentCity, loadStorage, showSettings])

  let visualOpList = {...recommended}
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
              <ShoppingLists prioritySwitches={prioritySwitches[currentCity]}
                             lists={[]} priorityOrder={priorityOrder}
                             removeShoppingList={removeShoppingList}
                             finishShoppingList={finishShoppingList} reorderList={reorder}
                             changePriority={changePriority} cityGoods={goodsSettings}
              />
            </div>
          </div>
          <OperationList key={"oplist"} operations={visualOpList}
                         buildingSettings={buildingSettings}
                         startOp={(good, count) => {
                           let items = {}
                           items[good] = count
                           makeGoods(items, true)
                         }}
                         finishOp={finishOperations} speedUp={speedUp} startOperation={(operations) => startOperations(operations)}
          />
        </div>
    )
  }
}

export default App;
