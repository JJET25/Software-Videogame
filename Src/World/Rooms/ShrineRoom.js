// ShrineRoom.js — Room subclass containing a shrine portal that advances the player to the next level.
// The portal is registered as an interactable for the InteractionManager.

import Vector from "../../Utils/Vector.js";
import ShrinePortal from "../Objects/ShrinePortal.js";
import Room from "./Room.js";
import { TILE_SIZE, ROOM_COLS, ROOM_ROWS } from "../../Utils/Constants.js";

export default class ShrineRoom extends Room {
  // Extends Room and immediately places the shrine portal at the room center.
  constructor(doorDirections, player, bullets, credits, dimension) {
    super(doorDirections, player, bullets, credits, dimension);

    this.populate();
  }

  // Instantiates the shrine portal at the center and builds the decoration grid.
  populate() {
    const centerPos = new Vector(
      (TILE_SIZE * ROOM_COLS) / 2,
      (TILE_SIZE * ROOM_ROWS) / 2,
    );
    this.shrinePortal = new ShrinePortal(centerPos);
    this.objects.push(this.shrinePortal);
    this.buildDecorGrid();
  }

  // Returns the shrine portal as the sole interactable in this room.
  getInteractables() {
    return this.shrinePortal ? [this.shrinePortal] : [];
  }
}
