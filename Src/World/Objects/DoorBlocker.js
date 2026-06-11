// DoorBlocker.js — Invisible solid tile that seals a door opening during combat.
// Becomes active to block the player from leaving until the room is cleared.

import { TILE_SIZE } from "../../Utils/Constants.js";
import GameObject from "./GameObject.js";

export default class DoorBlocker extends GameObject {
  // Creates a door blocker at the given position; inactive by default.
  constructor(position) {
    super(position, TILE_SIZE, TILE_SIZE, "transparent", "doorBlocker");
    this.isActive = false;
  }
}
