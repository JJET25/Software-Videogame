import Entity from "./Entity.js";
import Vector from "../Utils/Vector.js";
import { Trigger } from "../cards/AutomaticCard.js";
import SpriteSheet from "../Animation/SpriteSheet.js";
import Animation from "../Animation/Animation.js";

// --------------------- CONFIG ---------------------
const DASH_SPEED = 300;
const DASH_DURATION = 0.2; // How long dash lasts
const DASH_COOLDOWN = 0.8; // Wait before next dash is allowed
const DASH_IFRAMES = 0.45; // Extra no-damage time after dash ends

const BASE_SPEED = 150;
const SLOW_FACTOR = 0.4; // Speed multiplier when slowed by spikes

const DEFENSE_DURATION = 2;

// --------------------- SPRITE SHEET ---------------------
const PLAYER_SHEET = "../../Assets/Sprites/player/knight/knight-Sheet.png";

// All direction, action combinations, loaded once at module level
const ANIMATIONS = {
  down: {
    idle: new SpriteSheet({
      src: PLAYER_SHEET,
      frameWidth: 64,
      frameHeight: 52,
      frameCount: 1,
      row: 0,
    }),
    walk: new SpriteSheet({
      src: PLAYER_SHEET,
      frameWidth: 64,
      frameHeight: 52,
      frameCount: 7,
      row: 0,
    }),
    attack: new SpriteSheet({
      src: PLAYER_SHEET,
      frameWidth: 64,
      frameHeight: 52,
      frameCount: 4,
      row: 0,
      startCol: 8,
    }),
    defense: new SpriteSheet({
      src: PLAYER_SHEET,
      frameWidth: 64,
      frameHeight: 52,
      frameCount: 4,
      row: 0,
      startCol: 12,
    }),
  },
  left: {
    idle: new SpriteSheet({
      src: PLAYER_SHEET,
      frameWidth: 64,
      frameHeight: 52,
      frameCount: 1,
      row: 1,
    }),
    walk: new SpriteSheet({
      src: PLAYER_SHEET,
      frameWidth: 64,
      frameHeight: 52,
      frameCount: 4,
      row: 1,
    }),
    attack: new SpriteSheet({
      src: PLAYER_SHEET,
      frameWidth: 64,
      frameHeight: 52,
      frameCount: 4,
      row: 1,
      startCol: 5,
    }),
    defense: new SpriteSheet({
      src: PLAYER_SHEET,
      frameWidth: 64,
      frameHeight: 52,
      frameCount: 3,
      row: 1,
      startCol: 9,
    }),
  },
  right: {
    idle: new SpriteSheet({
      src: PLAYER_SHEET,
      frameWidth: 64,
      frameHeight: 52,
      frameCount: 1,
      row: 2,
    }),
    walk: new SpriteSheet({
      src: PLAYER_SHEET,
      frameWidth: 64,
      frameHeight: 52,
      frameCount: 4,
      row: 2,
    }),
    attack: new SpriteSheet({
      src: PLAYER_SHEET,
      frameWidth: 64,
      frameHeight: 52,
      frameCount: 4,
      row: 2,
      startCol: 5,
    }),
    defense: new SpriteSheet({
      src: PLAYER_SHEET,
      frameWidth: 64,
      frameHeight: 52,
      frameCount: 3,
      row: 2,
      startCol: 9,
    }),
  },
  up: {
    idle: new SpriteSheet({
      src: PLAYER_SHEET,
      frameWidth: 64,
      frameHeight: 52,
      frameCount: 1,
      row: 3,
    }),
    walk: new SpriteSheet({
      src: PLAYER_SHEET,
      frameWidth: 64,
      frameHeight: 52,
      frameCount: 2,
      row: 3,
    }),
    attack: new SpriteSheet({
      src: PLAYER_SHEET,
      frameWidth: 64,
      frameHeight: 52,
      frameCount: 4,
      row: 3,
      startCol: 3,
    }),
    defense: new SpriteSheet({
      src: PLAYER_SHEET,
      frameWidth: 64,
      frameHeight: 52,
      frameCount: 4,
      row: 3,
      startCol: 7,
    }),
  },
};

