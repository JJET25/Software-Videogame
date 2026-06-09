import Entity from "./Entity.js";

// Spirit colors: core #d5f2ff, glow #a9d4e7, dark outline #012637
const CORE_COLOR  = "rgb(213, 242, 255)";
const GLOW_COLOR  = "rgba(169, 212, 231, 0.65)";
const OUTER_COLOR = "rgba(1, 38, 55, 0)";

export default class SpiritBullet extends Entity {
  constructor(position, direction) {
    super(position, 8, 8, "#a9d4e7");
    this.hitboxWidth = 6;
    this.hitboxHeight = 6;
    this.speed = 200;
    this.velocity = direction.times(this.speed);
    this.damage = 12;
  }

  update(deltaTime) {
    this.position = this.position.plus(this.velocity.times(deltaTime));
    const { x, y } = this.position;
    if (x < -300 || x > 4000 || y < -300 || y > 4000) this.isDead = true;
  }

  draw(renderer) {
    const ctx = renderer.context;
    const s   = renderer.scale;
    const cx  = (this.position.x + renderer.offsetX) * s;
    const cy  = (this.position.y + renderer.offsetY) * s;

    ctx.save();

    // Outer aura (soft glow)
    const glowR = 6 * s;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
    grad.addColorStop(0,   CORE_COLOR);
    grad.addColorStop(0.4, GLOW_COLOR);
    grad.addColorStop(1,   OUTER_COLOR);
    ctx.beginPath();
    ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Bright core
    ctx.beginPath();
    ctx.arc(cx, cy, 2.5 * s, 0, Math.PI * 2);
    ctx.fillStyle = CORE_COLOR;
    ctx.fill();

    ctx.restore();
  }
}
