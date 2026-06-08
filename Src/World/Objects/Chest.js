import {
  OBJECTS_IMAGE,
  OBJECTS_SPRITE,
} from "../../../Assets/Sprites/ObjectsID.js";
import { getRandomCardByRarity } from "../../cards/CardFactory.js";
import { randInt } from "../../Utils/Random.js";
import GameObject from "./GameObject.js";
import LootTable from "./LootTable.js";

export default class Chest extends GameObject {
  constructor(position) {
    super(position, 16, 16, "#f1c536", "chest");
    this.isSolid = true;
    this.isOpen = false;
  }

  // Call when player presses E near the chest
  interact(player, context = {}) {
    if (this.isOpen) return;
    this.isOpen = true;
    player.audio?.playSFX("chestOpen");
    const loot = LootTable.roll();

    if (loot.type === "credits") {
      this.#giveCredits(player, loot.amount, context);
    } else this.#giveCard(player, loot.rarity, context);
  }

  draw(renderer) {
    const key = this.isOpen ? "chestOpen" : "chestClosed";
    const s = OBJECTS_SPRITE[key];

    if (OBJECTS_IMAGE.complete && OBJECTS_IMAGE.naturalWidth > 0) {
      renderer.drawSprite(
        OBJECTS_IMAGE,
        s.srcX,
        s.srcY,
        s.srcW,
        s.srcH,
        this.position.x - this.width / 2,
        this.position.y - this.height / 2,
        this.width,
        this.height,
      );
    } else
      renderer.drawRect(
        this.position.x - this.width / 2,
        this.position.y - this.height / 2,
        this.width,
        this.height,
        this.isOpen ? "#6B4C11" : "#f1c536",
      );

    if (this.isPlayerNear && !this.isOpen) {
      renderer.drawText(
        "[E] Open Chest",
        this.position.x,
        this.position.y - 16,
        4,
        "#ffffff",
        { font: "'Press Start 2P', monospace" },
      );
    }
  }

  // --------------------- PRIVATE HELPERS ---------------------
  // Give credits directly and notify the player
  #giveCredits(player, amount, context) {
    player.addCredits(amount);
    context.showNotification?.(`You got ${amount} Credits!`);
  }

  // Try to give a card; fallback to random credits if no card is available
  #giveCard(player, rarity, context) {
    const card = getRandomCardByRarity(context.cardCatalog, rarity);

    if (card && context.cardManager) {
      context.cardManager.addCard(card);
      context.showNotification?.(`You got ${card.name}!`);
      return;
    }

    // No card available, give credits instead
    const amount = randInt(1, 10) * 20;
    this.#giveCredits(player, amount, context);
  }
}
