// Room.js — Base class for all dungeon rooms.
// Handles tile grid construction, wall placement, decoration generation, enemy/object updates, collision resolution, and rendering.

import {
  TILE_SIZE,
  ROOM_WIDTH,
  ROOM_HEIGHT,
  ROOM_ROWS,
  ROOM_COLS,
} from "../../Utils/Constants.js";
import Wall from "../../World/Objects/Wall.js";
import Vector from "../../Utils/Vector.js";
import Collision from "../../Physics/Collision.js";
import Credit from "../../Entities/pickups/Credit.js";
import { randFloat, randInt } from "../../Utils/Random.js";

// Background image paths indexed by tileset ID.
const ROOM_BG = {
  tilesOldWest: "../../Assets/Sprites/room/roomOldWest.png",
  tilesDarkAge: "../../Assets/Sprites/room/roomDungeon.png",
};

// Tileset sprite sheet paths used for floor decoration rendering.
const ROOM_TILESET = {
  tilesDarkAge: "../../Assets/Sprites/tiles/tilesDungeon.png",
  tilesOldWest: "../../Assets/Sprites/tiles/tilesOldWest.png",
};

export default class Room {
  // Builds the room grid and walls; subclasses call populate() to add enemies and objects.
  constructor(
    doorDirections = [],
    player,
    bullets = [],
    credits = [],
    dimension = null,
  ) {
    this.doorDirections = doorDirections;

    this.player = player;
    this.bullets = bullets;
    this.credits = credits;

    // Dimension data used for tileset, enemy pool, and decorations.
    this.dimension = dimension;
    this.tileGrid = null;
    this.decorGrid = null;

    // Room content arrays populated by subclasses.
    this.walls = [];
    this.enemies = [];
    this.objects = [];

    // False until all enemies are defeated.
    this.isCleared = false;

    Room.#loadImage(this.dimension?.tileSetId);
    Room.#loadTileset(this.dimension?.tileSetId);
    this.buildGrid();
    this.buildWalls();
  }

  // Override in subclasses to spawn enemies and place objects after construction.
  populate() {}

  // Updates player collision, objects, enemies, and removes dead entities each frame.
  update(deltaTime, player) {
    this.#handlePlayerCollision(player);
    this.#updateObjects(deltaTime, player);

    this.#updateEnemies(deltaTime);
    this.#removeDeadEnemies();
    this.#removeDeadObjects();
  }

  // Draws the room background, decorations, walls, and objects.
  draw(renderer) {
    const img = Room.#imageCache[this.dimension?.tileSetId];

    if (img?.complete && img.naturalWidth > 0) {
      renderer.drawImage(
        img,
        -TILE_SIZE,
        -TILE_SIZE,
        ROOM_WIDTH + TILE_SIZE * 2,
        ROOM_HEIGHT + TILE_SIZE * 2,
      );
    } else {
      // Fallback solid background when image is not yet loaded.
      renderer.drawRect(0, 0, ROOM_WIDTH, ROOM_HEIGHT, "#1a1a1a");
    }

    this.#drawDecor(renderer);

    // Enemies are drawn separately by RoomManager after door visuals so they render on top.
    for (const wall of this.walls) wall.draw(renderer);
    for (const obj of this.objects) obj.draw(renderer);
  }

  // Called by RoomManager after door visuals so enemies appear on top of doors.
  drawEnemies(renderer) {
    for (const enemy of this.enemies) enemy.draw(renderer);
  }

  // Draws floor decoration tiles from the decor grid onto inner floor cells.
  #drawDecor(renderer) {
    if (!this.decorGrid) return;
    const pool = this.dimension?.decorations?.pool;
    if (!pool) return;

    const img = Room.#tilesetCache[this.dimension?.tileSetId];
    if (!img?.complete || img.naturalWidth === 0) return;

