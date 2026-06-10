import SpriteSheet from "../../../Animation/SpriteSheet.js";
import Animation from "../../../Animation/Animation.js";
import FinalBossEnemy from "../archetypes/FinalBossEnemy.js";

// ----- SPRITE SHEET -----
const _img = new Image();
_img.src = "../../Assets/Sprites/enemies/Boss/SkeletonKing-Spritesheet.png";

const ANIMATIONS = {
  left: {
    idle: new SpriteSheet({
      image: _img,
      frameWidth: 200,
      frameHeight: 200,
      frameCount: 1,
      row: 0,
      startCol: 0,
    }),
    walk: new SpriteSheet({
      image: _img,
      frameWidth: 200,
      frameHeight: 200,
      frameCount: 4,
      row: 0,
      startCol: 1,
    }),
    charge: new SpriteSheet({
      image: _img,
      frameWidth: 200,
      frameHeight: 200,
      frameCount: 3,
      row: 0,
      startCol: 5,
    }),
    dash: new SpriteSheet({
      image: _img,
      frameWidth: 200,
      frameHeight: 200,
      frameCount: 3,
      row: 0,
      startCol: 8,
    }),
    shoot: new SpriteSheet({
      image: _img,
      frameWidth: 200,
      frameHeight: 200,
      frameCount: 2,
      row: 0,
      startCol: 11,
    }),
  },
  right: {
    idle: new SpriteSheet({
      image: _img,
      frameWidth: 200,
      frameHeight: 200,
      frameCount: 1,
      row: 1,
      startCol: 0,
    }),
    walk: new SpriteSheet({
      image: _img,
      frameWidth: 200,
      frameHeight: 200,
      frameCount: 4,
      row: 1,
      startCol: 1,
    }),
    charge: new SpriteSheet({
      image: _img,
      frameWidth: 200,
      frameHeight: 200,
      frameCount: 3,
      row: 1,
      startCol: 5,
    }),
    dash: new SpriteSheet({
      image: _img,
      frameWidth: 200,
      frameHeight: 200,
      frameCount: 3,
      row: 1,
      startCol: 8,
    }),
    shoot: new SpriteSheet({
      image: _img,
      frameWidth: 200,
      frameHeight: 200,
      frameCount: 2,
      row: 1,
      startCol: 11,
    }),
  },
};

// Dark Ages finalBoss — Skeleton King
// The undead lord of the dungeon. 2000 HP, 3 phases.
export default class SkeletonKing extends FinalBossEnemy {
  constructor(position, deps) {
    super(position, deps);

    this.color = "#aaaaff";
    this.originalColor = "#aaaaff";

    this.width = 45;
    this.height = 45;
    this.drawWidth = 45;
    this.drawHeight = 45;

    this._facingDir = "left";
    this._animation = new Animation({
      sheet: ANIMATIONS.left.idle,
      fps: 4,
      loop: true,
    });
  }

  // Phase 3 enraged: glows bright violet
  onUpdate(deltaTime) {
    super.onUpdate(deltaTime);
    if (this.isEnraged) {
      this.color = "#cc88ff";
    }
    this.#updateAnimation();
  }

  // ----- PRIVATE -----
  #resolveAction() {
    if (this.isDashing) return "dash";
    if (this._isCharging) return "charge";
    if (this._recoveryTimer > 0 && !this.isDashing && !this._isCharging) {
      return "shoot";
    }
    if (this.velocity.squareLength() > 1) return "walk";
    return "idle";
  }

  #updateAnimation() {
    if (this.velocity.x < -0.5) this._facingDir = "right";
    else if (this.velocity.x > 0.5) this._facingDir = "left";

    const action = this.#resolveAction();
    const targetSheet = ANIMATIONS[this._facingDir][action];

    if (this._animation.sheet !== targetSheet) {
      const loops = action !== "charge" && action !== "shoot";
      const fps =
        action === "dash"
          ? 18
          : action === "charge"
            ? 8
            : action === "shoot"
              ? 10
              : action === "walk"
                ? 8
                : 4;
      this._animation = new Animation({ sheet: targetSheet, fps, loop: loops });
    }
  }
}
