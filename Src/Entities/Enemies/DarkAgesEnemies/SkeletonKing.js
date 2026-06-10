import SpriteSheet from "../../../Animation/SpriteSheet.js";
import Animation from "../../../Animation/Animation.js";
import FinalBossEnemy from "../archetypes/FinalBossEnemy.js";

// ----- SPRITE SHEET -----
// Layout: col0=idle(1) | cols1-4=walk(4) | cols5-7=charge(3) | cols8-10=dash(3) | cols11-12=shoot(2)
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
// The undead lord of the dungeon, 2000 HP, 3 phases
export default class SkeletonKing extends FinalBossEnemy {
  constructor(position, deps) {
    super(position, deps);

    this.color = "#aaaaff";
    this.originalColor = "#aaaaff";

    // Sprite size matches the 45x45 sheet frames
    this.width = 45;
    this.height = 45;

    // Facing direction — updated each frame from velocity
    this._facingDir = "left";

    // Start with idle animation (left row)
    this._animation = new Animation({
      sheet: ANIMATIONS.left.idle,
      fps: 4,
      loop: true,
    });
  }

  // Phase 3 enraged: glows bright violet; animation continues normally
  onUpdate(deltaTime) {
    super.onUpdate(deltaTime);
    if (this.isEnraged) {
      this.color = "#cc88ff";
    }
    this.#updateAnimation();
  }

  // ----- PRIVATE -----

  // Map boss state machine flags to the correct animation action
  #resolveAction() {
    if (this.isDashing) return "dash";
    if (this._isCharging) return "charge";

    // Shoot: recovery timer fires right after any attack method
    // Use attackCooldown as a proxy — if it was just reset it means a shot was fired
    // A cleaner signal: _recoveryTimer is >0 after every attack
    if (this._recoveryTimer > 0 && !this.isDashing && !this._isCharging) {
      return "shoot";
    }

    if (this.velocity.squareLength() > 1) return "walk";
    return "idle";
  }

  #updateAnimation() {
    // Update facing direction from horizontal velocity
    if (this.velocity.x < -0.5) this._facingDir = "right";
    else if (this.velocity.x > 0.5) this._facingDir = "left";

    const action = this.#resolveAction();
    const targetSheet = ANIMATIONS[this._facingDir][action];

    // Only recreate Animation when the sheet actually changes — avoids frame reset flash
    if (this._animation.sheet !== targetSheet) {
      // Charge and shoot play once (loop: false) so the player reads the telegraph clearly
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
                : 4; // idle
      this._animation = new Animation({ sheet: targetSheet, fps, loop: loops });
    }
  }
}
