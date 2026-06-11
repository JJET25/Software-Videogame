// Dimension.js — Base class representing a game dimension (world theme).
// Stores all dimension-specific configuration: enemy pool, room weights, tileset, bosses, and object/decoration rules.

export default class Dimension {
  // Initializes the dimension with all configuration fields from a config object.
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.roomWeights = config.roomWeights;
    this.enemyPool = config.enemyPool;
    this.tileSetId = config.tileSetId;
    this.miniBoss = config.miniBoss ?? null;
    this.finalBoss = config.finalBoss ?? null;
    this.objectConfig = config.objectConfig ?? null;
    this.decorations = config.decorations ?? null;
  }
}