// Player entity: handles movement, dashing, aiming, card activation and trigger firing
export default class Player extends Entity {
  constructor(position, input, mouse, audio) {
    super(position, 64, 52, "#4488ff", {
      hitboxHeight: 16,
      hitboxWidth: 16,
      hitboxOffset: new Vector(0, 8),
    });

    this.input = input;
    this.mouse = mouse;
    this.audio = audio;

    // Movement
    this.speed = BASE_SPEED;
    this._baseSpeed = BASE_SPEED;
    this._slowTimer = 0;

    // Animation state
    this._facingDir = "down";
    this._actionState = "idle";
    this._animation = new Animation({
      sheet: ANIMATIONS.down.idle,
      fps: 1,
      loop: true,
    });

    // Aim direction follows the mouse cursor
    this.aimDirection = new Vector(1, 0);

    // Cards and economy
    this.cardManager = null;
    this.credits = 0;
    this.totalDamageDealt = 0;

    // Set by GameplayScreen so player can read live room state
    this.getEnemies = null;
    this.getObjects = null;

    // Dash state
    this._dashTimer = 0;
    this._dashCooldownTimer = 0;
    this._dashDir = null;

    // Defense card timer
    this._defenseTimer = 0;

    // Freeze blocks all input and movement (notifications, room entry)
    this._freezeTimer = 0;

    // Melee arc visual — written by ActiveMeleeCard, read in draw()
    this._strikeTimer = 0;
    this._strikeDir = new Vector(1, 0);
    this._strikeRange = 120;
    this._strikeSpread = Math.PI * 0.6;
  }

  // True while the dash is active
  get isDashing() {
    return this._dashTimer > 0;
  }

  // Reduces health and fires ON_DAMAGE trigger if health actually dropped
  takeDamage(amount) {
    if (window.testingMode) return;
    const prev = this.health;
    const prevShield = this.shield;
    super.takeDamage(amount);

    // Plays if health or shild reduce
    const tookDamage = this.health < prev || this.shield < prevShield;
    if (tookDamage) this.audio?.playSFX("playerHit");
    if (this.isDead) this.audio?.playSFX("playerDeath");

    if (this.cardManager && this.health < prev) {
      this.cardManager.fireTrigger(Trigger.ON_DAMAGE, {
        player: this,
        enemies: this.getEnemies?.() ?? [],
      });
    }
  }

  addCredits(amount) {
    this.credits += amount;
  }
  freeze(duration) {
    this._freezeTimer = duration;
  }
  unfreeze() {
    this._freezeTimer = 0;
  }

  update(deltaTime) {
    if (this.isDead) return;

    this.#updateSpeed(deltaTime);

    // Freeze blocks all input and movement
    if (this._freezeTimer > 0) {
      this._freezeTimer -= deltaTime;
      this.velocity = new Vector(0, 0);
      super.update(deltaTime);
      return;
    }

    const { raw, isMoving, direction } = this.#readMovementInput();

    this.#updateAim();
    this.#updateDash(deltaTime, direction, isMoving);
    this.#updateCards();
    this.#updateActionState(isMoving);
    this.#updateTimers(deltaTime);

    super.update(deltaTime);
  }

  draw(renderer) {
    if (this._strikeTimer > 0) this.#drawMeleeArc(renderer);

    if (this._animation) {
      renderer.drawAnimation(
        this._animation,
        this.position.x - this.width / 2,
        this.position.y - this.height / 2,
        this.width,
        this.height,
      );
    }
  }

