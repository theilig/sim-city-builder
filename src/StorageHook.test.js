import {useStorage} from "./StorageHook";
import {localStorageMock} from "./LocalStorageMock";
import {render} from "@testing-library/react";
import {useEffect, useState} from "react";
import {testSetUp} from "./TestUtils";

const startingStorage = {testing: {metal: 1}}
const storageToAdd = {metal: 2, nails: 3}
const storageToRemove = {metal: 1, cement: 3}
let storageStatus = []
let removeResult = null

testSetUp()

function TestComponent() {
    const [runningStep, setRunningStep] = useState(0)
    const {
        inStorage,
        addStorage,
        clearStorage,
        removeGoods,
        loadStorage
    } = useStorage()

    useEffect(() => {
        const saveState = () => {
            storageStatus.push({storage: inStorage, saved: localStorageMock.getItem('simStorage')})
        }
        switch (runningStep) {
            case 0:
                let bogus = {...startingStorage}
                bogus['bogus'] = {metal: 3}
                localStorageMock.setItem('simStorage', JSON.stringify(bogus))
                loadStorage(['testing'])
                saveState()
                setRunningStep(1)
                break;
            case 1:
                addStorage(storageToAdd, 'testing')
                saveState()
                setRunningStep(2)
                break;
            case 2:
                removeResult = removeGoods(storageToRemove, 'testing')
                saveState()
                setRunningStep(3)
                break;
            case 3:
                clearStorage('testing')
                saveState()
                setRunningStep(4)
                break;
            case 4:
                saveState()
                setRunningStep(5)
                break;
            default:
                break;
        }
    }, [runningStep, loadStorage, addStorage, clearStorage, inStorage, removeGoods])
    return <div>{JSON.stringify(inStorage)}</div>
}

describe('storage interactions', () => {
    render(<TestComponent />)
    let nextExpectedStorage = startingStorage
    // inStorage will always lag one step behind
    const expectations = (index, expectedStorage) => {
        expect(storageStatus[index + 1].storage).toEqual(expectedStorage)
        expect(storageStatus[index].saved).toEqual(JSON.stringify(expectedStorage))
    }
    test('initial load', () => {
        expectations(0, nextExpectedStorage)
    })
    test('adding storage', () => {
        nextExpectedStorage = {testing: {metal: 3, nails: 3}}
        expectations(1, nextExpectedStorage)
    })
    test('removing storage', () => {
        nextExpectedStorage = {testing: {metal: 2, nails: 3}}
        expectations(2, nextExpectedStorage)
        expect(removeResult).toEqual({metal: 1})
    })
    test('clearing storage', () => {
        nextExpectedStorage = {testing: {}}
        expectations(3, nextExpectedStorage)
    })
})
