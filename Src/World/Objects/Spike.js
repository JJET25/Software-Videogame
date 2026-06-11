// Spike.js — Floor hazard that damages and slows the player on contact.
// Non-solid; uses a smaller hitbox and a per-contact cooldown to avoid spam damage.

import {
  OBJECTS_IMAGE,
  OBJECTS_SPRITE,
} from "../../../Assets/Sprites/ObjectsID.js";
import { randInt } from "../../Utils/Random.js";
import GameObject from "./GameObject.js";

const SPIKE_DAMAGE = 8;
// Seconds between damage applications while the player stands on the spike.
const SPIKE_COOLDOWN = 1;
// Duration in seconds the player is slowed after being hit.
const SLOW_DURATION = 1.2;

export default class Spike extends GameObject {
  // Creates a spike at the given position with a random sprite variant and reduced hitbox.
  constructor(position) {
    super(position, 16, 16, "#363636", "spike");
    this.isSolid = false;
    this._damageCooldown = 0;

    // Hitbox is half the tile size to require more direct contact.
    this.hitboxHeight = 8;
    this.hitboxWidth = 8;

    const variants = ["spike_1", "spike_2"];
    this.spriteKey = variants[randInt(0, variants.length - 1)];
  }

  // Applies damage and slow to the player while respecting the per-hit cooldown.
  onPlayerContact(player, deltaTime) {
    if (this._damageCooldown > 0) {
      this._damageCooldown -= deltaTime;
      return;
    }
    player.takeDamage(SPIKE_DAMAGE);
    player.audio?.playSFX("spikes");
    player._slowTimer = SLOW_DURATION;
    this._damageCooldown = SPIKE_COOLDOWN;
  }

  // Draws the spike sprite if the image is loaded, otherwise renders a fallback rectangle.
  draw(renderer) {
    const s = OBJECTS_SPRITE[this.spriteKey];

    if (OBJECTS_IMAGE.complete && OBJECTS_IMAGE.naturalWidth > 0) {
      renderer.drawSprite(
        OBJECTS_IMAGE,
        s.srcX,
        s.srcY,
        s.srcW,
        s.srcH,
        this.position.x - this.width / 2,
        this.position.y - this.height / 2,
        this.width,
        this.height,
      );
    } else
      renderer.drawRect(
        this.position.x - this.width / 2,
        this.position.y - this.height / 2,
        this.width,
        this.height,
        "#363636",
      );
  }
}
