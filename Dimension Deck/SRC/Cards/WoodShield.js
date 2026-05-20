import ActiveCard from './ActiveCard.js';
import { Rarity } from './Card.js';

export default class WoodShield extends ActiveCard {
    constructor() {
        super({
            name:         'Wood Shield',
            description:  'Absorb the next 20 damage.',
            rarity:       Rarity.COMMON,
            baseCooldown: 8,
        });
    }

    effect({ player }) {
        player.shield += 20;
    }
}
