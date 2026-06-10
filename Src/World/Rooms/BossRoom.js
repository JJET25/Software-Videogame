import Room from "./Room.js";
import Vector from "../../Utils/Vector.js";
import { ROOM_COLS, ROOM_ROWS, TILE_SIZE } from "../../Utils/Constants.js";

export default class BossRoom extends Room {
  constructor(doorDirections, player, bullets, credits, dimension, nodeType) {
    super(doorDirections, player, bullets, credits, dimension);
    this.dimension = dimension;
    this.nodeType = nodeType; // "miniBoss" or "finalBoss"
    this.onBossDefeated = null;

    // Create the boss when the room is initialized
    this.populate();
    // Small delay before the boss becomes active
    this.spawnDelay = 0.5;
  }

  populate() {
    // Stop if required data is missing
    if (!this.player || !this.dimension) return;

    // Choose the boss type based on the room node
    const BossClass =
      this.nodeType === "finalBoss"
        ? this.dimension.finalBoss
        : this.dimension.miniBoss;

    // Stop if no boss class exists
    if (!BossClass) return;

    // Calculate the center position of the room
    const centerX = Math.floor(ROOM_COLS / 2) * TILE_SIZE;
    const centerY = Math.floor(ROOM_ROWS / 2) * TILE_SIZE;

    // Pass enemyPool so the boss can spawn dimension-correct minions on phase change
    const deps = {
      player: this.player,
      bullets: this.bullets,
      enemyPool: this.dimension.enemyPool,
    };
    const boss = new BossClass(new Vector(centerX, centerY), deps);

    // Scale boss stats by difficulty multiplier
    const mult = this.player?.cardManager?.difficultyMultiplier ?? 1;
    if (mult > 1) {
      boss.health = Math.round(boss.health * mult);
      boss.maxHealth = Math.round(boss.maxHealth * mult);
      boss.contactDamage = Math.round(boss.contactDamage * mult);
    }

    boss.enemyList = this.enemies;
    this.enemies.push(boss);

    this.buildDecorGrid();
  }
}
