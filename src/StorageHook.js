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
    const removeGoods = (goods, localStorage, currentCity) => {
        let storage = localStorage[currentCity]
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
        return {storage, found}
    }
    const addStorage = (storage, goods) => {
        let newStorage = {...storage}
        Object.keys(goods).forEach(good => {
            if (newStorage[good] === undefined) {
                newStorage[good] = goods[good]
            } else {
                newStorage[good] += goods[good]
            }
        })
        return newStorage
    }

    const clearStorage = (currentCity) => {
        return updateStorage({}, currentCity)
    }

    const updateStorage = (storage, currentCity) => {
        let allStorage = {...inStorage}
        allStorage[currentCity] = storage
        setInStorage(allStorage)
        localStorage.setItem("simStorage", JSON.stringify(allStorage))
        return allStorage[currentCity]
    }

    const loadStorage = () => {
        let storage = JSON.parse(localStorage.getItem("simStorage"))
        if (storage === undefined || storage === null) {
            storage = {}
        }
        if (storage && storage['']) {
            delete storage['']
        }
        return storage
    }

    return {
        inStorage,
        addStorage,
        clearStorage,
        unassignedStorage,
        setUnassignedStorage,
        removeGoods,
        updateStorage,
        loadStorage
    }

}
