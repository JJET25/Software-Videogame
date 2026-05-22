import Enemy from "../Enemy.js";

import EnemyBullet from "../EnemyBullet.js";

import SwarmEnemy from "./SwarmEnemy.js";

import RangedEnemy from "./RangedEnemy.js";

import TankEnemy from "./TankEnemy.js";

import Vector from "../../Utils/Vector.js";

export default class BossEnemy extends Enemy {

    constructor(
        position,
        player,
        bullets,
        credits
    ) {

        super(position, player);

        this.bullets = bullets;

        this.credits = credits;

        // Boss size
        this.width = 80;

        this.height = 80;

        // Stats
        this.health = 2500;

        this.maxHealth = 2500;

        this.speed = 32;

        this.contactDamage = 35;

        // Phases
        this.phase = 1;

        this.isEnraged = false;

        // Dash
        this.dashSpeed = 380;

        this.dashCooldown = 0;

        this.isDashing = false;

        this.dashTimer = 0;

        this.dashDirection =
            new Vector(0, 0);

        // Attacks
        this.attackCooldown = 0;

        this.radialCooldown = 0;

        // Summons
        this.summonCooldown = 6;

        this.enemyList = null;
    }

    update(deltaTime) {

        if (this.isDead) return;

        // Timers
        this.dashCooldown -= deltaTime;

        this.dashTimer -= deltaTime;

        this.attackCooldown -= deltaTime;

        this.radialCooldown -= deltaTime;

        this.summonCooldown -= deltaTime;

        if (this._flashTimer > 0) {

            this._flashTimer -= deltaTime;
        }

        if (this.damageCooldown > 0) {

            this.damageCooldown -= deltaTime;
        }

        // Phase transitions
        this.updatePhase();

        // Direction
        const dir = new Vector(

            this.player.position.x -
            this.position.x,

            this.player.position.y -
            this.position.y
        );

        const normDir =
            dir.normalize();

        const distance =
            dir.magnitude();

        // Dash behavior
        if (this.isDashing) {

            this.velocity =
                this.dashDirection.times(
                    this.dashSpeed
                );

            if (this.dashTimer <= 0) {

                this.isDashing = false;
            }
        }

        else {

            this.velocity =
                normDir.times(
                    this.speed
                );

            // Dash trigger
            if (
                distance < 320 &&
                this.dashCooldown <= 0
            ) {

                this.startDash(normDir);
            }
        }

        // Shoot attacks
        if (this.attackCooldown <= 0) {

            this.shootBurst(normDir);

            this.attackCooldown =
                this.phase === 3
                    ? 0.8
                    : 1.5;
        }

        // Radial attack
        if (
            this.phase >= 2 &&
            this.radialCooldown <= 0
        ) {

            this.radialAttack();

            this.radialCooldown =
                this.phase === 3
                    ? 2
                    : 4;
        }

        // Summons
        if (this.summonCooldown <= 0) {

            this.summonEnemies();
        }

        // Contact damage
        const dx = Math.abs(

            this.player.position.x -
            this.position.x
        );

        const dy = Math.abs(

            this.player.position.y -
            this.position.y
        );

        if (

            dx < 60 &&
            dy < 60 &&
            this.damageCooldown <= 0
        ) {

            this.player.takeDamage(
                this.contactDamage
            );

            this.damageCooldown = 0.5;
        }

        // Move
        this.position =
            this.position.plus(

                this.velocity.times(
                    deltaTime
                )
            );

        // Death
        if (this.health <= 0) {

            this.die();
        }
    }

    updatePhase() {

        // Phase 2
        if (
            this.health <=
            this.maxHealth * 0.65 &&
            this.phase === 1
        ) {

            this.phase = 2;

            this.speed = 45;

            this.dashSpeed = 500;
        }

        // Phase 3
        if (
            this.health <=
            this.maxHealth * 0.3 &&
            this.phase === 2
        ) {

            this.phase = 3;

            this.speed = 60;

            this.dashSpeed = 700;

            this.isEnraged = true;
        }
    }

    startDash(direction) {

        this.isDashing = true;

        this.dashTimer = 0.45;

        this.dashDirection = direction;

        this.dashCooldown =
            this.phase === 3
                ? 1.2
                : 3;
    }

    shootBurst(direction) {

        const spread = [-0.25, 0, 0.25];

        for (let angle of spread) {

            const rotated =
                new Vector(

                    direction.x *
                    Math.cos(angle) -

                    direction.y *
                    Math.sin(angle),

                    direction.x *
                    Math.sin(angle) +

                    direction.y *
                    Math.cos(angle)
                );

            this.bullets.push(

                new EnemyBullet(

                    new Vector(

                        this.position.x,

                        this.position.y
                    ),

                    rotated.normalize()
                )
            );
        }
    }

    radialAttack() {

        const bulletCount =
            this.phase === 3
                ? 18
                : 12;

        for (
            let i = 0;
            i < bulletCount;
            i++
        ) {

            const angle =
                (Math.PI * 2 / bulletCount)
                * i;

            const dir =
                new Vector(

                    Math.cos(angle),

                    Math.sin(angle)
                );

            this.bullets.push(

                new EnemyBullet(

                    new Vector(

                        this.position.x,

                        this.position.y
                    ),

                    dir
                )
            );
        }
    }

    summonEnemies() {

        if (!this.enemyList) return;

        // Phase 1
        if (this.phase === 1) {

            for (let i = 0; i < 3; i++) {

                this.enemyList.push(

                    new SwarmEnemy(

                        this.randomSpawn(),

                        this.player
                    )
                );
            }

            this.summonCooldown = 7;
        }

        // Phase 2
        else if (this.phase === 2) {

            for (let i = 0; i < 4; i++) {

                this.enemyList.push(

                    new SwarmEnemy(

                        this.randomSpawn(),

                        this.player
                    )
                );
            }

            this.enemyList.push(

                new RangedEnemy(

                    this.randomSpawn(),

                    this.player,

                    this.bullets
                )
            );

            this.summonCooldown = 5;
        }

        // Phase 3
        else {

            for (let i = 0; i < 5; i++) {

                this.enemyList.push(

                    new SwarmEnemy(

                        this.randomSpawn(),

                        this.player
                    )
                );
            }

            this.enemyList.push(

                new TankEnemy(

                    this.randomSpawn(),

                    this.player,

                    this.enemyList
                )
            );

            this.enemyList.push(

                new RangedEnemy(

                    this.randomSpawn(),

                    this.player,

                    this.bullets
                )
            );

            this.summonCooldown = 4;
        }
    }

    randomSpawn() {

        return new Vector(

            this.position.x +
            (Math.random() - 0.5) * 260,

            this.position.y +
            (Math.random() - 0.5) * 260
        );
    }
}