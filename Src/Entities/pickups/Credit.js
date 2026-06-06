import Animation from "../../Animation/Animation.js";
import SpriteSheet from "../../Animation/SpriteSheet.js";
import { TILE_SIZE } from "../../Utils/Constants.js";
import Entity from "../Entity.js";

const COIN_SHEET = new SpriteSheet({
  src: "../../Assets/Sprites/drops/coin-Sheet.png",
  frameWidth: 24,
  frameHeight: 24,
  frameCount: 4,
});

export default class Credit extends Entity {
  constructor(position, value = 10) {
    super(position, 24, 24, "gold");
    this.hitboxWidth = TILE_SIZE;
    this.hitboxHeight = TILE_SIZE;
    this.value = value;
    this._animation = new Animation({ sheet: COIN_SHEET, fps: 6, loop: true });
  }
}