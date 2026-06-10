import Animation from "../../../Animation/Animation.js";
import SpriteSheet from "../../../Animation/SpriteSheet.js";
import TankEnemy from "../archetypes/TankEnemy.js";
import Vector from "../../../Utils/Vector.js";

const SPRITE_SRC = "../../Assets/Sprites/enemies/minotaur/minotaur.png";

const _img = new Image();
_img.src = SPRITE_SRC;

const FW = 48;
const FH = 48;

const SHEETS = {
  idle: new SpriteSheet({
    image: _img,
    frameWidth: FW,
    frameHeight: FH,
    frameCount: 10,
    row: 0,
    startCol: 0,
  }),
  walk: new SpriteSheet({
    image: _img,
    frameWidth: FW,
    frameHeight: FH,
    frameCount: 10,
    row: 1,
    startCol: 0,
  }),
  attack: new SpriteSheet({
    image: _img,
    frameWidth: FW,
    frameHeight: FH,
    frameCount: 10,
    row: 2,
    startCol: 0,
  }),
};

const DRAW_W = 60;
const DRAW_H = 60;

// Stomp — close-range slam that uses the attack frames
const STOMP_RANGE = 55;
const STOMP_DURATION = 0.72; // 10 frames at ~14 fps
const STOMP_COOLDOWN = 2.8;
const STOMP_DAMAGE = 28;

export default class Minotaur extends TankEnemy {
  constructor(position, deps) {
    super(position, deps);

    this.health = 120;
    this.maxHealth = 120;
    this.speed = 36;
    this.contactDamage = 20;
    this.activationDelay = 1.2;

    this.width = DRAW_W;
    this.height = DRAW_H;
    this.hitboxWidth = 28;
    this.hitboxHeight = 34;

    this.color = "#8b4513";
    this.originalColor = "#8b4513";

    this._facingDir = "left";
    this._animation = new Animation({
      sheet: SHEETS.idle,
      fps: 10,
      loop: true,
    });

    this._stompPhase = "ready"; // "ready" | "stomping" | "cooldown"
    this._stompTimer = 0;
    this._stompDamaged = false;
  }

  onUpdate(deltaTime) {
    const dir = new Vector(
      this.player.position.x - this.position.x,
      this.player.position.y - this.position.y,
    );
    const distance = dir.magnitude();

    this.#updateStomp(deltaTime, distance);

    // Let TankEnemy handle dash/charge only when not stomping
    if (this._stompPhase !== "stomping") super.onUpdate(deltaTime);

    this.#updateAnimation();
  }

  // Minotaur keeps its own draw() because its sprite sheet uses a reversed
  // right-facing layout that ctx.drawImage must handle manually.
  draw(renderer) {
    const drawX = this.position.x - DRAW_W / 2;
    const drawY = this.position.y - DRAW_H / 2;

    const { sheet, frame } = this._animation;
    if (sheet?.isLoaded) {
      const ctx = renderer.context;
      const s = renderer.scale;
      const dx = (drawX + renderer.offsetX) * s;
      const dy = (drawY + renderer.offsetY) * s;
      const dw = DRAW_W * s;
      const dh = DRAW_H * s;

      let sx, sy;
      if (this._facingDir === "right") {
        // Right-facing rows are 5 rows below the left-facing equivalent
        // Frames are stored in reverse order: col 9 = frame 0, col 0 = last frame
        sy = (sheet.row + 5) * FH;
        sx = (sheet.frameCount - 1 - frame) * FW;
      } else {
        sy = sheet.row * FH;
        sx = (sheet.startCol + frame) * FW;
      }
      ctx.drawImage(sheet.image, sx, sy, FW, FH, dx, dy, dw, dh);

      if (
        this._flashTimer > 0 &&
        this._stompPhase !== "stomping" &&
        !this._isCharging
      ) {
        renderer.drawRect(
          drawX,
          drawY,
          DRAW_W,
          DRAW_H,
          "rgba(255,255,255,0.7)",
        );
      }
    } else {
      renderer.drawRect(drawX, drawY, DRAW_W, DRAW_H, this.color);
    }

    this._drawHealthBar(renderer, drawX, drawY, DRAW_W);

    // ── DEBUG ──────────────────────────────────────────────────────────────
    if (window.__debugHitboxes) {
      // Sprite bounds (amarillo)
      renderer.drawRect(drawX, drawY, DRAW_W, DRAW_H, "rgba(255,255,0,0.35)");
      // Hitbox real (rojo)
      const b = this.getBounds();
      renderer.drawRect(
        b.left,
        b.top,
        this.hitboxWidth,
        this.hitboxHeight,
        "rgba(255,0,0,0.45)",
      );
      // Centro de posición (cyan)
      renderer.drawRect(this.position.x - 1, this.position.y - 1, 2, 2, "cyan");
    }
    // ───────────────────────────────────────────────────────────────────────
  }

  // --------------------- PRIVATE ---------------------
  #updateStomp(deltaTime, distance) {
    if (this._stompPhase === "ready") {
      if (distance < STOMP_RANGE && !this.isDashing && !this._isCharging) {
        this._stompPhase = "stomping";
        this._stompTimer = STOMP_DURATION;
        this._stompDamaged = false;
        this.velocity = new Vector(0, 0);
      }
    } else if (this._stompPhase === "stomping") {
      this._stompTimer -= deltaTime;
      this.velocity = new Vector(0, 0);

      // Deliver damage at the midpoint of the animation
      if (!this._stompDamaged && this._stompTimer <= STOMP_DURATION / 2) {
        if (distance < STOMP_RANGE + 15) this.player.takeDamage(STOMP_DAMAGE);
        this._stompDamaged = true;
      }

      if (this._stompTimer <= 0) {
        this._stompPhase = "cooldown";
        this._stompTimer = STOMP_COOLDOWN;
      }
    } else {
      this._stompTimer -= deltaTime;
      if (this._stompTimer <= 0) this._stompPhase = "ready";
    }
  }

  #updateAnimation() {
    if (
      !this.isDashing &&
      !this._isCharging &&
      this._stompPhase !== "stomping"
    ) {
      if (this.velocity.x < 0) this._facingDir = "right";
      else if (this.velocity.x > 0) this._facingDir = "left";
    }

    const isMoving = this.velocity.squareLength() > 0.1;
    const action =
      this.isDashing || this._stompPhase === "stomping"
        ? "attack"
        : this._isCharging || isMoving
          ? "walk"
          : "idle";
    const fps = this.isDashing || this._stompPhase === "stomping" ? 14 : 10;
    const sheet = SHEETS[action];

    if (this._animation.sheet !== sheet) {
      this._animation = new Animation({ sheet, fps, loop: true });
    }
  }
}
