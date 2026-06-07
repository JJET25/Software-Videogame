import RangedEnemy from "../../Entities/Enemies/archetypes/RangedEnemy.js";
import SwarmEnemy from "../../Entities/Enemies/archetypes/SwarmEnemy.js";
import TankEnemy from "../../Entities/Enemies/archetypes/TankEnemy.js";
import { ENCOUNTER_TEMPLATES } from "../../Generation/EncounterTemplates.js";
import Rock from "../Objects/Rock.js";
import { ROOM_COLS, ROOM_ROWS, TILE_SIZE } from "../../Utils/Constants.js";
import Vector from "../../Utils/Vector.js";
import Room from "./Room.js";
import { randInt } from "../../Utils/Random.js";
import Box from "../Objects/Box.js";
import Spike from "../Objects/Spike.js";

export default class CombatRoom extends Room {
  constructor(doorDirections, player, bullets, credits, dimension) {
    super(doorDirections, player, bullets, credits, dimension);
    this.dimension = dimension;

    this.populate();
  }

  populate() {
    const deps = { player: this.player, bullets: this.bullets };
    const pool = this.dimension.enemyPool;
    const templete =
      ENCOUNTER_TEMPLATES[randInt(0, ENCOUNTER_TEMPLATES.length - 1)];
    const mult = this.player?.cardManager?.difficultyMultiplier ?? 1;

    // Spawn swarm enemies
    for (let i = 0; i < templete.swarm; i++) {
      const EnemyClass = pool.swarm[randInt(0, pool.swarm.length - 1)];
      const enemy = new EnemyClass(this.#getSafeSpawnPosition(this.tileGrid), deps);
      this.#applyDifficulty(enemy, mult);
      this.enemies.push(enemy);
    }

    // Spawn tank enemies
    for (let i = 0; i < templete.tank; i++) {
      const EnemyClass = pool.tank[randInt(0, pool.tank.length - 1)];
      const enemy = new EnemyClass(this.#getSafeSpawnPosition(this.tileGrid), deps);
      this.#applyDifficulty(enemy, mult);
      this.enemies.push(enemy);
    }

    // Spawn ranged enemies
    for (let i = 0; i < templete.ranged; i++) {
      const EnemyClass = pool.ranged[randInt(0, pool.ranged.length - 1)];
      const enemy = new EnemyClass(this.#getSafeSpawnPosition(this.tileGrid), deps);
      this.#applyDifficulty(enemy, mult);
      this.enemies.push(enemy);
    }

    // Add room objects after enemies
    this.#populateObjects();
    this.buildDecorGrid();
  }

  #applyDifficulty(enemy, mult) {
    if (mult <= 1) return;
    enemy.health      = Math.round(enemy.health      * mult);
    enemy.maxHealth   = Math.round(enemy.maxHealth   * mult);
    enemy.contactDamage = Math.round(enemy.contactDamage * mult);
  }

  #getSafeSpawnPosition(tileGrid) {
    // Keep searching until a valid floor tile is found
    while (true) {
      const row = randInt(4, ROOM_ROWS - 4);
      const col = randInt(4, ROOM_COLS - 4);

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
    if (this.dimension.objectConfig === null) return;
    this.#spawnCluster(Rock, this.dimension.objectConfig.rocks, null);
    this.#spawnCluster(Box, this.dimension.objectConfig.boxes, [
      "ore",
      "silver",
      "wood",
    ]);
    this.#spawnCluster(Spike, this.dimension.objectConfig.spikes, null);
  }

  #spawnCluster(ObjectClass, config, typeOptions) {
    const count = randInt(config.min, config.max);
    if (count === 0) return;

    const centerRow = randInt(5, ROOM_ROWS - 5);
    const centerCol = randInt(5, ROOM_COLS - 5);

    // Object have type variants ?
    const type = typeOptions
      ? typeOptions[randInt(0, typeOptions.length - 1)]
      : null;

    for (let i = 0; i < count; i++) {
      const objectPos = this.#getNearbyFloorTile(centerRow, centerCol);
      if (!objectPos) continue;
      this.objects.push(new ObjectClass(objectPos, type));
    }
  }

  #getNearbyFloorTile(centerRow, centerCol) {
    for (let attempt = 0; attempt < 10; attempt++) {
      // Generate a near tile of a determinated point,
      // But inside secure limits
      const row = Math.min(
        Math.max(centerRow + randInt(-1, 1), 5),
        ROOM_ROWS - 5,
      );
      const col = Math.min(
        Math.max(centerCol + randInt(-1, 1), 5),
        ROOM_COLS - 5,
      );

      if (this.tileGrid[row][col] === "floor") {
        this.tileGrid[row][col] = "object";
        return new Vector(
          col * TILE_SIZE + TILE_SIZE / 2,
          row * TILE_SIZE + TILE_SIZE / 2,
        );
      }
    }
    return null;
  }
}
