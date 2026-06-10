import Enemy from "../../Enemy.js";
import EnemyBullet from "../../EnemyBullet.js";
import SwarmEnemy from "./SwarmEnemy.js";
import Vector from "../../../Utils/Vector.js";
import {
  ROOM_HEIGHT,
  ROOM_WIDTH,
  TILE_SIZE,
} from "../../../Utils/Constants.js";
import { randFloat } from "../../../Utils/Random.js";

// --------------------- PHASE CONFIG ---------------------
const PHASE = {
  1: { speed: 24, dashSpeed: 260, dashCooldown: 5, attackRate: 1.5 },
  2: { speed: 28, dashSpeed: 380, dashCooldown: 4, attackRate: 1.5 },
  3: { speed: 32, dashSpeed: 520, dashCooldown: 3, attackRate: 0.8 },
};

const DASH_DURATION = 0.45;
const CHARGE_DURATION = 0.6;
const CHARGE_DURATION_2 = 0.5;
const INTRO_DURATION = 1.0;
const POST_DASH_WAIT = 2.0;
const RADIAL_RANGE = 60;
const DASH_RANGE = 320;

// Base archetype for all miniBoss encounters.
// Subclasses pass a bossConfig object to tune stats without duplicating logic:
//   healthMult    — multiplies base HP (default 1.0)
//   damageMult    — multiplies contactDamage and bullet damage (default 1.0)
//   speedMult     — multiplies all phase speeds (default 1.0)
export default class BossEnemy extends Enemy {
  constructor(position, deps, bossConfig = {}) {
    super(position, deps);

    this.width = 45;
    this.height = 45;
    this.hitboxWidth = this.width;
    this.hitboxHeight = this.height;

    // Read multipliers — all default to 1 so existing subclasses are unaffected
    const healthMult = bossConfig.healthMult ?? 1.0;
    const damageMult = bossConfig.damageMult ?? 1.0;
    this._speedMult = bossConfig.speedMult ?? 1.0;

    this.health = Math.round(1000 * healthMult);
    this.maxHealth = this.health;
    this.contactDamage = Math.round(35 * damageMult);
    this._bulletDamageMult = damageMult;

    // enemyPool from BossRoom — used to spawn dimension-correct minions
    this._enemyPool = deps.enemyPool ?? null;

    // Phase state
    this.phase = 1;
    this.isEnraged = false;
    this.#applyPhase(1);

    // Timers
    this.dashCooldown = 0;
    this.attackCooldown = 0;
    this.radialCooldown = 0;
    this._introTimer = INTRO_DURATION;
    this._recoveryTimer = 0;
    this._postDashTimer = 0;

    // Dash state machine
    this.isDashing = false;
    this.dashTimer = 0;
    this.dashDirection = new Vector(0, 0);
    this._isCharging = false;
    this._chargeTimer = 0;
    this._chargeDir = null;
    this._dashesThisCycle = 0;

    // Animation — subclasses set _facingDir and override _animation
    this._facingDir = "left";
  }

  onUpdate(deltaTime) {
    this.#tickTimers(deltaTime);

    if (this._introTimer > 0) {
      this._introTimer -= deltaTime;
      this.velocity = new Vector(0, 0);
      return;
    }

    this.#updatePhase();

    const dir = new Vector(
      this.player.position.x - this.position.x,
      this.player.position.y - this.position.y,
    );
    const normDir = dir.normalize();
    const distance = dir.magnitude();

    this.#updateMovement(deltaTime, normDir, distance);
    this.#updateAttacks(normDir, distance);
  }

  // ----- PRIVATE -----

