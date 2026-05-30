import { TILE_SIZE } from "../../Utils/Constants.js";
import GameObject from "./GameObject.js";

export default class DoorBlocker extends GameObject {
  constructor(position) {
    super(position, TILE_SIZE, TILE_SIZE, "transparent", "doorBlocker");
    this.isActive = false;
  }
}
