import Entity from "./Entity.js";
import Collision from "../Physics/Collision.js";

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
  }

  update(deltaTime) {
    // Stop updating after death
    if (this.isDead) return;

    this.onUpdate(deltaTime);
    this._applyContactDamage(deltaTime); // Check collision damage
    if (this.health <= 0) this.die(); // Kill enemy if health reaches 0
    super.update(deltaTime);
  }

  // Reduces enemy health and shows hit flash
  takeDamage(amount) {
    if (this.isDead) return;
    this.health = Math.max(0, this.health - amount);

    // Small white flash effect
    this._flashTimer = 0.12;
    if (this.health === 0) this.die();
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
