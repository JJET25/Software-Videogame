import RangedEnemy from "../../Entities/Enemies/archetypes/RangedEnemy.js";
import SwarmEnemy from "../../Entities/Enemies/archetypes/SwarmEnemy.js";
import TankEnemy from "../../Entities/Enemies/archetypes/TankEnemy.js";
import { ENCOUNTER_TEMPLATES } from "../../Generation/EncounterTemplates.js";
import Rock from "../Objects/Rock.js";
import { ROOM_COLS, ROOM_ROWS, TILE_SIZE } from "../../Utils/Constants.js";
import Vector from "../../Utils/Vector.js";
import Room from "./Room.js";
import { randInt } from "../../Utils/Random.js";

export default class CombatRoom extends Room {
  constructor(doorDirections, player, bullets, credits, dimension) {
    super(doorDirections, player, bullets, credits, dimension);
    this.dimension = dimension;
    this.spawnDelay = 1;

    this.populate();
  }

  populate() {
    const deps = { player: this.player, bullets: this.bullets };
    const pool = this.dimension.enemyPool;
    const templete =
      ENCOUNTER_TEMPLATES[randInt(0, ENCOUNTER_TEMPLATES.length - 1)];

    // Spawn swarm enemies
    for (let i = 0; i < templete.swarm; i++) {
      const EnemyClass = pool.swarm[randInt(0, pool.swarm.length - 1)];
      this.enemies.push(
        new EnemyClass(this.#getSafeSpawnPosition(this.tileGrid), deps),
      );
    }

    // Spawn tank enemies
    for (let i = 0; i < templete.tank; i++) {
      const EnemyClass = pool.tank[randInt(0, pool.tank.length - 1)];
      this.enemies.push(
        new EnemyClass(this.#getSafeSpawnPosition(this.tileGrid), deps),
      );
    }

    // Spawn ranged enemies
    for (let i = 0; i < templete.ranged; i++) {
      const EnemyClass = pool.ranged[randInt(0, pool.ranged.length - 1)];
      this.enemies.push(
        new EnemyClass(this.#getSafeSpawnPosition(this.tileGrid), deps),
      );
    }

    // Add room objects after enemies
    this.#populateObjects();
  }

  #getSafeSpawnPosition(tileGrid) {
    // Keep searching until a valid floor tile is found
    while (true) {
      const row = randInt(3, ROOM_ROWS - 3);
      const col = randInt(3, ROOM_COLS - 1);

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
    const rockCount = randInt(0, 4);

    for (let i = 0; i < rockCount; i++) {
      const pos = this.#getSafeSpawnPosition(this.tileGrid, this.rng);
      this.objects.push(new Rock(pos));
    }
  }
}
