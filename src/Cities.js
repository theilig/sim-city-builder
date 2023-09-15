import { Tabs, Tab, TabList, TabPanel } from 'react-tabs';
import City from "./City";
import EditableBox from "./EditableBox";
import {updateSettings} from "./BuildingSettings";
import EditableNumber from "./EditableNumber";


function Cities(props) {
    let localCities = {...props.cities}
    function createCity() {
        if (localCities['unnamed.city']) {
            alert('Need to name existing city first')
            return
        }
        let newCity = {buildings: {}, goods: {}, groups: [], level: 1}
        newCity = updateSettings(newCity)
        localCities['unnamed.city'] = newCity
        props.update(localCities)
    }
    if (!localCities) {
        localCities = {}
    }
    function updateName(oldName, newName) {
        localCities[newName] = localCities[oldName]
        delete localCities[oldName]
        props.update(localCities)
    }

    function updateLevel(name, newLevel) {
        localCities[name]['level'] = Math.max(parseInt(newLevel) || 1, 1)
        localCities[name] = updateSettings(localCities[name])
        props.update(localCities)
    }

    function updateCity(name, newSettings) {
        localCities[name] = newSettings
        props.update(localCities)
    }

    function deleteCity(name) {
        delete localCities[name]
        props.update(localCities)
    }

    const cityNames = Object.keys(localCities)
    const unnamedCity = cityNames.includes("unnamed.city")
    let addStyle = {color: 'blue', disabled: unnamedCity}
    return(
        <div>
            <button style={addStyle} onClick={createCity}>Add City</button>
            {cityNames.length > 0 && <button onClick={props.exit}>Production</button>}
            {cityNames.map(name => {
                return (
                    <div key={'city.' + name}>
                        <h2>
                            <div style={{display:'flex'}}>
                                <EditableBox
                                    noField={true}
                                    name={'city name'}
                                    value={name}
                                    size={20}
                                    updateValue={(value) => updateName(name, value)}
                                />
                                <EditableNumber value={localCities[name].level} name={"Level"} updateCallback={(newLevel) => updateLevel(name, newLevel)} />
                                <button onClick={() => deleteCity(name)}>Remove</button>
                            </div>
                        </h2>
                        <City key={'city.' + name} name={name} settings={localCities[name]} update={(newSettings) => updateCity(name, newSettings)} />
                    </div>
                )
            })}
        </div>
    )
}
export default Cities;
