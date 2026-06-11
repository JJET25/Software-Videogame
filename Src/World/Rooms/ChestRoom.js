// ChestRoom.js — Pre-cleared room subclass containing a single chest at the center.
// The chest is registered as an interactable so the InteractionManager can trigger it on player E press.

import Chest from "../Objects/Chest.js";
import { ROOM_COLS, ROOM_ROWS, TILE_SIZE } from "../../Utils/Constants.js";
import Vector from "../../Utils/Vector.js";
import Room from "./Room.js";

export default class ChestRoom extends Room {
  // Extends Room and immediately places the chest and builds the decoration grid.
  constructor(doorDirections, player, bullets, credits, dimension) {
    super(doorDirections, player, bullets, credits, dimension);

    this.populate();
  }

  // Places a chest at the room center and adds it to the objects array.
  populate() {
    const centerPos = new Vector(
      (TILE_SIZE * ROOM_COLS) / 2,
      (TILE_SIZE * ROOM_ROWS) / 2,
    );

    this.chest = new Chest(centerPos);
    this.objects.push(this.chest);

    this.buildDecorGrid();
  }

  // Returns the chest as the sole interactable in this room.
  getInteractables() {
    return this.chest ? [this.chest] : [];
  }
}
