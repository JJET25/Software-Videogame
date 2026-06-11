// BombasticRoom.js — Pre-cleared room subclass containing the MrBombastic easter-egg NPC.
// Shows an interaction prompt when the player is nearby and the NPC has not yet started dancing.

import Room from "./Room.js";
import MrBombastic from "../Objects/MrBombastic.js";
import { ROOM_WIDTH, ROOM_HEIGHT } from "../../Utils/Constants.js";

export default class BombasticRoom extends Room {
  // Creates the room, places MrBombastic at the center, and marks the room as cleared.
  constructor(doorDirections, player, bullets, credits, dimension) {
    super(doorDirections, player, bullets, credits, dimension);

    this.isBombasticRoom = true;
    this.isCleared = true;

    this.mrBombastic = new MrBombastic({
      x: ROOM_WIDTH  / 2 + 8,
      y: ROOM_HEIGHT / 2,
    });

    this.objects.push(this.mrBombastic);
  }

  // Builds the decoration grid; no enemies or combat objects are placed.
  populate() {
    this.buildDecorGrid();
  }

  // Returns MrBombastic as the sole interactable in this room.
  getInteractables() {
    return this.mrBombastic ? [this.mrBombastic] : [];
  }

  // Draws the room and shows the talk prompt when the player is close and the NPC is idle.
  draw(renderer) {
    super.draw(renderer);

    if (!this.mrBombastic.isDancing) {
      const dx = this.player.position.x - this.mrBombastic.position.x;
      const dy = this.player.position.y - this.mrBombastic.position.y;
      if (dx * dx + dy * dy <= 60 * 60) {
        renderer.drawText(
          '[E] Talk',
          this.mrBombastic.position.x,
          this.mrBombastic.position.y - 16,
          4,
          '#ffffff',
          { font: "'Press Start 2P', monospace" },
        );
      }
    }
  }
}
