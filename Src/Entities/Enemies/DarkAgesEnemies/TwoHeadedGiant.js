import Animation from "../../../Animation/Animation.js";
import SpriteSheet from "../../../Animation/SpriteSheet.js";
import TankEnemy from "../archetypes/TankEnemy.js";

const SPRITE_SRC = "../../Assets/Sprites/enemies/Two headed giant/spritesheet (4).png";

// Shared image — one load across all TwoHeadedGiant instances
const _img = new Image();
_img.src = SPRITE_SRC;

// 4×4 grid — 154×173 px per frame
// Row 0: walk down   Row 1: walk left   Row 2: walk right   Row 3: walk up
const FRAME_W = 154;
const FRAME_H = 173;

const SHEETS = {
  left: {
    idle: new SpriteSheet({ image: _img, frameWidth: FRAME_W, frameHeight: FRAME_H, frameCount: 1, row: 1, startCol: 0 }),
    walk: new SpriteSheet({ image: _img, frameWidth: FRAME_W, frameHeight: FRAME_H, frameCount: 4, row: 1, startCol: 0 }),
  },
  right: {
    idle: new SpriteSheet({ image: _img, frameWidth: FRAME_W, frameHeight: FRAME_H, frameCount: 1, row: 2, startCol: 0 }),
    walk: new SpriteSheet({ image: _img, frameWidth: FRAME_W, frameHeight: FRAME_H, frameCount: 4, row: 2, startCol: 0 }),
  },
};

const DRAW_W  = 44;
const DRAW_H  = 50;
const WALK_FPS = 6;

export default class TwoHeadedGiant extends TankEnemy {
  constructor(position, deps) {
    super(position, deps);

    this.health        = 160;
    this.maxHealth     = 160;
    this.speed         = 30;
    this.contactDamage = 25;
    this.activationDelay = 1.5;

    this.width        = DRAW_W;
    this.height       = DRAW_H;
    this.hitboxWidth  = 30;
    this.hitboxHeight = 36;

    this.color         = "#c07040";
    this.originalColor = "#c07040";

    this._facingDir = "right";
    this._animation = new Animation({ sheet: SHEETS.right.idle, fps: WALK_FPS, loop: true });
  }

  onUpdate(deltaTime) {
    super.onUpdate(deltaTime);
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

    this._drawHealthBar(renderer, drawX, drawY, DRAW_W);
  }

  // --------------------- PRIVATE ---------------------
  #updateAnimation() {
    if (this.velocity.x < 0)      this._facingDir = "left";
    else if (this.velocity.x > 0) this._facingDir = "right";

    const isMoving = this.velocity.squareLength() > 0.1;
    const action   = isMoving ? "walk" : "idle";
    const sheet    = SHEETS[this._facingDir][action];

    if (this._animation.sheet !== sheet) {
      this._animation = new Animation({ sheet, fps: WALK_FPS, loop: true });
    }
  }
}
