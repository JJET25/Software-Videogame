// CardFactory.js — Converts raw database rows into typed Card instances.
// Supports active subtypes (melee, heal, defense, drain) and automatic cards with inline effect generation.

import ActiveMeleeCard from "./ActiveMeleeCard.js";
import ActiveHealCard from "./ActiveHealCard.js";
import ActiveDefenseCard from "./ActiveDefenseCard.js";
import ActiveDrainCard from "./ActiveDrainCard.js";
import AutomaticCard, { Trigger } from "./AutomaticCard.js";

// Normalizes DB rarity strings to the values the Card class accepts.
function mapRarity(dbRarity) {
  const MAP = {
    common: "common",
    uncommon: "common",
    rare: "rare",
    epic: "epic",
    legendary: "legendary",
  };
  return MAP[dbRarity] ?? "common";
}

// Maps DB trigger strings to the Trigger enum values used by AutomaticCard.
// on_low_health maps to ON_DAMAGE so the card fires on hit; the threshold check happens inside the effect.
const TRIGGER_MAP = {
  on_hit_received: Trigger.ON_DAMAGE,
  on_kill: Trigger.ON_KILL,
  on_attack: Trigger.ON_HIT,
  on_low_health: Trigger.ON_DAMAGE,
  on_dash: Trigger.ON_DASH,
};

// Builds an inline effect closure for AutomaticCards entirely from DB fields.
// Supports flat damage, flat heal, threshold guard, heal_pct, shield gain, invincibility, and AoE from enemy.
function buildAutoEffect({ base_damage, base_heal, effect_json: fx }) {
  const range = fx?.range ?? 200;
  const threshold = fx?.threshold ?? 0;
  const healPct = fx?.heal_pct ?? 0;
  // Shield gained on hit (e.g. Iron Skin).
  const shieldGain = fx?.shield ?? 0;
  // Invincibility duration in seconds (e.g. Last Stand).
  const invincDur = fx?.invincibility ?? 0;
  // When true, AoE is centered on the killed enemy position (e.g. Chain Kill).
  const fromEnemy = fx?.from_enemy ?? false;

  return ({ player, enemies = [], enemy }) => {
    // Threshold guard: skip if player health ratio is above the threshold.
    if (threshold > 0 && player.health / player.maxHealth > threshold) return;

    if (base_damage > 0) {
      if (enemy && !enemy.isDead && !fromEnemy) {
        // Single-target: damage the enemy that triggered the card.
        enemy.takeDamage(base_damage);
      } else {
        // AoE: center on the killed enemy (fromEnemy) or on the player for other triggers.
        const cx = fromEnemy && enemy ? enemy.position.x : player.position.x;
        const cy = fromEnemy && enemy ? enemy.position.y : player.position.y;
        for (const t of enemies) {
          if (t.isDead || t === enemy) continue;
          const dx = t.position.x - cx;
          const dy = t.position.y - cy;
          if (dx * dx + dy * dy <= range * range) t.takeDamage(base_damage);
        }
      }
    }

    if (base_heal > 0) player.heal(base_heal);
    if (healPct > 0) player.heal(Math.round((base_damage || 30) * healPct));
    if (shieldGain > 0) player.shield += shieldGain;
    if (invincDur > 0) player.grantInvincibility(invincDur);
  };
}

// Factories for each active card subtype keyed by the subtype string from the DB.
// Adding a new card with an existing subtype requires no code changes here.
const ACTIVE_MAP = {
  melee: (d, r) =>
    new ActiveMeleeCard({
      name: d.card_name,
      description: d.description,
      rarity: r,
      damage: d.base_damage,
      range: d.effect_json?.range ?? 120,
      spread: d.effect_json?.spread ?? Math.PI * 0.6,
      cooldown: d.cooldown_seconds,
    }),
  heal: (d, r) =>
    new ActiveHealCard({
      name: d.card_name,
      description: d.description,
      rarity: r,
      healAmount: d.effect_json?.full_heal ? null : d.base_heal,
      cooldown: d.cooldown_seconds,
    }),
  defense: (d, r) =>
    new ActiveDefenseCard({
      name: d.card_name,
      description: d.description,
      rarity: r,
      shieldAmount: d.effect_json?.shield ?? 0,
      invincibility: d.effect_json?.invincibility ?? 0,
      cooldown: d.cooldown_seconds,
    }),
  drain: (d, r) =>
    new ActiveDrainCard({
      name: d.card_name,
      description: d.description,
      rarity: r,
      damage: d.base_damage,
      healAmount: d.base_heal,
      cooldown: d.cooldown_seconds,
    }),
};

// Creates a Card instance from a DB row; returns null and logs a warning on unknown subtype or trigger.
export function createCard(dbData) {
  const rarity = mapRarity(dbData.rarity);

  let card;

  if (dbData.card_type === "automatic") {
    const trigger = TRIGGER_MAP[dbData.effect_json?.trigger];
    if (!trigger) {
      console.warn(
        `CardFactory: unknown trigger "${dbData.effect_json?.trigger}" for "${dbData.card_name}"`,
      );
      return null;
    }
    card = new AutomaticCard({
      name: dbData.card_name,
      description: dbData.description,
      rarity,
      trigger,
      effect: buildAutoEffect(dbData),
    });
  } else {
    const factory = ACTIVE_MAP[dbData.subtype];
    if (!factory) {
      console.warn(
        `CardFactory: unknown subtype "${dbData.subtype}" for "${dbData.card_name}"`,
      );
      return null;
    }
    card = factory(dbData, rarity);
  }

  // Attach the DB id to the card instance when present.
  if (dbData.id != null) card.id = dbData.id;
  return card;
}

// Names of the three cards that every new player starts with.
export const STARTER_CARDS = ["Quick Strike", "Heal Pulse", "Wood Shield"];

// Returns a random card instance matching the given rarity from the catalog, or null if none exist.
export function getRandomCardByRarity(catalog, rarity) {
  if (!catalog?.length) return null;

  const pool = catalog.filter((d) => mapRarity(d.rarity) === rarity);
  if (!pool.length) return null;

  const dbData = pool[Math.floor(Math.random() * pool.length)];
  return createCard(dbData);
}
