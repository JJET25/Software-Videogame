import BossRoom from "./BossRoom.js";
import ChestRoom from "./ChestRoom.js";
import CombatRoom from "./CombatRoom.js";
import ShopRoom from "./ShopRoom.js";
import Room from "./Room.js";

export default class RoomFactory {
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

    if (node.type === "shop") {
      return new ShopRoom(doorDirections, player, bullets, credits, dimension);
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
