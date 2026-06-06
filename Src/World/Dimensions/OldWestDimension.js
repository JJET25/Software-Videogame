import SkeletonKing from "../../Entities/Enemies/DarkAgesEnemies/SkeletonKing.js";
import Bandit from "../../Entities/Enemies/OldWestEnemies/Bandit.js";
import CactusThung from "../../Entities/Enemies/OldWestEnemies/CactusThug.js";
import DesertRat from "../../Entities/Enemies/OldWestEnemies/DesertRat.js";
import { ROOM_WEIGHTS } from "../../Utils/Constants.js";
import Dimension from "./Dimension.js";

const OBJECT_CONFIG = {
  rocks: { min: 0, max: 2 },
  boxes: { min: 1, max: 4 },
  spikes: { min: 0, max: 3 },
};

const DECORATIONS = {
  pool: {
    blood_1: { srcX: 64, srcY: 0, srcW: 16, srcH: 16 },
    blood_2: { srcX: 80, srcY: 0, srcW: 16, srcH: 16 },
    blood_3: { srcX: 96, srcY: 0, srcW: 16, srcH: 16 },
  },
  frequency: 0.12, // 12% of the floor are decor tiles
};

export default class OldWestDimension extends Dimension {
  constructor() {
    super({
      id: "oldWest",
      name: "Old West",
      roomWeights: ROOM_WEIGHTS,
      tileSetId: "tilesOldWest",
      enemyPool: {
        swarm: [DesertRat],
        tank: [CactusThung],
        ranged: [Bandit],
      },
      miniBoss: SkeletonKing,
      finalBoss: SkeletonKing,
      objectConfig: OBJECT_CONFIG,
      decorations: DECORATIONS,
    });
  }
}
