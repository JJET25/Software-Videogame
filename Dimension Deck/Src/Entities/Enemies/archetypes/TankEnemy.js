import Vector from "../../../Utils/Vector.js";
import Enemy from "../../Enemy.js";

export default class TankEnemy extends Enemy {
  constructor(position, player, credits) {
    super(position, player);

    // BALANCE
    this.speed = 38;

    this.health = 90;
    this.maxHealth = 90;

    // Bigger size
    this.width = 28;
    this.height = 28;

    this.color = "purple";
    this.originalColor = "purple";

    this.contactDamage = 18;

    // Dash system
    this.dashCooldown = 2.5;
    this.isDashing = false;
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

    const normalizedDirection = direction.normalize();

    this.dashCooldown -= deltaTime;

    // DASH
    if (this.dashCooldown <= 0) {
      this.isDashing = true;
      this.dashCooldown = 2.5;
    }

    if (this.isDashing) {
      this.velocity = normalizedDirection.times(this.speed * 3);

      setTimeout(() => {
        this.isDashing = false;
      }, 300);
    } else {
      this.velocity = normalizedDirection.times(this.speed);
    }

    this._applyContactDamage(deltaTime);
    this.position = this.position.plus(this.velocity.times(deltaTime));

    if (this.health <= 0) {
      this.die();
    }
  }
}
