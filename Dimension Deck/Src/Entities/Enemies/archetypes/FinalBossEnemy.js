import Enemy from "../../Enemy.js";
import EnemyBullet from "../../EnemyBullet.js";
import SwarmEnemy from "./SwarmEnemy.js";
import RangedEnemy from "./RangedEnemy.js";
import TankEnemy from "./TankEnemy.js";
import Vector from "../../../Utils/Vector.js";

export default class FinalBossEnemy extends Enemy {
  constructor(position, player, bullets, credits) {
    super(position, player);

    this.bullets = bullets;

    this.credits = credits;

    // BIGGER
    this.width = 110;
    this.height = 110;

    // MUCH STRONGER
    this.health = 5000;
    this.maxHealth = 5000;

    this.speed = 48;

    this.contactDamage = 50;

    // Phases
    this.phase = 1;

    this.isEnraged = false;

    // Dash
    this.dashSpeed = 650;

    this.dashCooldown = 0;

    this.isDashing = false;

    this.dashTimer = 0;

    this.dashDirection = new Vector(0, 0);

    // Attacks
    this.attackCooldown = 0;

    this.radialCooldown = 0;

    this.laserCooldown = 0;

    // Summons
    this.summonCooldown = 5;

    this.enemyList = null;
  }

  update(deltaTime) {
    if (this.isDead) return;

    // Timers
    this.dashCooldown -= deltaTime;

    this.dashTimer -= deltaTime;

    this.attackCooldown -= deltaTime;

    this.radialCooldown -= deltaTime;

    this.laserCooldown -= deltaTime;

    this.summonCooldown -= deltaTime;

    if (this._flashTimer > 0) {
      this._flashTimer -= deltaTime;
    }

    if (this.damageCooldown > 0) {
      this.damageCooldown -= deltaTime;
    }

    // PHASES
    this.updatePhase();

    const dir = new Vector(
      this.player.position.x - this.position.x,
      this.player.position.y - this.position.y,
    );

    const normDir = dir.normalize();

    const distance = dir.magnitude();

    // DASH
    if (this.isDashing) {
      this.velocity = this.dashDirection.times(this.dashSpeed);

      if (this.dashTimer <= 0) {
        this.isDashing = false;
      }
    } else {
      this.velocity = normDir.times(this.speed);

      if (distance < 420 && this.dashCooldown <= 0) {
        this.startDash(normDir);
      }
    }

    // MAIN SHOOT
    if (this.attackCooldown <= 0) {
      this.shootBurst(normDir);

      this.attackCooldown =
        this.phase === 3 ? 0.35 : 0.7;
    }

    // RADIAL
    if (this.radialCooldown <= 0) {
      this.radialAttack();

      this.radialCooldown =
        this.phase === 3 ? 1.2 : 2.5;
    }

    // LASER SPAM
    if (this.phase >= 2 && this.laserCooldown <= 0) {
      this.laserAttack(normDir);

      this.laserCooldown =
        this.phase === 3 ? 1 : 2;
    }

    // SUMMONS
    if (this.summonCooldown <= 0) {
      this.summonEnemies();
    }

    // CONTACT DAMAGE
    const dx = Math.abs(
      this.player.position.x - this.position.x,
    );

    const dy = Math.abs(
      this.player.position.y - this.position.y,
    );

    if (dx < 80 && dy < 80 && this.damageCooldown <= 0) {
      this.player.takeDamage(this.contactDamage);

      this.damageCooldown = 0.35;
    }

    // MOVE
    this.position = this.position.plus(
      this.velocity.times(deltaTime),
    );

    // DEATH
    if (this.health <= 0) {
      this.die();
    }
  }

  updatePhase() {
    // PHASE 2
    if (
      this.health <= this.maxHealth * 0.7 &&
      this.phase === 1
    ) {
      this.phase = 2;

      this.speed = 65;

      this.dashSpeed = 850;
    }

    // PHASE 3
    if (
      this.health <= this.maxHealth * 0.3 &&
      this.phase === 2
    ) {
      this.phase = 3;

      this.speed = 90;

      this.dashSpeed = 1200;

      this.isEnraged = true;
    }
  }

  startDash(direction) {
    this.isDashing = true;

    this.dashTimer = 0.5;

    this.dashDirection = direction;

    this.dashCooldown =
      this.phase === 3 ? 0.7 : 2;
  }

  shootBurst(direction) {
    const spread =
      this.phase === 3
        ? [-0.5, -0.25, 0, 0.25, 0.5]
        : [-0.25, 0, 0.25];

    for (let angle of spread) {
      const rotated = new Vector(
        direction.x * Math.cos(angle) -
          direction.y * Math.sin(angle),

        direction.x * Math.sin(angle) +
          direction.y * Math.cos(angle),
      );

      this.bullets.push(
        new EnemyBullet(
          new Vector(
            this.position.x,
            this.position.y,
          ),
          rotated.normalize(),
        ),
      );
    }
  }

  radialAttack() {
    const bulletCount =
      this.phase === 3 ? 30 : 18;

    for (let i = 0; i < bulletCount; i++) {
      const angle =
        ((Math.PI * 2) / bulletCount) * i;

      const dir = new Vector(
        Math.cos(angle),
        Math.sin(angle),
      );

      this.bullets.push(
        new EnemyBullet(
          new Vector(
            this.position.x,
            this.position.y,
          ),
          dir,
        ),
      );
    }
  }

  laserAttack(direction) {
    for (let i = 0; i < 8; i++) {
      this.bullets.push(
        new EnemyBullet(
          new Vector(
            this.position.x,
            this.position.y,
          ),
          direction,
        ),
      );
    }
  }

  summonEnemies() {
    if (!this.enemyList) return;

    // PHASE 1
    if (this.phase === 1) {
      for (let i = 0; i < 5; i++) {
        this.enemyList.push(
          new SwarmEnemy(
            this.randomSpawn(),
            this.player,
          ),
        );
      }

      this.summonCooldown = 6;
    }

    // PHASE 2
    else if (this.phase === 2) {
      for (let i = 0; i < 6; i++) {
        this.enemyList.push(
          new SwarmEnemy(
            this.randomSpawn(),
            this.player,
          ),
        );
      }

      for (let i = 0; i < 2; i++) {
        this.enemyList.push(
          new RangedEnemy(
            this.randomSpawn(),
            this.player,
            this.bullets,
          ),
        );
      }

      this.summonCooldown = 4;
    }

    // PHASE 3
    else {
      for (let i = 0; i < 8; i++) {
        this.enemyList.push(
          new SwarmEnemy(
            this.randomSpawn(),
            this.player,
          ),
        );
      }

      for (let i = 0; i < 2; i++) {
        this.enemyList.push(
          new TankEnemy(
            this.randomSpawn(),
            this.player,
            this.enemyList,
          ),
        );
      }

      for (let i = 0; i < 3; i++) {
        this.enemyList.push(
          new RangedEnemy(
            this.randomSpawn(),
            this.player,
            this.bullets,
          ),
        );
      }

      this.summonCooldown = 3;
    }
  }

  randomSpawn() {
    return new Vector(
      this.position.x + (Math.random() - 0.5) * 340,
      this.position.y + (Math.random() - 0.5) * 340,
    );
  }
}