import {useShoppingLists} from "./ShoppingListHook";
import {localStorageMock} from "./LocalStorageMock";
import {render} from "@testing-library/react";
import {useEffect, useState} from "react";
import {testSetUp} from "./TestUtils";

let listStatus = []
const startingLists = {testing: [{items: {cement: 1, paint: 2}}]}
const cityGoods = {nails: {stockAmount: 5}, planks: {stockAmount: 4}}
const goodsLists = [{items: {nails: 5}, region: 'sim.stocking'}, {items: {planks: 4}, region: 'sim.stocking'}]

testSetUp()

function TestComponent() {
    const [runningStep, setRunningStep] = useState(0)
    const {
        allShoppingLists,
        prioritySwitches,
        priorityOrder,
        clearShoppingLists,
        addList,
        removeList,
        reorderList,
        changePriorityInList,
        loadShoppingLists
    } = useShoppingLists()

    useEffect(() => {
        const saveState = () => {
            listStatus.push({
                lists: allShoppingLists('testing'),
                switches: prioritySwitches,
                order: priorityOrder,
                saved: localStorageMock.getItem('simShoppingLists')
            })
        }
        switch (runningStep) {
            case 0:
                let bogus = {...startingLists}
                bogus['bogus'] = [{items: {metal: 3}}]
                localStorageMock.setItem('simShoppingLists', JSON.stringify(bogus))
                loadShoppingLists({'testing': {goods: cityGoods}})
                saveState()
                setRunningStep(1)
                break;
            case 1:
                addList({wood: 3}, 0, 'something', 'testing')
                saveState()
                setRunningStep(2)
                break;
            case 2:
                addList({nails: 2}, 0, 'something', 'testing')
                saveState()
                setRunningStep(3)
                break;
            case 3:
                reorderList(2, 0, 'testing')
                saveState()
                setRunningStep(4)
                break;
            case 4:
                addList({plastic: 2}, 0, 'something', 'testing')
                saveState()
                setRunningStep(5)
                break;
            case 5:
                changePriorityInList(3, 1, 'testing')
                saveState()
                setRunningStep(6)
                break;
            case 6:
                removeList(2, 'testing')
                saveState()
                setRunningStep(7)
                break;
            case 7:
                clearShoppingLists('testing')
                saveState()
                setRunningStep(8)
                break;
            case 8:
                saveState();
                setRunningStep(9)
                break;                saveState();
                setRunningStep(8)
                break;
            default:
                break;
        }
    }, [runningStep, allShoppingLists, loadShoppingLists, priorityOrder, prioritySwitches])
    return <div>{JSON.stringify(allShoppingLists)}</div>
}

describe('shopping list interactions', () => {
    const expectations = (index, expectedStoredLists, expectedAllLists, expectedSwitches, expectedOrder) => {
        const fullLists = {testing: expectedStoredLists}
        const fullSwitches = {testing: expectedSwitches}
        const fullOrder = {testing: expectedOrder}
        expect(listStatus[index].saved).toEqual(JSON.stringify(fullLists))
        expect(listStatus[index + 1].lists).toEqual(expectedAllLists)
        expect(listStatus[index + 1].switches).toEqual(fullSwitches)
        expect(listStatus[index + 1].order).toEqual(fullOrder)
    }
    render(<TestComponent/>)
    let visibleLists = startingLists['testing']
    test('initial load', () => {
        expectations(0, visibleLists,
            visibleLists.concat(goodsLists),
            [], [0, 1, 2])
    })
    test('list is added to the right spot', () => {
        visibleLists.push({items: {wood: 3}, region: 'something'})
        expectations(1, visibleLists, visibleLists.concat(goodsLists), [], [0, 1, 2, 3])
    })
    test('reodering by index shifts others', () => {
        // shift everyone down and add new one at the top
        visibleLists.push(visibleLists[1])
        visibleLists[1] = visibleLists[0]
        visibleLists[0] = {items: {nails: 2}, region: 'something'}
        expectations(3, visibleLists, visibleLists.concat(goodsLists), [], [0, 1, 2, 3, 4])
    })
    test('priority is correctly shifted', () => {
        visibleLists.push({items: {plastic: 2}, region: 'something'})
        expectations(5, visibleLists, visibleLists.concat(goodsLists), [{above: 3, below: 1}, {above: 3, below: 2}], [0, 3, 1, 2, 4, 5])
    })
    test('can remove lists', () => {
        visibleLists.splice(2, 1)
        expectations(6, visibleLists, visibleLists.concat(goodsLists), [{above: 2, below: 1}], [0, 2, 1, 3, 4])
    })
    test('can clear lists', () => {
        expectations(7, [], goodsLists, [], [0,1])
    })
})
