import ActiveCard from './ActiveCard.js';

// healAmount: number of HP to restore, or null for a full heal.
export default class ActiveHealCard extends ActiveCard {
    constructor({ name, description, rarity, healAmount, cooldown, level = 1 }) {
        super({ name, description, rarity, baseCooldown: cooldown, level });
        this.healAmount = healAmount;
    }

    effect({ player }) {
        player.heal(this.healAmount ?? player.maxHealth);
    }
}
