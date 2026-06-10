import SpriteSheet from "../../../Animation/SpriteSheet.js";
import Animation from "../../../Animation/Animation.js";
import BossEnemy from "../archetypes/BossEnemy.js";

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

// Dark Ages miniBoss — Fallen Knight
// A weakened echo of the Skeleton King. Half the HP, 70% of the damage, same behavior.
export default class FallenKnight extends BossEnemy {
  constructor(position, deps) {
    super(position, deps, {
      healthMult: 0.5, // 500 HP vs 1000 of a full BossEnemy
      damageMult: 0.7, // weaker hits and bullets
      speedMult: 0.85, // slightly slower — easier to avoid dashes
    });

    this.color = "#8899aa";
    this.originalColor = "#8899aa";

    this.width = 45;
    this.height = 45;

    this._facingDir = "left";
    this._animation = new Animation({
      sheet: ANIMATIONS.left.idle,
      fps: 4,
      loop: true,
    });
  }

  onUpdate(deltaTime) {
    super.onUpdate(deltaTime);
    if (this.isEnraged) {
      // Phase 3: armor cracks, reveals darker metal
      this.color = "#556677";
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
