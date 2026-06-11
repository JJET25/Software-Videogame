// GameObject.js — Base class for all world objects in the game.
// Provides position, velocity, hitbox configuration, and basic draw/bounds methods.

import Vector from "../../Utils/Vector.js";

export default class GameObject {
  // Initializes position, size, hitbox, color, and type. Hitbox can be overridden via options.
  constructor(position, width, height, color = null, type, options = {}) {
    this.position = position;
    this.velocity = new Vector(0, 0);

    this.width = width;
    this.height = height;

    // Hitbox dimensions and offset, defaulting to the visual size if not specified.
    this.hitboxWidth = options.hitboxWidth ?? width;
    this.hitboxHeight = options.hitboxHeight ?? height;
    this.hitboxOffset = options.hitboxOffset ?? new Vector(0, 0);

    this.color = color;
    this.type = type;
  }

  // Returns the axis-aligned bounding box edges used for collision detection.
  getBounds() {
    return {
      left: this.position.x + this.hitboxOffset.x - this.hitboxWidth / 2,
      right: this.position.x + this.hitboxOffset.x + this.hitboxWidth / 2,
      top: this.position.y + this.hitboxOffset.y - this.hitboxHeight / 2,
      bottom: this.position.y + this.hitboxOffset.y + this.hitboxHeight / 2,
    };
  }

  // Draws the object as a colored rectangle centered on its position.
  draw(renderer) {
    const drawX = this.position.x - this.width / 2;
    const drawY = this.position.y - this.height / 2;

    renderer.drawRect(drawX, drawY, this.width, this.height, this.color);
  }
}
