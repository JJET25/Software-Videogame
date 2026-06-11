// DarkAgesDimension.js — Dimension configuration for the Dark Ages theme.
// Defines the enemy pool, object spawn limits, floor decorations, and boss assignments for this dimension.

import DungeonRat from "../../Entities/Enemies/DarkAgesEnemies/DungeonRat.js";
import Spirit from "../../Entities/Enemies/DarkAgesEnemies/Spirit.js";
import SkeletonKing from "../../Entities/Enemies/DarkAgesEnemies/SkeletonKing.js";
import TwoHeadedGiant from "../../Entities/Enemies/DarkAgesEnemies/TwoHeadedGiant.js";
import { ROOM_WEIGHTS } from "../../Utils/Constants.js";
import Dimension from "./Dimension.js";
import FallenKnight from "../../Entities/Enemies/DarkAgesEnemies/FallenKnight.js";

// Spawn count ranges for environmental objects in combat rooms.
const OBJECT_CONFIG = {
  rocks: { min: 1, max: 4 },
  boxes: { min: 0, max: 2 },
  spikes: { min: 0, max: 3 },
};

// Floor decoration sprites and their spawn frequency for this dimension.
const DECORATIONS = {
  pool: {
    crack_1: { srcX: 16, srcY: 0, srcW: 16, srcH: 16 },
    crack_2: { srcX: 32, srcY: 0, srcW: 16, srcH: 16 },
    crack_3: { srcX: 48, srcY: 0, srcW: 16, srcH: 16 },
    blood_1: { srcX: 0, srcY: 16, srcW: 16, srcH: 16 },
    blood_2: { srcX: 16, srcY: 16, srcW: 16, srcH: 16 },
    blood_3: { srcX: 32, srcY: 16, srcW: 16, srcH: 16 },
  },
  frequency: 0.12,
};

// Dark Ages dimension with dungeon tileset, swarm/tank/ranged enemies, and two boss tiers.
export default class DarkAgesDimension extends Dimension {
  constructor() {
    super({
      id: "darkAges",
      name: "Dark Ages",
      roomWeights: ROOM_WEIGHTS,
      tileSetId: "tilesDarkAge",
      enemyPool: {
        swarm: [DungeonRat],
        tank: [TwoHeadedGiant],
        ranged: [Spirit],
      },
      miniBoss: FallenKnight,
      finalBoss: SkeletonKing,
      objectConfig: OBJECT_CONFIG,
      decorations: DECORATIONS,
    });
  }
}