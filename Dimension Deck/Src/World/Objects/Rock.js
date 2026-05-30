import {
  OBJECTS_IMAGE,
  OBJECTS_SPRITE,
} from "../../../Assets/Sprites/ObjectsID.js";
import { randInt } from "../../Utils/Random.js";
import GameObject from "./GameObject.js";

export default class Rock extends GameObject {
  constructor(position) {
    super(position, 16, 16, "#806262", "rock");
    this.isSolid = true;

    const variants = ["rock_1", "rock_2", "rock_3"];
    this.spriteKey = variants[randInt(0, variants.length - 1)];
  }

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
        "#806262",
      );
  }
}
