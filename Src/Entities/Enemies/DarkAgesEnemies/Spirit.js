import Animation from "../../../Animation/Animation.js";
import SpriteSheet from "../../../Animation/SpriteSheet.js";
import { randInt } from "../../../Utils/Random.js";
import Vector from "../../../Utils/Vector.js";
import Enemy from "../../Enemy.js";
import SpiritBullet from "../../SpiritBullet.js";

const SPRITE_SRC = "../../Assets/Sprites/enemies/spirit/spirit-Sheet.png";

// Shared image — one load across all Spirit instances
const _img = new Image();
_img.src = SPRITE_SRC;

const SHEETS = {
  right: {
    idle: new SpriteSheet({
      image: _img,
      frameWidth: 32,
      frameHeight: 32,
      frameCount: 1,
      row: 0,
      startCol: 0,
    }),
    chase: new SpriteSheet({
      image: _img,
      frameWidth: 32,
      frameHeight: 32,
      frameCount: 1,
      row: 0,
      startCol: 1,
    }),
    shoot: new SpriteSheet({
      image: _img,
      frameWidth: 32,
      frameHeight: 32,
      frameCount: 3,
      row: 0,
      startCol: 2,
    }),
  },
  left: {
    idle: new SpriteSheet({
      image: _img,
      frameWidth: 32,
      frameHeight: 32,
      frameCount: 1,
      row: 1,
      startCol: 0,
    }),
    chase: new SpriteSheet({
      image: _img,
      frameWidth: 32,
      frameHeight: 32,
      frameCount: 1,
      row: 1,
      startCol: 1,
    }),
    shoot: new SpriteSheet({
      image: _img,
      frameWidth: 32,
      frameHeight: 32,
      frameCount: 3,
      row: 1,
      startCol: 2,
    }),
  },
};

const DRAW_W = 36;
const DRAW_H = 36;

const PREFERRED_DISTANCE = 100;
const DISTANCE_BUFFER = 25;
const SHOOT_RANGE = 220;
const STRAFE_SPEED_MULT = 0.65;
const SHOOT_COOLDOWN = 2.5;
const FPS_IDLE = 4;
const FPS_SHOOT = 10;

export default class Spirit extends Enemy {
  constructor(position, deps) {
    super(position, deps);

    this.speed = 46;
    this.health = 28;
    this.maxHealth = 28;
    this.contactDamage = 8;
    this.activationDelay = 0.8;

    this.width = DRAW_W;
    this.height = DRAW_H;
    this.drawWidth = DRAW_W;
    this.drawHeight = DRAW_H;
    this.hitboxWidth = 20;
    this.hitboxHeight = 20;
    this.hitboxOffset = new Vector(-this.width / 4, - this.height / 4);

    this.color = "#a9d4e7";
    this.originalColor = "#a9d4e7";

    this._facingDir = "right";
    this._aimDir = new Vector(1, 0);

    // "ready" | "animating" | "cooldown"
    this._shootPhase = "ready";
    this._cooldownTimer = 0;

    this._strafeDir = randInt(0, 1) === 0 ? 1 : -1;
    this._strafeTimer = randInt(3, 5);

    this._animation = new Animation({
      sheet: SHEETS.right.idle,
      fps: FPS_IDLE,
      loop: true,
    });
  }

  onUpdate(deltaTime) {
    const dir = new Vector(
      this.player.position.x - this.position.x,
      this.player.position.y - this.position.y,
    );
    const distance = dir.magnitude();
    const normDir = dir.normalize();

    this.#updateMovement(deltaTime, normDir, distance);
    this.#updateShooting(deltaTime, normDir, distance);
    this.#updateAnimation();
  }

  // --------------------- PRIVATE ---------------------
  #updateMovement(deltaTime, normDir, distance) {
    if (this._shootPhase === "animating") {
      this.velocity = new Vector(0, 0);
      return;
    }

    if (distance > PREFERRED_DISTANCE + DISTANCE_BUFFER) {
      this.velocity = normDir.times(this.speed);
    } else if (distance < PREFERRED_DISTANCE - DISTANCE_BUFFER) {
      this.velocity = normDir.times(-this.speed);
    } else {
      this._strafeTimer -= deltaTime;
      if (this._strafeTimer <= 0) {
        this._strafeDir *= -1;
        this._strafeTimer = randInt(3, 5);
      }
      const strafeDir = new Vector(-normDir.y, normDir.x);
      this.velocity = strafeDir.times(
        this.speed * STRAFE_SPEED_MULT * this._strafeDir,
      );
    }
  }

  #updateShooting(deltaTime, normDir, distance) {
    if (this._shootPhase === "ready") {
      if (distance < SHOOT_RANGE) {
        this._aimDir = normDir;
        this._shootPhase = "animating";
        this._animation = new Animation({
          sheet: SHEETS[this._facingDir].shoot,
          fps: FPS_SHOOT,
          loop: false,
        });
      }
    } else if (this._shootPhase === "animating") {
      if (this._animation.isDone) {
        // Bullet originates from the spirit's mouth — slightly ahead in aim direction
        const spawnPos = this.position.plus(this._aimDir.times(10));
        this.bullets.push(new SpiritBullet(spawnPos, this._aimDir));
        this._shootPhase = "cooldown";
        this._cooldownTimer = SHOOT_COOLDOWN;
      }
    } else {
      // "cooldown"
      this._cooldownTimer -= deltaTime;
      if (this._cooldownTimer <= 0) this._shootPhase = "ready";
    }
  }

  #updateAnimation() {
    if (this._shootPhase === "animating") return;

    // Update facing from velocity (use _aimDir when not moving)
    if (this.velocity.x < 0) this._facingDir = "right";
    else if (this.velocity.x > 0) this._facingDir = "left";

    const isMoving = this.velocity.squareLength() > 0.1;
    const action = isMoving ? "chase" : "idle";
    const sheet = SHEETS[this._facingDir][action];

    if (this._animation.sheet !== sheet) {
      this._animation = new Animation({ sheet, fps: FPS_IDLE, loop: true });
    }
  }
}
