import QuickStrike from './QuickStrike.js';
import HealPulse   from './HealPulse.js';
import WoodShield  from './WoodShield.js';

// Maps DB card_name → card constructor using DB stats.
// Add new entries here as more cards are implemented.
const REGISTRY = {
    'Quick Strike': (d) => new QuickStrike({
        damage:   d.base_damage,
        range:    d.effect_json?.range ?? 120,
        cooldown: d.cooldown_seconds,
    }),
    'Heal Pulse': (d) => new HealPulse({
        healAmount: d.base_heal,
        cooldown:   d.cooldown_seconds,
    }),
    'Wood Shield': (d) => new WoodShield({
        shieldAmount: d.effect_json?.shield ?? 20,
        cooldown:     d.cooldown_seconds,
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

// Returns the three starter card names in slot order.
export const STARTER_CARDS = ['Quick Strike', 'Heal Pulse', 'Wood Shield'];
