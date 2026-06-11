// Collision.js — Static utility class for axis-aligned bounding box collision detection and resolution.
export default class Collision {
  // Clamps an entity inside the room boundaries by correcting its position using its hitbox.
  static resolveEntityBounds(entity, roomWidth, roomHeight) {
    const b = entity.getBounds();
    if (b.left   < 0)          entity.position.x -= b.left;
    if (b.right  > roomWidth)  entity.position.x -= (b.right  - roomWidth);
    if (b.top    < 0)          entity.position.y -= b.top;
    if (b.bottom > roomHeight) entity.position.y -= (b.bottom - roomHeight);
  }

  // Returns true if two axis-aligned rectangles overlap.
  static rectCollision(boundsA, boundsB) {
    return (
      boundsA.left <= boundsB.right &&
      boundsA.right >= boundsB.left &&
      boundsA.top <= boundsB.bottom &&
      boundsA.bottom >= boundsB.top
    );
  }

  // Returns the pixel overlap on each axis between two intersecting rectangles.
  static getOverlap(boundsA, boundsB) {
    const overlapX = Math.min(boundsA.right, boundsB.right) - Math.max(boundsA.left, boundsB.left);
    const overlapY = Math.min(boundsA.bottom, boundsB.bottom) - Math.max(boundsA.top, boundsB.top);

    return { overlapX, overlapY };
  }

  // Pushes objectA out of objectB along the axis of smallest overlap and zeroes the corresponding velocity.
  static resolve(objectA, objectB) {
    const boundsA = objectA.getBounds();
    const boundsB = objectB.getBounds();

    if (!this.rectCollision(boundsA, boundsB)) return;

    const { overlapX, overlapY } = this.getOverlap(boundsA, boundsB);

    // Compare hitbox centres to determine push direction.
    // Using entity.position directly would give wrong results when the hitbox is offset from the sprite.
    if (overlapX < overlapY) {
      const cAx = (boundsA.left + boundsA.right)  / 2;
      const cBx = (boundsB.left + boundsB.right)  / 2;
      objectA.position.x += cAx < cBx ? -overlapX : overlapX;
      objectA.velocity.x  = 0;
    } else {
      const cAy = (boundsA.top  + boundsA.bottom) / 2;
      const cBy = (boundsB.top  + boundsB.bottom) / 2;
      objectA.position.y += cAy < cBy ? -overlapY : overlapY;
      objectA.velocity.y  = 0;
    }
  }
}
