import Animation from "../../../Animation/Animation.js";
import SpriteSheet from "../../../Animation/SpriteSheet.js";
import RangedEnemy from "../archetypes/RangedEnemy.js";
import BanditBullet from "../../BanditBullet.js";
import Vector from "../../../Utils/Vector.js";
import { randInt } from "../../../Utils/Random.js";

const SPRITE_SRC = "../../Assets/Sprites/enemies/bandit/bandit.png";

// Shared image — one load across all Bandit instances
const _img = new Image();
_img.src = SPRITE_SRC;

// Sheet: 464×96 px — 2 rows of 48px, 9 frames per row (~48px wide each)
// Row 0 (srcY= 0): left-facing    Row 1 (srcY=48): right-facing
// Col 0        : idle   (1 frame)
// Cols 1–4  (srcX= 48): run    (4 frames)
// Cols 5–8  (srcX=240): attack (4 frames)
const FW = 48;
const FH = 48;
const SHEETS = {
  left: {
    idle:   new SpriteSheet({ image: _img, srcX: 0,   srcY: 0,  frameWidth: FW, frameHeight: FH, frameCount: 1 }),
    run:    new SpriteSheet({ image: _img, srcX: FW,  srcY: 0,  frameWidth: FW, frameHeight: FH, frameCount: 4 }),
    attack: new SpriteSheet({ image: _img, srcX: FW*5,srcY: 0,  frameWidth: FW, frameHeight: FH, frameCount: 4 }),
  },
  right: {
    idle:   new SpriteSheet({ image: _img, srcX: 0,   srcY: FH, frameWidth: FW, frameHeight: FH, frameCount: 1 }),
    run:    new SpriteSheet({ image: _img, srcX: FW,  srcY: FH, frameWidth: FW, frameHeight: FH, frameCount: 4 }),
    attack: new SpriteSheet({ image: _img, srcX: FW*5,srcY: FH, frameWidth: FW, frameHeight: FH, frameCount: 4 }),
  },
};

const DRAW_W = 40;
const DRAW_H = 40;

const SHOOT_RATE        = 1.5;
const SHOOT_RANGE       = 280;
const PREFERRED_DIST    = 180;
const DIST_BUFFER       = 30;
const STRAFE_SPEED_MULT = 0.7;
const IDLE_FPS          = 4;
const RUN_FPS           = 8;
const SHOOT_FPS         = 10;

export default class Bandit extends RangedEnemy {
  constructor(position, deps) {
    super(position, deps);

    this.width        = DRAW_W;
    this.height       = DRAW_H;
    this.hitboxWidth  = 12;
    this.hitboxHeight = 16;

    this.color         = "#a0522d";
    this.originalColor = "#a0522d";

    this.shootCooldown = 0;

    this._facingDir   = "right";
    this._aimDir      = new Vector(1, 0);
    this._shootPhase  = "ready";   // "ready" | "animating" | "cooldown"
    this._cooldownTimer = 0;
    this._strafeDir   = randInt(0, 1) === 0 ? 1 : -1;
    this._strafeTimer = randInt(3, 5);

    this._animation = new Animation({ sheet: SHEETS.right.idle, fps: IDLE_FPS, loop: true });
  }

  // Fully overrides RangedEnemy.onUpdate to drive the shoot-animation state machine
  onUpdate(deltaTime) {
    this._cooldownTimer -= deltaTime;

    const dir      = new Vector(
      this.player.position.x - this.position.x,
      this.player.position.y - this.position.y,
    );
    const normDir  = dir.normalize();
    const distance = dir.magnitude();

    this.#updateMovement(deltaTime, normDir, distance);
    this.#updateShooting(deltaTime, normDir, distance);
    this.#updateAnimation();
  }

  draw(renderer) {
    const drawX = this.position.x - DRAW_W / 2;
    const drawY = this.position.y - DRAW_H / 2;

    if (this._animation) {
      renderer.drawAnimation(this._animation, drawX, drawY, DRAW_W, DRAW_H);
      if (this._flashTimer > 0) {
        renderer.drawRect(drawX, drawY, DRAW_W, DRAW_H, "rgba(255,255,255,0.7)");
      }
    } else {
      renderer.drawRect(drawX, drawY, DRAW_W, DRAW_H, this.color);
    }

    // Health bar
    const H  = 3;
    const bx = drawX;
    const by = drawY - H - 2;
    renderer.drawRect(bx, by, DRAW_W, H, "#333333");
    const fill = Math.max(0, (this.health / this.maxHealth) * DRAW_W);
    renderer.drawRect(bx, by, fill, H, "#22cc44");
  }

  // --------------------- PRIVATE ---------------------
  #updateMovement(deltaTime, normDir, distance) {
    // Stand still while playing the shoot animation
    if (this._shootPhase === "animating") {
      this.velocity = new Vector(0, 0);
      return;
    }

    if (distance > PREFERRED_DIST + DIST_BUFFER) {
      this.velocity = normDir.times(this.speed);
    } else if (distance < PREFERRED_DIST - DIST_BUFFER) {
      this.velocity = normDir.times(-this.speed);
    } else {
      this._strafeTimer -= deltaTime;
      if (this._strafeTimer <= 0) {
        this._strafeDir  *= -1;
        this._strafeTimer = randInt(3, 5);
      }
      const strafeDir = new Vector(-normDir.y, normDir.x);
      this.velocity = strafeDir.times(this.speed * STRAFE_SPEED_MULT * this._strafeDir);
    }
  }

  #updateShooting(deltaTime, normDir, distance) {
    if (this._shootPhase === "ready") {
      if (distance < SHOOT_RANGE) {
        // Face the player and start the attack animation
        this._aimDir     = normDir;
        this._facingDir  = normDir.x >= 0 ? "right" : "left";
        this._shootPhase = "animating";
        this._animation  = new Animation({
          sheet: SHEETS[this._facingDir].attack,
          fps:   SHOOT_FPS,
          loop:  false,
        });
      }
    } else if (this._shootPhase === "animating") {
      if (this._animation.isDone) {
        // Spawn bullet at gun tip when animation finishes
        const spawnPos = this.position.plus(this._aimDir.times(14));
        this.bullets.push(new BanditBullet(spawnPos, this._aimDir));
        this._shootPhase    = "cooldown";
        this._cooldownTimer = SHOOT_RATE;
      }
    } else {
      // cooldown
      if (this._cooldownTimer <= 0) this._shootPhase = "ready";
    }
  }

  #updateAnimation() {
    // Don't interrupt the attack animation
    if (this._shootPhase === "animating") return;

    // Update facing from horizontal velocity
    if (this.velocity.x < 0)      this._facingDir = "left";
    else if (this.velocity.x > 0) this._facingDir = "right";

    const isMoving = this.velocity.squareLength() > 0.1;
    const action   = isMoving ? "run" : "idle";
    const fps      = isMoving ? RUN_FPS : IDLE_FPS;
    const sheet    = SHEETS[this._facingDir][action];

    if (this._animation.sheet !== sheet) {
      this._animation = new Animation({ sheet, fps, loop: true });
    }
  }
}
