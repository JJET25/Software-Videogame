import Player from "../Entities/Player.js";
import Enemy from "../Entities/Enemy.js";
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

        // Render configs
        this.renderer.resize();
        this.renderer.setupResizeListener();
    }

    initEntities() {
        this.player = new Player(new Vector(0, 0), this.input, this.mouse);

        // No va ser necesario en un futuro, eliminar luego
        this.enemies = [
            new Enemy(new Vector(500, 300), this.player),
            new Enemy(new Vector(700, 200), this.player)
        ];
    }

    initWorld() {
        const rng = new SeededRandom();
        this.dimManager = new DimensionManager(rng, this.player, () => this.onVictory());
        this.dimManager.startRun();
    }

    start() { requestAnimationFrame((ts) => this.gameLoop(ts)); }

    gameLoop(timestamp) {
        // Prevent huge delta spikes
        const deltaTime = Math.min((timestamp - this.lastTime) / 1000, 0.05);
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame((ts) => this.gameLoop(ts));
    }

    update(deltaTime) {
        const prevHealth = this.player.health;

        this.player.update(deltaTime);
        this.dimManager.getRoomManager().update(deltaTime);

        //this.interaction.update(this.player, this.room.interactables);
        // Checar como resolver el room.interactables

        // Visual effets HUD damage
        if (this.player.health < prevHealth) this.hud.triggerDamageFlash();
        this.hud.update(deltaTime);
        // Realmente es necesario hacer esto en game.js??

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

        this.hud.draw(this.renderer, this.player);
    }

    onVictory() { console.log("Victoria! Run completada"); }
    // Aqui implementar pantalla de victoria en un futuro
}
