import Enemy from "./Enemy.js";

import EnemyBullet from "./EnemyBullet.js";

import Vector from "../Utils/Vector.js";

export default class RangedEnemy extends Enemy {

    constructor(position, player, bullets, credits = null) {

        super(position, player, credits);

        this.bullets = bullets;

        // Stats
        this.speed = 60;

        this.health = 40;
        this.maxHealth = 40;

        // Visual
        this.color = "orange";
        this.originalColor = "orange";

        // Shoot timer
        this.shootCooldown = 0;

        // Disable melee damage
        this.contactDamage = 0;
    }

    update(deltaTime) {

        // Cooldown
        this.shootCooldown -= deltaTime;

        // Direction to player
        const direction = new Vector(
            this.player.position.x - this.position.x,
            this.player.position.y - this.position.y
        );

        const normalizedDirection = direction.normalize();

        const distance = direction.magnitude();

        // FOLLOW ONLY IF TOO FAR
        if (distance > 350) {

            this.velocity = normalizedDirection.times(this.speed);

        } else {

            // STOP MOVING
            this.velocity = new Vector(0, 0);

            // SHOOT
            if (this.shootCooldown <= 0) {

                this.bullets.push(

                    new EnemyBullet(

                        new Vector(
                            this.position.x + normalizedDirection.x * 50,
                            this.position.y + normalizedDirection.y * 50
                        ),

                        normalizedDirection
                    )
                );

                this.shootCooldown = 1.2;
            }
        }

        // MOVE MANUALLY
        this.position = this.position.plus(
            this.velocity.times(deltaTime)
        );
    }
}