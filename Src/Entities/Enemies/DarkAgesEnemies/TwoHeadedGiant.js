import Animation from "../../../Animation/Animation.js";
import SpriteSheet from "../../../Animation/SpriteSheet.js";
import TankEnemy from "../archetypes/TankEnemy.js";
import Vector from "../../../Utils/Vector.js";

const SPRITE_SRC = "../../Assets/Sprites/enemies/Two_headed_giant/Two_headed_giant_Sprite-Sheet.png";

const _img = new Image();
_img.src = SPRITE_SRC;

const FW = 154;
const FH = 173;

// 4×4 sprite sheet: rows 0-1 face right, rows 2-3 face left
// row 0 / 2 = walk, row 1 / 3 = attack
const SHEETS = {
  right: {
    idle:   new SpriteSheet({ image: _img, frameWidth: FW, frameHeight: FH, frameCount: 1, row: 0, startCol: 0 }),
    walk:   new SpriteSheet({ image: _img, frameWidth: FW, frameHeight: FH, frameCount: 4, row: 0, startCol: 0 }),
    attack: new SpriteSheet({ image: _img, frameWidth: FW, frameHeight: FH, frameCount: 4, row: 1, startCol: 0 }),
  },
  left: {
    idle:   new SpriteSheet({ image: _img, frameWidth: FW, frameHeight: FH, frameCount: 1, row: 2, startCol: 0 }),
    walk:   new SpriteSheet({ image: _img, frameWidth: FW, frameHeight: FH, frameCount: 4, row: 2, startCol: 0 }),
    attack: new SpriteSheet({ image: _img, frameWidth: FW, frameHeight: FH, frameCount: 4, row: 3, startCol: 0 }),
  },
};

const DRAW_W = 40;
const DRAW_H = 40;
const IDLE_FPS = 4;
const WALK_FPS = 8;
const ATTACK_FPS = 10;

export default class TwoHeadedGiant extends TankEnemy {
  constructor(position, deps) {
    super(position, deps);

    this.width = DRAW_W;
    this.height = DRAW_H;
    this.drawWidth = DRAW_W;
    this.drawHeight = DRAW_H;
    this.hitboxWidth = DRAW_W;
    this.hitboxHeight = DRAW_H;

    this.health = 100;
    this.maxHealth = 100;
    this.speed = 35;
    this.contactDamage = 22;

    this.color = "#8b6914";
    this.originalColor = "#8b6914";

    this._facingDir = "right";
    this._animation = new Animation({
      sheet: SHEETS.right.idle,
      fps: IDLE_FPS,
      loop: true,
    });
  }

  onUpdate(deltaTime) {
    super.onUpdate(deltaTime);
    this.#updateAnimation();
  }

  #updateAnimation() {
    if (!this.isDashing && !this._isCharging) {
      if (this.velocity.x < 0) this._facingDir = "left";
      else if (this.velocity.x > 0) this._facingDir = "right";
    }

    const isMoving = this.velocity.squareLength() > 0.1;
    const action = this.isDashing
      ? "attack"
      : this._isCharging || isMoving
        ? "walk"
        : "idle";
    const fps = this.isDashing ? ATTACK_FPS : isMoving ? WALK_FPS : IDLE_FPS;
    const sheet = SHEETS[this._facingDir][action];

    if (this._animation.sheet !== sheet) {
      this._animation = new Animation({ sheet, fps, loop: true });
    }
  }
}
