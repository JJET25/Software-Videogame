import GameObject from "./GameObject.js";
import SpriteSheet from "../Utils/SpriteSheet.js";
import { ROCK_FRAMES } from "../Utils/ObjectSprites.js";

export default class Rock extends GameObject {
  static sheet = new SpriteSheet("../../Assets/Sprites/tiles/tilesDungeon.png");
  // variant: 0, 1, 2
  constructor(position, variant = 0) {
    super(position, 32, 32, "#7a6a5a", "rock");
    this.spriteSheet = Rock.sheet;
    this.spriteFrame = ROCK_FRAMES[variant];
  }
}
