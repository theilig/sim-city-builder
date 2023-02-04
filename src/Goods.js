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
    'electrical components': {ingredients: {}, duration: 25200, building: 'Factory'},
    vegetables: {ingredients: {seeds: 2}, duration: 1080, building: 'Farmer\'s Market'},
    flour: {ingredients: {seeds: 2, 'toilet paper rolls': 2}, duration: 1620, building: 'Farmer\'s Market'},
    fruit: {ingredients: {seeds: 2, trees: 1}, duration: 4860, building: 'Farmer\'s Market'},
    cream: {ingredients: {'animal feed': 1}, duration: 4020, building: 'Farmer\'s Market'},
    corn: {ingredients: {'minerals': 1, seeds: 4}, duration: 3240, building: 'Farmer\'s Market'},
    cheese: {ingredients: {'animal feed': 2}, duration: 5640, building: 'Farmer\'s Market'},
    beef: {ingredients: {'animal feed': 3}, duration: 8100, building: 'Farmer\'s Market'},
    nails: {ingredients: {metal: 2}, duration: 270, building: 'Building Supplies Store'},
    'wood planks': {ingredients: {wood: 2}, duration: 1620, building: 'Building Supplies Store'},
    bricks: {ingredients: {minerals: 2}, duration: 1080, building: 'Building Supplies Store'},
    cement: {ingredients: {minerals: 2, chemicals: 1}, duration: 2700, building: 'Building Supplies Store'},
    glue: {ingredients: {plastic: 1, chemicals: 2}, duration: 3240, building: 'Building Supplies Store'},
    paint: {ingredients: {metal: 2, minerals: 1, chemicals: 2}, duration: 3240, building: 'Building Supplies Store'},
    hammers: {ingredients: {metal: 1, wood: 1}, duration: 756, building: 'Hardware Store'},
    'measuring tapes': {ingredients: {plastic: 1, metal: 1}, duration: 1080, building: 'Hardware Store'},
    shovels: {ingredients: {plastic: 1, metal: 1, wood: 1}, duration: 1620, building: 'Hardware Store'},
    utensils: {ingredients: {plastic: 2, metal: 2, wood: 2}, duration: 2430, building: 'Hardware Store'},
    ladders: {ingredients: {metal: 2, 'wood planks': 2}, duration: 3240, building: 'Hardware Store'},
    drills: {ingredients: {metal: 2, plastic: 2, 'electrical components': 1}, duration: 6480, building: 'Hardware Store'},
    'baseball caps': {ingredients: {'toilet paper rolls': 2, 'measuring tapes': 1}, duration: 3600, building: 'Fashion Store'},
    'red shoes': {ingredients: {plastic: 1, glue: 1, 'toilet paper rolls': 1}, duration: 4500, building: 'Fashion Store'},
    watches: {singular: 'watch', ingredients: {plastic: 2, glass: 1, chemicals: 1}, duration: 5400, building: 'Fashion Store'},
    chairs: {ingredients: {nails: 1, hammers: 1, wood: 2}, duration: 1080, building: 'Furniture Store'},
    tables: {ingredients: {'wood planks': 1, nails: 2, hammers: 1}, duration: 1620, building: 'Furniture Store'},
    'kitchen/bathroom tiles': {ingredients: {'toilet paper rolls': 2, 'measuring tapes': 2}, duration: 4020, building: 'Furniture Store'},
    cupboard: {ingredients: {'wood planks': 2, 'glass': 2, 'paint': 1}, duration: 2430, building: 'Furniture Store'},
    grass: {'singular': 'grass', ingredients: {seeds: 1, 'shovels': 1}, duration: 1620, building: 'Gardening Supplies'},
    trees: {ingredients: {seeds: 2, shovels: 1}, duration: 4860, building: 'Gardening Supplies'},
    'outdoor furniture': {ingredients: {plastic: 2, 'toilet paper rolls': 2, 'wood planks': 2}, duration: 7260, building: 'Gardening Supplies'},
    'fire pits': {ingredients: {bricks: 2, shovels: 1, cement: 2}, duration: 12960, building: 'Gardening Supplies'},
    'lawnmowers': {ingredients: {metal: 3, paint: 1, 'electrical components': 1}, duration: 6480, building: 'Gardening Supplies'},
    donuts: {ingredients: {flour: 1, 'sugar&spices': 1}, duration: 2700, building: 'Donut Shop'},
    'smoothies': {ingredients: {vegetables: 1, fruit: 1}, duration: 1800, building: 'Donut Shop'},
    'bread rolls': {ingredients: {flour: 2, cream: 1}, duration: 3600, building: 'Donut Shop'},
    'cherry cheesecake slices': {ingredients: {flour: 1, fruit: 1, cheese: 1}, duration: 5400, building: 'Donut Shop'},
    'frozen yogurts': {ingredients: {fruit: 1, cream: 1, 'sugar&spices': 1}, duration: 14400, building: 'Donut Shop'},
    fabric: {ingredients: {}, duration: 360, building: 'Green Factory'},
    'ice cream sandwiches': {'singular': 'ice cream sandwich', ingredients: {'bread rolls': 1, cream: 1}, 'duration': 840, building: 'Fast Food Restaurant'},
    pizzas: {ingredients: {flour: 1, cheese: 1, beef: 1}, duration: 1440, building: 'Fast Food Restaurant'},
    cheeseburgers: {ingredients: {beef: 1, 'bread rolls': 1, 'BBQ grills': 1}, duration: 2100, building: 'Fast Food Restaurant'},
    'reusable bags': {ingredients: {fabric: 2}, duration: 1200, building: 'Eco Shop'},
    'electric shoes': {ingredients: {fabric: 2, glue: 1, 'measuring tapes': 1}, duration: 7200, building: 'Eco Shop'},
    'BBQ Grills': {ingredients: {metal: 3, utensils: 1}, duration: 9900, building: 'Home Appliances'}
 } ;

export default goods;
