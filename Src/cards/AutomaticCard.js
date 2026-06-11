// AutomaticCard.js — Base class for cards that fire automatically when a game event occurs.
// No cooldown; subclasses or inline effect functions respond to a specific Trigger event.

import Card, { CardType } from './Card.js';

// Events that can trigger automatic cards.
export const Trigger = Object.freeze({
  ON_HIT:    'onHit',
  ON_KILL:   'onKill',
  ON_DAMAGE: 'onDamage',
  ON_DASH:   'onDash',
});

export default class AutomaticCard extends Card {
  // Constructs an automatic card, validates the trigger, and stores an optional inline effect function.
  constructor(cfg) {
    super({ ...cfg, type: CardType.AUTOMATIC, baseCooldown: 0 });

    if (!Object.values(Trigger).includes(cfg.trigger)) {
      throw new Error(`AutomaticCard "${cfg.name}": invalid trigger "${cfg.trigger}"`);
    }

    this.trigger = cfg.trigger;
    // Inline effect function; subclasses may override effect() instead.
    if (cfg.effect) this._effectFn = cfg.effect;
  }

  // Calls the inline effect function if provided; otherwise expects a subclass override.
  effect(combatState) {
    if (this._effectFn) return this._effectFn(combatState);
    throw new Error(`AutomaticCard "${this.name}" must implement effect(combatState)`);
  }

  // Called by CardManager when the matching trigger event fires.
  onTrigger(combatState) {
    this.effect(combatState);
  }
}