  // --------------------- PRIVATE ---------------------
  // Apply slow debuff or restore normal speed
  #updateSpeed(deltaTime) {
    if (this._slowTimer > 0) {
      this._slowTimer -= deltaTime;
      this.speed = this._baseSpeed * SLOW_FACTOR;
    } else this.speed = this._baseSpeed;
  }

  // Read WASD + arrow keys; also updates _facingDir from movement input
  #readMovementInput() {
    const raw = new Vector(0, 0);

    if (this.input.isKeyDown("W") || this.input.isKeyDown("ARROWUP")) {
      raw.y -= 1;
      this._facingDir = "up";
    }
    if (this.input.isKeyDown("S") || this.input.isKeyDown("ARROWDOWN")) {
      raw.y += 1;
      this._facingDir = "down";
    }
    if (this.input.isKeyDown("A") || this.input.isKeyDown("ARROWLEFT")) {
      raw.x -= 1;
      this._facingDir = "left";
    }
    if (this.input.isKeyDown("D") || this.input.isKeyDown("ARROWRIGHT")) {
      raw.x += 1;
      this._facingDir = "right";
    }

    return {
      raw,
      isMoving: raw.squareLength() > 0,
      direction: raw.normalize(),
    };
  }

  // Keep aim direction pointed at the mouse cursor
  #updateAim() {
    if (!this.mouse) return;
    const toMouse = this.mouse.position.minus(this.position);
    if (toMouse.squareLength() > 0) this.aimDirection = toMouse.normalize();
  }

  // Handle dash cooldown, active dash velocity, and dash start
  #updateDash(deltaTime, direction, isMoving) {
    if (this._dashCooldownTimer > 0) this._dashCooldownTimer -= deltaTime;

    if (this.isDashing) {
      this._dashTimer -= deltaTime;
      this.velocity = this._dashDir.times(DASH_SPEED);
    } else if (
      this.input.wasKeyPressed("SPACE") &&
      this._dashCooldownTimer <= 0 &&
      isMoving
    ) {
      this.#startDash(direction);
    } else this.velocity = direction.times(this.speed);
  }

  // Select card with keys 1-5
  #updateCards() {
    if (!this.cardManager) return;
    for (let i = 0; i < 5; i++) {
      if (this.input.wasKeyPressed(String(i + 1))) {
        this.cardManager.selectSlot(i);
        this.audio?.playSFX("cardSelect");
      }
    }
    if (this.mouse?.consumeClick())
      this.#playCardAtSlot(this.cardManager.selectedIndex);
  }

  // Resolve the current animation state from active timers and movement
  #updateActionState(isMoving) {
    if (this._strikeTimer > 0) this._actionState = "attack";
    else if (this._defenseTimer > 0) this._actionState = "defense";
    else if (isMoving || this.isDashing) this._actionState = "walk";
    else this._actionState = "idle";

    // During attack or defense, facing direction follows the aim
    if (this._actionState === "attack" || this._actionState === "defense") {
      this._facingDir = this.#aimToDir();
    }

    this.#selectAnimation();
  }

  // Count down melee and defense timers
  #updateTimers(deltaTime) {
    if (this._strikeTimer > 0)
      this._strikeTimer = Math.max(0, this._strikeTimer - deltaTime);
    if (this._defenseTimer > 0)
      this._defenseTimer = Math.max(0, this._defenseTimer - deltaTime);
  }

  // Start a dash: set timers, grant iframes, fire ON_DASH trigger
  #startDash(dir) {
    this.audio?.playSFX("dash");
    this._dashDir = dir;
    this._dashTimer = DASH_DURATION;
    this._dashCooldownTimer = DASH_COOLDOWN;
    this.velocity = dir.times(DASH_SPEED);
    this.grantInvincibility(DASH_DURATION + DASH_IFRAMES);
    this._flashTimer = DASH_DURATION;

    if (this.cardManager) {
      this.cardManager.fireTrigger(Trigger.ON_DASH, {
        player: this,
        enemies: this.getEnemies?.() ?? [],
      });
    }
  }

  // Play a card and fire ON_HIT / ON_KILL triggers based on damage dealt
  #playCardAtSlot(index) {
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
      this.totalDamageDealt += Math.max(0, snap.health - snap.enemy.health);
      if (snap.enemy.isDead)
        this.cardManager.fireTrigger(Trigger.ON_KILL, state);
      else if (snap.enemy.health < snap.health)
        this.cardManager.fireTrigger(Trigger.ON_HIT, state);
    }
  }

  // Swap to the correct SpriteSheet when direction or action changes
  #selectAnimation() {
    const sheet = ANIMATIONS[this._facingDir][this._actionState];
    if (this._animation.sheet !== sheet) {
      this._animation = new Animation({ sheet, fps: 8, loop: true });
    }
  }

  // Convert the aim vector to the nearest cardinal direction string
  #aimToDir() {
    const { x, y } = this.aimDirection;
    if (Math.abs(y) >= Math.abs(x)) return y < 0 ? "up" : "down";
    return x < 0 ? "left" : "right";
  }

  // Draw the melee cone while a strike is active
  #drawMeleeArc(renderer) {
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
    ctx.fillStyle = `rgba(255,230,80,${(alpha * 0.3).toFixed(2)})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(255,200,50,${(alpha * 0.9).toFixed(2)})`;
    ctx.lineWidth = 2 * s;
    ctx.stroke();
    ctx.restore();
  }
}
