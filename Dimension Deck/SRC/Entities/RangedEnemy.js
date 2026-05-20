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

        // No melee damage
        this.contactDamage = 0;

        this.isDead = false;
    }

    update(deltaTime) {
        if (this.isDead) return;

        this.shootCooldown -= deltaTime;

        const direction           = new Vector(
            this.player.position.x - this.position.x,
            this.player.position.y - this.position.y
        );
        const normalizedDirection = direction.normalize();
        const distance            = direction.magnitude();

        // Preferred range: 130–180px. Approach if too far, flee only if player is
        // very close (< 80px) — keeps the enemy reachable by melee at ~120px.
        if (distance > 180) {
            this.velocity = normalizedDirection.times(this.speed);
        } else if (distance < 80) {
            this.velocity = normalizedDirection.times(-this.speed);
        } else {
            this.velocity = new Vector(0, 0);
        }

        // Shoot at player
        if (this.shootCooldown <= 0) {
            this.bullets.push(new EnemyBullet(
                new Vector(
                    this.position.x + normalizedDirection.x * 50,
                    this.position.y + normalizedDirection.y * 50
                ),
                normalizedDirection
            ));
            this.shootCooldown = 1.2;
        }

        // Tick timers (_flashTimer, _invincibleTimer) + apply movement
        if (this._flashTimer > 0) this._flashTimer -= deltaTime;
        this.position = this.position.plus(this.velocity.times(deltaTime));
    }
}