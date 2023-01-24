const buildingLimits = {
    'Factory': 18,
    'Green Factory': 5
}
const goods = {
    'animal feed': {ingredients: {}, duration: 21600, building: 'Factory'},
    'baseball caps': {ingredients: {'toilet paper rolls': 2, 'measuring tapes': 1}, duration: 3600, building: 'Fashion Store'},
    beef: {ingredients: {'animal feed': 3}, duration: 8100, building: 'Farmer\'s Market'},
    'bread rolls': {ingredients: {flour: 2, cream: 1}, duration: 3600, building: 'Donut Shop'},
    bricks: {ingredients: {minerals: 2}, duration: 1080, building: 'Building Supplies Store'},
    cement: {ingredients: {minerals: 2, chemicals: 1}, duration: 2700, building: 'Building Supplies Store'},
    chairs: {ingredients: {nails: 1, hammers: 1, wood: 2}, duration: 1080, building: 'Furniture Store'},
    cheese: {ingredients: {'animal feed': 2}, duration: 5640, building: 'Farmer\'s Market'},
    chemicals: {ingredients: {}, duration: 7200, building: 'Factory'},
    'cherry cheesecake slices': {ingredients: {flour: 1, fruit: 1, cheese: 1}, duration: 5400, building: 'Donut Shop'},
    corn: {ingredients: {'minerals': 1, seeds: 4}, duration: 3240, building: 'Farmer\'s Market'},
    cream: {ingredients: {'animal feed': 1}, duration: 4020, building: 'Farmer\'s Market'},
    cupboard: {ingredients: {'wood planks': 2, 'glass': 2, 'paint': 1}, duration: 2430, building: 'Furniture Store'},
    donuts: {ingredients: {flour: 1, 'sugar&spices': 1}, duration: 2700, building: 'Donut Shop'},
    'electrical components': {ingredients: {}, duration: 25200, building: 'Factory'},
    fabric: {ingredients: {}, duration: 360, building: 'Green Factory'},
    'fire pits': {ingredients: {'bricks': 2, 'shovels': 1, 'cement': 2}, duration: 14400, building: 'Gardening Supplies'},
    flour: {ingredients: {seeds: 2, 'toilet paper rolls': 2}, duration: 1620, building: 'Farmer\'s Market'},
    trees: {ingredients: {seeds: 2, shovels: 1}, duration: 5400, building: 'Gardening Supplies'},
    'frozen yogurts': {ingredients: {fruit: 1, cream: 1, 'sugar&spices': 1}, duration: 14400, building: 'Donut Shop'},
    fruit: {ingredients: {seeds: 2, trees: 1}, duration: 4860, building: 'Farmer\'s Market'},
    glass: {ingredients: {}, duration: 18000, singular: 'glass', building: 'Factory'},
    glue: {ingredients: {plastic: 1, chemicals: 2}, duration: 3240, building: 'Building Supplies Store'},
    grass: {'singular': 'grass', ingredients: {seeds: 1, 'shovels': 1}, duration: 1800, building: 'Gardening Supplies'},
    hammers: {ingredients: {metal: 1, wood: 1}, duration: 756, building: 'Hardware Store'},
    'ice cream sandwiches': {'singular': 'ice cream sandwich', ingredients: {'bread rolls': 1, cream: 1}, 'duration': 840, building: 'Fast Food Restaurant'},
    'kitchen/bathroom tiles': {ingredients: {'toilet paper rolls': 2, 'measuring tapes': 2}, duration: 4020, building: 'Furniture Store'},
    ladders: {ingredients: {metal: 2, 'wood planks': 2}, duration: 3240, building: 'Hardware Store'},
    'measuring tapes': {ingredients: {plastic: 1, metal: 1}, duration: 1080, building: 'Hardware Store'},
    metal: {ingredients: {}, duration: 60, building: 'Factory'},
    minerals: {ingredients: {}, duration: 1800, building: 'Factory'},
    nails: {ingredients: {metal: 2}, duration: 270, building: 'Building Supplies Store'},
    'outdoor furniture': {ingredients: {plastic: 2, 'toilet paper rolls': 2, 'wood planks': 2}, duration: 8100, building: 'Gardening Supplies'},
    paint: {ingredients: {plastic: 1, chemicals: 2}, duration: 3240, building: 'Building Supplies Store'},
    pizzas: {ingredients: [{flour: 1}, {cheese: 1}, {beef: 1}], duration: 1440},
    plastic: {ingredients: {}, duration: 540, building: 'Factory'},
    'red shoes': {ingredients: {plastic: 1, glue: 1, 'toilet paper rolls': 1}, duration: 4500, building: 'Fashion Store'},
    'reusable bags': {ingredients: {fabric: 2}, duration: 1200, building: 'Eco Shop'},
    seeds: {ingredients: {}, duration: 1200, building: 'Factory'},
    shovels: {ingredients: {plastic: 1, metal: 1, wood: 1}, duration: 1620, building: 'Hardware Store'},
    'smoothies': {ingredients: {vegetables: 1, fruit: 1}, duration: 1800, building: 'Donut Shop'},
    'sugar&spices': {ingredients: {}, duration: 14400, building: 'Factory'},
    tables: {ingredients: {'wood planks': 1, nails: 2, hammers: 1}, duration: 1620, building: 'Furniture Store'},
    'toilet paper rolls': {ingredients: {}, duration: 10800, building: 'Factory'},
    utensils: {ingredients: {plastic: 2, metal: 2, wood: 2}, duration: 2430, building: 'Hardware Store'},
    vegetables: {ingredients: {seeds: 2}, duration: 1080, building: 'Farmer\'s Market'},
    watches: {singular: 'watch', ingredients: {plastic: 2, glass: 1, chemicals: 1}, duration: 5400, building: 'Fashion Store'},
    wood: {ingredients: {}, duration: 180, building: 'Factory'},
    'wood planks': {ingredients: {wood: 2}, duration: 1620, building: 'Building Supplies Store'},
};

