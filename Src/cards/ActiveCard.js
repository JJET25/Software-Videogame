// ActiveCard.js — Base class for cards the player manually activates using a key press.
// Delegates execution to the cooldown system so the effect only fires when the card is ready.

import Card, { CardType } from './Card.js';

export default class ActiveCard extends Card {
  // Constructs an active card by forwarding config with the ACTIVE type set.
  constructor(cfg) {
    super({ ...cfg, type: CardType.ACTIVE });
  }

  // Fires the card effect and starts its cooldown only when the cooldown system reports it as ready.
  execute(combatState, cooldownSystem) {
    if (cooldownSystem.isReady(this.name)) {
      this.effect(combatState);
      cooldownSystem.startCooldown(this.name, this.cooldown);
    }
  }
}
