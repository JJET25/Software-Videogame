import ActiveCard from './ActiveCard.js';

// Active card that restores the HP of the player
// If the player is already full health, the card does nothing
export default class ActiveHealCard extends ActiveCard {
    constructor({ name, description, rarity, healAmount, cooldown, level = 1 }) {
        super({ name, description, rarity, baseCooldown: cooldown, level });
        this.healAmount = healAmount;
    }

    effect({ player }) {
        player.heal(this.healAmount ?? player.maxHealth);
    }
}
