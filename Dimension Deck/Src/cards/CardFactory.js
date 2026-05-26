import ActiveMeleeCard   from './ActiveMeleeCard.js';
import ActiveHealCard    from './ActiveHealCard.js';
import ActiveDefenseCard from './ActiveDefenseCard.js';

// Maps DB rarity strings to the values the Card base class accepts
function mapRarity(dbRarity) {
    const map = { common: 'common', uncommon: 'common', rare: 'rare', epic: 'epic', legendary: 'legendary' };
    return map[dbRarity] ?? 'common';
}

// Maps DB card_name → constructor call using DB stats.
// Add new entries here as more card implementations are created.
const REGISTRY = {
    'Quick Strike': (d) => new ActiveMeleeCard({
        name:        d.card_name,
        description: d.description,
        rarity:      mapRarity(d.rarity),
        damage:      d.base_damage,
        range:       d.effect_json?.range ?? 120,
        cooldown:    d.cooldown_seconds,
    }),
    'Heal Pulse': (d) => new ActiveHealCard({
        name:        d.card_name,
        description: d.description,
        rarity:      mapRarity(d.rarity),
        healAmount:  d.base_heal,
        cooldown:    d.cooldown_seconds,
    }),
    'Wood Shield': (d) => new ActiveDefenseCard({
        name:        d.card_name,
        description: d.description,
        rarity:      mapRarity(d.rarity),
        shieldAmount: d.effect_json?.shield ?? 20,
        cooldown:    d.cooldown_seconds,
    }),
};

export function createCard(dbData) {
    const factory = REGISTRY[dbData.card_name];
    if (!factory) {
        console.warn(`CardFactory: no implementation for "${dbData.card_name}"`);
        return null;
    }
    return factory(dbData);
}

export const STARTER_CARDS = ['Quick Strike', 'Heal Pulse', 'Wood Shield'];
