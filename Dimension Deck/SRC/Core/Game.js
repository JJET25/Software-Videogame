import Player from "../Entities/Player.js";

import Enemy from "../Entities/Enemy.js";
import SwarmEnemy from "../Entities/SwarmEnemy.js";
import TankEnemy from "../Entities/TankEnemy.js";
import RangedEnemy from "../Entities/RangedEnemy.js";

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

        this.player = new Player(
            new Vector(0, 0),
            this.input,
            this.mouse
        );

        // Credits
        this.credits = [];

        this.playerCredits = 0;

        // Enemy bullets
        this.enemyBullets = [];

        // Enemy list
        this.enemies = [

            new Enemy(
                new Vector(500, 300),
                this.player,
                this.credits
            ),

            new SwarmEnemy(
                new Vector(700, 200),
                this.player,
                this.credits
            ),

            new SwarmEnemy(
                new Vector(650, 400),
                this.player,
                this.credits
            ),

            new TankEnemy(
                new Vector(850, 300),
                this.player,
                this.credits
            ),

            new RangedEnemy(
                new Vector(900, 150),
                this.player,
                this.enemyBullets,
                this.credits
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

    start() {

        requestAnimationFrame((ts) => this.gameLoop(ts));
    }

    gameLoop(timestamp) {

        const deltaTime = Math.min(
            (timestamp - this.lastTime) / 1000,
            0.05
        );

        this.lastTime = timestamp;

        this.update(deltaTime);

        this.render();

        requestAnimationFrame((ts) => this.gameLoop(ts));
    }

    update(deltaTime) {

        const prevHealth = this.player.health;

        // Player
        this.player.update(deltaTime);

        // World
        this.dimManager.getRoomManager().update(deltaTime);

        // HUD flash
        if (this.player.health < prevHealth) {
            this.hud.triggerDamageFlash();
        }

        this.hud.update(deltaTime);

        // Enemies
        for (const enemy of this.enemies) {
            enemy.update(deltaTime);
        }

        // Remove dead enemies
        this.enemies = this.enemies.filter(
            enemy => !enemy.isDead
        );

        // Bullets
        for (const bullet of this.enemyBullets) {
            bullet.update(deltaTime);
        }

        // Bullet collisions
        this.enemyBullets = this.enemyBullets.filter(bullet => {

            const distanceX = Math.abs(
                this.player.position.x - bullet.position.x
            );

            const distanceY = Math.abs(
                this.player.position.y - bullet.position.y
            );

            if (distanceX < 10 && distanceY < 10) {

                this.player.takeDamage(bullet.damage);

                return false;
            }

            return true;
        });

        // Credits pickup
        this.credits = this.credits.filter(credit => {

            const distanceX = Math.abs(
                this.player.position.x - credit.x
            );

            const distanceY = Math.abs(
                this.player.position.y - credit.y
            );

            if (distanceX < 20 && distanceY < 20) {

                this.playerCredits += 10;

                console.log(
                    "Credits:",
                    this.playerCredits
                );

                return false;
            }

            return true;
        });
    }

    render() {

        this.renderer.clear();

        // Draw rooms
        this.dimManager
            .getRoomManager()
            .draw(this.renderer);

        // Draw player
        this.player.draw(this.renderer);

        // Draw enemies
        for (const enemy of this.enemies) {
            enemy.draw(this.renderer);
        }

        // Draw bullets
        for (const bullet of this.enemyBullets) {
            bullet.draw(this.renderer);
        }

        // Draw credits
        for (const credit of this.credits) {

            this.renderer.drawRect(
                credit.x,
                credit.y,
                14,
                14,
                "gold"
            );
        }

        // Draw HUD
        this.hud.draw(this.renderer, this.player);
    }

    onVictory() {

        console.log("Victoria! Run completada");
    }
}