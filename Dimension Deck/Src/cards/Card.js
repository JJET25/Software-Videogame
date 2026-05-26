export const Rarity = Object.freeze({
    COMMON:    'common',
    RARE:      'rare',
    EPIC:      'epic',
    LEGENDARY: 'legendary',
});

export const CardType = Object.freeze({
    ACTIVE:    'active',
    AUTOMATIC: 'automatic',
});

// Abstract base class for all cards
// Check the rarity, type and level of the card
export default class Card {
    constructor({ name, description, rarity, type, level = 1, baseCooldown = 0 }) {
        if (!Object.values(Rarity).includes(rarity)) {
            throw new Error(`Card "${name}": invalid rarity "${rarity}"`);
        }
        if (!Object.values(CardType).includes(type)) {
            throw new Error(`Card "${name}": invalid type "${type}"`);
        }
        if (level < 1 || level > 3) {
            throw new Error(`Card "${name}": level must be 1-3, got ${level}`);
        }

        this.name         = name;
        this.description  = description;
        this.rarity       = rarity;
        this.type         = type;
        this.level        = level;
        this.baseCooldown = baseCooldown;
    }

    effect(combatState) {
        throw new Error(`Card "${this.name}" must implement effect(combatState)`);
    }

    get isMaxLevel() {
        return this.level === 3;
    }

    // Scales the cooldwon base on the level of the card, level 1 = 100%, level 2 = 70%, level 3 = 49
    get cooldown() {
        const scale = this.level >= 2 ? (this.level === 3 ? 0.49 : 0.7) : 1;
        return this.baseCooldown * scale;
    }
}
