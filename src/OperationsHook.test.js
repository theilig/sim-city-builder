import {createOperation, useOperations} from "./OperationsHook";
import {render} from "@testing-library/react";
import {useEffect, useState} from "react";
import {testSetUp, createCity} from "./TestUtils";
import {buildingData, deepCopy} from "./BuildingSettings";

let operationStatus = []

testSetUp()
jest.useFakeTimers()

function TestComponent() {
    const [runningStep, setRunningStep] = useState(0)
    const {
        running,
        getRecommended,
        clearRecommendations,
        changeRunningOperations,
        speedUpOperations,
        createRecommendations,
        updateAllRunningOps,
        updatePipelines
    } = useOperations()

    useEffect(() => {
        const tests = [
            {
                name: 'test setup', execute: function () {
                    jest.setSystemTime(12345678)
                    const cities = {
                        'testing': createCity()
                    }
                    updatePipelines(cities, "testing")
                }
            },
            {
                name: 'pipelines are set up completely', execute: () => {
                }
            },
            {
                name: 'create recommendations',
                execute: () => {
                    let newRunning = deepCopy(running['testing'])
                    const newFactoryRunning = [
                        createOperation('metal', 'Factory'),
                        createOperation('metal', 'Factory'),
                        createOperation('metal', 'Factory')]
                    newRunning['Factory'].running = newRunning['Factory'].running.concat(newFactoryRunning)
                    createRecommendations(newRunning, 'testing')
                }
            },
            {
                name: 'start operation, and create one not on the list',
                execute: () => {
                    let newRunning = deepCopy(running['testing'])
                    let op = createOperation('metal', 'Factory')
                    const newFactoryRunning = [
                        op
                    ]
                    newRunning['Factory'].running = newRunning['Factory'].running.concat(newFactoryRunning)
                    op.duration = 60
                    changeRunningOperations([op, {...op}], [], false, 'testing')
                }
            },
            {
                name: 'can start commercial and finish industrial',
                execute: () => {
                    running['testing']['Factory'].running[0].duration = 45 // To trigger nearly finished operation pulling
                    let op2 = createOperation('nails', 'Building Supplies Store')
                    op2.duration = 240
                    changeRunningOperations([op2], {metal: 2}, false, 'testing')
                }
            },
            {
                name: 'can speed up',
                execute: () => {
                    speedUpOperations([running['testing']['Building Supplies Store'].running[0]], 10, 'testing')
                }
            },
            {
                name: 'can force remove',
                execute: () => {
                    changeRunningOperations([], {metal: 1}, true, 'testing')
                }
            },
            {
                name: 'can update',
                execute: () => {
                    jest.setSystemTime(12345688)
                    updateAllRunningOps()
                }
            }
        ]

        const saveState = () => {
            const savedRunning = JSON.parse(JSON.stringify(running['testing'] || {}))
            const savedRecommended = JSON.parse(JSON.stringify(getRecommended('testing')))
            operationStatus.push({running: savedRunning, recommended: savedRecommended})
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
    },[runningStep, running, updateAllRunningOps, updatePipelines, changeRunningOperations, speedUpOperations, createRecommendations])
    return <div>
        <div>{JSON.stringify(running)}</div>
        <div>{JSON.stringify(getRecommended('testing'))}</div>
    </div>
}

describe('running interactions', () => {
    render(<TestComponent/>)
    test('setup pipelines', () => {
        expect(Object.keys(operationStatus[1].running).length).toEqual(Object.keys(buildingData).length)
        expect(operationStatus[1].running['Factory'].running).toEqual([])
        expect(operationStatus[1].running['Factory'].isParallel).toEqual(true)
        expect(Object.keys(operationStatus[1].running['Factory'].goods).length).toEqual(11)
    })

    test('create recommendations', () => {
        expect(operationStatus[2].recommended.length).toEqual(3)
    })

    test('create operation', () => {
        expect(operationStatus[3].running['Factory'].running.length).toEqual(2)
        expect(operationStatus[3].recommended.length).toEqual(0)
    })

    test('can start commercial and finish industrial', () => {
        expect(operationStatus[4].running['Building Supplies Store'].running.length).toEqual(1)
        expect(operationStatus[4].running['Factory'].running.length).toEqual(1)
    })

    test('can speed up', () => {
        expect(operationStatus[5].running['Building Supplies Store'].running[0].duration).toEqual(230)
    })

    test('can force remove', () => {
        expect(operationStatus[6].running['Factory'].running.length).toEqual(0)
    })

    test('can update', () => {
        expect(operationStatus[7].running['Building Supplies Store'].running[0].lastUpdateTime).toEqual(12345688)
        expect(operationStatus[7].running['Building Supplies Store'].running[0].duration).toEqual(220)

    })
})
