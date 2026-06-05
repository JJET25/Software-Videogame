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

    // health bar just above the enemy sprite
    const W = this.width;
    const H = 4;
    const bx = this.position.x - W / 2;
    const by = this.position.y - this.height / 2 - H - 2;

    renderer.drawRect(bx, by, W, H, "#333333");
    const fill = Math.max(0, (this.health / this.maxHealth) * W);
    renderer.drawRect(bx, by, fill, H, "#22cc44");
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

  // subclasses override this to define their movement and attacks
  onUpdate(deltaTime) {}
}
