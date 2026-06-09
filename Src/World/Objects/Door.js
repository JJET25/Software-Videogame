import Collision from "../../Physics/Collision.js";
import { TILE_SIZE } from "../../Utils/Constants.js";
import GameObject from "./GameObject.js";

export default class Door extends GameObject {
  constructor(position, targetNodeId, direction) {
    super(position, TILE_SIZE, TILE_SIZE, "transparent", "door");
    this.position = position;
    this.targetNodeId = targetNodeId;
    this.isLocked = false;
    this.direction = direction;
  }

  lock()   { this.isLocked = true; }
  unlock() { this.isLocked = false; }

  isPlayerInside(player) {
    return Collision.rectCollision(this.getBounds(), player.getBounds());
  }
}
