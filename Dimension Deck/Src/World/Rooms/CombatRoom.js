import RangedEnemy from "../../Entities/Enemies/archetypes/RangedEnemy.js";
import SwarmEnemy from "../../Entities/Enemies/archetypes/SwarmEnemy.js";
import TankEnemy from "../../Entities/Enemies/archetypes/TankEnemy.js";
import { ENCOUNTER_TEMPLATES } from "../../Generation/EncounterTemplates.js";
import Rock from "../Objects/Rock.js";
import { ROOM_COLS, ROOM_ROWS, TILE_SIZE } from "../../Utils/Constants.js";
import Vector from "../../Utils/Vector.js";
import Room from "./Room.js";

export default class CombatRoom extends Room {
  constructor(doorDirections, player, bullets, credits, dimension, rng) {
    super(doorDirections, player, bullets, credits, dimension);
    this.dimension = dimension;
    this.rng = rng;
    this.spawnDelay = 1;

    this.populate();
  }

  populate() {
    // Pick a random encounter templete
    const templetedSelected =
      ENCOUNTER_TEMPLATES[this.rng.int(0, ENCOUNTER_TEMPLATES.length - 1)];

    // Spawn swarm enemies
    for (let i = 0; i < templetedSelected.swarm; i++) {
      const enemyPos = this.#getSafeSpawnPosition(this.tileGrid, this.rng);
      this.enemies.push(
        new SwarmEnemy(enemyPos, this.player, this.bullets, this.credits),
      );
    }

    // Spawn tank enemies
    for (let i = 0; i < templetedSelected.tank; i++) {
      const enemyPos = this.#getSafeSpawnPosition(this.tileGrid, this.rng);
      this.enemies.push(
        new TankEnemy(enemyPos, this.player, this.bullets, this.credits),
      );
    }

    // Spawn ranged enemies
    for (let i = 0; i < templetedSelected.ranged; i++) {
      const enemyPos = this.#getSafeSpawnPosition(this.tileGrid, this.rng);
      this.enemies.push(
        new RangedEnemy(enemyPos, this.player, this.bullets, this.credits),
      );
    }

    // Add room objects after enemies
    this.#populateObjects();
  }

  #getRandomEnemyType(pool, rng) {
    const categories = ["swarm", "tank", "ranged"];
    const chosenCategory = categories[rng.int(0, categories.length - 1)];
    const options = pool[chosenCategory];

    // Return a random enemy from that category
    return options[rng.int(0, options.length - 1)];
  }

  #getSafeSpawnPosition(tileGrid, rng) {
    // Keep searching until a valid floor tile is found
    while (true) {
      const row = rng.int(3, ROOM_ROWS - 3);
      const col = rng.int(3, ROOM_COLS - 3);

      // Only spawn on walkable tiles
      if (tileGrid[row][col] === "floor") {
        return new Vector(
          col * TILE_SIZE - TILE_SIZE / 2,
          row * TILE_SIZE - TILE_SIZE / 2,
        );
      }
    }
  }

  #populateObjects() {
    // Rocks
    const rockCount = this.rng.int(0, 4);

    for (let i = 0; i < rockCount; i++) {
      const pos = this.#getSafeSpawnPosition(this.tileGrid, this.rng);
      this.objects.push(new Rock(pos));
    }
  }
}
