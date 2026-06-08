import Room from "./Room.js";
import Merchant from "../Objects/Merchant.js";
import StoreUI from "../../UI/ShopUI.js";
import { ROOM_WIDTH, ROOM_HEIGHT } from "../../Utils/Constants.js";

// Shop room variant — pre-cleared, contains a merchant NPC with an interactive store
export default class ShopRoom extends Room {
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

    // Añadir al array de objects para que Room aplique colisiones automáticamente
    this.objects.push(this.merchant);
  }

  populate() {
    this.buildDecorGrid();
  }

  // Calls super so wall collisions are resolved correctly
  update(deltaTime, player) {
    super.update(deltaTime, player);
  }

  draw(renderer) {
    super.draw(renderer); // dibuja fondo, decor, paredes y objects (incluye merchant)

    // Show interaction prompt when the player is nearby and the shop is closed
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

  getInteractables() {
    return this.merchant ? [this.merchant] : [];
  }
}
