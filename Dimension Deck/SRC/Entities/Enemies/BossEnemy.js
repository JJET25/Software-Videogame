import Enemy from "../Enemy.js";
import Vector from "../../Utils/Vector.js";

export default class BossEnemy extends Enemy {
  constructor(position, player, bullets, credits) {
    super(position, player);

    this.bullets = bullets;
    this.credits = credits;

    // Phases
    this.phase = 1;
    this.isEnraged = false;
    this.hasSummoned = false;

    // Boss size
    this.width = 64;
    this.height = 64;

    // Stats base
    this.health = 900;
    this.maxHealth = 900;
    this.speed = 28;
    this.contactDamage = 25;

    // Dash
    this.dashSpeed = 340;
    this.dashCooldown = 0;
    this.isDashing = false;
    this.dashTimer = 0;
    this.dashDirection = new Vector(0, 0);

    this.enemyList = null;
  }

  update(deltaTime) {
    if (this.isDead) return;

    this.dashCooldown -= deltaTime;
    this.dashTimer -= deltaTime;
    if (this._flashTimer > 0) this._flashTimer -= deltaTime;
    if (this.damageCooldown > 0) this.damageCooldown -= deltaTime;

    // Trasition phase 2
    if (!this.isEnraged && this.health <= this.maxHealth * 0.4) {
      this.enterPhase2();
    }

    // Summon phase 2
    if (!this.hasSummoned && this.health <= this.maxHealth * 0.25) {
      this.hasSummoned = true;
      this.summonMinions();
    }

    const dir = new Vector(
      this.player.position.x - this.position.x,
      this.player.position.y - this.position.y,
    );
    const normDir = dir.normalize();
    const distance = dir.magnitude();

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
    if (dx < 48 && dy < 48 && this.damageCooldown <= 0) {
      this.player.takeDamage(this.contactDamage);
      this.damageCooldown = 0.6;
    }

    this.position = this.position.plus(this.velocity.times(deltaTime));
    if (this.health <= 0) this.die();
  }

  enterPhase2() {
    this.isEnraged = true;
    this.phase = 2;
    this.speed = 42;
    this.dashSpeed = 500;
  }

  getMinionClass() {
    return null;
  }

  summonMinions() {
    const MinionClass = this.getMinionClass();
    if (!MinionClass || !this.enemyList) return;

    for (let i = 0; i < 5; i++) {
      const offset = new Vector(
        (Math.random() - 0.5) * 160,
        (Math.random() - 0.5) * 160,
      );
      this.enemyList.push(
        new MinionClass(
          this.position.plus(offset),
          this.player,
          this.bullets,
          this.credits,
        ),
      );
    }
  }
}
