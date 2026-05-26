import Enemy from "../../Enemy.js";
import Vector from "../../../Utils/Vector.js";

export default class TankEnemy extends Enemy {
  constructor(position, player, bullets, credits) {
    super(position, player);

    this.speed = 28;
    this.health = 150;
    this.maxHealth = 150;
    this.width = 16;
    this.height = 16;
    this.color = "blue";
    this.originalColor = "blue";
    this.contactDamage = 20;

    // Dash attack
    this.dashSpeed = 340;
    this.dashCooldown = 0;
    this.isDashing = false;
    this.dashTimer = 0;
    this.dashDirection = new Vector(0, 0);

    // Rage mode
    this.isEnraged = false;
  }

  update(deltaTime) {
    if (this.isDead) return;

    this.dashCooldown -= deltaTime;
    this.dashTimer -= deltaTime;
    if (this._flashTimer > 0) this._flashTimer -= deltaTime;
    if (this.damageCooldown > 0) this.damageCooldown -= deltaTime;

    // Rage a 40% HP
    if (!this.isEnraged && this.health <= this.maxHealth * 0.4) {
      this.isEnraged = true;
      this.speed = 42;
      this.dashSpeed = 500;
      this.color = "#4444ff";
    }

    const direction = new Vector(
      this.player.position.x - this.position.x,
      this.player.position.y - this.position.y,
    );
    const normDir = direction.normalize();
    const distance = direction.magnitude();

    if (this.isDashing) {
      this.velocity = this.dashDirection.times(this.dashSpeed);
      if (this.dashTimer <= 0) this.isDashing = false;
    } else {
      this.velocity = normDir.times(this.speed);
      if (distance < 280 && this.dashCooldown <= 0) {
        this.isDashing = true;
        this.dashTimer = 0.55;
        this.dashCooldown = this.isEnraged ? 1.5 : 3.5;
        this.dashDirection = normDir;
      }
    }

    const dx = Math.abs(this.player.position.x - this.position.x);
    const dy = Math.abs(this.player.position.y - this.position.y);
    if (dx < 40 && dy < 40 && this.damageCooldown <= 0) {
      this.player.takeDamage(this.contactDamage);
      this.damageCooldown = 0.6;
    }

    this.position = this.position.plus(this.velocity.times(deltaTime));
    if (this.health <= 0) this.die();
  }
}
