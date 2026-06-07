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
const CHARGE_DURATION_2 = 0.5; // Short pause before second dash in phase 3
const INTRO_DURATION = 1.0;
const POST_DASH_WAIT = 2.0;
const RADIAL_RANGE = 60
const DASH_RANGE = 320;

export default class BossEnemy extends Enemy {
  constructor(position, deps) {
    super(position, deps);

    this.width = 40;
    this.height = 40;
    this.hitboxWidth = this.width;
    this.hitboxHeight = this.height;

    this.health = 1000;
    this.maxHealth = 1000;
    this.contactDamage = 35;

    // Phase state
    this.phase = 1;
    this.isEnraged = false;
    this.#applyPhase(1); // Set speed and dashSpeed from config

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
  }

  onUpdate(deltaTime) {
    this.#tickTimers(deltaTime);

    // Freeze during intro animation
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

  // --------------------- PRIVATE HELPERS ---------------------
  // Decrease all cooldown timers each frame
  #tickTimers(deltaTime) {
    this.dashCooldown -= deltaTime;
    this.dashTimer -= deltaTime;
    this.attackCooldown -= deltaTime;
    this.radialCooldown -= deltaTime;
    if (this._recoveryTimer > 0) this._recoveryTimer -= deltaTime;
    if (this._postDashTimer > 0) this._postDashTimer -= deltaTime;
  }

  // Three state machine: dashing -> charging -> walking
  #updateMovement(deltaTime, normDir, distance) {
    if (this.isDashing) this.#stateDashing(normDir);
    else if (this._isCharging) this.#stateCharging(deltaTime, normDir);
    else this.#stateWalking(normDir, distance);
  }

  // Move at full dash speed; check if dash is done
  #stateDashing(normDir) {
    this.velocity = this.dashDirection.times(this.dashSpeed);

    if (this.dashTimer > 0) return;

    this.isDashing = false;

    // Phase 3: chain a second dash before resting
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

  // Stand still and flash, then launch the dash
  #stateCharging(deltaTime, normDir) {
    this._chargeTimer -= deltaTime;
    this.velocity = new Vector(0, 0);
    this._flashTimer = 0.1;

    if (this._chargeTimer <= 0) {
      this._isCharging = false;
      this.#startDash(this._chargeDir ?? normDir);
    }
  }

  // Walk to player, start a charge when close enough
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

  // Fire burst and radial attacks when cooldowns allow
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

  // Transition to the next phase and apply new stats
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

  // Pull speed and dashSpeed from the PHASE config table
  #applyPhase(phase) {
    this.speed = PHASE[phase].speed;
    this.dashSpeed = PHASE[phase].dashSpeed;
  }

  #startDash(direction) {
    this.isDashing = true;
    this.dashTimer = DASH_DURATION;
    this.dashDirection = direction;
    this.dashCooldown = PHASE[this.phase].dashCooldown;
  }

  // 3 bullet spread toward the player
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
        ),
      );
    }
  }

  // Ring of bullets in all directions
  #radialAttack() {
    const count = this.phase === 3 ? 18 : 12;
    for (let i = 0; i < count; i++) {
      const angle = ((Math.PI * 2) / count) * i;
      this.bullets.push(
        new EnemyBullet(
          new Vector(this.position.x, this.position.y),
          new Vector(Math.cos(angle), Math.sin(angle)),
        ),
      );
    }
  }

  // Spawn SwarmEnemies at random positions on phase transition
  #spawnMinions(phase) {
    const count = phase === 2 ? 2 : 3;
    for (let i = 0; i < count; i++) {
      this.enemyList.push(
        new SwarmEnemy(this.#randomSpawn(), { player: this.player }),
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
