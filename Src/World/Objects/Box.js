// Box.js — Destructible box object that can drop credits when broken.
// Has a health value, supports a dimension-specific sprite variant, and drops random credits on death.

import { randInt } from "../../Utils/Random.js";
import GameObject from "./GameObject.js";
import Credit from "../../Entities/pickups/Credit.js";
import Vector from "../../Utils/Vector.js";
import {
  OBJECTS_IMAGE,
  OBJECTS_SPRITE,
} from "../../../Assets/Sprites/ObjectsID.js";

export default class Box extends GameObject {
  // Creates a box with the given position and visual type variant.
  constructor(position, type) {
    super(position, 16, 16, "#8B6914", "box");
    this.isSolid = true;
    this.health = 10;
    this.isDead = false;

    this.type = type;
    this.spriteKey = `box_1_${type}`;
  }

  // Reduces health by the given amount and marks the box as dead when health reaches zero.
  takeDamage(amount) {
    if (this.isDead) return;
    this.health -= amount;
    if (this.health <= 0) this.isDead = true;
  }

  // Spawns a credit pickup at the box position with a random amount (0, 10, or 20).
  dropLoot(credits) {
    const amount = randInt(0, 2) * 10;
    if (amount > 0)
      credits.push(
        new Credit(new Vector(this.position.x, this.position.y), amount),
      );
  }

  // Draws the box sprite if the image is loaded, otherwise renders a fallback rectangle.
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
        "#8B6914",
      );
  }
}
