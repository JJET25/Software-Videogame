import Door from "../World/Objects/Door.js";
import Collision from "../Physics/Collision.js";
import Vector from "../Utils/Vector.js";
import Room from "../World/Rooms/Room.js";
import Credit from "../Entities/pickups/Credit.js";
import RoomFactory from "../World/Rooms/RoomFactory.js";
import {
  OPPOSITE,
  ROOM_HEIGHT,
  ROOM_WIDTH,
  TILE_SIZE,
} from "../Utils/Constants.js";
import DoorBlocker from "../World/Objects/DoorBlocker.js";

// Manages the active room, door transitions, bullet simulation, and credit pickup
export default class RoomManager {
  constructor(graph, player, dimension, callbacks = {}) {
    this.graph = graph;
    this.player = player;
    this.dimension = dimension;
    this.callbacks = callbacks;
    this.currentNodeId = null;
    this.previousNodeId = null;
    this.currentRoom = null;
    this.trasitionCooldown = 0;
    this.doors = [];
    this.doorBlockers = [];
    this.bullets = [];
    this.credits = [];
    this.roomCache = new Map();
  }

  enterStartRoom() {
    this.enterRoom(this.graph.startNodeId, null);
  }

  // Loads or retrieves the room for nodeId, builds its doors, and places the player at the entry point
  enterRoom(nodeId, fromNodeId = null) {
    const node = this.graph.getNode(nodeId);
    const neighbors = this.graph.getNeighbors(nodeId);

    this.credits.length = 0;
    this.currentNodeId = nodeId;
    this.previousNodeId = fromNodeId;
    node.isVisited = true;

    const doorDirections = neighbors.map((neighbor) =>
      this.#getDirectionBetweem(node, neighbor),
    );

    if (!this.roomCache.has(nodeId)) {
      const newRoom = RoomFactory.create(
        node,
        doorDirections,
        this.player,
        this.bullets,
        this.credits,
        this.dimension,
      );
      this.roomCache.set(nodeId, newRoom);
    }

    this.currentRoom = this.roomCache.get(nodeId);
    this.doors = this.#buildDoors(node);

    this.#placePlayer(fromNodeId);

    if (this.currentRoom.enemies.length > 0) {
      this.doors.forEach((door) => door.lock());
      this.doorBlockers.forEach((doorBlocker) => (doorBlocker.isActive = true));
    }

    this.trasitionCooldown = 0.3;
  }

  // Updates the room, handles credit drops, bullet movement, collisions, and door transitions
  update(deltaTime) {
    if (this.trasitionCooldown > 0) {
      this.trasitionCooldown -= deltaTime;
    }

    this.currentRoom.update(deltaTime, this.player);

    for (let credit of this.credits) {
      credit.update(deltaTime);
      
      const distanceX = Math.abs(this.player.position.x - credit.position.x);
      const distanceY = Math.abs(this.player.position.y - credit.position.y);
      if (distanceX < 28 && distanceY < 28) {
        this.player.addCredits(credit.value);
        credit.isDead = true;
      }
    }

    for (let i = this.credits.length - 1; i >= 0; i--) {
      if (this.credits[i].isDead) this.credits.splice(i, 1);
    }

    // Door collisions
    for (const door of this.doors) {
      if (door.isLocked) Collision.resolve(this.player, door);
    }

    // Door blockers collisions
    for (const blocker of this.doorBlockers) {
      if (!blocker.isActive) continue;

      Collision.resolve(this.player, blocker);
      for (const enemy of this.currentRoom.enemies) {
        Collision.resolve(enemy, blocker);
      }
    }

    // Bullets collision
    for (let bullet of this.bullets) {
      bullet.update(deltaTime);
      // Bullets vs Walls
      for (const wall of this.currentRoom.walls) {
        if (Collision.rectCollision(bullet.getBounds(), wall.getBounds())) {
          bullet.isDead = true;
          break;
        }
      }

      // Bullets vs DoorBlockers
      for (const blocker of this.doorBlockers) {
        if (
          blocker.isActive &&
          Collision.rectCollision(bullet.getBounds(), blocker.getBounds())
        ) {
          bullet.isDead = true;
          break;
        }
      }

      // Bullets vs Solid Objects
      for (const obj of this.currentRoom.objects) {
        if (!obj.isSolid || obj.isDead) continue;

        // Rocks blocks bullets
        // Boxes get damage
        if (Collision.rectCollision(bullet.getBounds(), obj.getBounds())) {
          if (typeof obj.takeDamage === "function")
            obj.takeDamage(bullet.damage);
          bullet.isDead = true;
          break;
        }
      }

      if (
        !bullet.isDead &&
        Collision.rectCollision(bullet.getBounds(), this.player.getBounds())
      ) {
        this.player.takeDamage(bullet.damage);
        bullet.isDead = true;
      }
    }

    for (let i = this.bullets.length - 1; i >= 0; i--) {
      if (this.bullets[i].isDead) this.bullets.splice(i, 1);
    }

    this.#checkRoomCleared();
    this.#checkDoorTransitions();
  }

