import Vector from "../../Utils/Vector.js";
import ShrinePortal from "../Objects/ShrinePortal.js";
import Room from "./Room.js";
import { TILE_SIZE, ROOM_COLS, ROOM_ROWS } from "../../Utils/Constants.js";

export default class ShrineRoom extends Room {
  constructor(doorDirections, player, bullets, credits, dimension) {
    super(doorDirections, player, bullets, credits, dimension);

    this.populate();
  }

  populate() {
    const centerPos = new Vector(
      (TILE_SIZE * ROOM_COLS) / 2,
      (TILE_SIZE * ROOM_ROWS) / 2,
    );
    this.shrinePortal = new ShrinePortal(centerPos);
    this.objects.push(this.shrinePortal);
    this.buildDecorGrid();
  }

  getInteractables() {
    return this.shrinePortal ? [this.shrinePortal] : [];
  }
}
