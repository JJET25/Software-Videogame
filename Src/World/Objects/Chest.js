// Chest.js — Interactive chest object that rewards the player with a card or credits on open.
// Uses LootTable to determine the reward type and falls back to credits if no card is available.

import {
  OBJECTS_IMAGE,
  OBJECTS_SPRITE,
} from "../../../Assets/Sprites/ObjectsID.js";
import { getRandomCardByRarity } from "../../cards/CardFactory.js";
import { randInt } from "../../Utils/Random.js";
import GameObject from "./GameObject.js";
import LootTable from "./LootTable.js";

export default class Chest extends GameObject {
  // Creates a chest at the given position; starts in the closed state.
  constructor(position) {
    super(position, 16, 16, "#f1c536", "chest");
    this.isSolid = true;
    this.isOpen = false;
  }

  // Opens the chest and distributes loot when the player presses E nearby.
  interact(player, context = {}) {
    if (this.isOpen) return;
    this.isOpen = true;
    player.audio?.playSFX("chestOpen");
    const loot = LootTable.roll();

    if (loot.type === "credits") {
      this.#giveCredits(player, loot.amount, context);
    } else this.#giveCard(player, loot.rarity, context);
  }

  // Draws the open or closed chest sprite and shows the interaction prompt when the player is near.
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

  // Adds credits directly to the player and displays a notification.
  #giveCredits(player, amount, context) {
    player.addCredits(amount);
    context.showNotification?.(`You got ${amount} Credits!`);
  }

  // Attempts to give a card of the rolled rarity; falls back to random credits if unavailable.
  #giveCard(player, rarity, context) {
    const card = getRandomCardByRarity(context.cardCatalog, rarity);

    if (card && context.cardManager) {
      context.cardManager.addCard(card);
      context.showNotification?.(`You got ${card.name}!`);
      return;
    }

    // No card available, give credits instead.
    const amount = randInt(1, 10) * 20;
    this.#giveCredits(player, amount, context);
  }
}
