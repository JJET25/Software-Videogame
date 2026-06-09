import Entity from "./Entity.js";

// 2-frame pistol bullet: elongated brass casing that flickers slightly while travelling
export default class BanditBullet extends Entity {
  constructor(position, direction) {
    super(position, 7, 3, "#d4a017");
    this.hitboxWidth  = 5;
    this.hitboxHeight = 3;
    this.speed        = 260;
    this.damage       = 12;
    this.velocity     = direction.times(this.speed);
    this._angle       = Math.atan2(direction.y, direction.x);
    this._frame       = 0;   // alternates 0 / 1 at ~18 fps — the 2 "frames"
    this._frameTimer  = 0;
  }

  update(deltaTime) {
    this.position = this.position.plus(this.velocity.times(deltaTime));

    // Advance the 2-frame flicker (~18 fps)
    this._frameTimer += deltaTime;
    if (this._frameTimer >= 1 / 18) {
      this._frame      = this._frame === 0 ? 1 : 0;
      this._frameTimer = 0;
    }

    const { x, y } = this.position;
    if (x < -300 || x > 4000 || y < -300 || y > 4000) this.isDead = true;
  }

  draw(renderer) {
    const ctx = renderer.context;
    const s   = renderer.scale;
    const cx  = (this.position.x + renderer.offsetX) * s;
    const cy  = (this.position.y + renderer.offsetY) * s;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this._angle);

    // Frame 0: full length    Frame 1: 1 pixel shorter (subtle flicker)
    const len  = (this._frame === 0 ? 7 : 6) * s;
    const wide = 2 * s;

    // Brass casing body
    ctx.fillStyle = "#c8920e";
    ctx.fillRect(-len / 2, -wide / 2, len, wide);

    // Bright tip flash
    ctx.fillStyle = this._frame === 0 ? "#ffe066" : "#ffd040";
    ctx.fillRect(len / 2 - wide, -wide / 2, wide, wide);

    ctx.restore();
  }
}
