import {createOperation, useOperations} from "./OperationsHook";
import {render} from "@testing-library/react";
import {useEffect, useState} from "react";
import {testSetUp} from "./TestUtils";

let operationStatus = []

testSetUp()
jest.useFakeTimers()
function TestComponent() {
    const [runningStep, setRunningStep] = useState(0)
    const {
        running,
        recommended,
        clearOperations,
        changeRunningOperations,
        speedUpOperations,
        createRecommendations,
        updateAllRunningOps
    } = useOperations()

    useEffect(() => {
        const saveState = () => {
            const savedRunning = JSON.parse(JSON.stringify(running['testing'] || {}))
            const savedRecommended = JSON.parse(JSON.stringify(recommended['testing'] || 0))
            operationStatus.push({running: savedRunning, recommended: savedRecommended})
        }
        switch (runningStep) {
            case 0:
                jest.setSystemTime(12345678)
                createRecommendations([
                    createOperation('metal'),
                    createOperation('metal'),
                    createOperation('metal')
                ], 'testing')
                saveState()
                setRunningStep(1)
                break;
            case 1:
                let op = createOperation('metal')
                op.duration = 60
                changeRunningOperations([op, {...op}], [], false, 'testing')
                saveState()
                setRunningStep(2)
                break;
            case 2:
                let op2 = createOperation('nails')
                running['testing'][0].end = 45
                op2.duration = 240
                changeRunningOperations([op2], {metal: 2}, false, 'testing')
                saveState()
                setRunningStep(3)
                break;
            case 3:
                changeRunningOperations([], {metal: 1}, true, 'testing')
                saveState()
                setRunningStep(4)
                break;
            case 4:
                speedUpOperations([running['testing'][0]], 10, 'testing')
                saveState()
                setRunningStep(5)
                break;
            case 5:
                jest.setSystemTime(12345688)
                updateAllRunningOps()
                saveState()
                setRunningStep(6)
                break;
            case 6:
                clearOperations('testing')
                saveState()
                setRunningStep(7)
                break;
            case 7:
                saveState()
                setRunningStep(8)
            default:
                break;
        }
    }, [runningStep, running, recommended, changeRunningOperations, speedUpOperations, clearOperations, createRecommendations])
    return <div>
            <div>{JSON.stringify(running)}</div>
            <div>{JSON.stringify(recommended)}</div>
        </div>
}

describe('running interactions', () => {
    render(<TestComponent />)
    // running and recommended will lag one step behind
    const expectations = (
        index,
        expectedOperations,
        expectedRecommendations
    ) => {
        if (expectedOperations !== undefined) {
            expect(operationStatus[index + 1].running).toEqual(expectedOperations)
        }
        if (expectedRecommendations !== undefined) {
            expect(operationStatus[index + 1].recommended).toEqual(expectedRecommendations)
        }
    }
    test('can add recommendation', () => {
        const expected = [createOperation('metal'), createOperation('metal'), createOperation('metal')]
        expectations(0, [], expected)
    })
    test('can start op', () => {
        let runningOp = createOperation('metal')
        runningOp.id = 1
        runningOp.duration = 60
        runningOp.lastUpdateTime = 12345678
        let runningOp2 = {...runningOp}
        runningOp.end = 45
        runningOp2.end = 60
        runningOp2.id = 2
        runningOp2.lastUpdateTime = 12345678
        expectations(1, [runningOp, runningOp2], [createOperation('metal')])
    })
    test('will remove op', () => {
        let runningOp = createOperation('nails')
        runningOp.id = 3
        runningOp.duration = 240
        runningOp.end = 240
        runningOp.lastUpdateTime = 12345678
        let runningOp2 = createOperation('metal')
        runningOp2.id = 2
        runningOp2.duration = 60
        runningOp2.end = 60
        runningOp2.lastUpdateTime = 12345678
        expectations(2, [runningOp2, runningOp], [createOperation('metal')])
    })
    test('can force remove', () => {
        let runningOp = createOperation('nails')
        runningOp.id = 3
        runningOp.duration = 240
        runningOp.end = 240
        runningOp.lastUpdateTime = 12345678
        expectations(3, [runningOp], [createOperation('metal')])
    })
    test('can speed up', () => {
        let runningOp = createOperation('nails')
        runningOp.id = 3
        runningOp.duration = 240
        runningOp.end = 230
        runningOp.lastUpdateTime = 12345678
        expectations(4, [runningOp], [createOperation('metal')])
    })
    test('updateAllRunningOps updates', () => {
        let runningOp = createOperation('nails')
        runningOp.id = 3
        runningOp.duration = 240
        runningOp.end = 220
        runningOp.lastUpdateTime = 12345688
        expectations(5, [runningOp], [createOperation('metal')])
    })
    test('clearOperations clears all', () => {
        expectations(6, [], [])
    })
})