    for (let row = 0; row < ROOM_ROWS; row++) {
      for (let col = 0; col < ROOM_COLS; col++) {
        const key = this.decorGrid[row][col];
        if (!key) continue;

        const { srcX, srcY, srcW, srcH } = pool[key];
        const destX = col * TILE_SIZE;
        const destY = row * TILE_SIZE;

        renderer.drawSprite(
          img,
          srcX,
          srcY,
          srcW,
          srcH,
          destX,
          destY,
          TILE_SIZE,
          TILE_SIZE,
        );
      }
    }
  }

  // Resolves wall and boundary collisions for the player; runs extra iterations during a dash.
  #handlePlayerCollision(player) {
    const iterations = player.isDashing ? 3 : 1;
    for (let i = 0; i < iterations; i++) {
      for (const wall of this.walls) Collision.resolve(player, wall);
      Collision.resolveEntityBounds(player, ROOM_WIDTH, ROOM_HEIGHT);
    }
  }

  // Updates each object, resolves solid object collisions against player and enemies, and handles contact effects.
  #updateObjects(deltaTime, player) {
    for (const obj of this.objects) {
      obj.update?.(deltaTime);

      if (obj.isDead) continue;
      if (obj.isSolid) {
        Collision.resolve(player, obj);

        for (const enemy of this.enemies) {
          Collision.resolve(enemy, obj);
        }
      }

      // Trigger floor-hazard contact effects (e.g. spikes).
      if (
        typeof obj.onPlayerContact === "function" &&
        Collision.rectCollision(obj.getBounds(), player.getBounds())
      ) {
        obj.onPlayerContact(player, deltaTime);
      }
    }
  }

  // Updates each enemy and keeps them within walls and room bounds.
  #updateEnemies(deltaTime) {
    for (const enemy of this.enemies) {
      enemy.update(deltaTime);
      for (const wall of this.walls) Collision.resolve(enemy, wall);
      Collision.resolveEntityBounds(enemy, ROOM_WIDTH, ROOM_HEIGHT);
    }
  }

  // Removes dead enemies and spawns a credit pickup at each enemy's last position.
  #removeDeadEnemies() {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (!enemy.isDead) continue;

      this.credits.push(
        new Credit(new Vector(enemy.position.x, enemy.position.y)),
      );
      this.enemies.splice(i, 1);
    }
  }

  // Removes dead objects, plays break sound for boxes, and allows objects to drop loot.
  #removeDeadObjects() {
    for (let i = this.objects.length - 1; i >= 0; i--) {
      const obj = this.objects[i];
      if (!obj.isDead) continue;

      if (obj.type === "box") this.player?.audio?.playSFX("boxBreak");

      obj.dropLoot?.(this.credits);
      this.objects.splice(i, 1);
    }
  }

  // Builds the 2D tile grid of "wall", "floor", and "door" cells based on room dimensions.
  buildGrid() {
    const grid = [];

    for (let row = 0; row < ROOM_ROWS; row++) {
      grid[row] = [];

      for (let col = 0; col < ROOM_COLS; col++) {
        const isWall =
          row < 2 || row >= ROOM_ROWS - 2 || col < 2 || col >= ROOM_COLS - 2;

        if (isWall) {
          // Replace wall tiles with "door" where a door opening is needed.
          grid[row][col] = this.#isDoorGap(row, col) ? "door" : "wall";
        } else {
          grid[row][col] = "floor";
        }
      }
    }

    this.tileGrid = grid;
  }

  // Creates Wall objects for every "wall" cell in the tile grid.
  buildWalls() {
    for (let row = 0; row < ROOM_ROWS; row++) {
      for (let col = 0; col < ROOM_COLS; col++) {
        if (this.tileGrid[row][col] === "wall") {
          this.walls.push(
            new Wall(
              new Vector(
                col * TILE_SIZE + TILE_SIZE / 2,
                row * TILE_SIZE + TILE_SIZE / 2,
              ),
            ),
          );
        }
      }
    }
  }

  // Randomly assigns floor decoration sprites to inner tiles based on the dimension's frequency setting.
  buildDecorGrid() {
    const decor = this.dimension?.decorations;
    if (!decor?.pool) {
      this.decorGrid = null;
      return;
    }

    const keys = Object.keys(decor.pool);
    const grid = [];

    for (let row = 0; row < ROOM_ROWS; row++) {
      grid[row] = [];
      for (let col = 0; col < ROOM_COLS; col++) {
        const isFloor = this.tileGrid[row][col] === "floor";
        const isInner =
          row >= 3 && row < ROOM_ROWS - 3 && col >= 3 && col < ROOM_COLS - 3;
        const roll = isFloor && isInner && randFloat(0, 1) <= decor.frequency;
        grid[row][col] = roll ? keys[randInt(0, keys.length - 1)] : null;
      }
    }
    this.decorGrid = grid;
  }

  // Returns true if the given tile position falls within a door gap for one of the active door directions.
  #isDoorGap(row, col) {
    const midCol = Math.floor(ROOM_COLS / 2);
    const midRow = Math.floor(ROOM_ROWS / 2);

    const inDoorCol =
      col === midCol || col === midCol - 1 || col === midCol + 1;
    const inDoorRow =
      row === midRow || row === midRow - 1 || row === midRow + 1;

    if (this.doorDirections.includes("north") && row < 2 && inDoorCol)
      return true;
    if (
      this.doorDirections.includes("south") &&
      row >= ROOM_ROWS - 2 &&
      inDoorCol
    )
      return true;
    if (
      this.doorDirections.includes("east") &&
      col >= ROOM_COLS - 2 &&
      inDoorRow
    )
      return true;
    if (this.doorDirections.includes("west") && col < 2 && inDoorRow)
      return true;

    return false;
  }

  // Returns the center world-space position of the door tile for the given direction.
  getDoorPosition(direction) {
    let col = 0;
    let row = 0;

    switch (direction) {
      case "north":
        col = Math.floor(ROOM_COLS / 2);
        row = 0;
        break;

      case "south":
        col = Math.floor(ROOM_COLS / 2);
        row = ROOM_ROWS - 1;
        break;

      case "east":
        col = ROOM_COLS - 1;
        row = Math.floor(ROOM_ROWS / 2);
        break;

      case "west":
        col = 0;
        row = Math.floor(ROOM_ROWS / 2);
        break;
    }

    return new Vector(
      col * TILE_SIZE + TILE_SIZE / 2,
      row * TILE_SIZE + TILE_SIZE / 2,
    );
  }

  // Returns the three tile positions that make up the door opening for the given direction.
  getDoorTilePositions(direction) {
    const midCol = Math.floor(ROOM_COLS / 2);
    const midRow = Math.floor(ROOM_ROWS / 2);
    const positions = [];

    switch (direction) {
      case "north":
        for (let dc = -1; dc <= 1; dc++)
          positions.push(
            new Vector(
              (midCol + dc) * TILE_SIZE + TILE_SIZE / 2,
              TILE_SIZE / 2,
            ),
          );
        break;

      case "south":
        for (let dc = -1; dc <= 1; dc++)
          positions.push(
            new Vector(
              (midCol + dc) * TILE_SIZE + TILE_SIZE / 2,
              (ROOM_ROWS - 1) * TILE_SIZE + TILE_SIZE / 2,
            ),
          );
        break;

      case "east":
        for (let dr = -1; dr <= 1; dr++)
          positions.push(
            new Vector(
              (ROOM_COLS - 1) * TILE_SIZE + TILE_SIZE / 2,
              (midRow + dr) * TILE_SIZE + TILE_SIZE / 2,
            ),
          );
        break;

      case "west":
        for (let dr = -1; dr <= 1; dr++)
          positions.push(
            new Vector(
              TILE_SIZE / 2,
              (midRow + dr) * TILE_SIZE + TILE_SIZE / 2,
            ),
          );
        break;
    }
    return positions;
  }

  // Returns an array of interactable objects in this room; overridden by subclasses.
  getInteractables() {
    return [];
  }

  // Shared background image cache for all Room instances.
  static #imageCache = {};
  // Shared tileset image cache used for decoration rendering.
  static #tilesetCache = {};

  // Loads the background image for the given tileset ID once and caches it.
  static #loadImage(tileSetId) {
    if (!tileSetId || !ROOM_BG[tileSetId]) return null;

    if (!Room.#imageCache[tileSetId]) {
      const img = new Image();
      img.src = ROOM_BG[tileSetId];
      Room.#imageCache[tileSetId] = img;
    }
    return Room.#imageCache[tileSetId];
  }

  // Loads the tileset sprite sheet for the given tileset ID once and caches it.
  static #loadTileset(tileSetId) {
    if (!tileSetId || !ROOM_TILESET[tileSetId]) return null;
    if (!Room.#tilesetCache[tileSetId]) {
      const img = new Image();
      img.src = ROOM_TILESET[tileSetId];
      Room.#tilesetCache[tileSetId] = img;
    }
    return Room.#tilesetCache[tileSetId];
  }
}
