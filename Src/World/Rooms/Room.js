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

const ROOM_BG = {
  tilesOldWest: "../../Assets/Sprites/room/roomOldWest.png",
  tilesDarkAge: "../../Assets/Sprites/room/roomDungeon.png",
};

const ROOM_TILESET = {
  tilesDarkAge: "../../Assets/Sprites/tiles/tilesDungeon.png",
  tilesOldWest: "../../Assets/Sprites/tiles/tilesOldWest.png",
};

export default class Room {
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

    // Room generation data
    this.dimension = dimension;
    this.tileGrid = null;
    this.decorGrid = null;

    // Room content
    this.walls = [];
    this.enemies = [];
    this.objects = [];

    // Room state
    this.isCleared = false;

    Room.#loadImage(this.dimension?.tileSetId);
    Room.#loadTileset(this.dimension?.tileSetId);
    this.buildGrid();
    this.buildWalls();
  }

  populate() {} // Overriden by child clases

  // ------------------------ Main: Update and Draw ------------------------
  update(deltaTime, player) {
    this.#handlePlayerCollision(player);
    this.#updateObjects(deltaTime, player);

    this.#updateEnemies(deltaTime);
    this.#removeDeadEnemies();
    this.#removeDeadObjects();
  }

  // ------------------------ Draw ------------------------
  draw(renderer) {
    const img = Room.#imageCache[this.dimension?.tileSetId];

    // Draw room background
    if (img?.complete && img.naturalWidth > 0) {
      renderer.drawImage(
        img,
        -TILE_SIZE,
        -TILE_SIZE,
        ROOM_WIDTH + TILE_SIZE * 2,
        ROOM_HEIGHT + TILE_SIZE * 2,
      );
    } else {
      // Fallback background
      renderer.drawRect(0, 0, ROOM_WIDTH, ROOM_HEIGHT, "#1a1a1a");
    }

    this.#drawDecor(renderer);

    // Draw walls, objects and enemies
    for (const wall of this.walls) wall.draw(renderer);
    for (const obj of this.objects) obj.draw(renderer);
    for (const enemy of this.enemies) enemy.draw(renderer);
  }

  // ------------------------ Helpers & Updates functions ------------------------
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

  #handlePlayerCollision(player) {
    for (const wall of this.walls) Collision.resolve(player, wall);
    Collision.resolveEntityBounds(player, ROOM_WIDTH, ROOM_HEIGHT);
  }

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

      if (
        typeof obj.onPlayerContact === "function" &&
        Collision.rectCollision(obj.getBounds(), player.getBounds())
      ) {
        obj.onPlayerContact(player, deltaTime);
      }
    }
  }

  #updateEnemies(deltaTime) {
    for (const enemy of this.enemies) {
      enemy.update(deltaTime);
      for (const wall of this.walls) Collision.resolve(enemy, wall);
      Collision.resolveEntityBounds(enemy, ROOM_WIDTH, ROOM_HEIGHT);
    }
  }

  #removeDeadEnemies() {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (!enemy.isDead) continue;

      // Spawn credits where the enemy died
      this.credits.push(
        new Credit(new Vector(enemy.position.x, enemy.position.y)),
      );
      this.enemies.splice(i, 1);
    }
  }

  #removeDeadObjects() {
    for (let i = this.objects.length - 1; i >= 0; i--) {
      const obj = this.objects[i];
      if (!obj.isDead) continue;

      // Some objects can drop loot
      obj.dropLoot?.(this.credits);
      this.objects.splice(i, 1);
    }
  }

  // ------------------------ Room Generation ------------------------
  buildGrid() {
    const grid = [];
    const variants = [];

    // Create room tiles
    for (let row = 0; row < ROOM_ROWS; row++) {
      grid[row] = [];

      for (let col = 0; col < ROOM_COLS; col++) {
        const isWall =
          row < 2 || row >= ROOM_ROWS - 2 || col < 2 || col >= ROOM_COLS - 2;

        if (isWall) {
          // Create doors where needed
          grid[row][col] = this.#isDoorGap(row, col) ? "door" : "wall";
        } else {
          // Floor tiles
          grid[row][col] = "floor";
        }
      }
    }

    this.tileGrid = grid;
  }

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

  #isDoorGap(row, col) {
    const midCol = Math.floor(ROOM_COLS / 2);
    const midRow = Math.floor(ROOM_ROWS / 2);

    // Check if tile is inside the door area
    const inDoorCol =
      col === midCol || col === midCol - 1 || col === midCol + 1;
    const inDoorRow =
      row === midRow || row === midRow - 1 || row === midRow + 1;

    // Open wall tiles where door exists
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

  // ------------------------ Dooor Utilities ------------------------
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

  // ------------------------ Room State ------------------------
  getInteractables() {
    return [];
  }

  // ------------------------ Static ------------------------
  // Shared image cache for all rooms
  static #imageCache = {};
  static #tilesetCache = {};

  static #loadImage(tileSetId) {
    if (!tileSetId || !ROOM_BG[tileSetId]) return null;

    // Load image only once
    if (!Room.#imageCache[tileSetId]) {
      const img = new Image();
      img.src = ROOM_BG[tileSetId];
      Room.#imageCache[tileSetId] = img;
    }
    return Room.#imageCache[tileSetId];
  }

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
