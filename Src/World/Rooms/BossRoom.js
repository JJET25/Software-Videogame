// BossRoom.js — Room subclass that spawns either a mini-boss or the final boss at the room center.
// Boss stats are scaled by the player's difficulty multiplier; the boss receives the full enemy list reference.

import Room from "./Room.js";
import Vector from "../../Utils/Vector.js";
import { ROOM_COLS, ROOM_ROWS, TILE_SIZE } from "../../Utils/Constants.js";

export default class BossRoom extends Room {
  // Creates the boss room, spawns the appropriate boss, and sets a short activation delay.
  constructor(doorDirections, player, bullets, credits, dimension, nodeType) {
    super(doorDirections, player, bullets, credits, dimension);
    this.dimension = dimension;
    // Determines whether to spawn the mini-boss or the final boss.
    this.nodeType = nodeType;
    this.onBossDefeated = null;

    this.populate();
    // Short delay in seconds before the boss becomes active after room entry.
    this.spawnDelay = 0.5;
  }

  // Selects the boss class, instantiates it at the room center, and applies difficulty scaling.
  populate() {
    if (!this.player || !this.dimension) return;

    const BossClass =
      this.nodeType === "finalBoss"
        ? this.dimension.finalBoss
        : this.dimension.miniBoss;

    if (!BossClass) return;

    const centerX = Math.floor(ROOM_COLS / 2) * TILE_SIZE;
    const centerY = Math.floor(ROOM_ROWS / 2) * TILE_SIZE;

    // Pass the enemy pool so the boss can spawn dimension-correct minions on phase change.
    const deps = {
      player: this.player,
      bullets: this.bullets,
      enemyPool: this.dimension.enemyPool,
    };
    const boss = new BossClass(new Vector(centerX, centerY), deps);

    // Scale boss health and damage by the current difficulty multiplier.
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
