// Door.js — Invisible trigger zone at a room exit that transports the player to the adjacent room.
// Stores the target node ID and direction, and can be locked to block passage.

import Collision from "../../Physics/Collision.js";
import { TILE_SIZE } from "../../Utils/Constants.js";
import GameObject from "./GameObject.js";

export default class Door extends GameObject {
  // Creates a door at the given position facing the specified direction, linking to targetNodeId.
  constructor(position, targetNodeId, direction) {
    super(position, TILE_SIZE, TILE_SIZE, "transparent", "door");
    this.position = position;
    this.targetNodeId = targetNodeId;
    this.isLocked = false;
    this.direction = direction;
  }

  // Locks the door to prevent the player from passing through.
  lock()   { this.isLocked = true; }
  // Unlocks the door to allow passage.
  unlock() { this.isLocked = false; }

  // Returns true if the player's bounds overlap with this door's bounds.
  isPlayerInside(player) {
    return Collision.rectCollision(this.getBounds(), player.getBounds());
  }
}
