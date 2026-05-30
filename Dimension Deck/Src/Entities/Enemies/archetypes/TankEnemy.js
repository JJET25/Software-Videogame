import Vector from "../../../Utils/Vector.js";
import Enemy from "../../Enemy.js";

const DASH_COOLDOWN = 2.5; // seconds between dashes
const DASH_DURATION = 0.3; // 300ms in seconds
const DASH_SPEED_MULT = 3;

export default class TankEnemy extends Enemy {
  constructor(position, deps) {
    super(position, deps);

    // BALANCE
    this.speed = 38;

    this.health = 90;
    this.maxHealth = 90;

    // Bigger size
    this.width = 28;
    this.height = 28;

    // Hitbox
    this.hitboxWidth = this.width;
    this.hitboxHeight = this.height;

    this.color = "purple";
    this.originalColor = "purple";

    this.contactDamage = 18;

    // Dash system
    this.dashCooldownTimer = DASH_COOLDOWN;
    this.dashTimer = 0;
    this.isDashing = false;
  }

  onUpdate(deltaTime) {
    const direction = new Vector(
      this.player.position.x - this.position.x,
      this.player.position.y - this.position.y,
    );

    const normalizedDirection = direction.normalize();

    // Dash
    this.dashCooldownTimer -= deltaTime;

    if (this.isDashing) {
      this.dashTimer -= deltaTime;
      if (this.dashTimer <= 0) this.isDashing = false; // Dash ends
    } else if (this.dashCooldownTimer <= 0) {
      this.isDashing = true; // Dash starts
      this.dashTimer = DASH_DURATION;
      this.dashCooldownTimer = DASH_COOLDOWN; // Dash resets
    }

    const speed = this.isDashing ? this.speed * DASH_SPEED_MULT : this.speed;
    this.velocity = normalizedDirection.times(speed);
  }
}
