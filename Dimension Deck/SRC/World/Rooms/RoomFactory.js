import BossRoom from "./BossRoom.js";
import ChestRoom from "./ChestRoom.js";
import CombatRoom from "./CombatRoom.js";
import Room from "./Room.js";

export default class RoomFactory {
  static create(
    node,
    doorDirections,
    player,
    bullets,
    credits,
    dimension,
    rng,
  ) {
    if (node.type === "combat") {
      return new CombatRoom(
        doorDirections,
        player,
        bullets,
        credits,
        dimension,
        rng,
      );
    }

    // Falta agregar rooms shrine, glitch y store

    if (node.type === "chest") {
      return new ChestRoom(doorDirections, player, bullets, credits);
    }

    if (node.type === "miniBoss" || node.type === "finalBoss") {
      return new BossRoom(doorDirections, player, bullets, credits); // Falta agregar la logica del BossRoom
    } else {
      return new Room(doorDirections, player, bullets, credits);
    }
  }
}
