import Player from "../Entities/Player.js";
import Enemy from "../Entities/Enemy.js";

import Vector from "../Utils/Vector.js";

import Room from "../World/Room.js";

import InputManager from "./Input.js";
import Renderer from "./Renderer.js";

export default class Game {

    constructor(canvas) {

        this.renderer = new Renderer(canvas);

        this.input = new InputManager();

        this.room = new Room();

        this.player = new Player(
            new Vector(100, 100),
            this.input
        );

        // Enemy list
        this.enemies = [
            new Enemy(new Vector(500, 300), this.player),
            new Enemy(new Vector(700, 200), this.player)
        ];

        this.lastTime = 0;

        this.renderer.resize();
        this.renderer.setupResizeListener();

        // Game starts
        this.start();
    }

    start() {
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }

    gameLoop(timestamp) {

        const deltaTime = (timestamp - this.lastTime) / 1000;

        this.lastTime = timestamp;

        // Update
        this.renderer.setupResizeListener();

        this.player.update(deltaTime);

        this.room.update(deltaTime, this.player);

        // Update enemies
        for (let enemy of this.enemies) {
            enemy.update(deltaTime);
        }

        // Remove dead enemies
        this.enemies = this.enemies.filter(enemy => !enemy.isDead);

        // Clear
        this.renderer.clear();

        // Draw
        this.room.draw(this.renderer);

        this.player.draw(this.renderer);

        // Draw enemies
        for (let enemy of this.enemies) {
            enemy.draw(this.renderer);
        }

        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
}