import Enemy from "../../Enemy.js";
import EnemyBullet from "../../EnemyBullet.js";
import SwarmEnemy from "./SwarmEnemy.js";
import RangedEnemy from "./RangedEnemy.js";
import Vector from "../../../Utils/Vector.js";
import {
  ROOM_HEIGHT,
  ROOM_WIDTH,
  TILE_SIZE,
} from "../../../Utils/Constants.js";
import { randFloat, randInt } from "../../../Utils/Random.js";

// --------------------- PHASE CONFIG ---------------------
const PHASE = {
  1: {
    speed: 26,
    dashSpeed: 300,
    dashCooldown: 4.5,
    attackRate: 1.8,
    radialCount: 8,
    radialCooldown: 5.0,
    spiralCooldown: 999,
  },
  2: {
    speed: 34,
    dashSpeed: 300,
    dashCooldown: 3.5,
    attackRate: 1.4,
    radialCount: 12,
    radialCooldown: 4.0,
    spiralCooldown: 5.0,
  },
  3: {
    speed: 44,
    dashSpeed: 300,
    dashCooldown: 2.5,
    attackRate: 0.9,
    radialCount: 16,
    radialCooldown: 3.0,
    spiralCooldown: 3.0,
  },
};

const DASH_DURATION = 0.45;
const CHARGE_DURATION = 0.55; // boss freezes here — telegraph window for player
const CHARGE_DURATION2 = 0.4; // second dash pause in phase 3
const INTRO_DURATION = 1.2;
const POST_DASH_WAIT = 1.6; // attack-free window after dash lands
const DASH_RANGE = 340;
const ORBIT_FLIP_TIME = 3.5; // seconds before orbit direction flips

export default class FinalBossEnemy extends Enemy {
  constructor(position, { player, bullets = [], enemyList = null } = {}) {
    super(position, { player, bullets, enemyList });

    this.width = 40;
    this.height = 40;
    this.hitboxWidth = this.width;
    this.hitboxHeight = this.height;

    this.health = 2000;
    this.maxHealth = 2000;
    this.contactDamage = 50;

    // Phase state
    this.phase = 1;
    this.isEnraged = false;
    this.#applyPhase(1);

    // Phase transition flash
    this._phaseFlashTimer = 0;

    // Timers
    this.dashCooldown = 0;
    this.attackCooldown = 1.5; // short delay before first attack
    this.radialCooldown = 3.0;
    this.spiralCooldown = 999;
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

    // Orbit
    this._orbitSign = 1;
    this._orbitFlipTimer = ORBIT_FLIP_TIME;

    // Summons — one wave per phase, never repeated
    this._summonedPhase1 = false;
    this._summonedPhase2 = false;
    this._summonedPhase3 = false;

    // BGM callback — wired by GameplayScreen when phase 3 starts
    this.onPhase3Enter = null;
  }

  // Enemy base class calls onUpdate each frame after its own logic
  onUpdate(deltaTime) {
    this.#tickTimers(deltaTime);

    // Freeze during intro
    if (this._introTimer > 0) {
      this._introTimer -= deltaTime;
      this.velocity = new Vector(0, 0);
      return;
    }

    // Freeze during phase transition flash
    if (this._phaseFlashTimer > 0) {
      this._phaseFlashTimer -= deltaTime;
      this._flashTimer = 0.1;
      this.velocity = new Vector(0, 0);
      return;
    }

    this.#updatePhase();
    this.#updateSummons();

    const dir = new Vector(
      this.player.position.x - this.position.x,
      this.player.position.y - this.position.y,
    );
    const normDir = dir.normalize();
    const distance = dir.magnitude();

    this.#updateMovement(deltaTime, normDir, distance);
    this.#updateAttacks(normDir);
  }

  // --------------------- PRIVATE ---------------------
  #tickTimers(deltaTime) {
    this.dashCooldown -= deltaTime;
    this.dashTimer -= deltaTime;
    this.attackCooldown -= deltaTime;
    this.radialCooldown -= deltaTime;
    this.spiralCooldown -= deltaTime;
    this._orbitFlipTimer -= deltaTime;
    if (this._recoveryTimer > 0) this._recoveryTimer -= deltaTime;
    if (this._postDashTimer > 0) this._postDashTimer -= deltaTime;

