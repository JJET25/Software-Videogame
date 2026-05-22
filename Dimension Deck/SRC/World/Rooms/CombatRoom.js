import {
  MAX_ENEMIES,
  MIN_ENEMIES,
  ROOM_COLS,
  ROOM_ROWS,
  TILE_SIZE,
} from "../../Utils/Constants.js";
import Vector from "../../Utils/Vector.js";
import Room from "./Room.js";

export default class CombatRoom extends Room {
  constructor(doorDirections, player, bullets, credits, dimension, rng) {
    super(doorDirections, player, bullets, credits);
    this.dimension = dimension;
    this.rng = rng;

    this.populate();
    this.spawnDelay = 1;
  }

  populate() {
    const quantityEnemies = this.rng.int(MIN_ENEMIES, MAX_ENEMIES);

    for (let i = 0; i < quantityEnemies; i++) {
      const enemyType = this.#getRandomEnemyType(
        this.dimension.enemyPool,
        this.rng,
      );
      const enemyPos = this.#getSafeSpawnPosition(this.tileGrid, this.rng);

      this.enemies.push(
        new enemyType(enemyPos, this.player, this.bullets, this.credits),
      );
    }
  }

  #getRandomEnemyType(pool, rng) {
    const categories = ["swarm", "tank", "ranged"];
    const chosenCategory = categories[rng.int(0, categories.length - 1)];
    const options = pool[chosenCategory];

    return options[rng.int(0, options.length - 1)];
  }

  #getSafeSpawnPosition(tileGrid, rng) {
    while (true) {
      const row = rng.int(2, ROOM_ROWS - 2); // Margin of walls
      const col = rng.int(2, ROOM_COLS - 2);

      if (tileGrid[row][col] === "floor") {
        return new Vector(col * TILE_SIZE, row * TILE_SIZE);
      }
    }
  }
}