export function secondsToTime(timeInSeconds) {
    const hours = Math.floor(timeInSeconds / 3600)
    const minutes = Math.floor((timeInSeconds - hours * 3600) / 60)
    const seconds = timeInSeconds - minutes * 60 - hours * 3600

    let timeString = ""
    if (hours > 1) {
        timeString = hours + " hrs "
    } else if (hours === 1) {
        timeString = hours + " hr "
    }
    if (minutes > 1) {
        timeString += minutes + " mins "
    } else if (minutes === 1) {
        timeString += minutes + " min "
    }
    if (hours === 0 && seconds > 1) {
        timeString += seconds + " secs"
    } else if (hours === 0 && seconds === 1) {
        timeString += seconds + " sec"
    }
    return timeString
}

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

function canSlide(currentOperation, amount) {
    return currentOperation.slideTime >= amount
}

function getAvailableTime(operationList, earliest, duration) {
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
                        slideSuccess = canSlide(slidingOperation, slideAmount)
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

function doSlide(operation, slideAmount) {
    operation.start += slideAmount
    operation.end += slideAmount
    operation.slideTime -= slideAmount
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
                        if (!canSlide(pipeline[index], slideAmount)) {
                            console.error("Slide wasn't successful, this isn't expected")
                        }
                        doSlide(pipeline[index], slideAmount)
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
                const available = getAvailableTime(operations[possibleBuilding], currentOperation['start'], currentOperation['duration'])
                if (canSlide(currentOperation, available - currentOperation['start'])) {
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

export function addOrder(order, operations, priority, remainingStorage, running) {
    let maxTimeOffset = 0
    let goodsAdded = []
    let childOperations = []
    let existingOperations = []
    let localStorage = {...remainingStorage}
    Object.keys(order).forEach(key => {
        for (let i=0; i < order[key]; i+=1) {
            if (localStorage[key] && localStorage[key] > 0) {
                localStorage[key] -= 1
                existingOperations.push({name: key, end: 0, start: 0, slideTime: 0, fromStorage: true})
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
                    foundRunning.priority = priority
                    childOperations[goodsAdded.length] = []
                    goodsAdded.push(foundRunning)
                    existingOperations.push(foundRunning)
                } else {
                    let good = {...goods[key]}
                    let result = addOrder(goods[key]['ingredients'], operations, priority, localStorage, running)
                    childOperations[goodsAdded.length] = result.operationsForOrder
                    operations = result['allOperations']
                    localStorage = result['storage']
                    good['start'] = result['timeOfCompletion']
                    good['end'] = result['timeOfCompletion'] + goods[key]['duration']
                    good['name'] = key
                    good['priority'] = priority
                    good['slideTime'] = 0
                    goodsAdded.push(good)
                    operations = addOperation(good, operations)
                }
            }
        }
    })
    if (goodsAdded.length === 0) {
        return {allOperations: operations, timeOfCompletion: 0, storage: localStorage, operationsForOrder: existingOperations}
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
            childOperations[index].forEach(op => op.slideTime += good['slideTime'])
            buildingSlides[good.building] = {targetTime: good.start, alreadySlid: alreadySlid + good.slideTime}
        }
    }
    let allMatchedOperations = existingOperations
    for (let index = 0; index < goodsAdded.length; index += 1) {
        allMatchedOperations = allMatchedOperations.concat(childOperations[index])
        allMatchedOperations.push(goodsAdded[index])
    }
    return {allOperations: operations, timeOfCompletion: maxTimeOffset, storage: localStorage, operationsForOrder: allMatchedOperations}
}

export default goods;
