import EditableNumber from "./EditableNumber";
export const randomGeneratorKey = "Vu's Random Generator"

export const buildingData = {
    Factory: {slots: 30, haveBuilding: true, isParallel: true, requiredLevel: 1},
    "Farmer's Market": {pipelineSize: 3, haveBuilding: false, isParallel: false, requiredLevel: 8},
    'Building Supplies Store': {pipelineSize: 3, haveBuilding: false, isParallel: false, requiredLevel: 1},
    'Hardware Store': {pipelineSize: 3, haveBuilding: false, isParallel: false, requiredLevel: 4},
    'Fashion Store': {pipelineSize: 3, haveBuilding: false, isParallel: false, requiredLevel: 19},
    'Furniture Store':{pipelineSize: 3, haveBuilding: false, isParallel: false, requiredLevel: 10},
    'Gardening Supplies': {pipelineSize: 3, haveBuilding: false, isParallel: false, requiredLevel: 14},
    'Donut Shop': {pipelineSize: 3, haveBuilding: false, isParallel: false, requiredLevel: 18},
    'Fast Food Restaurant': {pipelineSize: 3, haveBuilding: false, isParallel: false, requiredLevel: 25},
    'Home Appliances': {pipelineSize: 3, haveBuilding: false, isParallel: false, requiredLevel: 29},
    'Green Factory': {slots: 5, haveBuilding: false, isParallel: true, requiredLevel: 25},
    'Eco Shop': {pipelineSize: 3, haveBuilding: false, isParallel: false, requiredLevel: 25},
    'Coconut Farm':{slots: 5, haveBuilding: false, isParallel: true, requiredLevel: 25},
    'Tropical Products Store': {pipelineSize: 3, haveBuilding: false, isParallel: false, requiredLevel: 25},
    'Chocolate Factory':{pipelineSize: 3, haveBuilding: false, isParallel: false, requiredLevel: 6},
    'Fishery': {slots: 5, haveBuilding: false, isParallel: true, requiredLevel: 25},
    'Fish Marketplace': {pipelineSize: 3, haveBuilding: false, isParallel: false, requiredLevel: 25},
    'Oil Plant': {slots: 5, haveBuilding: false, isParallel: true, requiredLevel: 25},
    'Car Parts':  {pipelineSize: 3, haveBuilding: false, isParallel: false, requiredLevel: 25},
    'Mulberry Grove': {slots: 5, haveBuilding: false, isParallel: true, requiredLevel: 25},
    'Silk Store': {pipelineSize: 3, haveBuilding: false, isParallel: false, requiredLevel: 25},
    'Toy Shop': {pipelineSize: 3, haveBuilding: false, isParallel: false, requiredLevel: 40},
    'Sports Shop': {pipelineSize: 3, haveBuilding: false, isParallel: false, requiredLevel: 40},
    "Vu's Random Generator": {pipelineSize: 3, haveBuilding: false, isParallel: false, requiredLevel: 10},
    'Restoration': {pipelineSize: 3, haveBuilding: false, isParallel: false, requiredLevel: 30},
    'Country Store': {pipelineSize: 3, haveBuilding: false, isParallel: false, requiredLevel: 30},
    'Dessert Shop': {pipelineSize: 3, haveBuilding: false, isParallel: false, requiredLevel: 30},
}

