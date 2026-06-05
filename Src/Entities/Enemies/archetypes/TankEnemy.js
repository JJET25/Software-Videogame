import Vector from "../../../Utils/Vector.js";
import Enemy from "../../Enemy.js";

const DASH_RANGE = 150;
const CHARGE_DURATION = 0.4;
const DASH_COOLDOWN = 2.5;
const DASH_DURATION = 0.5;
const DASH_SPEED_MULT = 3;

export default class TankEnemy extends Enemy {
  constructor(position, deps) {
    super(position, deps);

    this.speed = 38;
    this.health = 90;
    this.maxHealth = 90;
    this.contactDamage = 18;
    this.activationDelay = 1.1;

    this.width = 28;
    this.height = 28;
    this.hitboxWidth = this.width;
    this.hitboxHeight = this.height;

    this.color = "purple";
    this.originalColor = "purple";

    // Dash state machine
    this.isDashing = false;
    this.dashTimer = 0;
    this.dashCooldownTimer = DASH_COOLDOWN;
    this._isCharging = false;
    this._chargeTimer = 0;
    this._chargeDir = null;
  }

  onUpdate(deltaTime) {
    const dir = new Vector(
      this.player.position.x - this.position.x,
      this.player.position.y - this.position.y,
    );
    const normDir = dir.normalize();
    const distance = dir.magnitude();

    this.dashCooldownTimer -= deltaTime;

    if (this.isDashing) this.#stateDashing(deltaTime);
    else if (this._isCharging) this.#stateCharging(deltaTime);
    else this.#stateWalking(normDir, distance);
  }

  // --------------------- PRIVATE ---------------------
  // Move at full dash speed until timer runs out
  #stateDashing(deltaTime) {
    this.velocity = this._chargeDir.times(this.speed * DASH_SPEED_MULT);
    this.dashTimer -= deltaTime;
    if (this.dashTimer <= 0) this.isDashing = false;
  }

  // Stand still and flash, then launch the dash
  #stateCharging(deltaTime) {
    this.velocity = new Vector(0, 0);
    this._flashTimer = 0.2;
    this._chargeTimer -= deltaTime;
    this.dashTimer = DASH_DURATION;
    if (this._chargeTimer <= 0) {
      this._isCharging = false;
      this.isDashing = true;
    }
  }

  // Walk toward player, start a charge when close enough and cooldown is ready
  #stateWalking(normDir, distance) {
    this.velocity = normDir.times(this.speed);
    if (this.dashCooldownTimer <= 0 && distance < DASH_RANGE) {
      this._isCharging = true;
      this._chargeDir = normDir;
      this._chargeTimer = CHARGE_DURATION;
      this.dashCooldownTimer = DASH_COOLDOWN;
    }
  }
}
