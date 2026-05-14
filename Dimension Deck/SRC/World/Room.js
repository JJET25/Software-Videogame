import { TILE_SIZE, ROOM_WIDTH, ROOM_HEIGHT, ROOM_ROWS, ROOM_COLS } from "../Utils/Constants.js";
import Wall from "../Objects/Wall.js";
import Vector from "../Utils/Vector.js";
import Collision from "../Physics/Collision.js";

export default class Room {
    constructor(position) {
        this.position = position ?? new Vector(0, 0);
        this.width = ROOM_WIDTH;
        this.height = ROOM_HEIGHT;

        // Arrays to store all entities and objects inside this room
        this.tileGrid = null;
        this.walls = [];
        this.enemies = [];
        this.objects = [];
            
        // Objects that respond to E-key interaction (chests, altars, pillars, etc.)
        this.interactables = [];

        this.isCleared = false;

        // Initialize the room layout
        this.buildGrid();
        this.buildWalls();
    }

    // Creates a 2D array representing the room map
    buildGrid() {
        const grid = [];

        for (let i = 0; i < ROOM_ROWS; i++) {
            grid[i] = [];
            for (let j = 0; j < ROOM_COLS; j++) {
                // If it is an edge of the room, set it as a "wall"
                if (i === 0 || i === ROOM_ROWS - 1 || j === 0 || j === ROOM_COLS - 1) {
                    grid[i][j] = "wall";
                } else {
                    grid[i][j] = "floor";
                }
            }
        }
        this.tileGrid = grid;
    }

    // Converts "wall" into physical Wall object
    buildWalls() {
        for (let row = 0; row < ROOM_ROWS; row++) {
            for (let col = 0; col < ROOM_COLS; col++) {
                if (this.tileGrid[row][col] === "wall") {
                    // Calculates world position
                    this.walls.push(
                        new Wall(new Vector(col * TILE_SIZE + TILE_SIZE / 2, row * TILE_SIZE + TILE_SIZE / 2))
                    );
                }
            }
        }
    }

    // Handles room logic
    update(deltaTime, player) {
        // Resolve Collisions: Player vs Walls
        this.walls.forEach(wall => { Collision.resolve(player, wall); });
        // Hard clamp: keep player inside room boundaries (belt-and-suspenders after wall push-out)
        Collision.resolveEntityBounds(player, this.width, this.height);
    }

    // Renders all the room elements
    draw(renderer) {
        // Draw walls
        this.walls.forEach(wall => { wall.draw(renderer) });
    }
}