export const goodsData = {
    metal: {ingredients: {}, duration: 60, building: 'Factory', price: 10, shortcut: 'ml', storeFrequency: 'frequent', requiredLevel: 1},
    wood: {ingredients: {}, duration: 180, building: 'Factory', price: 20, shortcut: 'wd', storeFrequency: 'frequent', requiredLevel: 2},
    plastic: {ingredients: {}, duration: 540, building: 'Factory', price: 25, shortcut: 'pl', storeFrequency: 'normal', requiredLevel: 5},
    seeds: {ingredients: {}, duration: 1200, building: 'Factory', price: 30, shortcut: 'se', storeFrequency: 'normal', requiredLevel: 7},
    minerals: {ingredients: {}, duration: 1800, building: 'Factory', price: 40, shortcut: 'mn', storeFrequency: 'normal', requiredLevel: 11},
    chemicals: {ingredients: {}, duration: 7200, building: 'Factory', price: 60, shortcut: 'cm', storeFrequency: 'normal', requiredLevel: 13},
    textiles: {ingredients: {}, duration: 10800, building: 'Factory', price: 90, shortcut: 'tp', storeFrequency: 'normal', requiredLevel: 15},
    'sugar and spices': {ingredients: {}, duration: 14400, building: 'Factory', price: 110, shortcut: 'su', storeFrequency: 'normal', requiredLevel: 17, display: 'sugar'},
    glass: {ingredients: {}, duration: 18000, singular: 'glass', building: 'Factory', price: 120, shortcut: 'gs', storeFrequency: 'normal', requiredLevel: 19},
    'animal feed': {ingredients: {}, duration: 21600, building: 'Factory', price: 140, shortcut: 'af', storeFrequency: 'normal', requiredLevel: 23, display: 'feed'},
    'electrical components': {ingredients: {}, duration: 25200, building: 'Factory', price: 160, shortcut: 'ec', storeFrequency: 'normal', requiredLevel: 29, display: 'electronics'},
    vegetables: {ingredients: {seeds: 2}, duration: 1200, building: 'Farmer\'s Market', price: 160, shortcut: 'vg', storeFrequency: 'normal', requiredLevel: 8},
    flour: {ingredients: {seeds: 2, textiles: 2}, duration: 1800, building: 'Farmer\'s Market', price: 570, shortcut: 'fl', storeFrequency: 'rare', requiredLevel: 17},
    'fruit and berries': {ingredients: {seeds: 2, 'tree saplings': 1}, duration: 5400, building: 'Farmer\'s Market', price: 730, shortcut: 'ft', storeFrequency: 'rare', requiredLevel: 18, display: 'fruit'},
    cream: {ingredients: {'animal feed': 1}, duration: 4500, building: 'Farmer\'s Market', price: 440, shortcut: 'ca', storeFrequency: 'normal', requiredLevel: 23},
    corn: {ingredients: {'minerals': 1, seeds: 4}, duration: 3600, building: 'Farmer\'s Market', price: 280, shortcut: 'cn', storeFrequency: 'rare', requiredLevel: 24},
    cheese: {ingredients: {'animal feed': 2}, duration: 6300, building: 'Farmer\'s Market', price: 660, shortcut: 'cz', storeFrequency: 'normal', requiredLevel: 26},
    beef: {ingredients: {'animal feed': 3}, duration: 9000, building: 'Farmer\'s Market', price: 860, shortcut: 'bf', storeFrequency: 'normal', requiredLevel: 27},
    nails: {ingredients: {metal: 2}, duration: 300, building: 'Building Supplies Store', price: 80, shortcut: 'nl', storeFrequency: 'normal', requiredLevel: 1},
    planks: {ingredients: {wood: 2}, duration: 1800, building: 'Building Supplies Store', price: 120, shortcut: 'wp', storeFrequency: 'rare', requiredLevel: 3},
    bricks: {ingredients: {minerals: 2}, duration: 1200, building: 'Building Supplies Store', price: 190, shortcut: 'bk', storeFrequency: 'normal', requiredLevel: 13},
    cement: {ingredients: {minerals: 2, chemicals: 1}, duration: 3000, building: 'Building Supplies Store', price: 440, shortcut: 'ce', storeFrequency: 'normal', requiredLevel: 14},
    glue: {ingredients: {plastic: 1, chemicals: 2}, duration: 3600, building: 'Building Supplies Store', price: 440, shortcut: 'gl', storeFrequency: 'normal', requiredLevel: 15},
    paint: {ingredients: {metal: 2, minerals: 1, chemicals: 2}, duration: 3600, building: 'Building Supplies Store', price: 320, shortcut: 'pt', storeFrequency: 'rare', requiredLevel: 16},
    hammers: {ingredients: {metal: 1, wood: 1}, duration: 840, building: 'Hardware Store', price: 90, shortcut: 'hm', storeFrequency: 'rare', requiredLevel: 4},
    'measuring tapes': {ingredients: {plastic: 1, metal: 1}, duration: 1200, building: 'Hardware Store', price: 110, shortcut: 'mt', storeFrequency: 'rare', requiredLevel: 6, display: 'tapes'},
    shovels: {ingredients: {plastic: 1, metal: 1, wood: 1}, duration: 1800, building: 'Hardware Store', price: 150, shortcut: 'sh', storeFrequency: 'rare', requiredLevel: 9},
    'cooking utensils': {ingredients: {plastic: 2, metal: 2, wood: 2}, duration: 2700, building: 'Hardware Store', price: 250, shortcut: 'ut', storeFrequency: 'normal', requiredLevel: 17, display: 'utensils'},
    ladders: {ingredients: {metal: 2, planks: 2}, duration: 3600, building: 'Hardware Store', price: 420, shortcut: 'ld', storeFrequency: 'rare', requiredLevel: 20},
    drills: {ingredients: {metal: 2, plastic: 2, 'electrical components': 1}, duration: 7200, building: 'Hardware Store', price: 590, shortcut: 'dr', storeFrequency: 'rare', requiredLevel: 30},
    caps: {ingredients: {textiles: 2, 'measuring tapes': 1}, duration: 3600, building: 'Fashion Store', price: 600, shortcut: 'bc', storeFrequency: 'normal', requiredLevel: 19},
    shoes: {ingredients: {plastic: 1, glue: 1, textiles: 2}, duration: 4500, building: 'Fashion Store', price: 980, shortcut: 'rs', storeFrequency: 'normal', requiredLevel: 21},
    watches: {singular: 'watch', ingredients: {plastic: 2, glass: 1, chemicals: 1}, duration: 5400, building: 'Fashion Store', price: 580, shortcut: 'wt', storeFrequency: 'normal', requiredLevel: 22},
    'business suits': {ingredients: {textiles: 3, 'measuring tapes': 1, 'glue': 1}, duration: 12600, building: 'Fashion Store', price: 1170, shortcut: 'bs', storeFrequency: 'normal', requiredLevel: 32, display: 'suits'},
    'backpacks': {ingredients: {textiles: 2, plastic: 2, 'measuring tapes': 1}, duration: 9000, building: 'Fashion Store', price: 430, shortcut: 'bp', storeFrequency: 'rare', requiredLevel: 34},
    chairs: {ingredients: {nails: 1, hammers: 1, wood: 2}, duration: 1200, building: 'Furniture Store', price: 300, shortcut: 'cr', storeFrequency: 'normal', requiredLevel: 10},
    tables: {ingredients: {planks: 1, nails: 2, hammers: 1}, duration: 1800, building: 'Furniture Store', price: 500, shortcut: 'tb', storeFrequency: 'normal', requiredLevel: 16},
    'home textiles': {ingredients: {textiles: 2, 'measuring tapes': 1}, duration: 4500, building: 'Furniture Store', price: 610, shortcut: 'tl', storeFrequency: 'rare', requiredLevel: 25, display: 'tiles'},
    cupboards: {ingredients: {planks: 2, 'glass': 2, 'paint': 1}, duration: 2700, building: 'Furniture Store', price: 900, shortcut: 'cp', storeFrequency: 'rare', requiredLevel: 26},
    couches: {singular: 'couch', ingredients: {textiles: 3, drills: 1, glue: 1}, duration: 9000, building: 'Furniture Store', price: 1810, shortcut: 'ch', storeFrequency: 'normal', requiredLevel: 33},
    grass: {'singular': 'grass', ingredients: {seeds: 1, 'shovels': 1}, duration: 1800, building: 'Gardening Supplies', price: 310, shortcut: 'gr', storeFrequency: 'normal', requiredLevel: 14},
    'tree saplings': {ingredients: {seeds: 2, shovels: 1}, duration: 5400, building: 'Gardening Supplies', price: 420, shortcut: 'tr', storeFrequency: 'rare', requiredLevel: 16, display: 'trees'},
    'garden furniture': {ingredients: {plastic: 2, textiles: 2, planks: 2}, duration: 8100, building: 'Gardening Supplies', price: 820, shortcut: 'of', storeFrequency: 'rare', requiredLevel: 21, display: 'lawn chairs'},
    'fire pits': {ingredients: {bricks: 2, shovels: 1, cement: 2}, duration: 14800, building: 'Gardening Supplies', price: 1740, shortcut: 'fp', storeFrequency: 'normal', requiredLevel: 28},
    'lawnmowers': {ingredients: {metal: 3, paint: 1, 'electrical components': 1}, duration: 7200, building: 'Gardening Supplies', price: 840, shortcut: 'lm', storeFrequency: 'rare', requiredLevel: 30, display: 'mowers'},
    'gnomes': {ingredients: {cement: 2, glue: 1}, duration: 5400, building: 'Gardening Supplies', price: 1600, shortcut: 'gn', storeFrequency: 'frequent', requiredLevel: 34},
    donuts: {ingredients: {flour: 1, 'sugar and spices': 1}, duration: 2700, building: 'Donut Shop', price: 950, shortcut: 'dn', storeFrequency: 'normal', requiredLevel: 18},
    'green smoothies': {ingredients: {vegetables: 1, 'fruit and berries': 1}, duration: 1800, building: 'Donut Shop', price: 1150, shortcut: 'sm', storeFrequency: 'normal', requiredLevel: 20, display: 'smoothies'},
    'bread rolls': {ingredients: {flour: 2, cream: 1}, duration: 3600, building: 'Donut Shop', price: 1840, shortcut: 'br', storeFrequency: 'rare', requiredLevel: 24, display: 'rolls'},
    'cherry cheesecake': {ingredients: {flour: 1, 'fruit and berries': 1, cheese: 1}, duration: 5400, building: 'Donut Shop', price: 2240, shortcut: 'cc', storeFrequency: 'normal', requiredLevel: 27, display: 'cheesecake'},
    'frozen yogurts': {ingredients: {'fruit and berries': 1, cream: 1, 'sugar and spices': 1}, duration: 14900, building: 'Donut Shop', price: 1750, shortcut: 'fy', storeFrequency: 'normal', requiredLevel: 28, display: 'froyo'},
    coffees: {ingredients: {cream: 1, seeds: 2, 'sugar and spices': 1}, duration: 3600, building: 'Donut Shop', price: 750, shortcut: 'co', storeFrequency: 'rare', requiredLevel: 33},
    fabric: {ingredients: {}, duration: 360, building: 'Green Factory', price: 30, shortcut: 'fb', storeFrequency: 'normal', requiredLevel: 25},
    'ice cream sandwiches': {'singular': 'ice cream sandwich', ingredients: {'bread rolls': 1, cream: 1}, 'duration': 840, building: 'Fast Food Restaurant', price: 2560, shortcut: 'ic', storeFrequency: 'normal', requiredLevel: 25, display: 'ice cream'},
    pizzas: {ingredients: {flour: 1, cheese: 1, beef: 1}, duration: 1440, building: 'Fast Food Restaurant', price: 2560, shortcut: 'pz', storeFrequency: 'frequent', requiredLevel: 28},
    burgers: {ingredients: {beef: 1, 'bread rolls': 1, 'BBQ Grills': 1}, duration: 2100, building: 'Fast Food Restaurant', price: 3620, shortcut: 'cb', storeFrequency: 'frequent', requiredLevel: 31},
    'cheese fries': {ingredients: {cheese: 1, vegetables: 1}, duration: 1200, singular: 'fries', building: 'Fast Food Restaurant', price: 1050, shortcut: 'fr', storeFrequency: 'frequent', requiredLevel: 33, display: 'fries'},
    'lemonades': {ingredients: {glass: 2, 'sugar and spices': 2, 'fruit and berries': 1}, duration: 3600, building: 'Fast Food Restaurant', price: 1690, shortcut: 'ln', storeFrequency: 'normal', requiredLevel: 37},
    'popcorn': {ingredients: {'microwave ovens': 1, corn: 2}, duration: 1800, building: 'Fast Food Restaurant', price: 1250, shortcut: 'pc', storeFrequency: 'rare', requiredLevel: 43},
    'reusable bags': {ingredients: {fabric: 2}, duration: 1200, building: 'Eco Shop', price: 120, shortcut: 'rb', storeFrequency: 'normal', requiredLevel: 25, display: 'bags'},
    'ecological shoes': {ingredients: {fabric: 2, glue: 1, 'measuring tapes': 1}, duration: 7200, building: 'Eco Shop', price: 750, shortcut: 'es', storeFrequency: 'rare', requiredLevel: 30, display: 'eco shoes'},
    'yoga mats': {ingredients: {fabric: 3, 'home textiles': 2, paint: 1}, duration: 14900, building: 'Eco Shop', price: 2000, shortcut: 'ym', storeFrequency: 'rare', requiredLevel: 35},
    'BBQ Grills': {ingredients: {metal: 3, 'cooking utensils': 1}, duration: 9900, building: 'Home Appliances', price: 530, shortcut: 'bb', storeFrequency: 'rare', requiredLevel: 29},
    refrigerators: {ingredients: {plastic: 2, chemicals: 2, 'electrical components': 2}, duration: 12600, building: 'Home Appliances', price: 1060, shortcut: 'rf', storeFrequency: 'normal', requiredLevel: 35, display: 'fridges'},
    'lighting systems': {ingredients: {chemicals: 1, 'electrical components': 1, glass: 1}, duration: 6300, building: 'Home Appliances', price: 890, shortcut: 'ls', storeFrequency: 'normal', requiredLevel: 36, display: 'bulbs'},
    tvs: {ingredients: {plastic:2, glass: 2, 'electrical components': 2}, duration: 9000, building: 'Home Appliances', price: 1280, shortcut: 'tv', storeFrequency: 'frequent', requiredLevel: 38},
    'microwave ovens': {ingredients: {glass: 1, 'electrical components': 1, metal: 4}, duration: 7200, building: 'Home Appliances', price: 640, shortcut: 'mw', storeFrequency: 'rare', requiredLevel: 42, display: 'microwaves'},
    coconuts: {ingredients: {}, duration: 360, building: 'Coconut Farm', price: 30, shortcut: 'ct', storeFrequency: 'normal', requiredLevel: 25},
    'coconut oil': {ingredients: {coconuts: 2}, duration: 1200, building: 'Tropical Products Store', price: 120, shortcut: 'ol', storeFrequency: 'normal', requiredLevel: 25},
    'face cream': {ingredients: {'coconut oil': 2, chemicals: 2}, duration: 5400, building: 'Tropical Products Store', price: 850, shortcut: 'fc', storeFrequency: 'rare', requiredLevel: 30},
    'tropical drink': {ingredients: {coconuts: 2, 'fruit and berries': 2, 'sugar and spices': 1}, duration: 15000, building: 'Tropical Products Store', price: 2400, shortcut: 'td', storeFrequency: 'rare', requiredLevel: 35},
    'chocolate bar': {ingredients: {seeds: 2, 'sugar and spices': 1}, duration: 1200, building: 'Chocolate Factory', price: 187, shortcut: 'ba', storeFrequency: 'rare', requiredLevel: 1},
    'easter basket': {ingredients: {wood: 1, grass: 1, 'sugar and spices': 1}, duration: 3600, building: 'Chocolate Factory', price: 340, shortcut: 'eb', storeFrequency: 'rare', requiredLevel: 1},
    'jelly beans': {ingredients: {glass: 1, 'sugar and spices': 1}, duration: 4500, building: 'Chocolate Factory', price: 340, shortcut: 'jb', storeFrequency: 'rare', requiredLevel: 1},
    'chocolate egg': {ingredients: {seeds: 1, 'sugar and spices': 1, cream: 1}, duration: 2700, building: 'Chocolate Factory', price: 340, shortcut: 'eg', storeFrequency: 'rare', requiredLevel: 1},
    'fruit cake': {ingredients: {'fruit and berries': 1, cream: 1, 'bread rolls': 1}, duration: 7200, building: 'Chocolate Factory', price: 340, shortcut: 'fk', storeFrequency: 'rare', requiredLevel: 1},
    fish: {ingredients: {}, duration: 360, building: 'Fishery', price: 30, shortcut: 'fi', storeFrequency: 'normal', requiredLevel: 25},
    'canned fish': {ingredients: {fish: 1, metal: 1}, duration: 1200, building: 'Fish Marketplace', price: 120, shortcut: 'cf', storeFrequency: 'normal', requiredLevel: 25},
    'fish soup': {ingredients: {vegetables: 1, fish: 2, 'cooking utensils': 2}, duration: 7200, building: 'Fish Marketplace', price: 400, shortcut: 'fs', storeFrequency: 'rare', requiredLevel: 30},
    'salmon sandwich': {ingredients: {'bread rolls': 1, fish: 2}, duration: 10800, building: 'Fish Marketplace', price: 2200, shortcut: 'ss', storeFrequency: 'rare', requiredLevel: 35, display: 'salmon'},
    silk: {ingredients: {}, duration: 360, building: 'Mulberry Grove', price: 30, shortcut: 'sk', storeFrequency: 'normal', requiredLevel: 25},
    string: {ingredients: {silk: 2}, duration: 1200, building: 'Silk Store', singular: 'string', price: 120, shortcut: 'st', storeFrequency: 'normal', requiredLevel: 25},
    fan: {ingredients: {silk: 2, wood: 1, glue: 2}, duration: 9000, building: 'Silk Store', price: 1100, shortcut: 'fn', storeFrequency: 'rare', requiredLevel: 30},
    robe: {ingredients: {silk: 3, paint: 2, 'home textiles': 1}, duration: 14400, building: 'Silk Store', price: 2000, shortcut: 'ro', storeFrequency: 'rare', requiredLevel: 35},
    'crude oil': {ingredients: {}, duration: 360, building: 'Oil Plant', price: 30, shortcut: 'cd', storeFrequency: 'normal', requiredLevel: 25},
    'motor oil': {ingredients: {'crude oil': 2}, duration: 1200, building: 'Car Parts', price: 120, shortcut: 'mo', storeFrequency: 'normal', requiredLevel: 25},
    'car tires': {ingredients: {'crude oil': 2, glue: 1, nails: 3}, duration: 7200, building: 'Car Parts', price: 950, shortcut: 'ti', storeFrequency: 'rare', requiredLevel: 30},
    'engines': {ingredients: {'electrical components': 1, drills: 1, nails: 3}, duration: 14400, building: 'Car Parts', price: 2000, shortcut: 'en', storeFrequency: 'rare', requiredLevel: 35},
    'tennis rackets': {ingredients: {minerals: 4, hammers: 2}, duration: 2700, building: 'Sports Shop', price: 780, shortcut: 'rk', storeFrequency: 'normal', requiredLevel: 35, display: 'rackets'},
    'sports drink': {ingredients: {'fruit and berries': 2, 'sugar and spices': 4}, duration: 2100, building: 'Sports Shop', price: 270, shortcut: 'sd', storeFrequency: 'normal', requiredLevel: 35},
    'soccer cleats': {ingredients: {shoes: 1, chemicals: 3}, duration: 2100, building: 'Sports Shop', price: 920, shortcut: 'sc', storeFrequency: 'normal', requiredLevel: 35, display: 'cleats'},
    'protein bar': {ingredients: {'cherry cheesecake': 1, 'sugar and spices': 2}, duration: 2430, building: 'Sports Shop', price: 1045, shortcut: 'eb', storeFrequency: 'normal', requiredLevel: 35, display: 'bars'},
    'ping pong table': {ingredients: {tables: 1, minerals: 4, wood: 4}, duration: 5400, building: 'Sports Shop', price: 1245, shortcut: 'pp', storeFrequency: 'normal', requiredLevel: 35},
    'letter blocks': {ingredients: {wood: 4, 'measuring tapes': 1}, duration: 3600, building: 'Toy Shop', price: 360, shortcut: 'lb', storeFrequency: 'normal', requiredLevel: 35, display: 'blocks'},
    'kites': {ingredients: {'home textiles': 2, planks: 2, paint: 2}, duration: 4500, building: 'Toy Shop', price: 1000, shortcut: 'ki', storeFrequency: 'rare', requiredLevel: 35},
    'teddy bears': {ingredients: {'home textiles': 4, plastic: 2}, duration: 3600, building: 'Toy Shop', price: 600, shortcut: 'te', storeFrequency: 'rare', requiredLevel: 35, display: 'bears'},
    'game consoles': {ingredients: {'electrical components': 3, glass: 3, 'lighting systems': 1}, duration: 2240, building: 'Toy Shop', price: 2000, shortcut: 'gc', storeFrequency: 'frequent', requiredLevel: 35, display: 'games'},
    'wool shirts': {ingredients: {textiles: 4, 'measuring tapes': 2, paint: 2}, duration: 4500, building: 'Country Store', price: 1700, shortcut: 'ws', storeFrequency: 'frequent', requiredLevel: 35},
    'picnic baskets': {ingredients: {'fruit and berries': 4, textiles: 4, glue: 2}, duration: 3600, building: 'Country Store', price: 6000, shortcut: 'pb', storeFrequency: 'frequent', requiredLevel: 35},
    'wrought iron': {ingredients: {metal: 4, hammers: 2, chemicals: 2}, duration: 1800, building: 'Restoration', price: 560, shortcut: 'wi', storeFrequency: 'frequent', requiredLevel: 35},
    'carved wood': {ingredients: {planks: 5, 'measuring tapes': 2, drills: 2}, duration: 3600, building: 'Restoration', price: 2800, shortcut: 'cw', storeFrequency: 'frequent', requiredLevel: 35},
    'chiseled stone': {ingredients: {hammers: 2, minerals: 6, drills: 2}, duration: 9000, building: 'Restoration', price: 2300, shortcut: 'cs', storeFrequency: 'frequent', requiredLevel: 35},
    'tapestry': {ingredients: {textiles: 4, glue: 2, paint: 2}, duration: 12600, building: 'Restoration', price: 2560, shortcut: 'ty', storeFrequency: 'normal', requiredLevel: 67},
    'tiramisu': {ingredients: {vegetables: 1, 'sugar and spices': 1, cream: 1}, duration: 2700, building: 'Dessert Shop', price: 1250, shortcut: 'tm', storeFrequency: 'normal', requiredLevel: 35},
    'churros': {ingredients: {flour: 2, 'cooking utensils': 1}, duration: 2100, building: 'Dessert Shop', price: 1750, shortcut: 'cu', storeFrequency: 'normal', requiredLevel: 62},
}

