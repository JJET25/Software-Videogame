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
import { ROOM_BG } from "../../../Assets/TileSetsID.js";

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
    this.dimension = dimension;
    this.tileGrid = null;
    this.variantGrid = null;
    this.walls = [];
    this.enemies = [];
    this.objects = [];
    this.isCleared = false;
    this.spawnDelay = 0;

    Room.#loadImage(this.dimension?.tileSetId);

    this.buildGrid();
    this.buildWalls();
  }
  populate() {}

  update(deltaTime, player) {
    this.walls.forEach((wall) => Collision.resolve(player, wall));
    Collision.resolveEntityBounds(player, ROOM_WIDTH, ROOM_HEIGHT);

    if (this.spawnDelay > 0) {
      this.spawnDelay -= deltaTime;
      return;
    }

    // Update enemies
    for (let enemy of this.enemies) {
      enemy.update(deltaTime);

      // Keep enemies inside room
      enemy.position.x = Math.max(
        32,
        Math.min(enemy.position.x, ROOM_WIDTH - 32),
      );

      enemy.position.y = Math.max(
        32,
        Math.min(enemy.position.y, ROOM_HEIGHT - 32),
      );
    }

    // Remove dead enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];

      if (enemy.isDead) {
        // Spawn credit
        this.credits.push(
          new Credit(new Vector(enemy.position.x, enemy.position.y)),
        );

        this.enemies.splice(i, 1);
      }
    }
  }

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
      renderer.drawRect(0, 0, ROOM_WIDTH, ROOM_HEIGHT, "#1a1a1a");
    }

    this.walls.forEach((wall) => wall.draw(renderer));

    for (const obj of this.objects) {
      obj.draw(renderer);
    }

    for (const enemy of this.enemies) {
      enemy.draw(renderer);
    }
  }

  buildGrid() {
    const grid = [];
    const variants = [];

    for (let i = 0; i < ROOM_ROWS; i++) {
      grid[i] = [];
      variants[i] = [];

      for (let j = 0; j < ROOM_COLS; j++) {
        const isWall =
          i < 2 || i >= ROOM_ROWS - 2 || j < 2 || j >= ROOM_COLS - 2;

        if (isWall) {
          grid[i][j] = this.#isDoorGap(i, j) ? "door" : "wall";
          variants[i][j] = 0;
        } else {
          grid[i][j] = "floor";
          variants[i][j] = (i * 7 + j * 13) % 4;
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

  #isDoorGap(row, col) {
    const midCol = Math.floor(ROOM_COLS / 2); // 9
    const midRow = Math.floor(ROOM_ROWS / 2); // 6

    // Puerta ocupa 2 tiles centrados
    const inDoorCol = col === midCol || col === midCol - 1 || col === midCol + 1;
    const inDoorRow = row === midRow || row === midRow - 1 || row === midRow + 1;

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

  static #imageCache = {};

  static #loadImage(tileSetId) {
    if (!tileSetId || !ROOM_BG[tileSetId]) return null;

    if (!Room.#imageCache[tileSetId]) {
      const img = new Image();
      img.src = ROOM_BG[tileSetId];
      Room.#imageCache[tileSetId] = img;
    }
    return Room.#imageCache[tileSetId];
  }
}
