// Wall.js — Solid boundary tile that blocks movement.
// Extends GameObject as a 16x16 transparent wall used to build room perimeters.

import GameObject from "./GameObject.js";

export default class Wall extends GameObject {
  // Creates a wall tile at the given position.
  constructor(position) {
    super(position, 16, 16, "transparent", "wall");
  }

  update() { }
}
