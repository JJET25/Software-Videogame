import Vector from "../Utils/Vector.js";

export default class GameObject {
  constructor(position, width, height, color, type) {
    this.position = position;
    this.velocity = new Vector(0, 0);
    this.width = width;
    this.height = height;
    this.color = color;
    this.type = type;

    this.spriteSheet = null;
    this.spriteFrame = null;
  }

  // Returns the hitbox edges for collisions
  getBounds() {
    return {
      left: this.position.x - this.width / 2,
      right: this.position.x + this.width / 2,
      top: this.position.y - this.height / 2,
      bottom: this.position.y + this.height / 2,
    };
  }

  // Draws the gameObject, it centers the obj on its position
  draw(renderer) {
    const dx = this.position.x - this.width / 2;
    const dy = this.position.y - this.height / 2;

    if (this.spriteSheet?.ready && this.spriteFrame) {
      const { sx, sy, sw, sh } = this.spriteFrame;
      renderer.drawSprite(
        this.spriteSheet.image,
        sx,
        sy,
        sw,
        sh,
        dx,
        dy,
        this.width,
        this.height,
      );
    } else {
      renderer.drawRect(dx, dy, this.width, this.height, this.color);
    }
  }
}
