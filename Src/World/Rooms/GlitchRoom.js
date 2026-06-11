// GlitchRoom.js — Room subclass containing a single glitch pillar that rewards a card on interaction.
// The pillar is placed slightly above center and registered as an interactable.

import { ROOM_COLS, ROOM_ROWS, TILE_SIZE } from "../../Utils/Constants.js";
import Vector from "../../Utils/Vector.js";
import GlitchPillar from "../Objects/GlitchPillar.js";
import Room from "./Room.js";

export default class GlitchRoom extends Room {
  // Extends Room and immediately places the glitch pillar.
  constructor(doorDirections, player, bullets, credits, dimension) {
    super(doorDirections, player, bullets, credits, dimension);

    this.populate();
  }

  // Instantiates the glitch pillar at the center of the room and builds the decoration grid.
  populate() {
    const centerPos = new Vector(
      (TILE_SIZE * ROOM_COLS) / 2,
      (TILE_SIZE * ROOM_ROWS) / 2 - TILE_SIZE / 2,
    );

    this.glitchPillar = new GlitchPillar(centerPos);
    this.objects.push(this.glitchPillar);

    this.buildDecorGrid();
  }

  // Returns the glitch pillar as the sole interactable in this room.
  getInteractables() {
    return [this.glitchPillar];
  }
}
