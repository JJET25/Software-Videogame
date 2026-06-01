import Entity from "./Entity.js";
import Vector from "../Utils/Vector.js";
import { Trigger } from "../cards/AutomaticCard.js";

// DASH CONFIG
const DASH_SPEED = 350;
const DASH_DURATION = 0.2; // how long the dash lasts
const DASH_COOLDOWN = 0.8; // wait before next dash is allowed
const DASH_IFRAMES = 0.45; // extra no-damage time after the dash ends

// MOVEMENT CONFIG
const BASE_SPEED = 150;
const SLOW_FACTOR = 0.4; // speed multiplier when slowed by spikes

// Player entity handles movement, dashing, aiming, card activation and trigger firing
export default class Player extends Entity {
  constructor(position, input, mouse) {
    super(position, 16, 32, "#4488ff", {
      hitboxHeight: 16,
      hitboxWidth: 16,
      hitboxOffset: new Vector(0, 8),
    });

    this.input = input;
    this.mouse = mouse;

    // movement
    this.speed = BASE_SPEED;
    this._baseSpeed = BASE_SPEED;
    this._slowTimer = 0;
    this.state = "idle";

    // aim direction follows the mouse
    this.aimDirection = new Vector(1, 0);

    // cards and economy
    this.cardManager = null;
    this.credits = 0;

    // callbacks set by GameplayScreen so player can read room state
    this.getEnemies = null;
    this.getObjects = null;

    // dash state
    this._dashTimer = 0;
    this._dashCooldownTimer = 0;
    this._dashDir = null;

    // freeze blocks all movement, used by notifications and room entry
    this._freezeTimer = 0;

    // melee arc visual, written by ActiveMeleeCard and read in draw
    this._strikeTimer = 0;
    this._strikeDir = new Vector(1, 0);
    this._strikeRange = 120;
    this._strikeSpread = Math.PI * 0.6;
  }

  // true while the dash is active
  get isDashing() {
    return this._dashTimer > 0;
  }

  // reduces health and fires ON_DAMAGE trigger if health actually dropped
  takeDamage(amount) {
    if (window.testingMode) return;
    const prev = this.health;
    super.takeDamage(amount);
    if (this.cardManager && this.health < prev) {
      const enemies = this.getEnemies?.() ?? [];
      this.cardManager.fireTrigger(Trigger.ON_DAMAGE, {
        player: this,
        enemies,
      });
    }
  }

  addCredits(amount) {
    this.credits += amount;
  }

  // hold all input and movement for a given duration
  freeze(duration) {
    this._freezeTimer = duration;
  }

  unfreeze() {
    this._freezeTimer = 0;
  }

