import Chest from "../Objects/Chest.js";
import { ROOM_COLS, ROOM_ROWS, TILE_SIZE } from "../../Utils/Constants.js";
import Vector from "../../Utils/Vector.js";
import Room from "./Room.js";

export default class ChestRoom extends Room {
  constructor(doorDirections, player, bullets, credits, dimension) {
    super(doorDirections, player, bullets, credits, dimension);

    this.populate();
  }

  populate() {
    const centerPos = new Vector(
      (TILE_SIZE * ROOM_COLS) / 2,
      (TILE_SIZE * ROOM_ROWS) / 2,
    );

    this.chest = new Chest(centerPos);  
    this.objects.push(this.chest);

    this.buildDecorGrid();
  }

  getInteractables() {
    return this.chest ? [this.chest] : [];
  }
}
