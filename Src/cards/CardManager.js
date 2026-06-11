// CardManager.js — Manages the player's active and automatic card slots, storage, and cooldown system.
// Routes input to the correct card, handles upgrades and slot assignment, and computes the difficulty multiplier.

import CooldownSystem from '../Systems/CooldownSystem.js';
import { CardType, Rarity } from './Card.js';

// Credit value awarded when a duplicate maxed-out card is received.
const CREDIT_VALUE = {
  [Rarity.COMMON]:    10,
  [Rarity.RARE]:      25,
  [Rarity.EPIC]:      50,
  [Rarity.LEGENDARY]: 100,
};

const MAX_ACTIVE_SLOTS = 5;
const MAX_AUTO_SLOTS   = 8;

export default class CardManager {
  // Initializes empty card slots, storage, and a cooldown system.
  constructor() {
    this.activeSlots = new Array(MAX_ACTIVE_SLOTS).fill(null);
    this.autoSlots   = new Array(MAX_AUTO_SLOTS).fill(null);
    // Cards collected beyond the available slot count overflow here.
    this.storage     = [];

    this.activeSlotCount = 3;
    this.autoSlotCount   = 4;

    this.selectedIndex = 0;
    this.cooldown      = new CooldownSystem();
  }

  // Sets the currently selected active slot index, clamped to valid range.
  selectSlot(index) {
    this.selectedIndex = Math.max(0, Math.min(index, this.activeSlotCount - 1));
  }

  // Executes the card at the given active slot index using the cooldown system.
  playCard(index, combatState) {
    if (index < 0 || index >= this.activeSlotCount) return;
    const card = this.activeSlots[index];
    if (!card) return;
    card.execute(combatState, this.cooldown);
  }

  // Executes the card at the currently selected active slot.
  playSelected(combatState) {
    this.playCard(this.selectedIndex, combatState);
  }

  // Fires all automatic cards whose trigger matches the given trigger name.
  fireTrigger(triggerName, combatState) {
    for (let i = 0; i < this.autoSlotCount; i++) {
      const card = this.autoSlots[i];
      if (card && card.trigger === triggerName) {
        card.onTrigger(combatState);
      }
    }
  }

  // Adds a card to the first empty slot; upgrades an existing copy if found, or sends to storage when full.
  addCard(card) {
    const isActive = card.type === CardType.ACTIVE;
    const slots    = isActive ? this.activeSlots : this.autoSlots;
    const limit    = isActive ? this.activeSlotCount : this.autoSlotCount;

    // Search both active slots (within limit) and storage for an existing copy to upgrade.
    const candidates = [...slots.slice(0, limit), ...this.storage];
    for (const existing of candidates) {
      if (!existing || existing.name !== card.name) continue;
      if (existing.isMaxLevel) {
        // Card is already at max level, convert the duplicate to credits.
        return { added: false, creditsAwarded: CREDIT_VALUE[card.rarity] };
      }
      existing.level++;
      return { added: true, creditsAwarded: 0, upgraded: true };
    }

    // No duplicate found: place in the first empty slot within the current slot limit.
    for (let i = 0; i < limit; i++) {
      if (slots[i] === null) {
        slots[i] = card;
        return { added: true, creditsAwarded: 0 };
      }
    }

    // All slots are full; overflow to storage.
    this.storage.push(card);
    return { added: true, creditsAwarded: 0 };
  }

  // Moves a card to the target slot type and index, swapping with any displaced card.
  // No-op when the card type does not match the target slot type.
  assignToSlot(card, type, index) {
    const isActive = card.type === CardType.ACTIVE;
    if (type === 'active' && !isActive) return;
    if (type === 'auto'   &&  isActive) return;

    if (type === 'storage') {
      this._removeFromAnywhere(card);
      this.storage.push(card);
      return;
    }

    const slots     = type === 'active' ? this.activeSlots : this.autoSlots;
    const displaced = slots[index];
    const srcInfo   = this._findCard(card);

    this._removeFromAnywhere(card);

    if (displaced) {
      this._removeFromAnywhere(displaced);
      if (srcInfo && srcInfo.type !== 'storage') {
        // True swap: displaced card returns to the original slot of the moved card.
        const srcSlots = srcInfo.type === 'active' ? this.activeSlots : this.autoSlots;
        srcSlots[srcInfo.index] = displaced;
      } else {
        this.storage.push(displaced);
      }
    }

    slots[index] = card;
  }

  // Removes the given card from whichever slot or storage it occupies.
  removeCard(card) {
    this._removeFromAnywhere(card);
    return true;
  }

  // Returns location info for a card (type and index) or null if not found.
  _findCard(card) {
    for (let i = 0; i < this.activeSlots.length; i++) {
      if (this.activeSlots[i] === card) return { type: 'active', index: i };
    }
    for (let i = 0; i < this.autoSlots.length; i++) {
      if (this.autoSlots[i] === card) return { type: 'auto', index: i };
    }
    const si = this.storage.indexOf(card);
    if (si !== -1) return { type: 'storage', index: si };
    return null;
  }

  // Clears the card from any slot or removes it from storage.
  _removeFromAnywhere(card) {
    for (let i = 0; i < this.activeSlots.length; i++) {
      if (this.activeSlots[i] === card) { this.activeSlots[i] = null; return; }
    }
    for (let i = 0; i < this.autoSlots.length; i++) {
      if (this.autoSlots[i] === card) { this.autoSlots[i] = null; return; }
    }
    const si = this.storage.indexOf(card);
    if (si !== -1) this.storage.splice(si, 1);
  }

  // Returns a linear difficulty multiplier: +8% per card beyond the starting 3.
  // Read by rooms at spawn time to scale enemy health and damage.
  get difficultyMultiplier() {
    const BASE  = 3;
    const total = this.activeSlots.filter(Boolean).length
                + this.autoSlots.filter(Boolean).length
                + this.storage.length;
    return 1.0 + Math.max(0, total - BASE) * 0.08;
  }

  // Advances all active cooldown timers by deltaTime each frame.
  update(deltaTime) {
    this.cooldown.update(deltaTime);
  }
}
