// ShopRoom.js — Pre-cleared room subclass that contains a merchant NPC and a store UI.
// Shows an interaction prompt when the player is within range and the shop is closed.

import Room from "./Room.js";
import Merchant from "../Objects/Merchant.js";
import StoreUI from "../../UI/ShopUI.js";
import { ROOM_WIDTH, ROOM_HEIGHT } from "../../Utils/Constants.js";

export default class ShopRoom extends Room {
  // Creates the shop room, instantiates the merchant and store UI, and marks the room as cleared.
  constructor(doorDirections, player, bullets, credits, dimension) {
    super(doorDirections, player, bullets, credits, dimension);

    this.isShopRoom = true;
    this.isCleared = true;

    this.storeUI = new StoreUI();

    this.merchant = new Merchant({
      x: ROOM_WIDTH  / 2,
      y: ROOM_HEIGHT / 2,
      dimensionId: dimension?.id,
    });
    this.merchant.storeUI = this.storeUI;

    // Register merchant in objects so Room applies solid collision automatically.
    this.objects.push(this.merchant);
  }

  // Builds the decoration grid; no enemies or combat objects are added.
  populate() {
    this.buildDecorGrid();
  }

  // Updates the room using the base class to resolve wall collisions correctly.
  update(deltaTime, player) {
    super.update(deltaTime, player);
  }

  // Draws the room and shows the shop prompt when the player is close enough and the UI is closed.
  draw(renderer) {
    super.draw(renderer);

    if (!this.storeUI.isOpen) {
      const dx = this.player.position.x - this.merchant.position.x;
      const dy = this.player.position.y - this.merchant.position.y;
      if (dx * dx + dy * dy <= 70 * 70) {
        renderer.drawText(
          "[E] Open Shop",
          this.merchant.position.x,
          this.merchant.position.y - 46,
          4,
          "#ffffff",
          { font: "'Press Start 2P', monospace" },
        );
      }
    }
  }

  // Returns the merchant as the sole interactable in this room.
  getInteractables() {
    return this.merchant ? [this.merchant] : [];
  }
}
