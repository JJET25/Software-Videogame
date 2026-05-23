import GameObject from "./GameObject.js";
import SpriteSheet from "../Utils/SpriteSheet.js";
import { CHEST_FRAMES } from "../Utils/ObjectSprites.js";

export default class Chest extends GameObject {
  static sheet = new SpriteSheet("../../Assets/Sprites/tiles/tilesDungeon.png");
  // variant: 0, 1, 2  (los 3 tipos)
  constructor(position, variant = 0) {
    super(position, 32, 32, "#d4a017", "chest");
    this.spriteSheet = Chest.sheet;
    this.spriteFrame = CHEST_FRAMES[variant];
  }
}