    // Flip orbit direction periodically so boss circles both ways
    if (this._orbitFlipTimer <= 0) {
      this._orbitSign *= -1;
      this._orbitFlipTimer = ORBIT_FLIP_TIME + randFloat(-0.5, 0.5);
    }
  }

  // --------------------- MOVEMENT ---------------------
  #updateMovement(deltaTime, normDir, distance) {
    if (this.isDashing) this.#stateDashing(normDir);
    else if (this._isCharging) this.#stateCharging(deltaTime, normDir);
    else this.#stateWalking(normDir, distance);
  }

  #stateDashing(normDir) {
    this.velocity = this.dashDirection.times(this.dashSpeed);
    if (this.dashTimer > 0) return;

    this.isDashing = false;

    // Phase 3: chain a second dash before resting
    if (this.phase === 3 && this._dashesThisCycle < 1) {
      this._dashesThisCycle++;
      this._isCharging = true;
      this._chargeTimer = CHARGE_DURATION2;
      this._chargeDir = normDir;
    } else {
      this._dashesThisCycle = 0;
      this._postDashTimer = POST_DASH_WAIT;
    }
  }

  // Boss freezes and flashes — visible telegraph for player
  #stateCharging(deltaTime, normDir) {
    this._chargeTimer -= deltaTime;
    this.velocity = new Vector(0, 0);
    this._flashTimer = 0.12;

    if (this._chargeTimer <= 0) {
      this._isCharging = false;
      this.#startDash(this._chargeDir ?? normDir);
    }
  }

  // Orbit around player instead of straight pursuit — creates movement space
  #stateWalking(normDir, distance) {
    // Perpendicular to player direction — the orbit component
    const perp = new Vector(-normDir.y, normDir.x);
    const orbitStrength = distance > 90 ? 0.45 : 0.0;
    const approach = normDir.times(this.speed);
    const orbit = perp.times(this.speed * orbitStrength * this._orbitSign);
    this.velocity = approach.plus(orbit);

    const canDash =
      distance < DASH_RANGE &&
      this.dashCooldown <= 0 &&
      this._recoveryTimer <= 0 &&
      this._postDashTimer <= 0;

    if (canDash) {
      this._isCharging = true;
      this._chargeTimer = CHARGE_DURATION;
      this._chargeDir = normDir;
      this.dashCooldown = PHASE[this.phase].dashCooldown;
    }
  }

  // --------------------- ATTACKS ---------------------
  #updateAttacks(normDir) {
    const idle =
      !this._isCharging &&
      !this.isDashing &&
      this._recoveryTimer <= 0 &&
      this._postDashTimer <= 0;

    if (!idle) return;

    // Burst — primary attack, most frequent
    if (this.attackCooldown <= 0) {
      this.#shootBurst(normDir);
      this.attackCooldown = PHASE[this.phase].attackRate;
      this._recoveryTimer = 0.6; // breathing room after burst
      return; // one attack per window
    }

    // Radial — ring of bullets, punishes standing still
    if (this.radialCooldown <= 0) {
      this.#radialAttack();
      this.radialCooldown = PHASE[this.phase].radialCooldown;
      this._recoveryTimer = 1.0; // larger window — radial is scary
      return;
    }

    // Spiral — phase 2+ only, rewards moving
    if (this.phase >= 2 && this.spiralCooldown <= 0) {
      this.#spiralAttack(normDir);
      this.spiralCooldown = PHASE[this.phase].spiralCooldown;
      this._recoveryTimer = 0.8;
    }
  }

  // --------------------- SUMMONS (one wave per phase) ---------------------
  #updateSummons() {
    if (this.phase === 1 && !this._summonedPhase1) {
      this._summonedPhase1 = true;
      this.#spawnWave(1);
    }
    if (this.phase === 2 && !this._summonedPhase2) {
      this._summonedPhase2 = true;
      this.#spawnWave(2);
    }
    if (this.phase === 3 && !this._summonedPhase3) {
      this._summonedPhase3 = true;
      this.#spawnWave(3);
    }
  }

  #spawnWave(phase) {
    if (!this.enemyList) return;

    if (phase === 1) {
      // 2 Swarm
      for (let i = 0; i < 2; i++)
        this.enemyList.push(
          new SwarmEnemy(this.#randomSpawn(), { player: this.player }),
        );
    } else if (phase === 2) {
      // 3 Swarm
      for (let i = 0; i < 3; i++)
        this.enemyList.push(
          new SwarmEnemy(this.#randomSpawn(), { player: this.player }),
        );
    } else {
      // 2 Ranged — no Tanks
      for (let i = 0; i < 2; i++)
        this.enemyList.push(
          new RangedEnemy(this.#randomSpawn(), {
            player: this.player,
            bullets: this.bullets,
          }),
        );
    }
  }

  // --------------------- PHASE TRANSITIONS ---------------------
  #updatePhase() {
    if (this.health <= this.maxHealth * 0.65 && this.phase === 1) {
      this.phase = 2;
      this.#applyPhase(2);
      this._phaseFlashTimer = 0.8;
    }
    if (this.health <= this.maxHealth * 0.3 && this.phase === 2) {
      this.phase = 3;
      this.isEnraged = true;
      this.#applyPhase(3);
      this._phaseFlashTimer = 1.0;
      this.onPhase3Enter?.(); // triggers finalBossTheme_2 in GameplayScreen
    }
  }

  #applyPhase(phase) {
    this.speed = PHASE[phase].speed;
    this.dashSpeed = PHASE[phase].dashSpeed;
    this.radialCooldown = PHASE[phase].radialCooldown;
    this.spiralCooldown = PHASE[phase].spiralCooldown;
  }

  #startDash(direction) {
    this.isDashing = true;
    this.dashTimer = DASH_DURATION;
    this.dashDirection = direction;
    this.dashCooldown = PHASE[this.phase].dashCooldown;
  }

  // --------------------- ATTACK PATTERNS ---------------------
  // Phase 1: 3 bullets. Phase 2+: 5 bullets. All aimed at player.
  #shootBurst(direction) {
    const angles =
      this.phase === 1 ? [-0.25, 0, 0.25] : [-0.42, -0.21, 0, 0.21, 0.42];
    for (const angle of angles) {
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

  // Even ring — punishes camping in one spot
  #radialAttack() {
    const count = PHASE[this.phase].radialCount;
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

  // Staggered ring — gaps the player can read and dodge through
  #spiralAttack(normDir) {
    const count = 8;
    const offset = Math.PI / count;
    for (let i = 0; i < count; i++) {
      const angle = ((Math.PI * 2) / count) * i + offset * i * 0.25;
      this.bullets.push(
        new EnemyBullet(
          new Vector(this.position.x, this.position.y),
          new Vector(Math.cos(angle), Math.sin(angle)),
        ),
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
