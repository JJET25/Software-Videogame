import Enemy from "../Enemy.js";
import EnemyBullet from "../EnemyBullet.js";
import Vector from "../../Utils/Vector.js";

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

        // Shoot immediately
        this.shootCooldown = 0;

        // Attack distance
        this.attackRange = 350;

        // Time between shots
        this.fireRate = 1.2;

        // No melee damage
        this.contactDamage = 0;

        this.isDead = false;
    }

    update(deltaTime) {
        if (this.isDead) return;

        // Cooldown timer
        this.shootCooldown -= deltaTime;

        const direction           = new Vector(
            this.player.position.x - this.position.x,
            this.player.position.y - this.position.y
        );

        const normalizedDirection =
            direction.normalize();

        const distance = direction.magnitude();

        // Move only if too far
        if (distance > this.attackRange) {

            this.velocity = normalizedDirection.times(
                this.speed
            );
        }

        else {

            this.velocity = new Vector(0, 0);

            // SHOOT
            if (this.shootCooldown <= 0) {

                this.shoot(normalizedDirection);

                this.shootCooldown = this.fireRate;
            }
        }

        // Tick timers (_flashTimer, _invincibleTimer) + apply movement
        if (this._flashTimer > 0) this._flashTimer -= deltaTime;
        this.position = this.position.plus(this.velocity.times(deltaTime));
    }

    shoot(direction) {

        this.bullets.push(

            new EnemyBullet(

                new Vector(
                    this.position.x +
                    direction.x * 50,

                    this.position.y +
                    direction.y * 50
                ),

                direction
            )
        );
    }
}