import {renderGoodsSettings, updateSettings} from "./BuildingSettings";
import EditableBuilding from "./EditableBuilding";

function City(props) {
    let localSettings = {...props.settings}
    function updateBuilding(name, newSettings) {
        localSettings.buildings[name] = newSettings
        localSettings = updateSettings(localSettings)
        props.update(localSettings)
    }
    function updateGood(name, newSettings) {
        localSettings.goods[name].stockAmount = Math.max(parseInt(newSettings) || 0, 0)
        props.update(localSettings)
    }
    function drawBuildings(condition) {
        return Object.keys(localSettings['buildings']).map(name =>
            condition(localSettings['buildings'][name]) &&
            <EditableBuilding key={name} name={name} buildingSettings={localSettings['buildings'][name]}
                              update={(buildingSettings) => {
                                  updateBuilding(name, buildingSettings)
                              }} level={localSettings.level} />
        )
    }
    const height = Object.keys(localSettings['buildings']).length * 20
    return <div style={{display: 'flex'}}>
        <div style={{display: 'flex', flexDirection: 'column', marginRight: '10px'}}>
            <div>Buildings</div>
            {drawBuildings((building) => building.haveBuilding && building.isParallel === true)}
            <div>&nbsp;</div>
            {drawBuildings((building) => building.haveBuilding && building.isParallel === false)}
            <div>&nbsp;</div>
            {drawBuildings((building) => !building.haveBuilding)}

        </div>
        <div style={{display: 'flex', flexDirection: 'column'}}>
            <div>Number to Stock</div>
            <div style={{display: 'flex', flexDirection: 'column', height: height + 'px', flexWrap: 'wrap'}}>
                {Object.keys(localSettings['goods']).map(name =>
                    renderGoodsSettings(name, localSettings['level'], localSettings['buildings'], localSettings['goods'][name], (newSettings) => updateGood(name, newSettings))
                )}
            </div>
        </div>
    </div>
}
export default City;
