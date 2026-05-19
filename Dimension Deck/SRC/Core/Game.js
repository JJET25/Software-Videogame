import Player from "../Entities/Player.js";
import Enemy from "../Entities/Enemy.js";
import Vector from "../Utils/Vector.js";
import InputManager from "./InputManager.js";
import MouseManager from "./MouseManager.js";
import Renderer from "./Renderer.js";
import HUD from "../UI/HUD.js";
import DeckScreen from "../UI/DeckScreen.js";
import CardManager from "../Cards/CardManager.js";
import SeededRandom from "../Utils/SeededRandom.js";
import DimensionManager from "../Systems/DimensionManager.js";
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
        this.renderer    = new Renderer(canvas);
        this.input       = new InputManager();
        this.mouse       = new MouseManager(canvas);
        this.interaction = new InteractionManager(this.input);
        this.cardManager = new CardManager();
        this.hud         = new HUD();
        this.deckScreen  = new DeckScreen();

        // Render configs
        this.renderer.resize();
        this.renderer.setupResizeListener();
    }

    initEntities() {
        this.player = new Player(new Vector(0, 0), this.input, this.mouse);
        this.player.cardManager = this.cardManager;

        // No va ser necesario en un futuro, eliminar luego
        this.enemies = [
            new Enemy(new Vector(500, 300), this.player),
            new Enemy(new Vector(700, 200), this.player),
        ];
    }

    initWorld() {
        const rng = new SeededRandom();
        this.dimManager = new DimensionManager(rng, this.player, () => this.onVictory());
        this.dimManager.startRun();
    }

    start() {
        requestAnimationFrame((ts) => this.gameLoop(ts));
    }

    gameLoop(timestamp) {
        // Prevent huge delta spikes
        const deltaTime = Math.min((timestamp - this.lastTime) / 1000, 0.05);
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.render();

        // Must be last — clears wasKeyPressed flags after all systems have read input
        this.input.update();

        requestAnimationFrame((ts) => this.gameLoop(ts));
    }

    update(deltaTime) {
        const prevHealth = this.player.health;

        this.player.update(deltaTime);
        this.cardManager.update(deltaTime);
        this.dimManager.getRoomManager().update(deltaTime);

        // Visual effects HUD damage
        if (this.player.health < prevHealth) this.hud.triggerDamageFlash();
        this.hud.update(deltaTime);
        this.deckScreen.update(this.input);

        // Update and filter alive enemies
        for (const enemy of this.enemies) { enemy.update(deltaTime); }
        this.enemies = this.enemies.filter(enemy => !enemy.isDead);
    }

    render() {
        this.renderer.clear();

        this.dimManager.getRoomManager().draw(this.renderer);
        this.player.draw(this.renderer);

        for (const enemy of this.enemies) {
            enemy.draw(this.renderer);
        }

        this.hud.draw(this.renderer, this.player, this.cardManager);
        this.deckScreen.draw(this.renderer, this.cardManager);
    }

    onVictory() {
        console.log("Victoria! Run completada");
        // Aqui implementar pantalla de victoria en un futuro
    }
}