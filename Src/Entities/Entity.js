import Vector from "../Utils/Vector.js";

// Base class for all game objects with position, velocity, health, shield, and hit-flash state
export default class Entity {
  constructor(position, width, height, color, options = {}) {
    this.position = position;
    this.velocity = new Vector(0, 0);
    this.width = width;
    this.height = height;

    this.hitboxWidth = options.hitboxWidth ?? width;
    this.hitboxHeight = options.hitboxHeight ?? height;
    this.hitboxOffset = options.hitboxOffset ?? new Vector(0, 0);

    this.color = color;
    this.health = 100;
    this.maxHealth = 100;
    this.shield = 0;
    this.isDead = false;
    this._animation = null;

    this._invincibleTimer = 0;
    this._flashTimer = 0;
  }

  get isInvincible() {
    return this._invincibleTimer > 0;
  }

  // Shield absorbs damage first
  // Remaining damage reduces health and triggers iframes
  takeDamage(amount) {
    if (this.isInvincible || this.isDead) return;

    if (this.shield > 0) {
      const absorbed = Math.min(this.shield, amount);
      this.shield -= absorbed;
      amount -= absorbed;
      if (amount <= 0) return;
    }

    this.health = Math.max(0, this.health - amount);
    this._flashTimer = 0.15;
    if (this.health === 0) {
      this.isDead = true;
    } else {
      this._invincibleTimer = 0.6;
    }
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  die() {
    this.isDead = true;
  }

  // Extends existing frames
  grantInvincibility(duration) {
    this._invincibleTimer = Math.max(this._invincibleTimer, duration);
  }

  getBounds() {
    return {
      left: this.position.x + this.hitboxOffset.x - this.hitboxWidth / 2,
      right: this.position.x + this.hitboxOffset.x + this.hitboxWidth / 2,
      top: this.position.y + this.hitboxOffset.y - this.hitboxHeight / 2,
      bottom: this.position.y + this.hitboxOffset.y + this.hitboxHeight / 2,
    };
  }

  // Draws the entity centered on position and flashes white when flash timer is active
  draw(renderer) {
    const drawX = this.position.x - this.width / 2;
    const drawY = this.position.y - this.height / 2;

    if (this._animation) {
      renderer.drawAnimation(
        this._animation,
        drawX,
        drawY,
        this.width,
        this.height,
      );
      if (this._flashTimer > 0) {
        renderer.drawRect(
          drawX,
          drawY,
          this.width,
          this.height,
          "rgba(255,255,255,0.7)",
        );
      }
    } else {
      const color = this._flashTimer > 0 ? "#ffffff" : this.color;
      renderer.drawRect(drawX, drawY, this.width, this.height, color);
    }
  }

  update(deltaTime) {
    if (this.isDead) return;
    if (this._invincibleTimer > 0) this._invincibleTimer -= deltaTime;
    if (this._flashTimer > 0) this._flashTimer -= deltaTime;
    this.position = this.position.plus(this.velocity.times(deltaTime));

    if (this._animation) this._animation.update(deltaTime);
  }
}
