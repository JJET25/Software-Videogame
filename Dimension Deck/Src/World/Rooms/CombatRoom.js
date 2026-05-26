import RangedEnemy from "../../Entities/Enemies/archetypes/RangedEnemy.js";
import SwarmEnemy from "../../Entities/Enemies/archetypes/SwarmEnemy.js";
import TankEnemy from "../../Entities/Enemies/archetypes/TankEnemy.js";
import { ENCOUNTER_TEMPLATES } from "../../Generation/EncounterTemplates.js";
import Rock from "../Objects/Rock.js";
import {
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
    const templetedSelected =
      ENCOUNTER_TEMPLATES[
        this.rng.int(0, ENCOUNTER_TEMPLATES.length - 1)
      ];

    // =========================
    // SWARM ENEMIES
    // =========================
    // Fixed amount to avoid overcrowded rooms

    for (let i = 0; i < 2; i++) {
      const enemyPos = this.#getSafeSpawnPosition(
        this.tileGrid,
        this.rng,
      );

      this.enemies.push(
        new SwarmEnemy(
          enemyPos,
          this.player,
          this.bullets,
          this.credits,
        ),
      );
    }

    // =========================
    // TANK ENEMIES
    // =========================

    const tankCount = Math.min(
      templetedSelected.tank,
      1,
    );

    for (let i = 0; i < tankCount; i++) {
      const enemyPos = this.#getSafeSpawnPosition(
        this.tileGrid,
        this.rng,
      );

      this.enemies.push(
        new TankEnemy(
          enemyPos,
          this.player,
          this.bullets,
          this.credits,
        ),
      );
    }

    // =========================
    // RANGED ENEMIES
    // =========================

    const rangedCount = Math.min(
      templetedSelected.ranged,
      1,
    );

    for (let i = 0; i < rangedCount; i++) {
      const enemyPos = this.#getSafeSpawnPosition(
        this.tileGrid,
        this.rng,
      );

      this.enemies.push(
        new RangedEnemy(
          enemyPos,
          this.player,
          this.bullets,
          this.credits,
        ),
      );
    }

    // =========================
    // ROOM OBJECTS
    // =========================

    this.#populateObjects();
  }

  #getRandomEnemyType(pool, rng) {
    const categories = ["swarm", "tank", "ranged"];

    const chosenCategory =
      categories[rng.int(0, categories.length - 1)];

    const options = pool[chosenCategory];

    return options[
      rng.int(0, options.length - 1)
    ];
  }

  #getSafeSpawnPosition(tileGrid, rng) {
    while (true) {
      const row = rng.int(2, ROOM_ROWS - 2);

      const col = rng.int(2, ROOM_COLS - 2);

      if (tileGrid[row][col] === "floor") {
        return new Vector(
          col * TILE_SIZE,
          row * TILE_SIZE,
        );
      }
    }
  }

  #populateObjects() {
    // Rocks

    const rockCount = this.rng.int(1, 2);

    for (let i = 0; i < rockCount; i++) {
      const pos = this.#getSafeSpawnPosition(
        this.tileGrid,
        this.rng,
      );

      this.objects.push(new Rock(pos));
    }
  }
}