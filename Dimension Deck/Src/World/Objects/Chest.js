import { getRandomCardByRarity } from "../../cards/CardFactory.js";
import { randInt } from "../../Utils/Random.js";
import GameObject from "./GameObject.js";
import LootTable from "./LootTable.js";

export default class Chest extends GameObject {
  constructor(position) {
    super(position, 16, 16, "#f1c536", "chest");
    this.isOpen = false;
    this.showPrompt = false;
  }

  // Call when player press E
  interact(player, context = {}) {
    if (this.isOpen) return;
    this.isOpen = true;

    const loot = LootTable.roll();

    if (loot.type === "credits") {
      player.addCredits(loot.amount);
      return;
    }

    const card = getRandomCardByRarity(context.cardCatalog, loot.rarity);
    if (card && context.cardManager) {
      const result = context.cardManager.addCard(card);
      if (!result.added && result.creditsAwarded > 0) {
        player.addCredits(result.creditsAwarded);
      }
    } else {
      player.addCredits(randInt(1, 10) * 20);
    }
  }

  draw(renderer) {
    renderer.drawRect(
      this.position.x - this.width / 2,
      this.position.y - this.height / 2,
      this.width,
      this.height,
      this.isOpen ? "#6B4C11" : "#f1c536",
    );

    if (this.showPrompt && !this.isOpen) {
      renderer.drawText(
        "[E] Open Chest",
        this.position.x,
        this.position.y - 16,
        "7px monospace",
        "#ffcc33",
        { align: "center" },
      );
    }
  }
}
