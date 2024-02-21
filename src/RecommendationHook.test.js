import {useOperations, createOperation} from "./OperationsHook";
import {useRecommendations} from "./RecommendationHook";
import {useStorage} from "./StorageHook";
import {testSetUp, createCity} from "./TestUtils";
import {useEffect, useState} from "react";
import {render} from "@testing-library/react";

let operationStatus = []

testSetUp()

function TestComponent() {
    const [runningStep, setRunningStep] = useState(0)

    const {
        running,
        getRecommended,
        updatePipelines,
        createRecommendations,
        clearRecommendations,
        changeRunningOperations
    } = useOperations()

    const {
        calculateRecommendations,
    } = useRecommendations()

    const {
        unassignedStorage,
        getUnusedStorage
    } = useStorage()

    useEffect(() => {
        let cities = {}
        const cityName = 'testing'

        const tests = [
            {
                name: 'test setup',
                execute: () => {
                    cities[cityName] = createCity()
                    updatePipelines(cities, cityName)
                }
            },
            {
                name: 'test recommendations with no storage or running',
                execute: () => {
                    const result = calculateRecommendations({}, running[cityName], [
                        {items: {metal: 2, nails: 3, planks: 1}, index: 0}
                    ])
                    createRecommendations(result.updatedPipelines, cityName)
                }
            },
            {
                name: 'test recommendations takes industrial storage',
                execute: () => {
                    const result = calculateRecommendations({metal: 1}, running[cityName], [
                        {items: {metal: 2, nails: 3, planks: 1}, index: 0}
                    ])
                    createRecommendations(result.updatedPipelines, cityName)
                }
            },
            {
                name: 'test recommendations takes commercial storage',
                execute: () => {
                    const result = calculateRecommendations({nails: 1}, running[cityName], [
                        {items: {metal: 2, nails: 3, planks: 1}, index: 0}
                    ])
                    createRecommendations(result.updatedPipelines, cityName)
                }
            },
            {name: 'clear recommendations and add running', execute: () => {
                clearRecommendations(cityName)
                changeRunningOperations([createOperation('planks', 'Building Supplies Store')], [], false, cityName)
            }},
            {name: 'test complicated order', execute: () => {
                Object.keys(running[cityName]).forEach(building => running[cityName][building].running = [])
                const result = calculateRecommendations({}, running[cityName], [
                    {items: {'yoga mats': 1, 'face cream': 1, 'couches': 1, 'green smoothies': 2}, index: 0}
                ])
            }}
        ]

        const saveState = () => {
            const savedRunning = JSON.parse(JSON.stringify(running['testing'] || {}))
            const savedRecommended = JSON.parse(JSON.stringify(getRecommended('testing')))
            const savedUnassignedStorage = JSON.parse(JSON.stringify(getUnusedStorage('testing')) || {})
            operationStatus.push({
                running: savedRunning,
                recommended: savedRecommended,
                storage: savedUnassignedStorage
            })
        }
        const testStep = Math.floor(runningStep / 2)
        if (runningStep % 2 === 0) {
            if (testStep < tests.length) {
                tests[testStep].execute()
            }
        } else {
            saveState()
            clearRecommendations('testing')
        }
        if (testStep <= tests.length) {
            setRunningStep(runningStep + 1)
        }
    }, [runningStep, running, calculateRecommendations, updatePipelines])
    return <div>
        <div>{JSON.stringify(running)}</div>
        <div>{JSON.stringify(getRecommended('testing'))}</div>
    </div>
}

describe('recommendations', () => {
    render(<TestComponent/>)
    test('calculate recommendations', () => {
        expect(operationStatus[1].recommended.length).toEqual(14)
    })
    test('calculate recommendations takes ingredient storage', () => {
        expect(operationStatus[2].recommended.length).toEqual(13)
    })
    test('calculate recommendations takes storage', () => {
        expect(operationStatus[3].recommended.length).toEqual(11)
    })
})
