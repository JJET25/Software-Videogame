import Enemy from "./Enemy.js";
import EnemyBullet from "./EnemyBullet.js";

import Vector from "../Utils/Vector.js";

export default class RangedEnemy extends Enemy {

    constructor(position, player, bullets) {

        super(position, player);

        this.bullets = bullets;

        this.speed = 60;

        this.health = 40;
        this.maxHealth = 40;

        this.color = "orange";
        this.originalColor = "orange";

        this.shootCooldown = 0;
    }

    update(deltaTime) {

        // Cooldown timer
        this.shootCooldown -= deltaTime;

        const direction = new Vector(
            this.player.position.x - this.position.x,
            this.player.position.y - this.position.y
        );

        const distance = Math.sqrt(
            direction.x * direction.x +
            direction.y * direction.y
        );

        // Move if far away
        if (distance > 250) {

            this.velocity = direction.normalize().times(this.speed);

        } else {

            // Stop moving
            this.velocity = new Vector(0, 0);

            // Shoot
            if (this.shootCooldown <= 0) {

                const bullet = new EnemyBullet(
                    new Vector(
                        this.position.x,
                        this.position.y
                    ),
                    direction
                );

                this.bullets.push(bullet);

                this.shootCooldown = 1.5;
            }
        }

        // Move enemy
        this.position = this.position.plus(
            this.velocity.times(deltaTime)
        );
    }
}