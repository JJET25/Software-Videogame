import Card, { CardType } from './Card.js';

// Events that triggers automatically the cards that responds to
export const Trigger = Object.freeze({
    ON_HIT:    'onHit',
    ON_KILL:   'onKill',
    ON_DAMAGE: 'onDamage',
    ON_DASH:   'onDash',
});

// Automatic cards activate when the trigger event occurs
// This cards do not have cooldown
export default class AutomaticCard extends Card {
    constructor(cfg) {
        super({ ...cfg, type: CardType.AUTOMATIC, baseCooldown: 0 });

        if (!Object.values(Trigger).includes(cfg.trigger)) {
            throw new Error(`AutomaticCard "${cfg.name}": invalid trigger "${cfg.trigger}"`);
        }

        this.trigger = cfg.trigger;
        // Inline effect; subclasses can override the effect function instead
        if (cfg.effect) this._effectFn = cfg.effect;
    }

    // Delegates to the effect if it is provided, if not expects a subclass override
    effect(combatState) {
        if (this._effectFn) return this._effectFn(combatState);
        throw new Error(`AutomaticCard "${this.name}" must implement effect(combatState)`);
    }

    onTrigger(combatState) {
        this.effect(combatState);
    }
}
