import Vector from "../../../Utils/Vector.js";
import EnemyBullet from "../../EnemyBullet.js";
import Enemy from "../../Enemy.js";
import { randInt } from "../../../Utils/Random.js";

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

    // Hitbox
    this.hitboxWidth = this.width;
    this.hitboxHeight = this.height;

    this.activationDelay = 0.8;

    // Shooting
    this.shootCooldown = 0;
    this.shootRate = 1.5;

    // Preferred distance
    this.preferredDistance = 100;
    this._strafeDir = Math.random() > 0.5 ? 1 : -1;
    this._strafeTimer = randInt(3, 5);
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
      this._strafeTimer -= deltaTime;
      if (this._strafeTimer <= 0) {
        this._strafeDir *= -1;
        this._strafeTimer = randInt(3, 5);
      }
      // Strafe around player
      const strafeDirection = new Vector(
        -normalizedDirection.y,
        normalizedDirection.x,
      );

      this.velocity = strafeDirection.times(this.speed * 0.7 * this._strafeDir);
    }

    // SHOOT
    if (distance < 300 && this.shootCooldown <= 0) {
      const bulletPosition = this.position.plus(normalizedDirection.times(18));
      this.bullets.push(new EnemyBullet(bulletPosition, normalizedDirection));
      this.shootCooldown = this.shootRate;
    }
  }
}
