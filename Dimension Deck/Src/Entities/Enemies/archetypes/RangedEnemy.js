import Vector from "../../../Utils/Vector.js";
import EnemyBullet from "../../EnemyBullet.js";
import Enemy from "../../Enemy.js";

export default class RangedEnemy extends Enemy {
  constructor(position, player, bullets, credits) {
    super(position, player);

    this.bullets = bullets;

    this.speed = 65;
    this.health = 40;
    this.maxHealth = 40;

    this.width = 22;
    this.height = 22;

    this.color = "orange";
    this.originalColor = "orange";

    this.contactDamage = 8;

    // Shooting
    this.shootCooldown = 0;
    this.shootRate = 1.4;

    // Preferred distance
    this.preferredDistance = 220;
  }

  update(deltaTime) {
    if (this.isDead) return;

    if (this._flashTimer > 0) {
      this._flashTimer -= deltaTime;
    }

    if (this.damageCooldown > 0) {
      this.damageCooldown -= deltaTime;
    }

    this.shootCooldown -= deltaTime;

    const direction = new Vector(
      this.player.position.x - this.position.x,
      this.player.position.y - this.position.y,
    );

    const normalizedDirection = direction.normalize();
    const distance = direction.magnitude();

    // KEEP DISTANCE AI
    if (distance > this.preferredDistance + 40) {
      // Move toward player
      this.velocity = normalizedDirection.times(this.speed);
    } else if (distance < this.preferredDistance - 40) {
      // Move away from player
      this.velocity = normalizedDirection.times(-this.speed);
    } else {
      // Strafe around player
      const strafeDirection = new Vector(
        -normalizedDirection.y,
        normalizedDirection.x,
      );

      this.velocity = strafeDirection.times(this.speed * 0.8);
    }

    // SHOOT
    if (distance < 350 && this.shootCooldown <= 0) {
      const bulletPosition = this.position.plus(
        normalizedDirection.times(20),
      );

      this.bullets.push(
        new EnemyBullet(bulletPosition, normalizedDirection),
      );

      this.shootCooldown = this.shootRate;
    }

    // Contact damage
    const dx = Math.abs(this.player.position.x - this.position.x);
    const dy = Math.abs(this.player.position.y - this.position.y);

    if (dx < 28 && dy < 28 && this.damageCooldown <= 0) {
      this.player.takeDamage(this.contactDamage);
      this.damageCooldown = 0.6;
    }

    this.position = this.position.plus(
      this.velocity.times(deltaTime),
    );

    if (this.health <= 0) {
      this.die();
    }
  }
}