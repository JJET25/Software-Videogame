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

export default class CardManager {
  constructor() {
    this.activeSlots = new Array(MAX_ACTIVE_SLOTS).fill(null);
    this.autoSlots   = new Array(MAX_AUTO_SLOTS).fill(null);

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

  fireTrigger(triggerName, combatState) {
    for (let i = 0; i < this.autoSlotCount; i++) {
      const card = this.autoSlots[i];
      if (card && card.trigger === triggerName) {
        card.onTrigger(combatState);
      }
    }
  }

  addCard(card) {
    const isActive = card.type === CardType.ACTIVE;
    const slots = isActive ? this.activeSlots : this.autoSlots;
    const limit = isActive ? this.activeSlotCount : this.autoSlotCount;

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

    return { added: false, creditsAwarded: 0 };
  }

  removeCard(card) {
    const isActive = card.type === CardType.ACTIVE;
    const slots    = isActive ? this.activeSlots : this.autoSlots;
    const limit    = isActive ? this.activeSlotCount : this.autoSlotCount;

    for (let i = 0; i < limit; i++) {
      if (slots[i] === card) {
        slots[i] = null;
        return true;
      }
    }
    return false;
  }

    update(deltaTime) {
      this.cooldown.update(deltaTime);
    }
}
