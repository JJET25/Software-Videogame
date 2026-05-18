import Player from "../Entities/Player.js";
import Enemy from "../Entities/Enemy.js";

import Vector from "../Utils/Vector.js";

import Room from "../World/Room.js";

import InputManager from "./Input.js";
import Mouse from "./Mouse.js";
import Renderer from "./Renderer.js";

import HUD from "../UI/HUD.js";
import DeckScreen from "../UI/DeckScreen.js";
import CardManager from "../Cards/CardManager.js";

import InteractionManager from "../Systems/InteractionManager.js";

export default class Game {

    constructor(canvas) {

        this.renderer = new Renderer(canvas);

        this.input = new InputManager();

        this.mouse = new Mouse(canvas);

        this.room = new Room();

        this.player = new Player(
            new Vector(240, 176),
            this.input,
            this.mouse
        );

        this.cardManager = new CardManager();
        this.player.cardManager = this.cardManager;

        this.hud        = new HUD();
        this.deckScreen = new DeckScreen();

        this.interaction = new InteractionManager(this.input);

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
        this.cardManager.update(deltaTime);

        this.room.update(deltaTime, this.player);

        this.interaction.update(
            this.player,
            this.room.interactables
        );

        if (this.player.health < prevHealth) {
            this.hud.triggerDamageFlash();
        }

        this.hud.update(deltaTime);
        this.deckScreen.update(this.input);

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

        // HUD + overlays render last
        this.hud.draw(this.renderer, this.player, this.cardManager);
        this.deckScreen.draw(this.renderer, this.cardManager);

        // Clear pressed-this-frame set after all systems have read input
        this.input.update();

        requestAnimationFrame((ts) => this.gameLoop(ts));
    }
}
