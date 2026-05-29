import { getRandomCardByRarity } from "../../cards/CardFactory.js";
import { randInt } from "../../Utils/Random.js";
import GameObject from "./GameObject.js";
import LootTable from "./LootTable.js";

export default class Chest extends GameObject {
  constructor(position) {
    super(position, 16, 16, "#f1c536", "chest");
    this.isOpen = false;
    this.showPrompt = true; // Shows interaction text
  }

  // Call when the player presses E
  interact(player, context = {}) {
    if (this.isOpen) return; // Prevent opening twice
    this.isOpen = true;

    // Generate random loot
    const loot = LootTable.roll();

    // Credit reward
    if (loot.type === "credits") {
      player.addCredits(loot.amount);
      //console.log(`[Chest] Monedas: ${loot.amount}`);
      return;
    }

    // Try to get a random card
    const card = getRandomCardByRarity(context.cardCatalog, loot.rarity);
    if (card && context.cardManager) {
      const result = context.cardManager.addCard(card); // Add card to player collection
      //console.log(`[Chest] Carta: ${card.name} (${card.rarity})`);

      if (!result.added && result.creditsAwarded > 0) {
        // Give coins if card cannot be added
        player.addCredits(result.creditsAwarded); 
      }
    } else {
      // Fallback reward if card generation fails
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
        "12px monospace",
        "#000000",
        { align: "center" },
      );
    }
  }
}
