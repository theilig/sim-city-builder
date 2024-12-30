const maxPairs = (available, used) => {
    available.sort((a, b) => a - b)
    used.sort((a, b) => a - b)
    let i = 0
    let j = 0
    let pairs = 0
    while (i < available.length && j < used.length) {
        if (available[i] <= used[j]) {
            if (available[i] === 0) {
                pairs += 1
            }
            i += 1
            j += 1
        } else {
            i += 1
        }
    }
    return pairs
}

export function getExtras(recommendations) {
    let goodsAvailable = {}
    let goodsUsed = {}
    recommendations.forEach(op => {
        op.storageUsed.forEach(item => {
            if (goodsUsed[item.good] === undefined) {
                goodsUsed[item.good] = []
            }
            if (goodsAvailable[item.good] === undefined) {
                goodsAvailable[item.good] = []
            }
            for (let i=0; i<item.amount; i+=1) {
                goodsUsed[item.good].push(op.waitUntil || 0)
                goodsAvailable[item.good].push(0)
            }
        })
        op.children.forEach(child => {
            if (goodsUsed[child.good] === undefined) {
                goodsUsed[child.good] = []
            }

            goodsUsed[child.good].push(op.waitUntil || 0)
        })

        if (goodsAvailable[op.good] === undefined) {
            goodsAvailable[op.good] = []
        }
        goodsAvailable[op.good].push(op.start + op.duration)
    })
    let extraGoods = {}
    let goods = Object.keys(goodsUsed)
    goods.forEach(good => {
        if (goodsAvailable[good] !== undefined) {
            extraGoods[good] = maxPairs(goodsAvailable[good], goodsUsed[good])
        }
    })
    return extraGoods
}
