import Bandit from "../../Entities/Enemies/OldWestEnemies/Bandit.js";
import CactusThung from "../../Entities/Enemies/OldWestEnemies/CactusThug.js";
import DesertRat from "../../Entities/Enemies/OldWestEnemies/DesertRat.js";
import { ROOM_WEIGHTS } from "../../Utils/Constants.js";
import Dimension from "./Dimension.js";

export default class OldWestDimension extends Dimension {
    constructor() {
        super({
            id: "old_west",
            name: "Old West",
            roomWeights: ROOM_WEIGHTS,
            enemyPool: {
                swarm: [DesertRat],
                tank: [CactusThung],
                ranged: [Bandit]
            },
            tileSetId: "tilesOldWest"
        })
    }
}