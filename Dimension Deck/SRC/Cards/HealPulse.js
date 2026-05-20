import ActiveCard from './ActiveCard.js';
import { Rarity } from './Card.js';

export default class HealPulse extends ActiveCard {
    constructor() {
        super({
            name:         'Heal Pulse',
            description:  'Restore 25 HP.',
            rarity:       Rarity.COMMON,
            baseCooldown: 10,
        });
    }

    effect({ player }) {
        player.heal(25);
    }
}
