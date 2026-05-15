import Player from "../Entities/Player.js";
import Enemy from "../Entities/Enemy.js";

import Vector from "../Utils/Vector.js";

import Room from "../World/Room/Room.js";

import InputManager from "./Input.js";
import Mouse from "./Mouse.js";
import Renderer from "./Renderer.js";

import HUD from "../UI/HUD.js";

//import InteractionManager from "../Systems/InteractionManager.js";

export default class Game {

    constructor(canvas) {

        this.renderer = new Renderer(canvas);

        this.input = new InputManager();

        this.mouse = new Mouse(canvas);

        this.room = new Room(['north', 'east', 'south']);

        this.player = new Player(
            new Vector(240, 176),
            this.input,
            this.mouse
        );

        this.hud = new HUD();

        //this.interaction = new InteractionManager(this.input);

        // Enemy list
        this.enemies = [
            new Enemy(new Vector(500, 300), this.player),
            new Enemy(new Vector(700, 200), this.player)
        ];

        this.lastTime = 0;

        this.renderer.resize();

        this.renderer.setupResizeListener();

        this.start();
    }

    start() {

        requestAnimationFrame((ts) => this.gameLoop(ts));
    }

    gameLoop(timestamp) {

        // Prevent huge delta spikes
        const deltaTime = Math.min(
            (timestamp - this.lastTime) / 1000,
            0.05
        );

        this.lastTime = timestamp;

        const prevHealth = this.player.health;

        // Update
        this.player.update(deltaTime);

        this.room.update(deltaTime, this.player);

        //this.interaction.update(
        //    this.player,
        //    this.room.interactables
        //);

        if (this.player.health < prevHealth) {
            this.hud.triggerDamageFlash();
        }

        this.hud.update(deltaTime);

        // Update enemies
        for (let enemy of this.enemies) {
            enemy.update(deltaTime);
        }

        // Remove dead enemies
        this.enemies = this.enemies.filter(
            enemy => !enemy.isDead
        );

        // Clear
        this.renderer.clear();

        // Draw
        this.room.draw(this.renderer);

        this.player.draw(this.renderer);

        // Draw enemies
        for (let enemy of this.enemies) {
            enemy.draw(this.renderer);
        }

        // HUD should render last
        this.hud.draw(this.renderer, this.player);

        requestAnimationFrame((ts) => this.gameLoop(ts));
    }
}