export function updateSettings(oldSettings) {
    const newSettings = {...oldSettings}
    newSettings.buildings = updateBuildingSettings(newSettings['level'], newSettings.buildings)
    newSettings.goods = updateGoodSettings(newSettings['level'], newSettings.buildings, newSettings.goods)
    return newSettings
}

function updateBuildingSettings(level, currentSettings) {
    let buildings = Object.keys(buildingData)
    buildings.sort()
    let newBuildingSettings = {}
    buildings.forEach(building => {
        let data = {...buildingData[building]}
        if (currentSettings[building]) {
            data = {...currentSettings[building]}
        }
        if (data.requiredLevel <= level) {
            newBuildingSettings[building] = data
        }
    })
    return newBuildingSettings
}

function updateGoodSettings(level, buildingData, goodsSettings) {
    let goods = Object.keys(goodsData)
    goods.sort()
    let newGoodsSettings = {}
    goods.forEach(good => {
        let goodData = {...goodsData[good]}
        if (goodsSettings[good]) {
            goodData = {...goodsSettings[good]}
        } else {
            goodData['stockAmount'] = 0
        }
        if (buildingData[goodData.building] && buildingData[goodData.building].haveBuilding && goodData.requiredLevel <= level) {
            let multiplier = 1
            if (buildingData[goodData.building].level > 0) {
                multiplier -= .05 + .05 * buildingData[goodData.building].level
            }
            newGoodsSettings[good] = goodData
            goodData['duration'] = multiplier * goodsData[good].duration
        } else if (goodsSettings[good]) {
            newGoodsSettings[good] = {...goodsSettings[good]}
        }
    })
    return newGoodsSettings
}

export function renderGoodsSettings(name, level, buildingSettings, goodSettings, updateCallback) {
    const building = goodSettings['building']
    if (buildingSettings[building]['haveBuilding'] && level >= goodSettings.requiredLevel) {
        return <EditableNumber key={name} value={goodSettings['stockAmount']} name={name} updateCallback={updateCallback} />
    } else {
        return ''
    }
}

export function deepCopy(source) {
    if (!Array.isArray(source) && typeof source !== 'object') {
        return source
    }
    let copyResult = {}
    if (Array.isArray(source)) {
        copyResult = []
        for (let i = 0; i < source.length; i += 1) {
            copyResult[i] = deepCopy(source[i])
        }
    } else {
        Object.keys(source).forEach(key => {
            copyResult[key] = deepCopy(source[key])
        })
    }
    return copyResult
}
