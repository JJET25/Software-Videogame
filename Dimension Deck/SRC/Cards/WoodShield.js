import ActiveCard from './ActiveCard.js';
import { Rarity } from './Card.js';

export default class WoodShield extends ActiveCard {
    constructor({ shieldAmount = 20, cooldown = 8 } = {}) {
        super({
            name:         'Wood Shield',
            description:  `Absorb the next ${shieldAmount} damage.`,
            rarity:       Rarity.COMMON,
            baseCooldown: cooldown,
        });
        this.shieldAmount = shieldAmount;
    }

    effect({ player }) {
        player.shield += this.shieldAmount;
    }
}
