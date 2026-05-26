import Collision from "../../Physics/Collision.js";
import GameObject from "./GameObject.js";

export default class Door extends GameObject {
  constructor(position, targetNodeId) {
    super(position, 16, 16, "#00AA44", "door");
    this.position = position;
    this.targetNodeId = targetNodeId;
    this.isLocked = false;
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
