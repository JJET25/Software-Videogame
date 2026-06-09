import Door from "../World/Objects/Door.js";
import DoorVisual from "../World/Objects/DoorVisual.js";
import Collision from "../Physics/Collision.js";
import Vector from "../Utils/Vector.js";
import Room from "../World/Rooms/Room.js";
import Credit from "../Entities/pickups/Credit.js";
import RoomFactory from "../World/Rooms/RoomFactory.js";
import { ROOM_HEIGHT, ROOM_WIDTH, TILE_SIZE } from "../Utils/Constants.js";
import DoorBlocker from "../World/Objects/DoorBlocker.js";

// --------------------- CONSTANTS ---------------------
const OPPOSITE = {
  north: "south",
  south: "north",
  east: "west",
  west: "east",
};

const TRANSITION_DURATION = 0.8;

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

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
    this.transition = null;

    this.doors = [];
    this.doorBlockers = [];
    this.doorVisuals = [];
    this._connectedDirs = new Set();
    this.bullets = [];
    this._knownBullets = new Set();
    this.credits = [];
    this.roomCache = new Map();
  }

  enterStartRoom() {
    this.enterRoom(this.graph.startNodeId, null);
  }

  enterRoom(nodeId, fromNodeId = null) {
    // Pre-build destination room if not cached yet
    this.#getOrCreateRoom(nodeId);

    if (fromNodeId === null) {
      this.#commitEnterRoom(nodeId, null);
      return;
    }

    // Calculate scroll direction
    const fromNode = this.graph.getNode(fromNodeId);
    const toNode = this.graph.getNode(nodeId);
    const direction = this.#getDirectionBetweem(fromNode, toNode);

    this.transition = {
      fromRoom: this.currentRoom,
      toRoom: this.roomCache.get(nodeId),
      direction,
      progress: 0,
      pendingNodeId: nodeId,
      pendingFromNodeId: fromNodeId,
    };

    // Block player input
    this.player.inputLocked = true;
  }

  // Updates the room, handles credit drops, bullet movement, collisions, and door transitions
  update(deltaTime) {
    // Advance scroll transition
    if (this.transition) {
      this.transition.progress += deltaTime / TRANSITION_DURATION;

      if (this.transition.progress >= 1) {
        const { pendingNodeId, pendingFromNodeId } = this.transition;
        this.transition = null;
        this.#commitEnterRoom(pendingNodeId, pendingFromNodeId);
      } else this.player.update?.(deltaTime);
      // During the trasition only move player

      return;
    }

    if (this.trasitionCooldown > 0) this.trasitionCooldown -= deltaTime;

    this.currentRoom.update(deltaTime, this.player);
    this.#updateCredits(deltaTime);
    this.#updateBullets(deltaTime);
    for (const v of this.doorVisuals) v.update(deltaTime);

    // Door collisions
    for (const door of this.doors) {
      if (door.isLocked) Collision.resolve(this.player, door);
    }

    this.#resolveBlockerCollisions();
    this.#checkRoomCleared();
    this.#checkDoorTransitions();
  }

  draw(renderer) {
    if (this.transition) {
      this.#drawTransition(renderer);
      return;
    }

    renderer.setOffset(0, 0);
    this.currentRoom.draw(renderer);                          // bg, walls, objects
    this.doorVisuals.forEach((v) => v.draw(renderer));        // doors behind enemies
    this.doors.forEach((door) => door.draw(renderer));
    this.doorBlockers.forEach((db) => db.draw(renderer));
    this.currentRoom.drawEnemies(renderer);                   // enemies in front of doors
    for (const bullet of this.bullets) bullet.draw(renderer);
    for (const credit of this.credits) credit.draw(renderer);
  }

  // --------------------- PRIVATE HELPERS ---------------------
  // Returns existing room or creates and caches it
  #getOrCreateRoom(nodeId) {
    if (this.roomCache.has(nodeId)) return this.roomCache.get(nodeId);

    const node = this.graph.getNode(nodeId);
    const neighbors = this.graph.getNeighbors(nodeId);
    const doorDirections = neighbors.map((n) =>
      this.#getDirectionBetweem(node, n),
    );

    const room = RoomFactory.create(
      node,
      doorDirections,
      this.player,
      this.bullets,
      this.credits,
      this.dimension,
    );
    this.roomCache.set(nodeId, room);
    return room;
  }

  // Performs actual room swap after scroll animation finishes
  #commitEnterRoom(nodeId, fromNodeId) {
    const node = this.graph.getNode(nodeId);

    this.credits.length = 0;
    this.currentNodeId = nodeId;
    this.previousNodeId = fromNodeId;
    node.isVisited = true;

    this.currentRoom = this.roomCache.get(nodeId);
    this.doors = this.#buildDoors(node);
    this.doorVisuals = this.#buildDoorVisuals(node);

    this.#placePlayer(fromNodeId);
    this.#setDoorsLocked(this.currentRoom.enemies.length > 0, true);

    this.trasitionCooldown = 0.3;
    this.player.isVisible = true;
    this.player.inputLocked = false;
  }

  #buildDoors(node) {
    this.doorBlockers = [];
    this._connectedDirs = new Set();
    const doors = [];

    for (const neighbor of this.graph.getNeighbors(node.id)) {
      const direction = this.#getDirectionBetweem(node, neighbor);
      this._connectedDirs.add(direction);
      const positions = this.currentRoom.getDoorTilePositions(direction);

      for (const position of positions) {
        doors.push(new Door(position, neighbor.id, direction));
        const offset = this.#getInnerOffset(direction);
        this.doorBlockers.push(new DoorBlocker(position.plus(offset)));
      }
    }
    return doors;
  }

  #buildDoorVisuals(node) {
    const tileSetId = this.dimension?.tileSetId ?? "tilesDarkAge";
    return ["north", "south", "east", "west"].map(
      (dir) => new DoorVisual(dir, tileSetId),
    );
  }

  // Positions the player at the center on first entry or just inside the arrival door otherwise
  #placePlayer(fromNodeId) {
    if (fromNodeId === null) {
      this.player.position = new Vector(ROOM_WIDTH / 2, ROOM_HEIGHT / 2);
      return;
    }

    const currentNode = this.graph.getNode(this.currentNodeId);
    const fromNode = this.graph.getNode(fromNodeId);
    const direction = this.#getDirectionBetweem(fromNode, currentNode);
    const oppositeDir = OPPOSITE[direction];
    const doorPos = this.currentRoom.getDoorPosition(oppositeDir);
    const offset = this.#getInnerOffset(oppositeDir);

    this.player.position = doorPos.plus(new Vector(offset.x * 2, offset.y * 2));
  }

  // Locks or unlocks all doors, blockers, and door visuals together
  #setDoorsLocked(locked, instant = false) {
    this.doors.forEach((door) => (locked ? door.lock() : door.unlock()));
    this.doorBlockers.forEach((db) => (db.isActive = locked));
    this.doorVisuals.forEach((v) => {
      if (this._connectedDirs.has(v._direction)) {
        locked ? v.close(instant) : v.open(instant);
      }
    });
  }

  // Unlocks doors and fires boss callbacks when all enemies are dead
  #checkRoomCleared() {
    if (this.currentRoom.isCleared || this.currentRoom.enemies.length > 0)
      return;

    this.currentRoom.isCleared = true;
    this.#setDoorsLocked(false);

    const type = this.graph.getNode(this.currentNodeId).type;
    if (type === "combat") this.player.audio?.playSFX("roomOpen");
    if (type === "miniBoss") this.callbacks.onMiniBossDefeated?.();
    if (type === "finalBoss") this.callbacks.onFinalBossDefeated?.();
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

  #updateCredits(deltaTime) {
    for (const credit of this.credits) {
      credit.update(deltaTime);
      const dx = Math.abs(this.player.position.x - credit.position.x);
      const dy = Math.abs(this.player.position.y - credit.position.y);
      if (dx < 28 && dy < 28) {
        this.player.addCredits(credit.value);
        this.player.audio?.playSFX("creditPickup");
        credit.isDead = true;
      }
    }
    for (let i = this.credits.length - 1; i >= 0; i--) {
      if (this.credits[i].isDead) this.credits.splice(i, 1);
    }
  }

  #updateBullets(deltaTime) {
    for (const bullet of this.bullets) {
      if (!this._knownBullets.has(bullet)) {
        this._knownBullets.add(bullet);
        this.player.audio?.playSFX("bullet");
      }
      bullet.update(deltaTime);
      this.#resolveBulletCollisions(bullet);
    }
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      if (this.bullets[i].isDead) {
        this._knownBullets.delete(this.bullets[i]);
        this.bullets.splice(i, 1);
      }
    }
  }

  #resolveBulletCollisions(bullet) {
    if (bullet.isDead) return;

    for (const wall of this.currentRoom.walls) {
      if (Collision.rectCollision(bullet.getBounds(), wall.getBounds())) {
        bullet.isDead = true;
        return;
      }
    }

    for (const blocker of this.doorBlockers) {
      if (
        blocker.isActive &&
        Collision.rectCollision(bullet.getBounds(), blocker.getBounds())
      ) {
        bullet.isDead = true;
        return;
      }
    }

    for (const obj of this.currentRoom.objects) {
      if (!obj.isSolid || obj.isDead) continue;
      if (Collision.rectCollision(bullet.getBounds(), obj.getBounds())) {
        obj.takeDamage?.(bullet.damage);
        bullet.isDead = true;
        return;
      }
    }

    if (Collision.rectCollision(bullet.getBounds(), this.player.getBounds())) {
      this.player.takeDamage(bullet.damage);
      bullet.isDead = true;
    }
  }

  #resolveBlockerCollisions() {
    for (const blocker of this.doorBlockers) {
      if (!blocker.isActive) continue;
      Collision.resolve(this.player, blocker);
      for (const enemy of this.currentRoom.enemies) {
        Collision.resolve(enemy, blocker);
      }
    }
  }

  #drawTransition(renderer) {
    const { fromRoom, toRoom, direction, progress } = this.transition;
    const ease = easeInOut(progress);
    const dx = ROOM_WIDTH * ease;
    const dy = ROOM_HEIGHT * ease;

    let fromOffsetX = 0,
      fromOffsetY = 0;
    let toOffsetX = 0,
      toOffsetY = 0;

    switch (direction) {
      case "east":
        fromOffsetX = -dx;
        toOffsetX = ROOM_WIDTH - dx;
        break;
      case "west":
        fromOffsetX = dx;
        toOffsetX = -ROOM_WIDTH + dx;
        break;
      case "south":
        fromOffsetY = -dy;
        toOffsetY = ROOM_HEIGHT - dy;
        break;
      case "north":
        fromOffsetY = dy;
        toOffsetY = -ROOM_HEIGHT + dy;
        break;
    }

    this.player.isVisible = false;

    renderer.setOffset(fromOffsetX, fromOffsetY);
    fromRoom.draw(renderer);
    fromRoom.drawEnemies(renderer);

    renderer.setOffset(toOffsetX, toOffsetY);
    toRoom.draw(renderer);
    toRoom.drawEnemies(renderer);

    renderer.setOffset(0, 0);
  }

  #getDirectionBetweem(fromNode, toNode) {
    const dx = toNode.gridPos.x - fromNode.gridPos.x;
    const dy = toNode.gridPos.y - fromNode.gridPos.y;
    if (dx > 0) return "east";
    if (dx < 0) return "west";
    if (dy > 0) return "south";
    if (dy < 0) return "north";
  }

  #getInnerOffset(direction) {
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
