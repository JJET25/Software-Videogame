import { randInt } from "../../Utils/Random.js";
import GameObject from "./GameObject.js";
import Credit from "../../Entities/pickups/Credit.js";
import Vector from "../../Utils/Vector.js";

export default class Box extends GameObject {
  constructor(position) {
    super(position, 16, 16, "#8B6914", "box");
    this.isSolid = true;
    this.health = 10;
    this.isDead = false;
  }

  takeDamage(amount) {
    if (this.isDead) return;
    this.health -= amount;
    if (this.health <= 0) this.isDead = true;
  }

  dropLoot(credits) {
    const amount = randInt(0, 2) * 10;
    if (amount > 0)
      credits.push(
        new Credit(new Vector(this.position.x, this.position.y), amount),
      );
  }

  draw(renderer) {
    renderer.drawRect(
      this.position.x - this.width / 2,
      this.position.y - this.height / 2,
      this.width,
      this.height,
      "#8B6914",
    );
  }
}
