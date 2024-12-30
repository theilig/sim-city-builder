import React from 'react';
import OperationCollection from "./OperationCollection";
import {buildingData} from "./BuildingSettings";
import {getExtras} from "./RecommendationUtilities";

function RecommendationList(props) {
    const factories = Object.keys(buildingData).filter(f => buildingData[f].isParallel)
    let firstCollection = {}
    let remainingSlots = {}
    let opCollections = []

    factories.forEach(building => {
        if (props.pipelines[building]) {
            let available = props.pipelines[building].slots
            props.pipelines[building].running.forEach(op => {
                if (op.lastUpdateTime) {
                    available -= 1
                }
            })
            remainingSlots[building] = available
        }
    })
    let extraGoods = getExtras(props.recommendations)
    props.recommendations.forEach(op => {
        let goodToGo = true
        if (op.children && op.children.length > 0) {
            let localExtras = {...extraGoods}
            let storageFound = 0
            op.children.forEach(child => {
                if (localExtras[child.good] === undefined || localExtras[child.good] === 0) {
                    goodToGo = false
                }
                let gave = 0
                op.storageUsed.forEach(item => {
                    if (item.good === child.good) {
                        gave += item.amount
                    }
                })
                if (localExtras[child.good] !== undefined && localExtras[child.good] > gave) {
                    localExtras[child.good] -= 1
                    storageFound += 1
                }
            })
            if (storageFound === op.children.length) {
                extraGoods = localExtras
                goodToGo = true
                op.waitUntil = 0
            } else {
                goodToGo = !(op.children && op.children.length > 0)
            }
        }
        const factory = factories.includes(op.building)
        if (!factory) {
            opCollections.push({
                goodToGo: goodToGo,
                ops: [{...op}],
                good: op.good,
                done: op.duration < 0,
                start: op.start,
                factory: factory,
                firstCollection: firstCollection[op.building] === undefined
            })
            firstCollection[op.building] = false
        }
    })
    opCollections = opCollections.slice(0, 49)
    return (
        <div style={{display: 'flex', flexDirection: 'column', flexWrap: 'wrap', height: '300px', width: '200px'}}>
            {opCollections.map((collection, index) => {
                return <OperationCollection key={index} collection={collection} startOp={props.startOp} finishOp={props.finishOp} />
            })}
        </div>
    )
}

export default RecommendationList;