  #tickTimers(deltaTime) {
    this.dashCooldown -= deltaTime;
    this.dashTimer -= deltaTime;
    this.attackCooldown -= deltaTime;
    this.radialCooldown -= deltaTime;
    if (this._recoveryTimer > 0) this._recoveryTimer -= deltaTime;
    if (this._postDashTimer > 0) this._postDashTimer -= deltaTime;
  }

  #updateMovement(deltaTime, normDir, distance) {
    if (this.isDashing) this.#stateDashing(normDir);
    else if (this._isCharging) this.#stateCharging(deltaTime, normDir);
    else this.#stateWalking(normDir, distance);
  }

  #stateDashing(normDir) {
    this.velocity = this.dashDirection.times(this.dashSpeed);
    if (this.dashTimer > 0) return;

    this.isDashing = false;

    if (this.phase === 3 && this._dashesThisCycle < 1) {
      this._dashesThisCycle++;
      this._isCharging = true;
      this._chargeTimer = CHARGE_DURATION_2;
      this._chargeDir = normDir;
    } else {
      this._dashesThisCycle = 0;
      this._postDashTimer = POST_DASH_WAIT;
    }
  }

  #stateCharging(deltaTime, normDir) {
    this._chargeTimer -= deltaTime;
    this.velocity = new Vector(0, 0);
    this._flashTimer = 0.1;

    if (this._chargeTimer <= 0) {
      this._isCharging = false;
      this.#startDash(this._chargeDir ?? normDir);
    }
  }

  #stateWalking(normDir, distance) {
    this.velocity = normDir.times(this.speed);

    const canDash =
      distance < DASH_RANGE &&
      this.dashCooldown <= 0 &&
      this._recoveryTimer <= 0;

    if (canDash) {
      this._isCharging = true;
      this._chargeTimer = CHARGE_DURATION;
      this._chargeDir = normDir;
      this.dashCooldown = PHASE[this.phase].dashCooldown;
    }
  }

  #updateAttacks(normDir, distance) {
    const idle =
      !this._isCharging && !this.isDashing && this._recoveryTimer <= 0;

    if (idle && this.attackCooldown <= 0) {
      this.#shootBurst(normDir);
      this.attackCooldown = PHASE[this.phase].attackRate;
      this._recoveryTimer = 0.8;
    }

    const canRadial =
      this.phase >= 2 &&
      distance < RADIAL_RANGE &&
      this.radialCooldown <= 0 &&
      !this.isDashing &&
      !this._isCharging &&
      this._postDashTimer <= 0;

    if (canRadial) {
      this.#radialAttack();
      this.radialCooldown = 2;
      this._recoveryTimer = this.phase === 2 ? 3 : 1;
    }
  }

  #updatePhase() {
    if (this.health <= this.maxHealth * 0.65 && this.phase === 1) {
      this.phase = 2;
      this.#applyPhase(2);
      this.#spawnMinions(2);
    }
    if (this.health <= this.maxHealth * 0.3 && this.phase === 2) {
      this.phase = 3;
      this.isEnraged = true;
      this.#applyPhase(3);
      this.#spawnMinions(3);
    }
  }

  // Apply speed from PHASE table, scaled by the subclass multiplier
  #applyPhase(phase) {
    this.speed = PHASE[phase].speed * this._speedMult;
    this.dashSpeed = PHASE[phase].dashSpeed * this._speedMult;
  }

  #startDash(direction) {
    this.isDashing = true;
    this.dashTimer = DASH_DURATION;
    this.dashDirection = direction;
    this.dashCooldown = PHASE[this.phase].dashCooldown;
  }

  #shootBurst(direction) {
    for (const angle of [-0.25, 0, 0.25]) {
      const rotated = new Vector(
        direction.x * Math.cos(angle) - direction.y * Math.sin(angle),
        direction.x * Math.sin(angle) + direction.y * Math.cos(angle),
      );
      this.bullets.push(
        new EnemyBullet(
          new Vector(this.position.x, this.position.y),
          rotated.normalize(),
          { damageMult: this._bulletDamageMult },
        ),
      );
    }
  }

  #radialAttack() {
    const count = this.phase === 3 ? 18 : 12;
    for (let i = 0; i < count; i++) {
      const angle = ((Math.PI * 2) / count) * i;
      this.bullets.push(
        new EnemyBullet(
          new Vector(this.position.x, this.position.y),
          new Vector(Math.cos(angle), Math.sin(angle)),
          { damageMult: this._bulletDamageMult },
        ),
      );
    }
  }

  // Spawn dimension-correct minions using the enemyPool passed from BossRoom.
  // Falls back to base SwarmEnemy if no pool is available.
  #spawnMinions(phase) {
    if (!this.enemyList) return;
    const count = phase === 2 ? 2 : 3;
    const SwarmClass = this._enemyPool?.swarm?.[0] ?? SwarmEnemy;

    for (let i = 0; i < count; i++) {
      this.enemyList.push(
        new SwarmClass(this.#randomSpawn(), { player: this.player }),
      );
    }
  }

  #randomSpawn() {
    const margin = TILE_SIZE * 3;
    return new Vector(
      randFloat(margin, ROOM_WIDTH - margin),
      randFloat(margin, ROOM_HEIGHT - margin),
    );
  }
}
