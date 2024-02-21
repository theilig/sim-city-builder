import {updateSettings} from "./BuildingSettings";

describe('setting up settings', () => {
    test('buildings above level are restricted', () => {
        const result = updateSettings({level: 11, buildings: {}, goods: {}})
        expect(Object.keys(result.buildings).length).toEqual(7)
    })
})
