import Card, { CardType } from './Card.js';

export default class ActiveCard extends Card {
    constructor(cfg) {
        super({ ...cfg, type: CardType.ACTIVE });
    }

    execute(combatState, cooldownSystem) {
        if (cooldownSystem.isReady(this.name)) {
            this.effect(combatState);
            cooldownSystem.startCooldown(this.name, this.cooldown);
        }
    }
}