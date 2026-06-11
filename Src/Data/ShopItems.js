// ShopItems.js — Static shop inventory: card pool, sell values, and slot upgrade costs.
// Mirrors the database seed data exactly; used when the API is unreachable.
import { createCard } from "../cards/CardFactory.js";

// Full fallback card definitions excluding starters (shop_cost = 0).
const FALLBACK_CARDS = [
  // Active — Melee cards.
  {
    card_name: "Iron Fist",
    card_type: "active",
    subtype: "melee",
    rarity: "rare",
    base_damage: 55,
    base_heal: 0,
    cooldown_seconds: 5,
    shop_cost: 120,
    description: "A powerful close-range blow dealing 55 damage within 48px.",
    effect_json: { range: 48, spread: 1.099 },
  },
  {
    card_name: "Nova Burst",
    card_type: "active",
    subtype: "melee",
    rarity: "epic",
    base_damage: 110,
    base_heal: 0,
    cooldown_seconds: 9,
    shop_cost: 210,
    description:
      "Unleash an explosion dealing 110 damage to all enemies within 72px.",
    effect_json: { range: 72, spread: 3.142 },
  },
  {
    card_name: "Shadow Blade",
    card_type: "active",
    subtype: "melee",
    rarity: "legendary",
    base_damage: 250,
    base_heal: 0,
    cooldown_seconds: 10,
    shop_cost: 360,
    description:
      "A devastating strike dealing 250 damage to enemies within 48px.",
    effect_json: { range: 48, spread: 2.356 },
  },

  // Active — Heal cards.
  {
    card_name: "Remedy Vial",
    card_type: "active",
    subtype: "heal",
    rarity: "rare",
    base_damage: 0,
    base_heal: 42,
    cooldown_seconds: 8,
    shop_cost: 130,
    description: "Drink a swift remedy restoring 42 HP.",
    effect_json: {},
  },
  {
    card_name: "Mending Wave",
    card_type: "active",
    subtype: "heal",
    rarity: "epic",
    base_damage: 0,
    base_heal: 85,
    cooldown_seconds: 12,
    shop_cost: 220,
    description: "Release a healing wave that restores 85 HP.",
    effect_json: {},
  },
  {
    card_name: "Phoenix Elixir",
    card_type: "active",
    subtype: "heal",
    rarity: "legendary",
    base_damage: 0,
    base_heal: 0,
    cooldown_seconds: 18,
    shop_cost: 380,
    description: "Consume a legendary elixir to fully restore all HP.",
    effect_json: { full_heal: true },
  },

  // Active — Drain cards.
  {
    card_name: "Blood Siphon",
    card_type: "active",
    subtype: "drain",
    rarity: "rare",
    base_damage: 45,
    base_heal: 20,
    cooldown_seconds: 10,
    shop_cost: 140,
    description: "Drain the nearest enemy for 45 damage and restore 20 HP.",
    effect_json: {},
  },

  // Active — Defense cards.
  {
    card_name: "Stone Wall",
    card_type: "active",
    subtype: "defense",
    rarity: "rare",
    base_damage: 0,
    base_heal: 0,
    cooldown_seconds: 10,
    shop_cost: 125,
    description: "Erect a wall of stone that absorbs the next 50 damage.",
    effect_json: { shield: 50 },
  },
  {
    card_name: "Mirror Guard",
    card_type: "active",
    subtype: "defense",
    rarity: "epic",
    base_damage: 0,
    base_heal: 0,
    cooldown_seconds: 14,
    shop_cost: 200,
    description: "Gain 58 shield and 1.5s of invincibility.",
    effect_json: { shield: 58, invincibility: 1.5 },
  },
  {
    card_name: "Diamond Fortress",
    card_type: "active",
    subtype: "defense",
    rarity: "legendary",
    base_damage: 0,
    base_heal: 0,
    cooldown_seconds: 15,
    shop_cost: 350,
    description: "Crystallize your body, absorbing the next 100 damage.",
    effect_json: { shield: 100 },
  },

  // Automatic — Common cards.
  {
    card_name: "Lifetap",
    card_type: "automatic",
    subtype: "heal",
    rarity: "common",
    base_damage: 0,
    base_heal: 20,
    cooldown_seconds: 0,
    shop_cost: 65,
    description: "Restore 20 HP each time you kill an enemy.",
    effect_json: { trigger: "on_kill" },
  },
  {
    card_name: "Iron Skin",
    card_type: "automatic",
    subtype: "defense",
    rarity: "common",
    base_damage: 0,
    base_heal: 0,
    cooldown_seconds: 0,
    shop_cost: 70,
    description: "Gain 8 shield each time you hit an enemy.",
    effect_json: { trigger: "on_attack", shield: 8 },
  },
  {
    card_name: "Wound Echo",
    card_type: "automatic",
    subtype: "melee",
    rarity: "common",
    base_damage: 10,
    base_heal: 0,
    cooldown_seconds: 0,
    shop_cost: 65,
    description: "Each hit deals 10 bonus damage to the struck enemy.",
    effect_json: { trigger: "on_attack" },
  },
  {
    card_name: "Quick Recovery",
    card_type: "automatic",
    subtype: "heal",
    rarity: "common",
    base_damage: 0,
    base_heal: 8,
    cooldown_seconds: 0,
    shop_cost: 65,
    description: "When hit, instantly recover 8 HP.",
    effect_json: { trigger: "on_hit_received" },
  },

  // Automatic — Rare cards.
  {
    card_name: "Rebound",
    card_type: "automatic",
    subtype: "melee",
    rarity: "rare",
    base_damage: 15,
    base_heal: 0,
    cooldown_seconds: 0,
    shop_cost: 120,
    description: "When hit, deal 15 damage to enemies within 48px.",
    effect_json: { trigger: "on_hit_received", range: 48 },
  },
  {
    card_name: "Berserker Rush",
    card_type: "automatic",
    subtype: "melee",
    rarity: "rare",
    base_damage: 20,
    base_heal: 0,
    cooldown_seconds: 0,
    shop_cost: 130,
    description: "Dashing deals 20 damage to enemies within 32px.",
    effect_json: { trigger: "on_dash", range: 32 },
  },
  {
    card_name: "Soul Siphon",
    card_type: "automatic",
    subtype: "heal",
    rarity: "rare",
    base_damage: 0,
    base_heal: 18,
    cooldown_seconds: 0,
    shop_cost: 135,
    description: "Killing an enemy restores 18 HP and grants 10 shield.",
    effect_json: { trigger: "on_kill", shield: 10 },
  },

  // Automatic — Epic cards.
  {
    card_name: "Last Stand",
    card_type: "automatic",
    subtype: "defense",
    rarity: "epic",
    base_damage: 0,
    base_heal: 0,
    cooldown_seconds: 0,
    shop_cost: 205,
    description: "When hit below 30% HP, gain 2s of invincibility.",
    effect_json: {
      trigger: "on_hit_received",
      invincibility: 2,
      threshold: 0.3,
    },
  },
  {
    card_name: "Chain Kill",
    card_type: "automatic",
    subtype: "melee",
    rarity: "epic",
    base_damage: 25,
    base_heal: 0,
    cooldown_seconds: 0,
    shop_cost: 215,
    description: "Killing an enemy deals 25 damage to all others within 64px.",
    effect_json: { trigger: "on_kill", from_enemy: true, range: 64 },
  },
];

// Exported pool: each entry wraps a factory function so cards are instantiated on demand.
// Exposes rarity so ShopUI can group by tier without instantiating cards.
export const SHOP_CARD_POOL = FALLBACK_CARDS.map((d) => ({
  factory: () => createCard(d),
  cost: d.shop_cost,
  rarity: d.rarity,
  name: d.card_name,
}));

// Credits awarded when selling a card, keyed by rarity.
export const SELL_VALUE = {
  common: 30,
  rare: 70,
  epic: 130,
  legendary: 220,
};

// Gold costs to unlock additional active card slots (two upgrade tiers).
export const ACTIVE_SLOT_UPGRADE_COSTS = [150, 280];

// Gold costs to unlock additional automatic card slots (four upgrade tiers).
export const AUTO_SLOT_UPGRADE_COSTS = [110, 160, 210, 270];
