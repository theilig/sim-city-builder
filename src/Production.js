const buildingLimits = {
    'Factory': 18,
    'Green Factory': 5
}
const goods = {
    metal: {ingredients: {}, duration: 60, building: 'Factory'},
    wood: {ingredients: {}, duration: 180, building: 'Factory'},
    plastic: {ingredients: {}, duration: 540, building: 'Factory'},
    seeds: {ingredients: {}, duration: 1200, building: 'Factory'},
    minerals: {ingredients: {}, duration: 1800, building: 'Factory'},
    chemicals: {ingredients: {}, duration: 7200, building: 'Factory'},
    'toilet paper rolls': {ingredients: {}, duration: 10800, building: 'Factory'},
    'sugar&spices': {ingredients: {}, duration: 14400, building: 'Factory'},
    glass: {ingredients: {}, duration: 18000, singular: 'glass', building: 'Factory'},
    'animal feed': {ingredients: {}, duration: 21600, building: 'Factory'},
    nails: {ingredients: {metal: 2}, duration: 270, building: 'Building Supplies Store'},
    'wood planks': {ingredients: {wood: 2}, duration: 1620, building: 'Building Supplies Store'},
    bricks: {ingredients: {minerals: 2}, duration: 1080, building: 'Building Supplies Store'},
    cement: {ingredients: {minerals: 2, chemicals: 1}, duration: 2700, building: 'Building Supplies Store'},
    glue: {ingredients: {plastic: 1, chemicals: 2}, duration: 3240, building: 'Building Supplies Store'},
    paint: {ingredients: {plastic: 1, chemicals: 2}, duration: 3240, building: 'Building Supplies Store'},
    hammers: {ingredients: {metal: 1, wood: 1}, duration: 756, building: 'Hardware Store'},
    'measuring tapes': {ingredients: {plastic: 1, metal: 1}, duration: 1080, building: 'Hardware Store'},
    shovels: {ingredients: {plastic: 1, metal: 1, wood: 1}, duration: 1620, building: 'Hardware Store'},
    utensils: {ingredients: {plastic: 2, metal: 2, wood: 2}, duration: 2430, building: 'Hardware Store'},
    ladders: {ingredients: {metal: 2, 'wood planks': 2}, duration: 3240, building: 'Hardware Store'},
    vegetables: {ingredients: {seeds: 2}, duration: 1080, building: 'Farmer\'s Market'},
    flour: {ingredients: {seeds: 2, 'toilet paper rolls': 2}, duration: 1620, building: 'Farmer\'s Market'},
    fruit: {ingredients: {seeds: 2, trees: 1}, duration: 4860, building: 'Farmer\'s Market'},
    cream: {ingredients: {'animal feed': 1}, duration: 4020, building: 'Farmer\'s Market'},
    corn: {ingredients: {'minerals': 1, seeds: 4}, duration: 3240, building: 'Farmer\'s Market'},
    cheese: {ingredients: {'animal feed': 2}, duration: 5640, building: 'Farmer\'s Market'},
    beef: {ingredients: {'animal feed': 3}, duration: 8100, building: 'Farmer\'s Market'},
    chairs: {ingredients: {nails: 1, hammers: 1, wood: 2}, duration: 1080, building: 'Furniture Store'},
    tables: {ingredients: {'wood planks': 1, nails: 2, hammers: 1}, duration: 1620, building: 'Furniture Store'},
    'kitchen/bathroom tiles': {ingredients: {'toilet paper rolls': 2, 'measuring tape': 2}, duration: 4020, building: 'Furniture Store'},
    cupboard: {ingredients: {'wood planks': 2, 'glass': 2, 'paint': 1}, duration: 2430, building: 'Furniture Store'},
    grass: {'singular': 'grass', ingredients: {seeds: 1, 'shovels': 1}, duration: 1800, building: 'Gardening Supplies'},
    trees: {ingredients: {seeds: 2, 'shovels': 1}, duration: 5400, building: 'Gardening Supplies'},
    'outdoor furniture': {ingredients: {plastic: 2, 'toilet paper rolls': 2, 'wood planks': 2}, duration: 8100, building: 'Gardening Supplies'},
    'fire pits': {ingredients: {'bricks': 2, 'shovels': 1, 'cement': 2}, duration: 14400, building: 'Gardening Supplies'},
    donuts: {ingredients: {flour: 1, 'sugar&spices': 1}, duration: 2700, building: 'Donut Shop'},
    'smoothies': {ingredients: {vegetables: 1, fruit: 1}, duration: 1800, building: 'Donut Shop'},
    'bread rolls': {ingredients: {flour: 2, cream: 1}, duration: 3600, building: 'Donut Shop'},
    'cherry cheesecake slices': {ingredients: {flour: 1, fruit: 1, cheese: 1}, duration: 5400, building: 'Donut Shop'},
    'frozen yogurts': {ingredients: {fruit: 1, cream: 1, 'sugar&spices': 1}, duration: 14400, building: 'Donut Shop'},
    'baseball caps': {ingredients: {'toilet paper rolls': 2, 'measuring tapes': 1}, duration: 3600, building: 'Fashion Store'},
    'red shoes': {ingredients: {plastic: 1, 'glue': 1, 'toilet paper rolls': 1}, duration: 4500, building: 'Fashion Store'},
    watches: {singular: 'watch', ingredients: {plastic: 2, 'glass': 1, chemicals: 1}, duration: 5400, building: 'Fashion Store'},
    'fabric': {ingredients: {}, duration: 360, building: 'Green Factory'},
    'reusable bags': {ingredients: {'fabric': 2}, duration: 1200, building: 'Eco Shop'},
    'ice cream sandwiches': {'singular': 'ice cream sandwich', ingredients: {'bread rolls': 1, cream: 1}, 'duration': 840, building: 'Fast Food Restaurant'},
    'pizzas': {'ingredients': [{'flour': 1}, {cheese: 1}, {beef: 1}], 'duration': 1440},
};