  update(deltaTime) {
    if (this.isDead) return;

    // spike slow effect
    if (this._slowTimer > 0) {
      this._slowTimer -= deltaTime;
      this.speed = this._baseSpeed * SLOW_FACTOR;
    } else {
      this.speed = this._baseSpeed;
    }

    // freeze blocks all input and movement
    if (this._freezeTimer > 0) {
      this._freezeTimer -= deltaTime;
      this.velocity = new Vector(0, 0);
      super.update(deltaTime);
      return;
    }

    // read movement input from WASD and arrows
    const raw = new Vector(0, 0);
    if (this.input.isKeyDown("W") || this.input.isKeyDown("ARROWUP"))
      raw.y -= 1;
    if (this.input.isKeyDown("S") || this.input.isKeyDown("ARROWDOWN"))
      raw.y += 1;
    if (this.input.isKeyDown("A") || this.input.isKeyDown("ARROWLEFT"))
      raw.x -= 1;
    if (this.input.isKeyDown("D") || this.input.isKeyDown("ARROWRIGHT"))
      raw.x += 1;

    const isMoving = raw.squareLength() > 0;
    const direction = raw.normalize();

    // aim follows mouse position in game-space
    if (this.mouse) {
      const toMouse = this.mouse.position.minus(this.position);
      if (toMouse.squareLength() > 0) this.aimDirection = toMouse.normalize();
    }

    if (this._dashCooldownTimer > 0) this._dashCooldownTimer -= deltaTime;

    if (this.isDashing) {
      // hold dash velocity for the full duration
      this._dashTimer -= deltaTime;
      this.velocity = this._dashDir.times(DASH_SPEED);
    } else if (
      this.input.wasKeyPressed("SPACE") &&
      this._dashCooldownTimer <= 0 &&
      isMoving
    ) {
      this.#startDash(direction);
    } else {
      this.velocity = direction.times(this.speed);
    }

    this.state = isMoving || this.isDashing ? "moving" : "idle";

    // card slot selection with keys 1-5, click to play selected card
    if (this.cardManager) {
      for (let i = 0; i < 5; i++) {
        if (this.input.wasKeyPressed(String(i + 1))) {
          this.cardManager.selectSlot(i);
        }
      }
      if (this.mouse?.consumeClick()) {
        this._playCardAtSlot(this.cardManager.selectedIndex);
      }
    }

    // melee arc counts down each frame
    if (this._strikeTimer > 0) {
      this._strikeTimer = Math.max(0, this._strikeTimer - deltaTime);
    }

    super.update(deltaTime);
  }

  draw(renderer) {
    // draw the melee cone while the strike is active
    if (this._strikeTimer > 0) {
      const DURATION = 0.18;
      const alpha = this._strikeTimer / DURATION;
      const angle = Math.atan2(this._strikeDir.y, this._strikeDir.x);
      const r = this._strikeRange;
      const ctx = renderer.context;
      const s = renderer.scale;
      const cx = this.position.x * s;
      const cy = this.position.y * s;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(
        cx,
        cy,
        r * s,
        angle - this._strikeSpread / 2,
        angle + this._strikeSpread / 2,
      );
      ctx.closePath();
      ctx.fillStyle = `rgba(255, 230, 80, ${(alpha * 0.3).toFixed(2)})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(255, 200, 50, ${(alpha * 0.9).toFixed(2)})`;
      ctx.lineWidth = 2 * s;
      ctx.stroke();
      ctx.restore();
    }

    super.draw(renderer);
  }

  // --------------------- PRIVATE ---------------------
  // start a dash in the given direction, grant iframes and fire card trigger
  #startDash(dir) {
    this._dashDir = dir;
    this._dashTimer = DASH_DURATION;
    this._dashCooldownTimer = DASH_COOLDOWN;
    this.velocity = dir.times(DASH_SPEED);

    // invincibility during dash and a short window after it ends
    this.grantInvincibility(DASH_DURATION + DASH_IFRAMES);
    this._flashTimer = DASH_DURATION;

    if (this.cardManager) {
      const enemies = this.getEnemies?.() ?? [];
      this.cardManager.fireTrigger(Trigger.ON_DASH, { player: this, enemies });
    }
  }

  // play card at the given slot and fire ON_HIT or ON_KILL triggers
  _playCardAtSlot(index) {
    if (!this.cardManager) return;

    const enemies = this.getEnemies?.() ?? [];
    const objects = this.getObjects?.() ?? [];
    const snapshots = enemies.map((e) => ({
      enemy: e,
      health: e.health,
      wasDead: e.isDead,
    }));

    this.cardManager.playCard(index, {
      player: this,
      enemies,
      objects,
      mouse: this.mouse,
    });

    for (const snap of snapshots) {
      if (snap.wasDead) continue;
      const state = { player: this, enemies, enemy: snap.enemy };
      if (snap.enemy.isDead)
        this.cardManager.fireTrigger(Trigger.ON_KILL, state);
      else if (snap.enemy.health < snap.health)
        this.cardManager.fireTrigger(Trigger.ON_HIT, state);
    }
  }
}
