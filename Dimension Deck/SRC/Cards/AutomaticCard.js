import Card, { CardType } from './Card.js';

export const Trigger = Object.freeze({
    ON_HIT:    'onHit',
    ON_KILL:   'onKill',
    ON_DAMAGE: 'onDamage',
    ON_DASH:   'onDash',
});

export default class AutomaticCard extends Card {
    constructor(cfg) {
        super({ ...cfg, type: CardType.AUTOMATIC, baseCooldown: 0 });

        if (!Object.values(Trigger).includes(cfg.trigger)) {
            throw new Error(`AutomaticCard "${cfg.name}": invalid trigger "${cfg.trigger}"`);
        }
        this.trigger = cfg.trigger;
    }

    onTrigger(combatState) {
        this.effect(combatState);
    }
} 
