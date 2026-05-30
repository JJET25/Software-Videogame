import Collision from "../../Physics/Collision.js";
import { TILE_SIZE } from "../../Utils/Constants.js";
import GameObject from "./GameObject.js";

export default class Door extends GameObject {
  constructor(position, targetNodeId, direction) {
    super(position, TILE_SIZE, TILE_SIZE, "#00AA44", "door");
    this.position = position;
    this.targetNodeId = targetNodeId;
    this.isLocked = false;
    this.direction = direction;
  }

  lock() {
    this.color = "#8B0000";
    this.isLocked = true;
  }

  unlock() {
    this.color = "#00AA44";
    this.isLocked = false;
  }

  isPlayerInside(player) {
    return Collision.rectCollision(this.getBounds(), player.getBounds());
  }
}
