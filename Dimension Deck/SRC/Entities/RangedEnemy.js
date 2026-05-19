import Enemy from "./Enemy.js";
import EnemyBullet from "./EnemyBullet.js";
import Vector from "../Utils/Vector.js";

export default class RangedEnemy extends Enemy {

    constructor(position, player, bullets, credits = null) {

        super(position, player, credits);

        this.bullets = bullets;

        // Slow ranged enemy
        this.speed = 25;

        this.health = 40;
        this.maxHealth = 40;

        this.color = "orange";
        this.originalColor = "orange";

        this.shootCooldown = -1;

        // No contact damage
        this.contactDamage = 0;
    }

    update(deltaTime) {

        this.shootCooldown -= deltaTime;

        const direction = new Vector(
            this.player.position.x - this.position.x,
            this.player.position.y - this.position.y
        );

        const normalizedDirection = direction.normalize();

        const distance = direction.magnitude();

        // Only move if too far away
        if (distance > 350) {

            this.velocity = normalizedDirection.times(this.speed);

        } else {

            // Stop and shoot
            this.velocity = new Vector(0, 0);
        }

        // Shoot bullets
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

        // Move enemy
        this.position = this.position.plus(
            this.velocity.times(deltaTime)
        );
    }
}