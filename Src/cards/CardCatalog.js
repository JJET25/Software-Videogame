// CardCatalog.js — Minimal fallback starter deck used when the backend is unreachable.
// Stats are intentionally minimal; the authoritative card data lives in the database.

import { Rarity } from './Card.js';
import ActiveMeleeCard   from './ActiveMeleeCard.js';
import ActiveHealCard    from './ActiveHealCard.js';
import ActiveDefenseCard from './ActiveDefenseCard.js';

// Factory function for the Quick Strike starter card.
const quickStrike = () => new ActiveMeleeCard({
  name:        'Quick Strike',
  description: 'Deal damage to enemies within 80px.',
  rarity:      Rarity.COMMON,
  damage:      25,
  range:       80,
  spread:      1.2,
  cooldown:    2,
});

// Factory function for the Heal Pulse starter card.
const healPulse = () => new ActiveHealCard({
  name:        'Heal Pulse',
  description: 'Restore 25 HP.',
  rarity:      Rarity.COMMON,
  healAmount:  25,
  cooldown:    5,
});

// Factory function for the Wood Shield starter card.
const woodShield = () => new ActiveDefenseCard({
  name:         'Wood Shield',
  description:  'Absorb the next 20 damage.',
  rarity:       Rarity.COMMON,
  shieldAmount: 20,
  cooldown:     6,
});

// Exported array of factory functions forming the default starter deck.
export const STARTER_DECK = [quickStrike, healPulse, woodShield];
