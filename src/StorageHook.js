import {useState} from "react";

export function useStorage() {
    const [inStorage, setInStorage] = useState({})
    const [unassignedStorage, setUnassignedStorage] = useState({})

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
        setInStorage(storage)
    }

    return {
        inStorage,
        addStorage,
        clearStorage,
        unassignedStorage,
        setUnassignedStorage,
        removeGoods,
        loadStorage
    }

}
