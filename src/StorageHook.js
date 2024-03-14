import {useState} from "react";
import {goodsData} from "./BuildingSettings";

export const grabFromStorage = (storage, good, amount) => {
    let amountTaken = 0
    if (storage[good]) {
        if (storage[good] > amount) {
            storage[good] -= amount
            amountTaken = amount
        } else {
            amountTaken = storage[good]
            delete storage[good]
        }
    }
    return amountTaken
}

export function useStorage() {
    const [inStorage, setInStorage] = useState({})
    const [usedStorage, setUsedStorage] = useState({})

    const removeGood = (storage, good) => {
        let newStorage = {...storage}
        let found = newStorage[good] && newStorage[good] > 0
        if (newStorage[good] > 1) {
            newStorage[good] -= 1
        } else {
            delete newStorage[good]
        }
        return {found: found, storage: newStorage}
    }
    const removeGoods = (goods, currentCity) => {
        let storage = inStorage[currentCity]
        let found = {}
        Object.keys(goods).forEach((good) => {
            for (let i = 0; i < goods[good]; i += 1) {
                const result = removeGood(storage, good)
                storage = result.storage
                if (result.found) {
                    found[good] = (found[good] || 0) + 1
                }
            }
        })
        updateStorage(storage, currentCity)
        return found
    }
    const addStorage = (goods, currentCity) => {
        let newStorage = {...inStorage[currentCity]}
        Object.keys(goods).forEach(good => {
            if (newStorage[good] === undefined) {
                newStorage[good] = goods[good]
            } else {
                newStorage[good] += goods[good]
            }
        })
        updateStorage(newStorage, currentCity)
        return newStorage
    }

    const clearStorage = (currentCity) => {
        updateStorage({}, currentCity)
    }

    const updateStorage = (storage, currentCity) => {
        let allStorage = {...inStorage}
        allStorage[currentCity] = storage
        setInStorage(allStorage)
        localStorage.setItem("simStorage", JSON.stringify(allStorage))
    }

    const getUnusedStorage = (currentCity) => {
        let currentCityStorage = inStorage[currentCity] || {}
        let currentCityUsed = usedStorage[currentCity]
        let newUnusedStorage = {}
        Object.keys(currentCityStorage).forEach(good => {
            newUnusedStorage[good] = currentCityStorage[good] - (currentCityUsed[good] || 0)
        })
        return newUnusedStorage
    }

    const updateUnassignedStorage = (newStorage, currentCity) => {
        let allStorage = {...usedStorage}
        let currentCityStorage = inStorage[currentCity] || {}
        let newUsedStorage = {}
        Object.keys(currentCityStorage).forEach(good => {
            if (newStorage[good]) {
                newUsedStorage[good] = Math.max(currentCityStorage[good] - newStorage[good], 0)
            } else {
                newUsedStorage[good] = currentCityStorage[good]
            }
        })
        allStorage[currentCity] = newUsedStorage
        setUsedStorage(allStorage)
    }

    const loadStorage = (cityNames) => {
        const storageJson = localStorage.getItem("simStorage")
        let storage = {}

        if (storageJson) {
            try {
                storage = JSON.parse(storageJson)
            } catch {
                alert("Couldn't load storage, clearing it out")
            }
        }

        Object.keys(storage).forEach(city => {
            if (!cityNames.includes(city)) {
                delete storage[city]
                localStorage.setItem("simStorage", JSON.stringify(storage))
            }
        })
        let usedStorage = {}
        Object.keys(storage).forEach(city => usedStorage[city] = {})
        setInStorage(storage)
        setUsedStorage(usedStorage)
    }

    const updateStorageItems = (pipelines) => {
        let updatedStorage = {}
        Object.keys(pipelines).forEach(cityName => {
            let newStorage = {}
            Object.keys(goodsData).forEach(good => {
                const building = goodsData[good].building
                if (pipelines[cityName][building] &&
                    pipelines[cityName][building].goods[good] !== undefined) {
                    newStorage[good] = inStorage[cityName][good] || 0
                }
            })
            updatedStorage[cityName] = newStorage
        })
        setInStorage(updatedStorage)
        let usedStorage = {}
        Object.keys(updatedStorage).forEach(city => usedStorage[city] = {})
        setUsedStorage(usedStorage)
    }

    const getStorage = (currentCity) => {
        if (inStorage && inStorage[currentCity]) {
            return {...inStorage[currentCity]}
        } else {
            return {}
        }
    }

    return {
        getStorage,
        addStorage,
        clearStorage,
        updateUnassignedStorage,
        removeGoods,
        loadStorage,
        getUnusedStorage,
        updateStorageItems
    }
}
