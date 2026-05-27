import Room from "./Room.js";
import Vector from "../../Utils/Vector.js";
import { ROOM_COLS, ROOM_ROWS, TILE_SIZE } from "../../Utils/Constants.js";

export default class BossRoom extends Room {
  constructor(
    doorDirections,
    player,
    bullets,
    credits,
    dimension,
    rng,
    nodeType,
  ) {
    super(doorDirections, player, bullets, credits, dimension);
    this.dimension = dimension;
    this.rng = rng;
    this.nodeType = nodeType; // "miniBoss" or "finalBoss"
    this.onBossDefeated = null;

    this.populate();
    this.spawnDelay = 0.5;
  }

  populate() {
    if (!this.player || !this.dimension) return;

    const BossClass =
      this.nodeType === "finalBoss"
        ? this.dimension.finalBoss
        : this.dimension.miniBoss;

    if (!BossClass) return;

    const centerX = Math.floor(ROOM_COLS / 2) * TILE_SIZE;
    const centerY = Math.floor(ROOM_ROWS / 2) * TILE_SIZE;

    const boss = new BossClass(
      new Vector(centerX, centerY),
      this.player,
      this.bullets,
      this.credits,
    );

    boss.enemyList = this.enemies;
    this.enemies.push(boss);
  }
}
