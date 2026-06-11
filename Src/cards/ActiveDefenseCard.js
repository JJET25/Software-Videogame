// ActiveDefenseCard.js — Active card that adds shield to the player and triggers the defense animation.
// Optionally grants invincibility frames when an invincibility duration is configured.

import ActiveCard from "./ActiveCard.js";

export default class ActiveDefenseCard extends ActiveCard {
  // Constructs a defense card with shield amount and optional invincibility duration.
  constructor({
    name,
    description,
    rarity,
    shieldAmount,
    cooldown,
    level = 1,
    invincibility = 0,
  }) {
    super({ name, description, rarity, baseCooldown: cooldown, level });
    this.shieldAmount = shieldAmount;
    this.invincibility = invincibility;
  }

  // Adds shield, plays the defense sound, activates the visual timer, and grants invincibility if set.
  effect({ player }) {
    player.shield += this.shieldAmount;
    player.audio?.playSFX("cardDefense");
    player._defenseTimer = 0.4;
    if (this.invincibility > 0) player.grantInvincibility(this.invincibility);
  }
}
