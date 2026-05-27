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

    // Grid data for room generation
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

  populate() {} // Overriden by child clases

  update(deltaTime, player) {
    // Prevent player from crossing walls
    this.walls.forEach((wall) => Collision.resolve(player, wall));

    // Keep player inside room bounds
    Collision.resolveEntityBounds(player, ROOM_WIDTH, ROOM_HEIGHT);

    // Wait before enemies act
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

    // Remove enemies after death
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];

      if (enemy.isDead) {
        // Spawn credits where the enemy died
        this.credits.push(
          new Credit(new Vector(enemy.position.x, enemy.position.y)),
        );

        this.enemies.splice(i, 1);
      }
    }
  }

  draw(renderer) {
    const img = Room.#imageCache[this.dimension?.tileSetId];

    // Draw background image if loaded correctly
    if (img?.complete && img.naturalWidth > 0) {
      renderer.drawImage(
        img,
        -TILE_SIZE,
        -TILE_SIZE,
        ROOM_WIDTH + TILE_SIZE * 2,
        ROOM_HEIGHT + TILE_SIZE * 2,
      );
    } else {
      // Fallback background color
      renderer.drawRect(0, 0, ROOM_WIDTH, ROOM_HEIGHT, "#1a1a1a");
    }

    // Draw room walls
    this.walls.forEach((wall) => wall.draw(renderer));

    // Draw room objects
    for (const obj of this.objects) {
      obj.draw(renderer);
    }

    // Draw enemies
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
        // Outer tiles become walls
        const isWall =
          i < 2 || i >= ROOM_ROWS - 2 || j < 2 || j >= ROOM_COLS - 2;

        if (isWall) {
          // Create doors where needed
          grid[i][j] = this.#isDoorGap(i, j) ? "door" : "wall";
          variants[i][j] = 0;
        } else {
          // Inner tiles are floor tiles
          grid[i][j] = "floor";
          // Small varition for appearance
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
        // Create wall objects from wall tiles
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

    // Get center tile for each room side
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

    // Return world position of the door
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
        // Create 3 tiles for the north door
        for (let dc = -1; dc <= 1; dc++)
          positions.push(
            new Vector(
              (midCol + dc) * TILE_SIZE + TILE_SIZE / 2,
              TILE_SIZE / 2,
            ),
          );
        break;

      case "south":
        // Create 3 tiles for the south door
        for (let dc = -1; dc <= 1; dc++)
          positions.push(
            new Vector(
              (midCol + dc) * TILE_SIZE + TILE_SIZE / 2,
              (ROOM_ROWS - 1) * TILE_SIZE + TILE_SIZE / 2,
            ),
          );
        break;

      case "east":
        // Create 3 tiles for the east door
        for (let dr = -1; dr <= 1; dr++)
          positions.push(
            new Vector(
              (ROOM_COLS - 1) * TILE_SIZE + TILE_SIZE / 2,
              (midRow + dr) * TILE_SIZE + TILE_SIZE / 2,
            ),
          );
        break;

      case "west":
        // Create 3 tiles for the west door
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

  #isDoorGap(row, col) {
    const midCol = Math.floor(ROOM_COLS / 2);
    const midRow = Math.floor(ROOM_ROWS / 2);

    // Check if tile is inside the door area
    const inDoorCol =
      col === midCol || col === midCol - 1 || col === midCol + 1;
    const inDoorRow =
      row === midRow || row === midRow - 1 || row === midRow + 1;

    // Open gaps only where door exist 
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
