const goods = {
    metal: {ingredients: {}, duration: 60, building: 'Factory', prices: [7, 10]},
    wood: {ingredients: {}, duration: 180, building: 'Factory', prices: [15, 20]},
    plastic: {ingredients: {}, duration: 540, building: 'Factory', prices: [18, 25]},
    seeds: {ingredients: {}, duration: 1200, building: 'Factory', prices: [22, 30]},
    minerals: {ingredients: {}, duration: 1800, building: 'Factory', prices: [30, 40]},
    chemicals: {ingredients: {}, duration: 7200, building: 'Factory', prices: [45, 60]},
    'toilet paper rolls': {ingredients: {}, duration: 10800, building: 'Factory', prices: [65, 90]},
    'sugar&spices': {ingredients: {}, duration: 14400, building: 'Factory', prices: [82, 110]},
    glass: {ingredients: {}, duration: 18000, singular: 'glass', building: 'Factory', prices: [90, 120]},
    'animal feed': {ingredients: {}, duration: 21600, building: 'Factory', prices: [105, 140]},
    'electrical components': {ingredients: {}, duration: 25200, building: 'Factory', prices: [120, 160]},
    vegetables: {ingredients: {seeds: 2}, duration: 1080, building: 'Farmer\'s Market', prices: [120, 160]},
    flour: {ingredients: {seeds: 2, 'toilet paper rolls': 2}, duration: 1620, building: 'Farmer\'s Market', prices: [427, 570]},
    fruit: {ingredients: {seeds: 2, trees: 1}, duration: 4860, building: 'Farmer\'s Market', prices: [547, 730]},
    cream: {ingredients: {'animal feed': 1}, duration: 4020, building: 'Farmer\'s Market', prices: [330, 440]},
    corn: {ingredients: {'minerals': 1, seeds: 4}, duration: 3240, building: 'Farmer\'s Market', prices: [210, 280]},
    cheese: {ingredients: {'animal feed': 2}, duration: 5640, building: 'Farmer\'s Market', prices: [495, 660]},
    beef: {ingredients: {'animal feed': 3}, duration: 8100, building: 'Farmer\'s Market', prices: [645, 860]},
    nails: {ingredients: {metal: 2}, duration: 270, building: 'Building Supplies Store', prices: [60, 80]},
    'wood planks': {ingredients: {wood: 2}, duration: 1620, building: 'Building Supplies Store', prices: [90, 120]},
    bricks: {ingredients: {minerals: 2}, duration: 1080, building: 'Building Supplies Store', prices: [142, 190]},
    cement: {ingredients: {minerals: 2, chemicals: 1}, duration: 2700, building: 'Building Supplies Store', prices: [330, 440]},
    glue: {ingredients: {plastic: 1, chemicals: 2}, duration: 3240, building: 'Building Supplies Store', prices: [330, 440]},
    paint: {ingredients: {metal: 2, minerals: 1, chemicals: 2}, duration: 3240, building: 'Building Supplies Store', prices: [240, 320]},
    hammers: {ingredients: {metal: 1, wood: 1}, duration: 756, building: 'Hardware Store', prices: [67, 90]},
    'measuring tapes': {ingredients: {plastic: 1, metal: 1}, duration: 1080, building: 'Hardware Store', prices: [82, 110]},
    shovels: {ingredients: {plastic: 1, metal: 1, wood: 1}, duration: 1620, building: 'Hardware Store', prices: [112, 150]},
    utensils: {ingredients: {plastic: 2, metal: 2, wood: 2}, duration: 2430, building: 'Hardware Store', prices: [187, 250]},
    ladders: {ingredients: {metal: 2, 'wood planks': 2}, duration: 3240, building: 'Hardware Store', prices: [315, 420]},
    drills: {ingredients: {metal: 2, plastic: 2, 'electrical components': 1}, duration: 6480, building: 'Hardware Store', prices: [442, 590]},
    'baseball caps': {ingredients: {'toilet paper rolls': 2, 'measuring tapes': 1}, duration: 3240, building: 'Fashion Store', prices: [450, 600]},
    'red shoes': {ingredients: {plastic: 1, glue: 1, 'toilet paper rolls': 1}, duration: 4020, building: 'Fashion Store', prices: [735, 980]},
    watches: {singular: 'watch', ingredients: {plastic: 2, glass: 1, chemicals: 1}, duration: 4860, building: 'Fashion Store', prices: [435, 580]},
    'business suits': {ingredients: {'toilet paper rolls': 3, 'measuring tapes': 1, 'glue': 1}, duration: 11340, building: 'Fashion Store', prices: [877, 1170]},
    'backpacks': {ingredients: {'toilet paper rolls': 2, plastic: 2, 'measuring tapes': 1}, duration: 8100, building: 'Fashion Store', prices: [322, 430]},
    chairs: {ingredients: {nails: 1, hammers: 1, wood: 2}, duration: 1080, building: 'Furniture Store', prices: [225, 300]},
    tables: {ingredients: {'wood planks': 1, nails: 2, hammers: 1}, duration: 1620, building: 'Furniture Store', prices: [375, 500]},
    'kitchen/bathroom tiles': {ingredients: {'toilet paper rolls': 2, 'measuring tapes': 1}, duration: 4020, building: 'Furniture Store', prices: [457, 610]},
    cupboards: {ingredients: {'wood planks': 2, 'glass': 2, 'paint': 1}, duration: 2430, building: 'Furniture Store', prices: [675, 900]},
    couches: {singular: 'couch', ingredients: {'toilet paper rolls': 3, drills: 1, glue: 1}, duration: 8100, building: 'Furniture Store', prices: [1357, 1810]},
    grass: {'singular': 'grass', ingredients: {seeds: 1, 'shovels': 1}, duration: 1620, building: 'Gardening Supplies', prices: [200, 310]},
    trees: {ingredients: {seeds: 2, shovels: 1}, duration: 4860, building: 'Gardening Supplies', prices: [315, 420]},
    'outdoor furniture': {ingredients: {plastic: 2, 'toilet paper rolls': 2, 'wood planks': 2}, duration: 7260, building: 'Gardening Supplies', prices: [615, 820]},
    'fire pits': {ingredients: {bricks: 2, shovels: 1, cement: 2}, duration: 12960, building: 'Gardening Supplies', prices: [1305, 1740]},
    'lawnmowers': {ingredients: {metal: 3, paint: 1, 'electrical components': 1}, duration: 6480, building: 'Gardening Supplies', prices: [630, 840]},
    'gnomes': {ingredients: {cement: 2, glue: 1}, duration: 4860, building: 'Gardening Supplies', prices: [1200, 1600]},
    donuts: {ingredients: {flour: 1, 'sugar&spices': 1}, duration: 2430, building: 'Donut Shop', prices: [712, 950]},
    'smoothies': {ingredients: {vegetables: 1, fruit: 1}, duration: 1620, building: 'Donut Shop', prices: [862, 1150]},
    'bread rolls': {ingredients: {flour: 2, cream: 1}, duration: 3240, building: 'Donut Shop', prices: [1380, 1840]},
    'cherry cheesecake slices': {ingredients: {flour: 1, fruit: 1, cheese: 1}, duration: 4860, building: 'Donut Shop', prices: [1680, 2240]},
    'frozen yogurts': {ingredients: {fruit: 1, cream: 1, 'sugar&spices': 1}, duration: 12960, building: 'Donut Shop', prices: [1312, 1750]},
    coffees: {ingredients: {cream: 1, seeds: 2, 'sugar&spices': 1}, duration: 3240, building: 'Donut Shop', prices: [562, 750]},
    fabric: {ingredients: {}, duration: 360, building: 'Green Factory', prices: [22, 30]},
    'ice cream sandwiches': {'singular': 'ice cream sandwich', ingredients: {'bread rolls': 1, cream: 1}, 'duration': 840, building: 'Fast Food Restaurant', prices: [1920, 2560]},
    pizzas: {ingredients: {flour: 1, cheese: 1, beef: 1}, duration: 1440, building: 'Fast Food Restaurant', prices: [1920, 2560]},
    cheeseburgers: {ingredients: {beef: 1, 'bread rolls': 1, 'BBQ Grills': 1}, duration: 2100, building: 'Fast Food Restaurant', prices: [2715, 3620]},
    'cheese fries': {ingredients: {cheese: 1, vegetables: 1}, duration: 1200, building: 'Fast Food Restaurant', prices: [787, 1050]},
    'reusable bags': {ingredients: {fabric: 2}, duration: 1200, building: 'Eco Shop', prices: [90, 120]},
    'electric shoes': {ingredients: {fabric: 2, glue: 1, 'measuring tapes': 1}, duration: 7200, building: 'Eco Shop', prices: [562, 750]},
    'yoga mats': {ingredients: {fabric: 3, 'kitchen/bathroom tiles': 2, paint: 1}, duration: 14400, building: 'Eco Shop', prices: [1500, 2000]},
    'BBQ Grills': {ingredients: {metal: 3, utensils: 1}, duration: 9900, building: 'Home Appliances', prices: [397, 530]},
    refrigerators: {ingredients: {plastic: 2, chemicals: 2, 'electrical components': 2}, duration: 12600, building: 'Home Appliances', prices: [795, 1060]},
    'light bulbs': {ingredients: {chemicals: 1, 'electrical components': 1, glass: 1}, duration:6300, building: 'Home Appliances', prices: [667, 890]}
 } ;

export default goods;
