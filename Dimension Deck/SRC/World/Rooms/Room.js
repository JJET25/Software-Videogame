import {
    TILE_SIZE,
    ROOM_WIDTH,
    ROOM_HEIGHT,
    ROOM_ROWS,
    ROOM_COLS
} from "../../Utils/Constants.js";

import Wall from "../../Objects/Wall.js";

import Vector from "../../Utils/Vector.js";

import Collision from "../../Physics/Collision.js";

import Enemy from "../../Entities/Enemy.js";
import SwarmEnemy from "../../Entities/SwarmEnemy.js";
import TankEnemy from "../../Entities/TankEnemy.js";
import RangedEnemy from "../../Entities/RangedEnemy.js";

export default class Room {

    constructor(
        doorDirections = [],
        player = null,
        bullets = []
    ) {

        this.position = new Vector(0, 0);

        this.width = ROOM_WIDTH;
        this.height = ROOM_HEIGHT;

        this.tileGrid = null;

        this.walls = [];

        this.enemies = [];

        this.enemyBullets = bullets;

        this.objects = [];

        this.doorDirections = doorDirections;

        this.interactables = [];

        this.isCleared = false;

        this.player = player;

        this.buildGrid();

        this.buildWalls();

        this.spawnEnemies();
    }

    update(deltaTime, player) {

        // Player vs walls
        this.walls.forEach(wall => {

            Collision.resolve(player, wall);
        });

        // Keep player inside room
        Collision.resolveEntityBounds(
            player,
            this.width,
            this.height
        );

        // Update enemies
        for (let enemy of this.enemies) {

            enemy.update(deltaTime);

            // Keep enemies inside room
            enemy.position.x = Math.max(
                32,
                Math.min(enemy.position.x, this.width - 32)
            );

            enemy.position.y = Math.max(
                32,
                Math.min(enemy.position.y, this.height - 32)
            );
        }

        // Remove dead enemies
        this.enemies = this.enemies.filter(
            enemy => !enemy.isDead
        );
    }

    draw(renderer) {

        // Draw walls
        this.walls.forEach(wall => {

            wall.draw(renderer);
        });

        // Draw enemies
        for (let enemy of this.enemies) {

            enemy.draw(renderer);
        }
    }

    spawnEnemies() {

        if (!this.player) return;

        const randomType = Math.floor(
            Math.random() * 4
        );

        // BASIC ROOM
        if (randomType === 0) {

            this.enemies.push(

                new Enemy(
                    new Vector(500, 250),
                    this.player
                )
            );
        }

        // SWARM ROOM
        else if (randomType === 1) {

            for (let i = 0; i < 4; i++) {

                this.enemies.push(

                    new SwarmEnemy(

                        new Vector(
                            420 + Math.random() * 180,
                            180 + Math.random() * 180
                        ),

                        this.player
                    )
                );
            }
        }

        // TANK ROOM
        else if (randomType === 2) {

            this.enemies.push(

                new TankEnemy(
                    new Vector(500, 250),
                    this.player
                )
            );
        }

        // RANGED ROOM
        else {

            this.enemies.push(

                new RangedEnemy(

                    new Vector(500, 250),

                    this.player,

                    this.enemyBullets
                )
            );
        }
    }

    buildGrid() {

        const grid = [];

        for (let i = 0; i < ROOM_ROWS; i++) {

            grid[i] = [];

            for (let j = 0; j < ROOM_COLS; j++) {

                if (
                    i === 0 ||
                    i === ROOM_ROWS - 1 ||
                    j === 0 ||
                    j === ROOM_COLS - 1
                ) {

                    grid[i][j] =
                        this.#isDoorGap(i, j)
                            ? "door"
                            : "wall";

                } else {

                    grid[i][j] = "floor";
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
                                row * TILE_SIZE + TILE_SIZE / 2
                            )
                        )
                    );
                }
            }
        }
    }

    getDoorPosition(direction){

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
            row * TILE_SIZE + TILE_SIZE / 2
        );
    }

    #isDoorGap(row, col) {

        if (
            this.doorDirections.includes("north") &&
            row === 0 &&
            col === Math.floor(ROOM_COLS / 2)
        ) return true;

        if (
            this.doorDirections.includes("south") &&
            row === ROOM_ROWS - 1 &&
            col === Math.floor(ROOM_COLS / 2)
        ) return true;

        if (
            this.doorDirections.includes("east") &&
            row === Math.floor(ROOM_ROWS / 2) &&
            col === ROOM_COLS - 1
        ) return true;

        if (
            this.doorDirections.includes("west") &&
            row === Math.floor(ROOM_ROWS / 2) &&
            col === 0
        ) return true;

        return false;
    }
}