  draw(renderer) {
    this.currentRoom.draw(renderer);
    this.doors.forEach((door) => door.draw(renderer));
    this.doorBlockers.forEach((doorBlocker) => doorBlocker.draw(renderer));
    for (let bullet of this.bullets) bullet.draw(renderer);
    for (let credit of this.credits) credit.draw(renderer);
  }

  #buildDoors(node) {
    this.doorBlockers = [];
    const arrDoor = [];
    for (const neighbor of this.graph.getNeighbors(node.id)) {
      const direction = this.#getDirectionBetweem(node, neighbor);
      const positions = this.currentRoom.getDoorTilePositions(direction);

      for (const position of positions) {
        arrDoor.push(new Door(position, neighbor.id, direction));

        const offset = this.getInnerOffset(direction);
        this.doorBlockers.push(new DoorBlocker(position.plus(offset)));
      }
    }
    return arrDoor;
  }

  // Positions the player at the center on first entry or just inside the arrival door otherwise
  #placePlayer(fromNodeId) {
    if (fromNodeId === null) {
      this.player.position = new Vector(ROOM_WIDTH / 2, ROOM_HEIGHT / 2);
    } else {
      const currentNode = this.graph.getNode(this.currentNodeId);
      const fromNode = this.graph.getNode(fromNodeId);
      const direction = this.#getDirectionBetweem(fromNode, currentNode);
      const oppositeDir = OPPOSITE[direction];
      const doorPos = this.currentRoom.getDoorPosition(oppositeDir);

      const offset = this.getInnerOffset(oppositeDir);
      this.player.position = doorPos.plus(
        new Vector(offset.x * 2, offset.y * 2),
      );
    }
  }

  // Unlocks doors and fires boss callbacks when all enemies are dead
  #checkRoomCleared() {
    if (this.currentRoom.isCleared) return;
    if (this.currentRoom.enemies.length === 0) {
      this.currentRoom.isCleared = true;
      this.doors.forEach((door) => door.unlock());
      this.doorBlockers.forEach(
        (doorBlocker) => (doorBlocker.isActive = false),
      );

      const type = this.graph.getNode(this.currentNodeId).type;
      if (type === "miniBoss") this.callbacks.onMiniBossDefeated?.();
      if (type === "finalBoss") this.callbacks.onFinalBossDefeated?.();
    }
  }

  // Triggers a room transition when the player steps through an unlocked door
  #checkDoorTransitions() {
    if (this.trasitionCooldown > 0) return;
    for (const door of this.doors) {
      if (!door.isLocked && door.isPlayerInside(this.player)) {
        this.enterRoom(door.targetNodeId, this.currentNodeId);
        return;
      }
    }
  }

  #getDirectionBetweem(fromNode, toNode) {
    const dx = toNode.gridPos.x - fromNode.gridPos.x;
    const dy = toNode.gridPos.y - fromNode.gridPos.y;
    if (dx > 0) return "east";
    if (dx < 0) return "west";
    if (dy > 0) return "south";
    if (dy < 0) return "north";
  }

  getInnerOffset(direction) {
    switch (direction) {
      case "north":
        return new Vector(0, TILE_SIZE);
      case "south":
        return new Vector(0, -TILE_SIZE);
      case "east":
        return new Vector(-TILE_SIZE, 0);
      case "west":
        return new Vector(TILE_SIZE, 0);
    }
  }
}
