import Player from "../Entities/Player.js";
import Enemy from "../Entities/Enemy.js";

import Vector from "../Utils/Vector.js";

import Room from "../World/Room.js";

import InputManager from "./Input.js";
import Mouse from "./Mouse.js";
import Renderer from "./Renderer.js";
import HUD from "../UI/HUD.js";
import InteractionManager from "../Systems/InteractionManager.js";

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
    constructor(canvas) {
        this.renderer    = new Renderer(canvas);
        this.input       = new InputManager();
        this.mouse       = new Mouse(canvas);
        this.room        = new Room();
        this.player      = new Player(new Vector(240, 176), this.input, this.mouse);
        this.hud         = new HUD();
        this.interaction = new InteractionManager(this.input);
        this.lastTime    = 0;

        this.renderer.resize();
        this.renderer.setupResizeListener(); // registered once — safe

        this.start();
    }

    start() {
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }

    gameLoop(timestamp) {

        const deltaTime = (timestamp - this.lastTime) / 1000;

        requestAnimationFrame((ts) => this.gameLoop(ts));
    }

    gameLoop(timestamp) {
        // Cap deltaTime to 50 ms to avoid large jumps after tab-switch or breakpoints
        const deltaTime = Math.min((timestamp - this.lastTime) / 1000, 0.05);
        this.lastTime = timestamp;

        const prevHealth = this.player.health;

        // Update
        this.renderer.setupResizeListener();

        this.player.update(deltaTime);

        this.room.update(deltaTime, this.player);
        this.interaction.update(this.player, this.room.interactables);

        if (this.player.health < prevHealth) {
            this.hud.triggerDamageFlash();
        }
        this.hud.update(deltaTime);

        // Update enemies
        for (let enemy of this.enemies) {
            enemy.update(deltaTime);
        }

        // Remove dead enemies
        this.enemies = this.enemies.filter(enemy => !enemy.isDead);

        // Clear
        this.renderer.clear();

        // Draw — HUD must come last so it renders on top
        this.room.draw(this.renderer);

        this.player.draw(this.renderer);
        this.hud.draw(this.renderer, this.player);

        // Draw enemies
        for (let enemy of this.enemies) {
            enemy.draw(this.renderer);
        }

        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
        requestAnimationFrame((ts) => this.gameLoop(ts));
    }
}