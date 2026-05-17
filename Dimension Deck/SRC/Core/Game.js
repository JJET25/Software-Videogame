import Player from "../Entities/Player.js";

import Enemy from "../Entities/Enemy.js";
import SwarmEnemy from "../Entities/SwarmEnemy.js";
import TankEnemy from "../Entities/TankEnemy.js";
import RangedEnemy from "../Entities/RangedEnemy.js";

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

        this.mouse = new Mouse(canvas);

        this.room = new Room();

        this.player = new Player(
            new Vector(240, 176),
            this.input,
            this.mouse
        );

        this.hud = new HUD();

        this.interaction = new InteractionManager(this.input);

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

        this.lastTime = 0;

        this.renderer.resize();

        this.renderer.setupResizeListener();

        this.start();
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

        const prevHealth = this.player.health;

        // Update player
        this.player.update(deltaTime);

        // Update room
        this.room.update(deltaTime, this.player);

        // Update interactions
        this.interaction.update(
            this.player,
            this.room.interactables
        );

        // Damage flash
        if (this.player.health < prevHealth) {
            this.hud.triggerDamageFlash();
        }

        this.hud.update(deltaTime);

        // Update enemies
        for (let enemy of this.enemies) {
            enemy.update(deltaTime);
        }

        // Update bullets
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

            // Smaller collision
            if (distanceX < 10 && distanceY < 10) {

                this.player.takeDamage(bullet.damage);

                return false;
            }

            return true;
        });

        // Remove dead enemies
        this.enemies = this.enemies.filter(
            enemy => !enemy.isDead
        );

        // Collect credits
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

        // Clear screen
        this.renderer.clear();

        // Draw room
        this.room.draw(this.renderer);

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

        // Draw credits
        for (let credit of this.credits) {

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

        requestAnimationFrame((ts) => this.gameLoop(ts));
    }
}