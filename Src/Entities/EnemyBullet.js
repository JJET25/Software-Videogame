// EnemyBullet.js — Generic projectile fired by enemies toward the player.

import Entity from "./Entity.js";

// Simple enemy projectile that travels in a straight line and self-destructs when out of bounds.
export default class EnemyBullet extends Entity {

  // Sets velocity from the given direction and initializes damage.
  constructor(position, direction) {
    super(position, 4, 4, "yellow");

    this.speed = 220;

    this.velocity = direction.times(
      this.speed
    );

    this.damage = 15;

    this.isDead = false;
  }

  // Moves the bullet and marks it dead when it leaves the playable area.
  update(deltaTime) {

    this.position = this.position.plus(
      this.velocity.times(deltaTime)
    );

    // Remove bullet when it has travelled far outside the room.
    if (
      this.position.x < -200 ||
      this.position.x > 4000 ||
      this.position.y < -200 ||
      this.position.y > 4000
    ) {
      this.isDead = true;
    }
  }
}