export function displayName(key, count) {
    if (count === 1) {
        if (goods[key].singular) {
            return goods[key].singular
        } else {
            if (key.charAt(key.length - 1) === "s") {
                return key.substring(0, key.length - 1);
            }
        }
    }
    return key
}

function canSlide(currentOperation, amount, nonceRegistry) {
    if (currentOperation.nonce === undefined || currentOperation.slideTime === undefined) {
        return false
    }
    for (let index = currentOperation.nonces.length; index > 0; index -= 1) {
        const nonce = currentOperation.nonces[index - 1]
        if (nonceRegistry[nonce].slideTime > amount) {
            return true;
        } else {
            amount -= nonceRegistry[nonce].slideTime
        }
    }
    return false
}

function getAvailableTime(operationList, earliest, duration, nonceRegistry) {
    let actual = earliest
    let done = false
    while (!done) {
        done = true
        for (let index = 0; index < operationList.length; index ++) {
            const operation = operationList[index]
            if (operation.start < actual + duration && operation.end > actual) {
                let slideAmount = actual + duration - operation.start
                let slideSuccess = true
                let slideIndex = index
                while (slideSuccess && slideIndex < operationList.length) {
                    let slidingOperation = operationList[index]
                    if (slidingOperation.slideTime === undefined) {
                        slideSuccess = false
                    } else {
                        slideSuccess = canSlide(slidingOperation, slideAmount, nonceRegistry)
                    }
                    if (slideSuccess) {
                        slideIndex += 1
                        if (slideIndex < operationList.length) {
                            slideAmount = operationList[slideIndex].start - slidingOperation.end + slideAmount
                            if (slideAmount <= 0) {
                                slideIndex = operationList.length
                            }
                        }
                    }
                }
                if (!slideSuccess) {
                    actual = operation.end
                    done = false
                }
            }
        }
    }
    return actual
}

function doSlide(operations, nonces, slideAmount) {
    for (let index=nonces.length - 1; index >= 0; index -= 1) {
        const nonce = nonces[index]
        let amountSlid = 0
        let operation = operations.nonceRegistry[nonce]
        if (operation.slideTime > slideAmount) {
            amountSlid = slideAmount
        } else {
            amountSlid = operation.slideTime
        }
        operations.nonceRegistry.forEach((registeredOp, index) => {
            if (index !== nonce && registeredOp.nonces.contains(nonce)) {
                registeredOp.slideTime += amountSlid
            }
        })
        slideAmount -= amountSlid
        if (slideAmount <= 0) {
            return
        }
    }
}

function insertOperation(operations, operation, building) {
    let newOperations = {...operations}
    let pipeline = newOperations[building]
    let newPipeline = []
    let inserted = false
    operation['building'] = building
    if (pipeline) {
        for (let index = 0; index < pipeline.length; index += 1) {
            if (inserted) {
                newPipeline[index + 1] = pipeline[index]
            } else {
                if (pipeline[index].end <= operation.start) {
                    newPipeline[index] = pipeline[index]
                } else {
                    let slideAmount = operation.start + operation.duration - pipeline[index].start
                    if (slideAmount > 0) {
                        if (!canSlide(pipeline[index], slideAmount, operations.nonceRegistry)) {
                            console.error("Slide wasn't successful, this isn't expected")
                        }
                        doSlide(operations, pipeline[index].nonces, slideAmount)
                    }
                    newPipeline[index] = operation
                    newPipeline[index + 1] = pipeline[index]
                    inserted = true
                }
            }
        }
    } else {
        newPipeline = [operation]
        inserted = true
    }
    if (!inserted) {
        newPipeline.push(operation)
    }
    newOperations[building] = newPipeline
    return newOperations
}

