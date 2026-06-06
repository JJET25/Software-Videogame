import ActiveCard from "./ActiveCard.js";

// Adds shield to the player and triggers the defense animation
export default class ActiveDefenseCard extends ActiveCard {
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

  effect({ player }) {
    player.shield += this.shieldAmount;
    player._defenseTimer = 0.4;

    if (this.invincibility > 0) player.grantInvincibility(this.invincibility);
  }
}
