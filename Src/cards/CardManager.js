import CooldownSystem from '../Systems/CooldownSystem.js';
import { CardType, Rarity } from './Card.js';

const CREDIT_VALUE = {
    [Rarity.COMMON]:    10,
    [Rarity.RARE]:      25,
    [Rarity.EPIC]:      50,
    [Rarity.LEGENDARY]: 100,
};

const MAX_ACTIVE_SLOTS = 5;
const MAX_AUTO_SLOTS   = 8;

// Holds the player's active and automatic card slots and routes input to the correct card
export default class CardManager {
  constructor() {
    this.activeSlots = new Array(MAX_ACTIVE_SLOTS).fill(null);
    this.autoSlots   = new Array(MAX_AUTO_SLOTS).fill(null);
    this.storage     = [];  // cards collected but not assigned to any active/auto slot

    this.activeSlotCount = 3;
    this.autoSlotCount   = 4;

    this.selectedIndex = 0;
    this.cooldown      = new CooldownSystem();
  }

  selectSlot(index) {
    this.selectedIndex = Math.max(0, Math.min(index, this.activeSlotCount - 1));
  }

  playCard(index, combatState) {
    if (index < 0 || index >= this.activeSlotCount) return;
    const card = this.activeSlots[index];
    if (!card) return;
    card.execute(combatState, this.cooldown);
  }

  playSelected(combatState) {
    this.playCard(this.selectedIndex, combatState);
  }

  // Iterates automatic slots and calls the trigger function on any card whose trigger matches
  fireTrigger(triggerName, combatState) {
    for (let i = 0; i < this.autoSlotCount; i++) {
      const card = this.autoSlots[i];
      if (card && card.trigger === triggerName) {
        card.onTrigger(combatState);
      }
    }
  }

  // Adds a card to the first empty slot; overflows to storage when all slots are full
  addCard(card) {
    const isActive = card.type === CardType.ACTIVE;
    const slots    = isActive ? this.activeSlots : this.autoSlots;
    const limit    = isActive ? this.activeSlotCount : this.autoSlotCount;

    for (let i = 0; i < limit; i++) {
      if (slots[i]?.name === card.name && slots[i].isMaxLevel) {
        return { added: false, creditsAwarded: CREDIT_VALUE[card.rarity] };
      }
    }

    for (let i = 0; i < limit; i++) {
      if (slots[i] === null) {
        slots[i] = card;
        return { added: true, creditsAwarded: 0 };
      }
    }

    // Active/auto slots full — send to storage instead of discarding
    this.storage.push(card);
    return { added: true, creditsAwarded: 0 };
  }

  // Moves `card` to the target slot (type: 'active'|'auto'|'storage', index: slot index).
  // If the target slot is occupied the two cards swap; displaced card goes back to card's old location.
  // No-op when card type doesn't match the target slot type.
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
        // True swap: displaced card goes back to card's original slot
        const srcSlots = srcInfo.type === 'active' ? this.activeSlots : this.autoSlots;
        srcSlots[srcInfo.index] = displaced;
      } else {
        this.storage.push(displaced);
      }
    }

    slots[index] = card;
  }

  removeCard(card) {
    this._removeFromAnywhere(card);
    return true;
  }

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

  update(deltaTime) {
    this.cooldown.update(deltaTime);
  }
}
