import Vector from "../../../Utils/Vector.js";
import Enemy from "../../Enemy.js";

export default class SwarmEnemy extends Enemy {
  constructor(position, player, credits) {
    super(position, player);

    // BALANCE
    this.speed = 82;

    this.health = 16;
    this.maxHealth = 16;

    // Smaller size
    this.width = 12;
    this.height = 12;

    this.color = "red";
    this.originalColor = "red";

    this.contactDamage = 6;

    this.orbitDirection = Math.random() > 0.5 ? 1 : -1;

    this.attackTimer = Math.random() * 1.5;

    this.isDiving = false;
  }

  update(deltaTime) {
    if (this.isDead) return;

    if (this._flashTimer > 0) {
      this._flashTimer -= deltaTime;
    }

    const direction = new Vector(
      this.player.position.x - this.position.x,
      this.player.position.y - this.position.y,
    );

    const distance = direction.magnitude();
    const normalizedDirection = direction.normalize();

    this.attackTimer -= deltaTime;

    // Dive attack
    if (this.attackTimer <= 0 && !this.isDiving) {
      this.isDiving = true;
      this.attackTimer = 0.55;
    }

    // End attack
    if (this.isDiving && this.attackTimer <= -0.2) {
      this.isDiving = false;
      this.attackTimer = 1.2 + Math.random() * 1.8;
    }

    // MOVEMENT
    if (this.isDiving) {
      this.velocity = normalizedDirection.times(this.speed * 1.6);
    } else {
      // Orbit movement
      const perpendicular = new Vector(
        -normalizedDirection.y * this.orbitDirection,
        normalizedDirection.x * this.orbitDirection,
      );

      let radialForce = 0;

      if (distance > 120) {
        radialForce = 0.35;
      } else if (distance < 80) {
        radialForce = -0.35;
      }

      const movement = perpendicular
        .plus(normalizedDirection.times(radialForce))
        .normalize();

      this.velocity = movement.times(this.speed);
    }

    // Contact damage
    this._applyContactDamage(deltaTime);

    this.position = this.position.plus(this.velocity.times(deltaTime));

    if (this.health <= 0) {
      this.die();
    }
  }
}
