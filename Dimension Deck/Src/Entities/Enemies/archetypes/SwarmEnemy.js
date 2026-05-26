import Vector from "../../../Utils/Vector.js";
import Enemy from "../../Enemy.js";

export default class SwarmEnemy extends Enemy {
  constructor(position, player, credits) {
    super(position, player);

    this.speed = 135;

    this.health = 20;
    this.maxHealth = 20;

    this.width = 18;
    this.height = 18;

    this.color = "red";
    this.originalColor = "red";

    this.contactDamage = 10;

    // Orbit behavior
    this.orbitDirection = Math.random() > 0.5 ? 1 : -1;

    // Attack cycle
    this.attackTimer = Math.random() * 1.2;

    this.isDiving = false;
  }

  update(deltaTime) {
    if (this.isDead) return;

    if (this._flashTimer > 0) {
      this._flashTimer -= deltaTime;
    }

    if (this.damageCooldown > 0) {
      this.damageCooldown -= deltaTime;
    }

    const direction = new Vector(
      this.player.position.x - this.position.x,
      this.player.position.y - this.position.y,
    );

    const distance = direction.magnitude();
    const normalizedDirection = direction.normalize();

    // Attack timers
    this.attackTimer -= deltaTime;

    // Start dive attack
    if (this.attackTimer <= 0 && !this.isDiving) {
      this.isDiving = true;

      // Attack duration
      this.attackTimer = 1.2;
    }

    // End dive attack
    if (this.isDiving && this.attackTimer <= -0.2) {
      this.isDiving = false;

      // Delay before next attack
      this.attackTimer = 0.6 + Math.random() * 1.2;
    }

    // MOVEMENT
    if (this.isDiving) {
      // Aggressive attack
      this.velocity = normalizedDirection.times(this.speed * 2.4);
    } else {
      // Orbit around player

      const perpendicular = new Vector(
        -normalizedDirection.y * this.orbitDirection,
        normalizedDirection.x * this.orbitDirection,
      );

      // Maintain circular distance
      let radialForce = 0;

      if (distance > 140) {
        radialForce = 0.45;
      } else if (distance < 100) {
        radialForce = -0.45;
      }

      const movement = perpendicular
        .plus(normalizedDirection.times(radialForce))
        .normalize();

      this.velocity = movement.times(this.speed);
    }

    // Contact damage
    const dx = Math.abs(this.player.position.x - this.position.x);
    const dy = Math.abs(this.player.position.y - this.position.y);

    if (dx < 24 && dy < 24 && this.damageCooldown <= 0) {
      this.player.takeDamage(this.contactDamage);
      this.damageCooldown = 0.45;
    }

    this.position = this.position.plus(
      this.velocity.times(deltaTime),
    );

    if (this.health <= 0) {
      this.die();
    }
  }
}