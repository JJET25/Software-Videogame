import { Rarity } from './Card.js';
import ActiveMeleeCard   from './ActiveMeleeCard.js';
import ActiveHealCard    from './ActiveHealCard.js';
import ActiveDefenseCard from './ActiveDefenseCard.js';

// Fallback deck used only when the backend is unreachable.
// Stats are intentionally minimal — the real values live in the DB.
const quickStrike = () => new ActiveMeleeCard({
    name:        'Quick Strike',
    description: 'Deal damage to enemies within 32px.',
    rarity:      Rarity.COMMON,
    damage:      20,
    range:       32,
    cooldown:    3,
});

const healPulse = () => new ActiveHealCard({
    name:        'Heal Pulse',
    description: 'Restore 25 HP.',
    rarity:      Rarity.COMMON,
    healAmount:  25,
    cooldown:    10,
});

const woodShield = () => new ActiveDefenseCard({
    name:         'Wood Shield',
    description:  'Absorb the next 20 damage.',
    rarity:       Rarity.COMMON,
    shieldAmount: 20,
    cooldown:     8,
});

export const STARTER_DECK = [quickStrike, healPulse, woodShield];
