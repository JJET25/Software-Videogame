import ActiveCard from './ActiveCard.js';
import { Rarity } from './Card.js';

export default class HealPulse extends ActiveCard {
    constructor({ healAmount = 25, cooldown = 10 } = {}) {
        super({
            name:         'Heal Pulse',
            description:  `Restore ${healAmount} HP.`,
            rarity:       Rarity.COMMON,
            baseCooldown: cooldown,
        });
        this.healAmount = healAmount;
    }

    effect({ player }) {
        player.heal(this.healAmount);
    }
}
