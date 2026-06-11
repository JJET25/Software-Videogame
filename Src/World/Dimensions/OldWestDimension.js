// OldWestDimension.js — Dimension configuration for the Old West theme.
// Defines the enemy pool, object spawn limits, floor decorations, and boss assignments for this dimension.

import DesertRat from "../../Entities/Enemies/OldWestEnemies/DesertRat.js";
import Minotaur from "../../Entities/Enemies/OldWestEnemies/Minotaur.js";
import Bandit from "../../Entities/Enemies/OldWestEnemies/Bandit.js";
import { ROOM_WEIGHTS } from "../../Utils/Constants.js";
import Dimension from "./Dimension.js";
import TheIronMarshal from "../../Entities/Enemies/OldWestEnemies/TheIronMarshal.js";
import DeadEye from "../../Entities/Enemies/OldWestEnemies/DeadEye.js";

// Spawn count ranges for environmental objects in combat rooms.
const OBJECT_CONFIG = {
  rocks: { min: 0, max: 2 },
  boxes: { min: 1, max: 4 },
  spikes: { min: 0, max: 3 },
};

// Floor decoration sprites and their spawn frequency for this dimension.
const DECORATIONS = {
  pool: {
    blood_1: { srcX: 64, srcY: 0, srcW: 16, srcH: 16 },
    blood_2: { srcX: 80, srcY: 0, srcW: 16, srcH: 16 },
    blood_3: { srcX: 96, srcY: 0, srcW: 16, srcH: 16 },
  },
  frequency: 0.12,
};

// Old West dimension with western tileset, swarm/tank/ranged enemies, and two boss tiers.
export default class OldWestDimension extends Dimension {
  constructor() {
    super({
      id: "oldWest",
      name: "Old West",
      roomWeights: ROOM_WEIGHTS,
      tileSetId: "tilesOldWest",
      enemyPool: {
        swarm: [DesertRat],
        tank: [Minotaur],
        ranged: [Bandit],
      },
      miniBoss: DeadEye,
      finalBoss: TheIronMarshal,
      objectConfig: OBJECT_CONFIG,
      decorations: DECORATIONS,
    });
  }
}
