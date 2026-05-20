import Player from "../Entities/Player.js";

import Enemy from "../Entities/Enemy.js";
import SwarmEnemy from "../Entities/SwarmEnemy.js";
import TankEnemy from "../Entities/TankEnemy.js";
import RangedEnemy from "../Entities/RangedEnemy.js";

import EnemyBullet from "../Entities/EnemyBullet.js";

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
import MiniMap from "../UI/Minimap.js";

export default class Game {
    constructor(canvas) {
        this.lastTime = 0;
        this.initManagers(canvas);
        this.initEntities();
        this.initWorld();
        this.initGUI();
        this.start();
    }

    initManagers(canvas) {
        this.renderer = new Renderer(canvas);
        this.input = new InputManager();
        this.mouse = new MouseManager(canvas);
        this.interaction = new InteractionManager(this.input);
        this.cardManager = new CardManager();

        this.renderer.resize();
        this.renderer.setupResizeListener();
    }

    initEntities() {

        this.player = new Player(
            new Vector(0, 0),
            this.input,
            this.mouse
        );

        this.player.cardManager = this.cardManager;

        // Enemy bullets
        this.enemyBullets = [];

        // Temporary enemy setup
        this.enemies = [

            new Enemy(
                new Vector(500, 300),
                this.player
            ),

            new SwarmEnemy(
                new Vector(700, 200),
                this.player
            ),

            new TankEnemy(
                new Vector(850, 300),
                this.player
            ),

            new RangedEnemy(
                new Vector(900, 150),
                this.player,
                this.enemyBullets
            )
        ];
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

    initGUI(){
        this.hud = new HUD();
        this.deckScreen = new DeckScreen();
        this.minimap = new MiniMap(this.dimManager);
    }

    start() { requestAnimationFrame((ts) => this.gameLoop(ts)); }

    gameLoop(timestamp) {
        const deltaTime = Math.min((timestamp - this.lastTime) / 1000, 0.05);
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.render();
        this.input.update();
        
        requestAnimationFrame((ts) => this.gameLoop(ts));
    }

    update(deltaTime) {
        const prevHealth = this.player.health;

        // Player
        this.player.update(deltaTime);

        // Cards
        this.cardManager.update(deltaTime);

        // Rooms
        this.dimManager
            .getRoomManager()
            .update(deltaTime);

        // Enemy bullets
        for (let bullet of this.enemyBullets) {

            bullet.update(deltaTime);
        }

        // Bullet collision
        this.enemyBullets = this.enemyBullets.filter(bullet => {

            const distanceX = Math.abs(
                this.player.position.x - bullet.position.x
            );

            const distanceY = Math.abs(
                this.player.position.y - bullet.position.y
            );

            if (distanceX < 20 && distanceY < 20) {

                this.player.takeDamage(
                    bullet.damage
                );

                return false;
            }

            return true;
        });

        // HUD flash
        if (this.player.health < prevHealth) { this.hud.triggerDamageFlash(); }
        if (this.input.isKeyDown("M")) this.minimap.toggle();

        this.hud.update(deltaTime);
        this.deckScreen.update(this.input);

        // Remove dead enemies
        this.enemies = this.enemies.filter(
            enemy => !enemy.isDead
        );
    }

    render() {

        this.renderer.clear();

        // Draw room
        this.dimManager
            .getRoomManager()
            .draw(this.renderer);

        // Draw player
        this.player.draw(this.renderer);

        // Draw enemies
        for (let enemy of this.enemies) {

            enemy.draw(this.renderer);
        }

        // Draw bullets
        for (let bullet of this.enemyBullets) {

            bullet.draw(this.renderer);
        }

        // Draw HUD
        this.hud.draw(
            this.renderer,
            this.player,
            this.cardManager
        );

        // Draw deck screen
        this.deckScreen.draw(
            this.renderer,
            this.cardManager
        );

        this.minimap.draw(this.renderer);
    }

    onVictory() { console.log("Victory! Run completed"); }
}