import Card, { CardType } from './Card.js';

// Active cards are manually triggered by the player and have a cooldown
export default class ActiveCard extends Card {
    constructor(cfg) {
        super({ ...cfg, type: CardType.ACTIVE });
    }

    // Fires effect() only when the cooldown system reports this card as ready
    execute(combatState, cooldownSystem) {
        if (cooldownSystem.isReady(this.name)) {
            this.effect(combatState);
            cooldownSystem.startCooldown(this.name, this.cooldown);
        }
    }
}
