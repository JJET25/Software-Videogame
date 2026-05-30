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

const ROOM_BG = {
  tilesOldWest: "../../Assets/Sprites/room/roomOldWest.png",
  tilesDarkAge: "../../Assets/Sprites/room/roomDungeon.png",
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
    this.variantGrid = null;

    // Room content
    this.walls = [];
    this.enemies = [];
    this.objects = [];

    // Room state
    this.isCleared = false;
    this.spawnDelay = 0;

    Room.#loadImage(this.dimension?.tileSetId);
    this.buildGrid();
    this.buildWalls();
  }

  populate() {} // Overriden by child clases

  // ------------------------ Main: Update and Draw ------------------------
  update(deltaTime, player) {
    this.#handlePlayerCollision(player);
    this.#updateObjects(deltaTime, player);

    // Wait before enemies start moving
    if (this.spawnDelay > 0) {
      this.spawnDelay -= deltaTime;
      return;
    }

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

    // Draw walls, objects and enemies
    for (const wall of this.walls) wall.draw(renderer);
    for (const obj of this.objects) obj.draw(renderer);
    for (const enemy of this.enemies) enemy.draw(renderer);
  }

  // ------------------------ Helpers & Updates functions ------------------------
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
      variants[row] = [];

      for (let col = 0; col < ROOM_COLS; col++) {
        const isWall =
          row < 2 || row >= ROOM_ROWS - 2 || col < 2 || col >= ROOM_COLS - 2;

        if (isWall) {
          // Create doors where needed
          grid[row][col] = this.#isDoorGap(row, col) ? "door" : "wall";
          variants[row][col] = 0;
        } else {
          // Floor tiles
          grid[row][col] = "floor";
          // Small varition for appearance
          variants[row][col] = (row * 7 + col * 13) % 4;
        }
      }
    }

    this.tileGrid = grid;
    this.variantGrid = variants;
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
}
