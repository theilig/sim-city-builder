const goods = {
    metal: {ingredients: {}, duration: 60, building: 'Factory', prices: [7, 10], shortcut: 'ml', storeFrequency: 5},
    wood: {ingredients: {}, duration: 180, building: 'Factory', prices: [15, 20], shortcut: 'wd', storeFrequency: 5},
    plastic: {ingredients: {}, duration: 540, building: 'Factory', prices: [18, 25], shortcut: 'pl', storeFrequency: 4},
    seeds: {ingredients: {}, duration: 1200, building: 'Factory', prices: [22, 30], shortcut: 'sd', storeFrequency: 4},
    minerals: {ingredients: {}, duration: 1800, building: 'Factory', prices: [30, 40], shortcut: 'mn', storeFrequency: 4},
    chemicals: {ingredients: {}, duration: 7200, building: 'Factory', prices: [45, 60], shortcut: 'cm', storeFrequency: 4},
    'toilet paper rolls': {ingredients: {}, duration: 10800, building: 'Factory', prices: [65, 90], shortcut: 'tp', storeFrequency: 4},
    'sugar&spices': {ingredients: {}, duration: 14400, building: 'Factory', prices: [82, 110], shortcut: 'su', storeFrequency: 5},
    glass: {ingredients: {}, duration: 18000, singular: 'glass', building: 'Factory', prices: [90, 120], shortcut: 'gs', storeFrequency: 4},
    'animal feed': {ingredients: {}, duration: 21600, building: 'Factory', prices: [105, 140], shortcut: 'af', storeFrequency: 2},
    'electrical components': {ingredients: {}, duration: 25200, building: 'Factory', prices: [120, 160], shortcut: 'ec', storeFrequency: 2},
    vegetables: {ingredients: {seeds: 2}, duration: 960, building: 'Farmer\'s Market', prices: [120, 160], shortcut: 'vg', storeFrequency: 1},
    flour: {ingredients: {seeds: 2, 'toilet paper rolls': 2}, duration: 1440, building: 'Farmer\'s Market', prices: [427, 570], shortcut: 'fl', storeFrequency: 0},
    fruit: {ingredients: {seeds: 2, trees: 1}, duration: 4320, building: 'Farmer\'s Market', prices: [547, 730], shortcut: 'ft', storeFrequency: 0},
    cream: {ingredients: {'animal feed': 1}, duration: 3600, building: 'Farmer\'s Market', prices: [330, 440], shortcut: 'ca', storeFrequency: 1},
    corn: {ingredients: {'minerals': 1, seeds: 4}, duration: 2880, building: 'Farmer\'s Market', prices: [210, 280], shortcut: 'cn', storeFrequency: 0},
    cheese: {ingredients: {'animal feed': 2}, duration: 5040, building: 'Farmer\'s Market', prices: [495, 660], shortcut: 'cz', storeFrequency: 1},
    beef: {ingredients: {'animal feed': 3}, duration: 7200, building: 'Farmer\'s Market', prices: [645, 860], shortcut: 'bf', storeFrequency: 1},
    nails: {ingredients: {metal: 2}, duration: 240, building: 'Building Supplies Store', prices: [60, 80], shortcut: 'nl', storeFrequency: 2},
    'wood planks': {ingredients: {wood: 2}, duration: 1440, building: 'Building Supplies Store', prices: [90, 120], shortcut: 'wp', storeFrequency: 1},
    bricks: {ingredients: {minerals: 2}, duration: 960, building: 'Building Supplies Store', prices: [142, 190], shortcut: 'bk', storeFrequency: 1},
    cement: {ingredients: {minerals: 2, chemicals: 1}, duration: 2400, building: 'Building Supplies Store', prices: [330, 440], shortcut: 'ce', storeFrequency: 1},
    glue: {ingredients: {plastic: 1, chemicals: 2}, duration: 2880, building: 'Building Supplies Store', prices: [330, 440], shortcut: 'gl', storeFrequency: 1},
    paint: {ingredients: {metal: 2, minerals: 1, chemicals: 2}, duration: 2880, building: 'Building Supplies Store', prices: [240, 320], shortcut: 'pt', storeFrequency: 0},
    hammers: {ingredients: {metal: 1, wood: 1}, duration: 714, building: 'Hardware Store', prices: [67, 90], shortcut: 'hm', storeFrequency: 1},
    'measuring tapes': {ingredients: {plastic: 1, metal: 1}, duration: 1020, building: 'Hardware Store', prices: [82, 110], shortcut: 'mt', storeFrequency: 1},
    shovels: {ingredients: {plastic: 1, metal: 1, wood: 1}, duration: 1530, building: 'Hardware Store', prices: [112, 150], shortcut: 'sh', storeFrequency: 0},
    utensils: {ingredients: {plastic: 2, metal: 2, wood: 2}, duration: 2295, building: 'Hardware Store', prices: [187, 250], shortcut: 'ut', storeFrequency: 1},
    ladders: {ingredients: {metal: 2, 'wood planks': 2}, duration: 3060, building: 'Hardware Store', prices: [315, 420], shortcut: 'ld', storeFrequency: 0},
    drills: {ingredients: {metal: 2, plastic: 2, 'electrical components': 1}, duration: 6120, building: 'Hardware Store', prices: [442, 590], shortcut: 'dr', storeFrequency: 1},
    'baseball caps': {ingredients: {'toilet paper rolls': 2, 'measuring tapes': 1}, duration: 3240, building: 'Fashion Store', prices: [450, 600], shortcut: 'bc', storeFrequency: 1},
    'red shoes': {ingredients: {plastic: 1, glue: 1, 'toilet paper rolls': 2}, duration: 4020, building: 'Fashion Store', prices: [735, 980], shortcut: 'rs', storeFrequency: 1},
    watches: {singular: 'watch', ingredients: {plastic: 2, glass: 1, chemicals: 1}, duration: 4860, building: 'Fashion Store', prices: [435, 580], shortcut: 'wt', storeFrequency: 1},
    'business suits': {ingredients: {'toilet paper rolls': 3, 'measuring tapes': 1, 'glue': 1}, duration: 11340, building: 'Fashion Store', prices: [877, 1170], shortcut: 'bs', storeFrequency: 3},
    'backpacks': {ingredients: {'toilet paper rolls': 2, plastic: 2, 'measuring tapes': 1}, duration: 8100, building: 'Fashion Store', prices: [322, 430], shortcut: 'bp', storeFrequency: 1},
    chairs: {ingredients: {nails: 1, hammers: 1, wood: 2}, duration: 1080, building: 'Furniture Store', prices: [225, 300], shortcut: 'cr', storeFrequency: 1},
    tables: {ingredients: {'wood planks': 1, nails: 2, hammers: 1}, duration: 1620, building: 'Furniture Store', prices: [375, 500], shortcut: 'tb', storeFrequency: 1},
    'kitchen/bathroom tiles': {ingredients: {'toilet paper rolls': 2, 'measuring tapes': 1}, duration: 4020, building: 'Furniture Store', prices: [457, 610], shortcut: 'tl', storeFrequency: 1},
    cupboards: {ingredients: {'wood planks': 2, 'glass': 2, 'paint': 1}, duration: 2430, building: 'Furniture Store', prices: [675, 900], shortcut: 'cp', storeFrequency: 0},
    couches: {singular: 'couch', ingredients: {'toilet paper rolls': 3, drills: 1, glue: 1}, duration: 8100, building: 'Furniture Store', prices: [1357, 1810], shortcut: 'ch', storeFrequency: 3},
    grass: {'singular': 'grass', ingredients: {seeds: 1, 'shovels': 1}, duration: 1620, building: 'Gardening Supplies', prices: [200, 310], shortcut: 'gr', storeFrequency: 1},
    trees: {ingredients: {seeds: 2, shovels: 1}, duration: 4860, building: 'Gardening Supplies', prices: [315, 420], shortcut: 'tr', storeFrequency: 0},
    'outdoor furniture': {ingredients: {plastic: 2, 'toilet paper rolls': 2, 'wood planks': 2}, duration: 7260, building: 'Gardening Supplies', prices: [615, 820], shortcut: 'of', storeFrequency: 0},
    'fire pits': {ingredients: {bricks: 2, shovels: 1, cement: 2}, duration: 12960, building: 'Gardening Supplies', prices: [1305, 1740], shortcut: 'fp', storeFrequency: 3},
    'lawnmowers': {ingredients: {metal: 3, paint: 1, 'electrical components': 1}, duration: 6480, building: 'Gardening Supplies', prices: [630, 840], shortcut: 'lm', storeFrequency: 1},
    'gnomes': {ingredients: {cement: 2, glue: 1}, duration: 4860, building: 'Gardening Supplies', prices: [1200, 1600], shortcut: 'gn', storeFrequency: 3},
    donuts: {ingredients: {flour: 1, 'sugar&spices': 1}, duration: 2430, building: 'Donut Shop', prices: [712, 950], shortcut: 'dn', storeFrequency: 2},
    'smoothies': {ingredients: {vegetables: 1, fruit: 1}, duration: 1620, building: 'Donut Shop', prices: [862, 1150], shortcut: 'sm', storeFrequency: 1},
    'bread rolls': {ingredients: {flour: 2, cream: 1}, duration: 3240, building: 'Donut Shop', prices: [1380, 1840], shortcut: 'br', storeFrequency: 0},
    'cherry cheesecake slices': {ingredients: {flour: 1, fruit: 1, cheese: 1}, duration: 4860, building: 'Donut Shop', prices: [1680, 2240], shortcut: 'cc', storeFrequency: 3},
    'frozen yogurts': {ingredients: {fruit: 1, cream: 1, 'sugar&spices': 1}, duration: 12960, building: 'Donut Shop', prices: [1312, 1750], shortcut: 'fy', storeFrequency: 3},
    coffees: {ingredients: {cream: 1, seeds: 2, 'sugar&spices': 1}, duration: 3240, building: 'Donut Shop', prices: [562, 750], shortcut: 'co', storeFrequency: 1},
    fabric: {ingredients: {}, duration: 360, building: 'Green Factory', prices: [22, 30], shortcut: 'fb', storeFrequency: 3},
    'ice cream sandwiches': {'singular': 'ice cream sandwich', ingredients: {'bread rolls': 1, cream: 1}, 'duration': 840, building: 'Fast Food Restaurant', prices: [1920, 2560], shortcut: 'ic', storeFrequency: 3},
    pizzas: {ingredients: {flour: 1, cheese: 1, beef: 1}, duration: 1440, building: 'Fast Food Restaurant', prices: [1920, 2560], shortcut: 'pz', storeFrequency: 3},
    cheeseburgers: {ingredients: {beef: 1, 'bread rolls': 1, 'BBQ Grills': 1}, duration: 2100, building: 'Fast Food Restaurant', prices: [2715, 3620], shortcut: 'cb', storeFrequency: 5},
    'cheese fries': {ingredients: {cheese: 1, vegetables: 1}, duration: 1200, building: 'Fast Food Restaurant', prices: [787, 1050], shortcut: 'fr', storeFrequency: 5},
    'lemonades': {ingredients: {glass: 2, 'sugar&spices': 2, fruit: 1}, duration: 3600, building: 'Fast Food Restaurant', prices: [1267, 1690], shortcut: 'ln', storeFrequency: 4},
    'popcorns': {ingredients: {'microwave ovens': 1, corn: 2}, duration: 1620, building: 'Fast Food Restaurant', prices: [937, 1250], shortcut: 'pc', storeFrequency: 0},
    'reusable bags': {ingredients: {fabric: 2}, duration: 1080, building: 'Eco Shop', prices: [90, 120], shortcut: 'rb', storeFrequency: 2},
    'electric shoes': {ingredients: {fabric: 2, glue: 1, 'measuring tapes': 1}, duration: 6480, building: 'Eco Shop', prices: [562, 750], shortcut: 'es', storeFrequency: 0},
    'yoga mats': {ingredients: {fabric: 3, 'kitchen/bathroom tiles': 2, paint: 1}, duration: 12960, building: 'Eco Shop', prices: [1500, 2000], shortcut: 'ym', storeFrequency: 0},
    'BBQ Grills': {ingredients: {metal: 3, utensils: 1}, duration: 9900, building: 'Home Appliances', prices: [397, 530], shortcut: 'bb', storeFrequency: 1},
    refrigerators: {ingredients: {plastic: 2, chemicals: 2, 'electrical components': 2}, duration: 12600, building: 'Home Appliances', prices: [795, 1060], shortcut: 'rf', storeFrequency: 3},
    'lighting systems': {ingredients: {chemicals: 1, 'electrical components': 1, glass: 1}, duration:6300, building: 'Home Appliances', prices: [667, 890], shortcut: 'ls', storeFrequency: 3},
    tvs: {ingredients: {plastic:2, glass: 2, 'electrical components': 2}, duration: 9000, building: 'Home Appliances', prices: [960, 1280], shortcut: 'tv', storeFrequency: 3},
    'microwave ovens': {ingredients: {glass: 1, 'electrical components': 1, metal: 4}, duration: 6480, building: 'Home Appliances', prices: [480, 640], shortcut: 'mo', storeFrequency: 1},
    coconuts: {ingredients: {}, duration: 360, building: 'Coconut Farm', prices: [22, 30], shortcut: 'ct', storeFrequency: 2},
    'coconut oil': {ingredients: {coconuts: 2}, duration: 1200, building: 'Tropical Products Store', prices: [90, 120], shortcut: 'ol', storeFrequency: 1},
    'face cream': {ingredients: {'coconut oil': 2, chemicals: 2}, duration: 5400, building: 'Tropical Products Store', prices: [637, 850], shortcut: 'fc', storeFrequency: 0},
    'tropical drink': {ingredients: {coconuts: 2, fruit: 2, 'sugar&spices': 1}, duration: 15000, building: 'Tropical Products Store', prices: [1800, 2400], shortcut: 'td', storeFrequency: 0},
//    'chocolate bar': {ingredients: {seeds: 2, 'sugar&spices': 1}, duration: 1200, building: 'Chocolate Factory', prices: [140, 187], shortcut: 'ba', storeFrequency: 0},
//    'easter basket': {ingredients: {wood: 1, grass: 1, 'sugar&spices': 1}, duration: 3600, building: 'Chocolate Factory', prices: [280, 340], shortcut: 'eb', storeFrequency: 0},
//    'jelly beans': {ingredients: {glass: 1, 'sugar&spices': 1}, duration: 4500, building: 'Chocolate Factory', prices: [280, 340], shortcut: 'jb', storeFrequency: 0},
//    'chocolate egg': {ingredients: {seeds: 1, 'sugar&spices': 1, cream: 1}, duration: 2700, building: 'Chocolate Factory', prices: [280, 340], shortcut: 'eg', storeFrequency: 0},
//    'fruit cake': {ingredients: {fruit: 1, cream: 1, 'bread rolls': 1}, duration: 7200, building: 'Chocolate Factory', prices: [280, 340], shortcut: 'fk', storeFrequency: 0},
    fish: {ingredients: {}, duration: 360, building: 'Fishery', prices: [22, 30], shortcut: 'fi', storeFrequency: 4},
    'canned fish': {ingredients: {fish: 1, metal: 1}, duration: 1200, building: 'Fish Marketplace', prices: [90, 120], shortcut: 'cf', storeFrequency: 3},
    'fish soup': {ingredients: {vegetables: 1, fish: 2, utensils: 2}, duration: 7200, building: 'Fish Marketplace', prices: [300, 400], shortcut: 'fs', storeFrequency: 0},
    'salmon sandwich': {ingredients: {'bread rolls': 1, fish: 2}, duration: 10800, building: 'Fish Marketplace', prices: [1650, 2200], shortcut: 'ss', storeFrequency: 0}
 };

export default goods;
