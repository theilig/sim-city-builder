import Cities from "./Cities";
function Settings(props) {
    let localSettings = {...props.settings}
    if (Object.keys(props.settings).length === 0) {
        localSettings = {
            cities: [],
        }
    }

    function updateSettings(key, value) {
        let newSettings = {...localSettings}
        newSettings[key] = value
        props.setSettings(newSettings)
    }

    return (
        <Cities update={(newValue) => updateSettings('cities', newValue)} cities={localSettings.cities} exit={props.exit} />
    )
}
export default Settings;
