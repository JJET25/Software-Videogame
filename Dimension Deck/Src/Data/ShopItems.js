import { createCard } from '../cards/CardFactory.js';

// Fallback card pool — mirrors the DB seed data exactly.
// Used by ShopUI when the API is unreachable.
// Cards with shop_cost = 0 (starters) are excluded; the API does the same.
const FALLBACK_CARDS = [
    // Active — Melee
    { card_name: 'Iron Fist',        card_type: 'active',    subtype: 'melee',   rarity: 'rare',      base_damage:  55, base_heal:  0, cooldown_seconds:  5, shop_cost:  50, description: 'A powerful close-range blow dealing 55 damage within 90px.',          effect_json: { range:  90, spread: 1.099 } },
    { card_name: 'Nova Burst',       card_type: 'active',    subtype: 'melee',   rarity: 'epic',      base_damage: 110, base_heal:  0, cooldown_seconds:  9, shop_cost:  80, description: 'Unleash an explosion dealing 110 damage to all enemies within 200px.', effect_json: { range: 200, spread: 3.142 } },
    { card_name: 'Shadow Blade',     card_type: 'active',    subtype: 'melee',   rarity: 'legendary', base_damage: 180, base_heal:  0, cooldown_seconds: 15, shop_cost: 130, description: 'A devastating strike dealing 180 damage to enemies within 160px.',     effect_json: { range: 160, spread: 2.356 } },
    // Active — Heal
    { card_name: 'Mending Wave',     card_type: 'active',    subtype: 'heal',    rarity: 'epic',      base_damage:   0, base_heal: 70, cooldown_seconds: 15, shop_cost:  85, description: 'Release a healing wave that restores 70 HP.',                          effect_json: {} },
    { card_name: 'Phoenix Elixir',   card_type: 'active',    subtype: 'heal',    rarity: 'legendary', base_damage:   0, base_heal:  0, cooldown_seconds: 30, shop_cost: 150, description: 'Consume a legendary elixir to fully restore all HP.',                  effect_json: { full_heal: true } },
    // Active — Drain
    { card_name: 'Blood Siphon',     card_type: 'active',    subtype: 'drain',   rarity: 'rare',      base_damage:  40, base_heal: 20, cooldown_seconds: 12, shop_cost:  65, description: 'Drain the nearest enemy for 40 damage and restore 20 HP.',             effect_json: {} },
    // Active — Defense
    { card_name: 'Stone Wall',       card_type: 'active',    subtype: 'defense', rarity: 'rare',      base_damage:   0, base_heal:  0, cooldown_seconds: 12, shop_cost:  60, description: 'Erect a wall of stone that absorbs the next 50 damage.',               effect_json: { shield: 50 } },
    { card_name: 'Mirror Guard',     card_type: 'active',    subtype: 'defense', rarity: 'epic',      base_damage:   0, base_heal:  0, cooldown_seconds: 14, shop_cost:  90, description: 'Gain 35 shield and 1.5s of invincibility.',                            effect_json: { shield: 35, invincibility: 1.5 } },
    { card_name: 'Diamond Fortress', card_type: 'active',    subtype: 'defense', rarity: 'legendary', base_damage:   0, base_heal:  0, cooldown_seconds: 18, shop_cost: 140, description: 'Crystallize your body, absorbing the next 100 damage.',                effect_json: { shield: 100 } },
    // Automatic
    { card_name: 'Lifetap',          card_type: 'automatic', subtype: 'heal',    rarity: 'common',    base_damage:   0, base_heal: 20, cooldown_seconds:  0, shop_cost:  40, description: 'Restore 20 HP each time you kill an enemy.',                          effect_json: { trigger: 'on_kill' } },
    { card_name: 'Iron Skin',        card_type: 'automatic', subtype: 'defense', rarity: 'common',    base_damage:   0, base_heal:  0, cooldown_seconds:  0, shop_cost:  45, description: 'Gain 8 shield each time you hit an enemy.',                            effect_json: { trigger: 'on_attack', shield: 8 } },
    { card_name: 'Rebound',          card_type: 'automatic', subtype: 'melee',   rarity: 'rare',      base_damage:  15, base_heal:  0, cooldown_seconds:  0, shop_cost:  65, description: 'When hit, deal 15 damage to enemies within 150px.',                   effect_json: { trigger: 'on_hit_received', range: 150 } },
    { card_name: 'Berserker Rush',   card_type: 'automatic', subtype: 'melee',   rarity: 'rare',      base_damage:  20, base_heal:  0, cooldown_seconds:  0, shop_cost:  70, description: 'Dashing deals 20 damage to enemies within 100px.',                    effect_json: { trigger: 'on_dash', range: 100 } },
    { card_name: 'Last Stand',       card_type: 'automatic', subtype: 'defense', rarity: 'epic',      base_damage:   0, base_heal:  0, cooldown_seconds:  0, shop_cost:  95, description: 'When hit below 30% HP, gain 2s of invincibility.',                    effect_json: { trigger: 'on_hit_received', invincibility: 2, threshold: 0.3 } },
    { card_name: 'Chain Kill',       card_type: 'automatic', subtype: 'melee',   rarity: 'epic',      base_damage:  25, base_heal:  0, cooldown_seconds:  0, shop_cost: 100, description: 'Killing an enemy deals 25 damage to all others within 200px.',        effect_json: { trigger: 'on_kill', from_enemy: true, range: 200 } },
];

export const SHOP_CARD_POOL = FALLBACK_CARDS.map(d => ({
    factory: () => createCard(d),
    cost:    d.shop_cost,
}));

// Credits returned when selling a card — keyed by rarity
export const SELL_VALUE = {
    common:    15,
    rare:      35,
    epic:      65,
    legendary: 120,
};

// Escalating costs to unlock additional active card slots — index 0 = 3→4 slots
export const ACTIVE_SLOT_UPGRADE_COSTS = [60, 120];

// Escalating costs to unlock additional auto card slots — index 0 = 4→5 slots
export const AUTO_SLOT_UPGRADE_COSTS = [50, 80, 120, 160];
