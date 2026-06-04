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
    nodeType,
  ) {
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
    // Stop if requiered data is missing
    if (!this.player || !this.dimension) return;

    // Choose the boss type based on the room node
    const BossClass =
      this.nodeType === "finalBoss"
        ? this.dimension.finalBoss
        : this.dimension.miniBoss;

    // Stopif no boss class exists
    if (!BossClass) return;

    // Calculate the center position of the room
    const centerX = Math.floor(ROOM_COLS / 2) * TILE_SIZE;
    const centerY = Math.floor(ROOM_ROWS / 2) * TILE_SIZE;

    // Create the boss in the center of the room
    const deps = { player: this.player, bullets: this.bullets };
    const boss = new BossClass(new Vector(centerX, centerY), deps);

    boss.enemyList = this.enemies;
    this.enemies.push(boss);

    this.buildDecorGrid();
  }
}
