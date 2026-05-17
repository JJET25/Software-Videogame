import { ROOM_WEIGHTS } from "../../Utils/Constants.js";
import Dimension from "./Dimension.js";

export default class OldWestDimension extends Dimension {
    constructor() {
        super({
            id: "old_west",
            name: "Old West",
            roomWeights: ROOM_WEIGHTS,
            enemyPool: {
                swarm: [],
                tank: [],
                ranged: []
            },
            tileSetId: "tilesOldWest"
        })
    }
}