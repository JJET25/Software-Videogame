import Entity from "./Entity.js";
import Collision from "../Physics/Collision.js";
import Vector from "../Utils/Vector.js";

// Base enemy class
// Moves directly toward the player and deals contact damage
export default class Enemy extends Entity {
  constructor(position, { player, bullets = [], enemyList = null } = {}) {
    super(position, 16, 16, "green");

    this.player = player;
    this.bullets = bullets;
    this.enemyList = enemyList;
    this.speed = 55; // Basic movement speed
    this.health = 50;
    this.maxHealth = 50;
    this.originalColor = "green";
    this.damageCooldown = 0; // Delay between contact attacks
    this.contactDamage = 10; // Damage dealt to the player
    this.activationDelay = 0;
    this._activationTimer = 0;
    this.isActive = false;

    this._prevX = this.position.x;
    this._prevY = this.position.y;
    this._stuckTimer = 0;
    this._stuckSteering = 0;
    this._stuckSign = 1;
  }

  update(deltaTime) {
    if (this.isDead) return;

    const dx = this.position.x - this._prevX;
    const dy = this.position.y - this._prevY;

    // If player moves less of 0.5px
    if (dx * dx + dy * dy < 2) {
      this._stuckTimer += deltaTime;
      if (this._stuckTimer > 0.4 && this._stuckSteering <= 0) {
        this._stuckSteering = 0.8;
        this._stuckSign = Math.random() > 0.5 ? 1 : -1;
      }
    } else this._stuckTimer = 0;

    if (this._stuckSteering > 0) this._stuckSteering -= deltaTime;

    this._prevX = this.position.x;
    this._prevY = this.position.y;

    // --------------------- Base logic ---------------------
    this.onUpdate(deltaTime);

    if (this._stuckSteering > 0 && this.velocity.squareLength() > 0) {
      const perp = new Vector(-this.velocity.y, this.velocity.x).normalize();
      this.velocity = this.velocity.plus(
        perp.times(this.speed * this._stuckSign),
      );
    }

    this._applyContactDamage(deltaTime);
    if (this.health <= 0) this.die();
    super.update(deltaTime);
  }

  // Draw enemy and health bar
  draw(renderer) {
    super.draw(renderer);

    const BAR_W = this.width;
    const BAR_H = 4;

    // Position above the enemy
    const bx = this.position.x - this.width / 2;
    const by = this.position.y - this.height / 2 - BAR_H - 2;

    // Background bar
    renderer.drawRect(bx, by, BAR_W, BAR_H, "#333333");

    // Health fill amount
    const fill = Math.max(0, (this.health / this.maxHealth) * BAR_W);

    // Current health bar
    renderer.drawRect(bx, by, fill, BAR_H, "#22cc44");
  }

  die() {
    this.isDead = true;
  }

  _applyContactDamage(deltaTime) {
    // Wait until cooldown finishes
    if (this.damageCooldown > 0) {
      this.damageCooldown -= deltaTime;
      return;
    }

    // Damage player on collision
    if (Collision.rectCollision(this.getBounds(), this.player.getBounds())) {
      this.player.takeDamage(this.contactDamage);
      this.damageCooldown = 0.5;
    }
  }

  onUpdate(deltaTime) {}
}
