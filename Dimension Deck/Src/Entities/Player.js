import Entity from "./Entity.js";
import Vector from "../Utils/Vector.js";
import { Trigger } from "../cards/AutomaticCard.js";

// Player entity
// Handles movement, dashing, aiming, card activation, and automatic trigger firing
export default class Player extends Entity {
  constructor(position, input, mouse) {
    super(position, 16, 32, "#4488ff", {
      hitboxHeight: 16,
      hitboxWidth: 16,
      hitboxOffset: new Vector(0, 8),
    });

    this.input = input;
    this.mouse = mouse;
    this.speed = 150;
    this._baseSpeed = 150;
    this._slowTimer = 0;
    this.state = "idle";
    this.getObjects = null;

    this.cardManager = null;
    this.credits = 0;

    this.aimDirection = new Vector(1, 0);

    this._dashSpeed = 400;
    this._dashDuration = 0.15;
    this._dashCooldown = 0.8;
    this._dashTimer = 0;
    this._dashCooldownTimer = 0;
    this._freezeTimer = 0;

    // Melee arc visual state
    // Written by functon active melee card and read by the draw function
    this._strikeTimer = 0;
    this._strikeDir = new Vector(1, 0);
    this._strikeRange = 120;
    this._strikeSpread = Math.PI * 0.6;
  }

  get isDashing() {
    return this._dashTimer > 0;
  }

  // Fires damage trigger only when health actually decreases
  takeDamage(amount) {
    if (window.testingMode) return;
    const healthBefore = this.health;
    super.takeDamage(amount);
    if (this.cardManager && this.health < healthBefore) {
      const enemies = this.getEnemies ? this.getEnemies() : [];
      this.cardManager.fireTrigger(Trigger.ON_DAMAGE, {
        player: this,
        enemies,
      });
    }
  }

  addCredits(amount) {
    this.credits += amount;
  }

  update(deltaTime) {
    if (this.isDead) return;

    // Slow timer: decreses each frame, when ends the velocity restart
    if (this._slowTimer > 0) {
      this._slowTimer -= deltaTime;
      this.speed = this._baseSpeed * 0.4; // 40% velocity
    } else {
      this.speed = this._baseSpeed; // normal velocity
    }

    // Freeze player when enters a new room
    if (this._freezeTimer > 0) this._freezeTimer -= deltaTime;

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

    if (this.mouse) {
      const toMouse = this.mouse.position.minus(this.position);
      if (toMouse.squareLength() > 0) {
        this.aimDirection = toMouse.normalize();
      }
    }

    if (this._dashCooldownTimer > 0) this._dashCooldownTimer -= deltaTime;

    if (this.isDashing) {
      this._dashTimer -= deltaTime;
    } else if (
      this.input.isKeyDown("SPACE") &&
      this._dashCooldownTimer <= 0 &&
      isMoving
    ) {
      const dashDir = direction;
      this._dashTimer = this._dashDuration;
      this._dashCooldownTimer = this._dashCooldown;

      this.velocity = dashDir.times(this._dashSpeed);
      this.grantInvincibility(this._dashDuration);

      if (this.cardManager) {
        const enemies = this.getEnemies?.() ?? [];
        this.cardManager.fireTrigger(Trigger.ON_DASH, {
          player: this,
          enemies,
        });
      }
    } else {
      const canMove = this._freezeTimer <= 0 && !this.isDashing;
      this.velocity = canMove ? direction.times(this.speed) : new Vector(0, 0);
    }

    this.state = isMoving || this.isDashing ? "moving" : "idle";

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

    if (this._strikeTimer > 0)
      this._strikeTimer = Math.max(0, this._strikeTimer - deltaTime);

    super.update(deltaTime);
  }

  // Draws the melee arc overlay when a strike is active, then renders the sprite
  draw(renderer) {
    if (this._strikeTimer > 0) {
      const DURATION = 0.18;
      const alpha = this._strikeTimer / DURATION;
      const angle = Math.atan2(this._strikeDir.y, this._strikeDir.x);
      const SPREAD = this._strikeSpread;
      const r = this._strikeRange;
      const ctx = renderer.context;
      const s = renderer.scale;
      const cx = this.position.x * s;
      const cy = this.position.y * s;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r * s, angle - SPREAD / 2, angle + SPREAD / 2);
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
      const combatState = { player: this, enemies, enemy: snap.enemy };

      if (snap.enemy.isDead) {
        this.cardManager.fireTrigger(Trigger.ON_KILL, combatState);
      } else if (snap.enemy.health < snap.health) {
        this.cardManager.fireTrigger(Trigger.ON_HIT, combatState);
      }
    }
  }

  freeze(duration) {
    this._freezeTimer = duration;
  }

  unfreeze() {
    this._freezeTimer = 0;
  }
}
