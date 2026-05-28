import Vector from "../../../Utils/Vector.js";
import EnemyBullet from "../../EnemyBullet.js";
import Enemy from "../../Enemy.js";

export default class RangedEnemy extends Enemy {
  constructor(position, deps) {
    super(position, deps);

    // BALANCE
    this.speed = 52;

    this.health = 30;
    this.maxHealth = 30;

    // Smaller size
    this.width = 16;
    this.height = 16;
    this.color = "orange";
    this.originalColor = "orange";

    this.contactDamage = 8;

    // Shooting
    this.shootCooldown = 0;
    this.shootRate = 1.5;

    // Preferred distance
    this.preferredDistance = 180;
  }

  onUpdate(deltaTime) {
    this.shootCooldown -= deltaTime;

    const direction = new Vector(
      this.player.position.x - this.position.x,
      this.player.position.y - this.position.y,
    );

    const normalizedDirection = direction.normalize();
    const distance = direction.magnitude();

    // KEEP DISTANCE AI
    if (distance > this.preferredDistance + 30) {
      // Move toward player
      this.velocity = normalizedDirection.times(this.speed);
    } else if (distance < this.preferredDistance - 30) {
      // Move away from player
      this.velocity = normalizedDirection.times(-this.speed);
    } else {
      // Strafe around player
      const strafeDirection = new Vector(
        -normalizedDirection.y,
        normalizedDirection.x,
      );

      this.velocity = strafeDirection.times(this.speed * 0.7);
    }

    // SHOOT
    if (distance < 300 && this.shootCooldown <= 0) {
      const bulletPosition = this.position.plus(normalizedDirection.times(18));
      this.bullets.push(new EnemyBullet(bulletPosition, normalizedDirection));
      this.shootCooldown = this.shootRate;
    }
  }
}
