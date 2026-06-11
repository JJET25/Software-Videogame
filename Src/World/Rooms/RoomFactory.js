// RoomFactory.js — Factory that instantiates the correct Room subclass based on a node's type.
// Returns a plain Room for unrecognized types as a safe fallback.

import BossRoom from "./BossRoom.js";
import ChestRoom from "./ChestRoom.js";
import CombatRoom from "./CombatRoom.js";
import ShopRoom from "./ShopRoom.js";
import Room from "./Room.js";
import GlitchRoom from "./GlitchRoom.js";
import ShrineRoom from "./ShrineRoom.js";
import BombasticRoom from "./BombasticRoom.js";

export default class RoomFactory {
  // Creates and returns the appropriate room instance for the given node type and shared game state.
  static create(node, doorDirections, player, bullets, credits, dimension) {
    if (node.type === "combat") {
      return new CombatRoom(
        doorDirections,
        player,
        bullets,
        credits,
        dimension,
      );
    }

    if (node.type === "glitch") {
      return new GlitchRoom(
        doorDirections,
        player,
        bullets,
        credits,
        dimension,
      );
    }

    if (node.type === "shrine") {
      return new ShrineRoom(
        doorDirections,
        player,
        bullets,
        credits,
        dimension,
      );
    }

    if (node.type === "shop") {
      return new ShopRoom(doorDirections, player, bullets, credits, dimension);
    }

    if (node.type === "mrBombastic") {
      return new BombasticRoom(doorDirections, player, bullets, credits, dimension);
    }

    if (node.type === "chest") {
      return new ChestRoom(doorDirections, player, bullets, credits, dimension);
    }

    if (node.type === "miniBoss" || node.type === "finalBoss") {
      return new BossRoom(
        doorDirections,
        player,
        bullets,
        credits,
        dimension,
        node.type,
      );
    }

    return new Room(doorDirections, player, bullets, credits, dimension);
  }
}
