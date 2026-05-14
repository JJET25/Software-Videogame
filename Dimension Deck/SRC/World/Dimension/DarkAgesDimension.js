import { ROOM_WEIGHTS } from "../../Utils/Constants.js"
import Dimension from "./Dimension.js"

export default class DarkAgesDimension extends Dimension {
    constructor() {
        super({
            id: "dark_ages",
            name: "Dark Ages",
            roomWeights: ROOM_WEIGHTS,
            enemyPool: {
                swarm: [],
                tank: [],
                ranged: []
            },
            tileSetId: "tilesDarkAge"
        })
    }

}