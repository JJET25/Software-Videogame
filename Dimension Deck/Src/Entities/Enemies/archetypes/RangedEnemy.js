import { randInt } from "../../../Utils/Random.js";
import Vector from "../../../Utils/Vector.js";
import EnemyBullet from "../../EnemyBullet.js";
import Enemy from "../../Enemy.js";

const PREFERRED_DISTANCE = 100;
const DISTANCE_BUFFER = 30;
const SHOOT_RANGE = 300;
const STRAFE_SPEED_MULT = 0.7;

export default class RangedEnemy extends Enemy {
  constructor(position, deps) {
    super(position, deps);

    this.speed = 52;
    this.health = 30;
    this.maxHealth = 30;
    this.contactDamage = 8;
    this.activationDelay = 0.8;

    this.width = 16;
    this.height = 16;
    this.hitboxWidth = this.width;
    this.hitboxHeight = this.height;

    this.color = "orange";
    this.originalColor = "orange";

    // Shooting
    this.shootCooldown = 0;
    this.shootRate = 1.5;

    // Strafe state
    this._strafeDir = randInt(0, 1) === 0 ? 1 : -1;
    this._strafeTimer = randInt(3, 5);
  }

  onUpdate(deltaTime) {
    this.shootCooldown -= deltaTime;

    const dir = new Vector(
      this.player.position.x - this.position.x,
      this.player.position.y - this.position.y,
    );
    const normDir = dir.normalize();
    const distance = dir.magnitude();

    this.#updateMovement(deltaTime, normDir, distance);
    this.#updateShooting(normDir, distance);
  }

  // --------------------- PRIVATE ---------------------
  // Keep preferred distance, approach, retreat, or strafe
  #updateMovement(deltaTime, normDir, distance) {
    if (distance > PREFERRED_DISTANCE + DISTANCE_BUFFER) {
      // Too far — move in
      this.velocity = normDir.times(this.speed);
    } else if (distance < PREFERRED_DISTANCE - DISTANCE_BUFFER) {
      // Too close — back off
      this.velocity = normDir.times(-this.speed);
    } else {
      // In range — strafe and flip direction periodically
      this._strafeTimer -= deltaTime;
      if (this._strafeTimer <= 0) {
        this._strafeDir *= -1;
        this._strafeTimer = randInt(3, 5);
      }
      const strafeDir = new Vector(-normDir.y, normDir.x);
      this.velocity = strafeDir.times(
        this.speed * STRAFE_SPEED_MULT * this._strafeDir,
      );
    }
  }

  // Shoot a single bullet toward the player when in range
  #updateShooting(normDir, distance) {
    if (distance >= SHOOT_RANGE || this.shootCooldown > 0) return;
    this.bullets.push(
      new EnemyBullet(this.position.plus(normDir.times(18)), normDir),
    );
    this.shootCooldown = this.shootRate;
  }
}
