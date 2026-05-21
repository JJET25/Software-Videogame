import DungeonRat from "../../Entities/Enemies/DarkAgesEnemies/DungeonRat.js"
import Skeleton from "../../Entities/Enemies/DarkAgesEnemies/Skeleton.js"
import Slime from "../../Entities/Enemies/DarkAgesEnemies/Slime.js"
import { ROOM_WEIGHTS } from "../../Utils/Constants.js"
import Dimension from "./Dimension.js"

export default class DarkAgesDimension extends Dimension {
    constructor() {
        super({
            id: "dark_ages",
            name: "Dark Ages",
            roomWeights: ROOM_WEIGHTS,
            enemyPool: {
                swarm: [DungeonRat],
                tank: [Skeleton],
                ranged: [Slime]
            },
            tileSetId: "tilesDarkAge"
        })
    }

}