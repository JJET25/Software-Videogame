// ActiveHealCard.js — Active card that restores HP to the player.
// If healAmount is null the card fully restores the player to max health.

import ActiveCard from "./ActiveCard.js";

export default class ActiveHealCard extends ActiveCard {
  // Constructs a heal card with an optional heal amount; null restores full health.
  constructor({ name, description, rarity, healAmount, cooldown, level = 1 }) {
    super({ name, description, rarity, baseCooldown: cooldown, level });
    this.healAmount = healAmount;
  }

  // Heals the player and plays the heal sound effect.
  effect({ player }) {
    player.heal(this.healAmount ?? player.maxHealth);
    player.audio?.playSFX("cardHeal");
  }
}
