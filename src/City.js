import {renderGoodsSettings, updateSettings} from "./BuildingSettings";
import EditableBuilding from "./EditableBuilding";
import EditableBox from "./EditableBox";

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
    const renderReminder = (reminder, updateName, updatePeriod) => {
        return <div>
            <div style={{display: 'flex'}}>
                <EditableBox name="somename" noField={true} value={reminder.name} updateValue={updateName} size={20} />
                <EditableBox name="someperiod" noField={true} value={reminder.period} updateValue={updatePeriod} size={10} />
            </div>
        </div>
    }
    const addReminder = () => {
        localSettings.currentReminders.push({name: 'New Reminder', period: 1})
        props.update(localSettings)
    }
    const height = Object.keys(localSettings['buildings']).length * 20
    if (localSettings.currentReminders === undefined) {
        localSettings.currentReminders = []
    }
    const updateReminderName = (name, index) => {
        localSettings.currentReminders[index].name = name
        props.update(localSettings)
    }
    const updateReminderPeriod = (period, index) => {
        localSettings.currentReminders[index].period = period
        props.update(localSettings)
    }
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
        <div style={{display: 'flex', flexDirection: 'column'}}>
            <div>Reminders</div>
            <div style={{display: 'flex', flexDirection: 'column'}}>
                {localSettings.currentReminders.map((reminder, index) =>
                    <div key={index}>
                        {renderReminder(
                            reminder,
                            (newName) => updateReminderName(newName, index),
                            (newPeriod) => updateReminderPeriod(newPeriod, index)
                        )}
                    </div>
                )}
                <div onClick={addReminder}>Add Reminder</div>
            </div>
        </div>
    </div>
}
export default City;
