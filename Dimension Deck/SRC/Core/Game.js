import Player from "../Entities/Player.js";

import Vector from "../Utils/Vector.js";

import InputManager from "./InputManager.js";
import Renderer from "./Renderer.js";
import HUD from "../UI/HUD.js";

import SeededRandom from "../Utils/SeededRandom.js";
import DimensionManager from "../Systems/DimensionManager.js";

import MouseManager from "./MouseManager.js";
import InteractionManager from "../Systems/InteractionManager.js";

export default class Game {

    constructor(canvas) {

        this.lastTime = 0;

        this.initManagers(canvas);

        this.initEntities();

        this.initWorld();

        this.start();
    }

    initManagers(canvas) {

        this.renderer = new Renderer(canvas);

        this.input = new InputManager();

        this.interaction = new InteractionManager(this.input);

        this.mouse = new MouseManager(canvas);

        this.hud = new HUD();

        this.renderer.resize();

        this.renderer.setupResizeListener();
    }

    initEntities() {

        this.player = new Player(
            new Vector(0, 0),
            this.input,
            this.mouse
        );
    }

    initWorld() {

        const rng = new SeededRandom();

        this.dimManager = new DimensionManager(
            rng,
            this.player,
            () => this.onVictory()
        );

        this.dimManager.startRun();
    }

    start() {

        requestAnimationFrame(
            (ts) => this.gameLoop(ts)
        );
    }

    gameLoop(timestamp) {

        const deltaTime = Math.min(
            (timestamp - this.lastTime) / 1000,
            0.05
        );

        this.lastTime = timestamp;

        this.update(deltaTime);

        this.render();

        requestAnimationFrame(
            (ts) => this.gameLoop(ts)
        );
    }

    update(deltaTime) {

        const prevHealth = this.player.health;

        // Player
        this.player.update(deltaTime);

        // Rooms + enemies + bullets
        this.dimManager
            .getRoomManager()
            .update(deltaTime);

        // HUD flash
        if (this.player.health < prevHealth) {

            this.hud.triggerDamageFlash();
        }

        this.hud.update(deltaTime);
    }

    render() {

        this.renderer.clear();

        // Draw room + enemies + bullets
        this.dimManager
            .getRoomManager()
            .draw(this.renderer);

        // Draw player
        this.player.draw(this.renderer);

        // Draw HUD
        this.hud.draw(
            this.renderer,
            this.player
        );
    }

    onVictory() {

        console.log(
            "Victory! Run completed"
        );
    }
}