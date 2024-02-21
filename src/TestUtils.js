import {localStorageMock} from "./LocalStorageMock";
import {unmountComponentAtNode} from "react-dom";

export function testSetUp() {
    let container = null
    Object.defineProperty(window, "localStorage", { value: localStorageMock });

    beforeEach(() => {
        // set up a DOM element as a render target
        container = document.createElement("div");
        document.body.appendChild(container);
    });

    afterEach(() => {
        // cleanup on exiting
        unmountComponentAtNode(container);
        container.remove();
        container = null;
    });
    return container
}

export function createCity() {
    return {
        "buildings": {
            "Building Supplies Store": {
                "pipelineSize": 3,
                "haveBuilding": true,
                "isParallel": false,
                "requiredLevel": 1,
                "level": 0
            },
            "Car Parts": {
                "pipelineSize": 3,
                "haveBuilding": false,
                "isParallel": false,
                "requiredLevel": 25
            },
            "Chocolate Factory": {
                "pipelineSize": 3,
                "haveBuilding": false,
                "isParallel": false,
                "requiredLevel": 6
            },
            "Coconut Farm": {
                "slots": 5,
                "haveBuilding": false,
                "isParallel": true,
                "requiredLevel": 25
            },
            "Donut Shop": {
                "pipelineSize": 3,
                "haveBuilding": true,
                "isParallel": false,
                "requiredLevel": 18
            },
            "Eco Shop": {
                "pipelineSize": 3,
                "haveBuilding": false,
                "isParallel": false,
                "requiredLevel": 25
            },
            "Factory": {
                "slots": 30,
                "haveBuilding": true,
                "isParallel": true,
                "requiredLevel": 1
            },
            "Farmer's Market": {
                "pipelineSize": 3,
                "haveBuilding": true,
                "isParallel": false,
                "requiredLevel": 8,
                "level": 0
            },
            "Fashion Store": {
                "pipelineSize": 3,
                "haveBuilding": false,
                "isParallel": false,
                "requiredLevel": 19
            },
            "Fast Food Restaurant": {
                "pipelineSize": 3,
                "haveBuilding": false,
                "isParallel": false,
                "requiredLevel": 25
            },
            "Fish Marketplace": {
                "pipelineSize": 3,
                "haveBuilding": false,
                "isParallel": false,
                "requiredLevel": 25
            },
            "Fishery": {
                "slots": 5,
                "haveBuilding": false,
                "isParallel": true,
                "requiredLevel": 25
            },
            "Furniture Store": {
                "pipelineSize": 3,
                "haveBuilding": true,
                "isParallel": false,
                "requiredLevel": 10,
                "level": 0
            },
            "Gardening Supplies": {
                "pipelineSize": 3,
                "haveBuilding": true,
                "isParallel": false,
                "requiredLevel": 14,
                "level": 0
            },
            "Green Factory": {
                "slots": 5,
                "haveBuilding": true,
                "isParallel": true,
                "requiredLevel": 25
            },
            "Hardware Store": {
                "pipelineSize": 3,
                "haveBuilding": true,
                "isParallel": false,
                "requiredLevel": 4,
                "level": 0
            },
            "Home Appliances": {
                "pipelineSize": 3,
                "haveBuilding": false,
                "isParallel": false,
                "requiredLevel": 29
            },
            "Mulberry Grove": {
                "slots": 5,
                "haveBuilding": false,
                "isParallel": true,
                "requiredLevel": 25
            },
            "Oil Plant": {
                "slots": 5,
                "haveBuilding": false,
                "isParallel": true,
                "requiredLevel": 25
            },
            "Silk Store": {
                "pipelineSize": 3,
                "haveBuilding": false,
                "isParallel": false,
                "requiredLevel": 25
            },
            "Tropical Products Store": {
                "pipelineSize": 3,
                "haveBuilding": true,
                "isParallel": false,
                "requiredLevel": 25
            },
            "Vu's Random Generator": {
                "pipelineSize": 3,
                "haveBuilding": true,
                "isParallel": false,
                "requiredLevel": 1,
                "currentBuilding": "Building Supplies Store"
            },
            'Toy Shop': {
                "pipelineSize": 3,
                "haveBuilding": true,
                "isParallel": false,
                "requiredLevel": 25,
            },
            'Sports Shop': {
                "pipelineSize": 3,
                "haveBuilding": true,
                "isParallel": false,
                "requiredLevel": 25,
            }
        },
        "goods": {
            "bricks": {
                "ingredients": {
                    "minerals": 2
                },
                "duration": 1200,
                "building": "Building Supplies Store",
                "price": 190,
                "shortcut": "bk",
                "storeFrequency": 1,
                "requiredLevel": 13,
                "stockAmount": 3
            },
            "cement": {
                "ingredients": {
                    "minerals": 2,
                    "chemicals": 1
                },
                "duration": 3000,
                "building": "Building Supplies Store",
                "price": 440,
                "shortcut": "ce",
                "storeFrequency": 1,
                "requiredLevel": 14,
                "stockAmount": 0
            },
            "chairs": {
                "ingredients": {
                    "nails": 1,
                    "hammers": 1,
                    "wood": 2
                },
                "duration": 1200,
                "building": "Furniture Store",
                "price": 300,
                "shortcut": "cr",
                "storeFrequency": 1,
                "requiredLevel": 10,
                "stockAmount": 0
            },
            "chemicals": {
                "ingredients": {},
                "duration": 7200,
                "building": "Factory",
                "price": 60,
                "shortcut": "cm",
                "storeFrequency": 4,
                "requiredLevel": 13,
                "stockAmount": 0
            },
            "glue": {
                "ingredients": {
                    "plastic": 1,
                    "chemicals": 2
                },
                "duration": 3600,
                "building": "Building Supplies Store",
                "price": 440,
                "shortcut": "gl",
                "storeFrequency": 1,
                "requiredLevel": 15,
                "stockAmount": 0
            },
            "grass": {
                "singular": "grass",
                "ingredients": {
                    "seeds": 1,
                    "shovels": 1
                },
                "duration": 1800,
                "building": "Gardening Supplies",
                "price": 310,
                "shortcut": "gr",
                "storeFrequency": 1,
                "requiredLevel": 14,
                "stockAmount": 0
            },
            "hammers": {
                "ingredients": {
                    "metal": 1,
                    "wood": 1
                },
                "duration": 840,
                "building": "Hardware Store",
                "price": 90,
                "shortcut": "hm",
                "storeFrequency": 1,
                "requiredLevel": 4,
                "stockAmount": 0
            },
            "measuring tapes": {
                "ingredients": {
                    "plastic": 1,
                    "metal": 1
                },
                "duration": 1200,
                "building": "Hardware Store",
                "price": 110,
                "shortcut": "mt",
                "storeFrequency": 1,
                "requiredLevel": 6,
                "stockAmount": 0
            },
            "metal": {
                "ingredients": {},
                "duration": 60,
                "building": "Factory",
                "price": 10,
                "shortcut": "ml",
                "storeFrequency": 5,
                "requiredLevel": 1,
                "stockAmount": 4
            },
            "minerals": {
                "ingredients": {},
                "duration": 1800,
                "building": "Factory",
                "price": 40,
                "shortcut": "mn",
                "storeFrequency": 4,
                "requiredLevel": 11,
                "stockAmount": 0
            },
            "nails": {
                "ingredients": {
                    "metal": 2
                },
                "duration": 300,
                "building": "Building Supplies Store",
                "price": 80,
                "shortcut": "nl",
                "storeFrequency": 2,
                "requiredLevel": 1,
                "stockAmount": 0
            },
            "planks": {
                "ingredients": {
                    "wood": 2
                },
                "duration": 1800,
                "building": "Building Supplies Store",
                "price": 120,
                "shortcut": "wp",
                "storeFrequency": 1,
                "requiredLevel": 3,
                "stockAmount": 0
            },
            "plastic": {
                "ingredients": {},
                "duration": 540,
                "building": "Factory",
                "price": 25,
                "shortcut": "pl",
                "storeFrequency": 4,
                "requiredLevel": 5,
                "stockAmount": 0
            },
            "seeds": {
                "ingredients": {},
                "duration": 1200,
                "building": "Factory",
                "price": 30,
                "shortcut": "sd",
                "storeFrequency": 4,
                "requiredLevel": 7,
                "stockAmount": 0
            },
            "shovels": {
                "ingredients": {
                    "plastic": 1,
                    "metal": 1,
                    "wood": 1
                },
                "duration": 1800,
                "building": "Hardware Store",
                "price": 150,
                "shortcut": "sh",
                "storeFrequency": 0,
                "requiredLevel": 9,
                "stockAmount": 0
            },
            "textiles": {
                "ingredients": {},
                "duration": 10800,
                "building": "Factory",
                "price": 90,
                "shortcut": "tp",
                "storeFrequency": 4,
                "requiredLevel": 15,
                "stockAmount": 0
            },
            "vegetables": {
                "ingredients": {
                    "seeds": 2
                },
                "duration": 1200,
                "building": "Farmer's Market",
                "price": 160,
                "shortcut": "vg",
                "storeFrequency": 1,
                "requiredLevel": 8,
                "stockAmount": 0
            },
            "wood": {
                "ingredients": {},
                "duration": 180,
                "building": "Factory",
                "price": 20,
                "shortcut": "wd",
                "storeFrequency": 5,
                "requiredLevel": 2,
                "stockAmount": 0
            }
        },
        "groups": [],
        "level": 40
    }
}
