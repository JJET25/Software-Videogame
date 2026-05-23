import Rock from "../../Objects/Rock.js";
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
    this.#populateObjects();
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

  #populateObjects() {
    // Rocas: 1-3 por sala
    const rockCount = this.rng.int(1, 3);
    for (let i = 0; i < rockCount; i++) {
      const pos = this.#getSafeSpawnPosition(this.tileGrid, this.rng);
      const variant = this.rng.int(0, 2); // 3 tipos
      this.objects.push(new Rock(pos, variant));
    }

    // Cajas: 0-2 por sala
    //const crateCount = this.rng.int(0, 2);
    //for (let i = 0; i < crateCount; i++) {
    //  const pos = this.#getSafeSpawnPosition(this.tileGrid, this.rng);
    //  const variant = this.rng.int(0, 5); // 6 tipos
    //  this.objects.push(new Crate(pos, variant));
    //}

    // Pinchos: 0-1 grupos por sala (50% chance)
    //if (this.rng.float() > 0.5) {
    //  const pos = this.#getSafeSpawnPosition(this.tileGrid, this.rng);
    //  const variant = this.rng.int(0, 3); // 4 tipos
    //  this.objects.push(new Spike(pos, variant));
    //}
  }
}
