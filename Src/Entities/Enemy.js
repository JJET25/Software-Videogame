import Entity from "./Entity.js";
import Vector from "../Utils/Vector.js";
import Collision from "../Physics/Collision.js";

// base class for all enemies
// handles contact damage, health bar, and stuck avoidance
export default class Enemy extends Entity {
  constructor(position, { player, bullets = [], enemyList = null } = {}) {
    super(position, 16, 16, "green");

    this.player = player;
    this.bullets = bullets;
    this.enemyList = enemyList;

    this.speed = 55;
    this.health = 50;
    this.maxHealth = 50;
    this.originalColor = "green";

    this.contactDamage = 10;
    this.damageCooldown = 0;

    // activation delay lets the room show enemies before they start moving
    this.activationDelay = 0;
    this._activationTimer = 0;
    this.isActive = false;

    // stuck avoidance, compares position frame to frame
    this._prevX = this.position.x;
    this._prevY = this.position.y;
    this._stuckTimer = 0;
    this._stuckSteering = 0;
    this._stuckSign = 1;
  }

  update(deltaTime) {
    if (this.isDead) return;

    // measure net movement from last frame including collision resolution
    const dx = this.position.x - this._prevX;
    const dy = this.position.y - this._prevY;
    const moved = dx * dx + dy * dy;

    if (moved < 0.25) {
      // enemy barely moved, might be stuck against a wall or box
      this._stuckTimer += deltaTime;
      if (this._stuckTimer > 0.4 && this._stuckSteering <= 0) {
        this._stuckSteering = 0.8;
        this._stuckSign = Math.random() > 0.5 ? 1 : -1;
      }
    } else {
      this._stuckTimer = 0;
    }

    if (this._stuckSteering > 0) this._stuckSteering -= deltaTime;

    // save position before this frame changes it
    this._prevX = this.position.x;
    this._prevY = this.position.y;

    this.onUpdate(deltaTime);

    // push sideways if stuck, so enemy can get around the obstacle
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

  draw(renderer) {
    super.draw(renderer);
    this._drawHealthBar(renderer, this.position.x - this.width / 2, this.position.y - this.height / 2, this.width);
  }

  _drawHealthBar(renderer, bx, by, barW) {
    const W    = Math.round(barW * 0.65);
    const offX = Math.floor((barW - W) / 2);
    const barX = bx + offX;
    const barY = by - 4;
    const pct  = Math.max(0, this.health / this.maxHealth);
    const fill = Math.floor(pct * W);
    const color =
      pct > 0.6 ? "#3adb44" :
      pct > 0.3 ? "#e8a020" :
                  "#cc2020";

    renderer.drawRect(barX, barY, W, 2, "#111111");
    if (fill > 0) renderer.drawRect(barX, barY, fill, 2, color);
  }

  die() {
    this.isDead = true;
  }

  _applyContactDamage(deltaTime) {
    if (this.damageCooldown > 0) {
      this.damageCooldown -= deltaTime;
      return;
    }
    if (Collision.rectCollision(this.getBounds(), this.player.getBounds())) {
      this.player.takeDamage(this.contactDamage);
      this.damageCooldown = 0.5;
    }
  }

  takeDamage(amount) {
    const prev = this.health;
    super.takeDamage(amount);
    if (this.health < prev) this.player?.audio?.playSFX("enemyHit");
    if (this.isDead) this.player?.audio?.playSFX("enemyDeath");
  }

  // subclasses override this to define their movement and attacks
  onUpdate(deltaTime) {}
}