function addOperation(operation, operations) {
    let currentOperation = operation
    const building = operation['building']
    const limit = buildingLimits[building] || 1
    let newOperations = {...operations}
    let possibleBuildings = [building]
    if (limit > 1) {
        possibleBuildings = [building + "0"]
        for (let i = 1; i < limit; i += 1) {
            possibleBuildings.push(building + i)
        }
    }

    let firstAvailableTime = undefined
    let buildingName = undefined
    let finalBuildingName = undefined
    possibleBuildings.forEach(possibleBuilding => {
        if (finalBuildingName === undefined) {
            if (!operations[possibleBuilding]) {
                newOperations[possibleBuilding] = [currentOperation]
                finalBuildingName = possibleBuilding
            } else {
                const available = getAvailableTime(operations[possibleBuilding], currentOperation['start'], currentOperation['duration'], operations.nonceRegistry)
                if (canSlide(currentOperation, available - currentOperation['start'], operations.nonceRegistry)) {
                    finalBuildingName = possibleBuilding
                } else if (firstAvailableTime === undefined || available < firstAvailableTime) {
                    firstAvailableTime = available
                    buildingName = possibleBuilding
                }
            }
        }
    })
    if (!finalBuildingName) {
        finalBuildingName = buildingName
        currentOperation['start'] = firstAvailableTime
        currentOperation['end'] = firstAvailableTime + currentOperation['duration']
    }
    newOperations = insertOperation(operations, currentOperation, finalBuildingName)
    return newOperations
}

export function addOrder(order, operations, priority, remainingStorage, running, nonces = []) {
    let maxTimeOffset = 0
    let goodsAdded = []
    if (operations['nonceRegistry'] === undefined) {
        operations['nonceRegistry'] = []
    }
    let localStorage = {...remainingStorage}
    Object.keys(order).forEach(key => {
        for (let i=0; i < order[key]; i+=1) {
            if (localStorage[key] && localStorage[key] > 0) {
                localStorage[key] -= 1
            } else {
                let foundRunning = undefined
                Object.keys(running).forEach(building => {
                    if (foundRunning === undefined) {
                        let foundIndex = undefined
                        running[building].forEach((op, index) => {
                            if (foundIndex === undefined && op.name === key) {
                                foundIndex = index
                            }
                        })
                        if (foundIndex !== undefined) {
                            foundRunning = running[building][foundIndex]
                            running[building].splice(foundIndex, 1)
                        }
                    }
                })
                if (foundRunning) {
                    foundRunning.priorty = priority
                    goodsAdded.push(foundRunning)
                } else {
                    let myNonces = []
                    if (nonces) {
                        myNonces = [...nonces]
                    }
                    let good = {...goods[key]}
                    myNonces.push(operations['nonceRegistry'].length)
                    operations['nonceRegistry'].push(good)
                    let result = addOrder(goods[key]['ingredients'], operations, priority, localStorage, running, myNonces)
                    operations = result['operations']
                    localStorage = result['storage']
                    good['start'] = result['timeOfCompletion']
                    good['end'] = result['timeOfCompletion'] + goods[key]['duration']
                    good['name'] = key
                    good['priority'] = priority
                    good['nonces'] = myNonces;
                    good['slideTime'] = 0
                    goodsAdded.push(good)
                    operations = addOperation(good, operations)
                }
            }
        }
    })
    if (goodsAdded.length === 0) {
        return {operations: operations, timeOfCompletion: 0, storage: localStorage}
    } else {
        goodsAdded.forEach(good => {
            if (good['end'] > maxTimeOffset) {
                maxTimeOffset = good['end']
            }
        })
        let buildingSlides = {}
        for (let index = goodsAdded.length - 1; index >= 0; index -= 1) {
            let good = goodsAdded[index]
            let targetTime = maxTimeOffset
            let alreadySlid = 0
            if (buildingSlides[good.building]) {
                targetTime = buildingSlides[good.building].targetTime
                alreadySlid = buildingSlides[good.building].alreadySlid
            }
            good['slideTime'] = targetTime - good['end'] + alreadySlid
            buildingSlides[good.building] = {targetTime: good.start, alreadySlid: alreadySlid + good.slideTime}
        }
    }
    return {operations: operations, timeOfCompletion: maxTimeOffset, storage: localStorage}
}

export default goods;
