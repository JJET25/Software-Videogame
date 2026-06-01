import { ROOM_COLS, ROOM_ROWS, TILE_SIZE } from "../../Utils/Constants.js";
import Vector from "../../Utils/Vector.js";
import GlitchPillar from "../Objects/GlitchPillar.js";
import Room from "./Room.js";

export default class GlitchRoom extends Room {
  constructor(doorDirections, player, bullets, credits, dimension) {
    super(doorDirections, player, bullets, credits, dimension);

    this.populate();
  }

  populate() {
    const centerPos = new Vector(
      (TILE_SIZE * ROOM_COLS) / 2,
      (TILE_SIZE * ROOM_ROWS) / 2 - TILE_SIZE / 2,
    );

    this.glitchPillar = new GlitchPillar(centerPos);
    this.objects.push(this.glitchPillar);
  }

  getInteractables() {
    return [this.glitchPillar];
  }
}
