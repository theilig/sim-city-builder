import openStar from "./open-star.gif"
import filledStar from "./filled-star.jpg"
import EditableNumber from "./EditableNumber";

function EditableBuilding(props) {
    function updateSlots(newSlots) {
        let localSettings = {...props.buildingSettings}
        localSettings.slots = Math.max(newSlots, 0);
        props.update(localSettings)
    }
    function updateLevel(direction) {
        let newSettings = {...props['buildingSettings']}
        const newLevel = newSettings.level + direction
        if (direction > 0 && !newSettings.haveBuilding) {
            newSettings.haveBuilding = true
            newSettings.level = 0
        } else if (newLevel < 0) {
            newSettings.haveBuilding = false
        } else if (newLevel <= 3) {
            newSettings.level = newLevel
        }
        props.update(newSettings)
    }
    if (props.buildingSettings.haveBuilding) {
        if (props.buildingSettings.isParallel) {
            return <div style={{display: "flex"}}>
                <EditableNumber style={{width: "100%"}} noField={true} name={props.name} updateCallback={updateSlots} value={props.buildingSettings.slots}/>
                <div style={{marginLeft: "auto"}} >slots</div>
            </div>
        } else {
            let stars = []
            for (let i=0; i<3; i++) {
                if (props.buildingSettings.level > i) {
                    stars.push(<img key={"star" + i} src={filledStar} alt={''} style={{justifyContent: 'center', alignItems: 'center', width: '15px', height: '15px'}} />)
                } else {
                    stars.push(<img key={"star" + i} src={openStar} alt={''} style={{justifyContent: 'center', alignItems: 'center', width: '15px', height: '15px'}} />)
                }
            }
            return <div style={{display: 'flex'}} id={'valueBox.' + props.name} onClick={() => updateLevel(1)} onContextMenu={() => updateLevel(-1)} >
                <div style={{marginRight: '5px'}}>{props.name}</div>
                <div style={{marginLeft: 'auto'}}>
                    {stars}
                </div>
            </div>
        }
    } else if (props.level >= props.buildingSettings['requiredLevel']) {
        return <div onClick={() => updateLevel(1)}><i>{props.name}</i></div>
    }
}

export default EditableBuilding;
