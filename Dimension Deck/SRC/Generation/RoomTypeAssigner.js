export default class RoomTypeAssigner {
    constructor(rng) {
        this.rng = rng; // Random Number Generator
    }

    assign(graph, weights) { }

    _weightedRoll(weights) {
        const arrWeights = this.#buildCumalativeTable(weights);
        const randomWeight = this.rng.int(0, 100);

        for (const weight of arrWeights){
            if (randomWeight <= weight.limit) return weight.type;
        }
    }

    #buildCumalativeTable(weights) {
        const arrWeights = [];
        let sumWeights = 0;

        Object.entries(weights).forEach(([key, value]) => {
            sumWeights += value;

            arrWeights.push({
                type: key,
                limit: sumWeights
            });
        });
        return arrWeights;
        //[ {type:'combat', limit:70}, {type:'chest', limit:85}, ... ]
    }
}