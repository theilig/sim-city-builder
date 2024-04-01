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
            storage[good] = 0
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
            newStorage[good] = 0
        }
        return {found: found, storage: newStorage}
    }
    const removeGoods = (goods, currentCity, newStorage) => {
        const allStorage = newStorage || inStorage
        let storage = allStorage[currentCity]
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

        return {found: found, storage: updateStorage(storage, currentCity, allStorage)}
    }
    const addStorage = (goods, currentCity, newStorage) => {
        const allStorage = newStorage || inStorage
        let currentStorage = {...allStorage[currentCity]}
        Object.keys(goods).forEach(good => {
            if (currentStorage[good] === undefined) {
                currentStorage[good] = goods[good]
            } else {
                currentStorage[good] += goods[good]
            }
        })
        return updateStorage(currentStorage, currentCity, newStorage)
    }

    const clearStorage = (currentCity) => {
        let newStorage = {}
        const currentStorage = getStorage(currentCity)
        Object.keys(currentStorage).forEach(good => newStorage[good] = 0)
        updateStorage(newStorage, currentCity)
    }

    const updateStorage = (storage, currentCity, newStorage) => {
        let allStorage = newStorage || {...inStorage}
        allStorage[currentCity] = storage
        setInStorage(allStorage)
        localStorage.setItem("simStorage", JSON.stringify(allStorage))
        return allStorage
    }

    const getUnusedStorage = (currentCity, newAllStorage) => {
        let allStorage = newAllStorage || inStorage || {}
        let currentCityStorage = allStorage[currentCity] || {}
        let currentCityUsed = usedStorage[currentCity]
        let newUnusedStorage = {}
        Object.keys(currentCityStorage).forEach(good => {
            newUnusedStorage[good] = currentCityStorage[good] - (currentCityUsed[good] || 0)
        })
        return newUnusedStorage
    }

    const updateUnassignedStorage = (newStorage, currentCity, newAllStorage) => {
        let allUsed = {...usedStorage}
        let allStorage = newAllStorage || inStorage
        let currentCityStorage = allStorage[currentCity] || {}
        let newUsedStorage = {}
        Object.keys(currentCityStorage).forEach(good => {
            if (newStorage[good]) {
                newUsedStorage[good] = Math.max(currentCityStorage[good] - newStorage[good], 0)
            } else {
                newUsedStorage[good] = currentCityStorage[good]
            }
        })
        allUsed[currentCity] = newUsedStorage
        setUsedStorage(allUsed)
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
        return storage
    }

    const updateStorageItems = (pipelines, loadedStorage) => {
        let updatedStorage = {}
        Object.keys(pipelines).forEach(cityName => {
            let newStorage = {}
            let oldStorage = inStorage[cityName] || {}
            if (loadedStorage) {
                oldStorage = loadedStorage[cityName]
            }
            Object.keys(goodsData).forEach(good => {
                const building = goodsData[good].building
                if (pipelines[cityName][building] &&
                    pipelines[cityName][building].goods[good] !== undefined) {
                    newStorage[good] = oldStorage[good] || 0
                }
            })
            updatedStorage[cityName] = newStorage
        })
        setInStorage(updatedStorage)
        let usedStorage = {}
        Object.keys(updatedStorage).forEach(city => usedStorage[city] = {})
        setUsedStorage(usedStorage)
    }

    const getStorage = (currentCity, newStorage) => {
        const allStorage = newStorage || inStorage
        if (allStorage && allStorage[currentCity]) {
            return {...allStorage[currentCity]}
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
