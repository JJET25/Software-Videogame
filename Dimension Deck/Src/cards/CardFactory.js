import ActiveMeleeCard from "./ActiveMeleeCard.js";
import ActiveHealCard from "./ActiveHealCard.js";
import ActiveDefenseCard from "./ActiveDefenseCard.js";
import ActiveDrainCard from "./ActiveDrainCard.js";
import AutomaticCard, { Trigger } from "./AutomaticCard.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// Maps DB trigger strings (effect_json.trigger) to the Trigger enum the game understands.
// on_low_health uses ON_DAMAGE so the card fires on hit; threshold check happens inside the effect.
const TRIGGER_MAP = {
  on_hit_received: Trigger.ON_DAMAGE,
  on_kill: Trigger.ON_KILL,
  on_attack: Trigger.ON_HIT,
  on_low_health: Trigger.ON_DAMAGE,
  on_dash: Trigger.ON_DASH,
};

// Builds an inline effect for AutomaticCards entirely from DB fields —
// no per-card code needed. Supports: flat damage, flat heal, threshold guard, heal_pct.
function buildAutoEffect({ base_damage, base_heal, effect_json: fx }) {
  const range = fx?.range ?? 200;
  const threshold = fx?.threshold ?? 0;
  const healPct = fx?.heal_pct ?? 0;
  const shieldGain = fx?.shield ?? 0; // Iron Skin: gain shield on hit
  const invincDur = fx?.invincibility ?? 0; // Last Stand: grant invincibility frames
  const fromEnemy = fx?.from_enemy ?? false; // Chain Kill: AoE centered on killed enemy

  return ({ player, enemies = [], enemy }) => {
    if (threshold > 0 && player.health / player.maxHealth > threshold) return;

    if (base_damage > 0) {
      if (enemy && !enemy.isDead && !fromEnemy) {
        // Single-target: enemy that triggered the card (ON_HIT / ON_KILL)
        enemy.takeDamage(base_damage);
      } else {
        // AoE: center on killed enemy position (fromEnemy) or player (ON_DAMAGE / ON_DASH)
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

// ── Active card factories (keyed by subtype) ─────────────────────────────────
// Adding a new card to the DB with an existing subtype requires zero code changes.

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

// ── Public API ────────────────────────────────────────────────────────────────

// Creates a card instance from a DB row.
// Returns null and warns if the card_type/subtype/trigger has no mapping yet.
export function createCard(dbData) {
  const rarity = mapRarity(dbData.rarity);

  if (dbData.card_type === "automatic") {
    const trigger = TRIGGER_MAP[dbData.effect_json?.trigger];
    if (!trigger) {
      console.warn(
        `CardFactory: unknown trigger "${dbData.effect_json?.trigger}" for "${dbData.card_name}"`,
      );
      return null;
    }
    return new AutomaticCard({
      name: dbData.card_name,
      description: dbData.description,
      rarity,
      trigger,
      effect: buildAutoEffect(dbData),
    });
  }

  const factory = ACTIVE_MAP[dbData.subtype];
  if (!factory) {
    console.warn(
      `CardFactory: unknown subtype "${dbData.subtype}" for "${dbData.card_name}"`,
    );
    return null;
  }
  return factory(dbData, rarity);
}

export const STARTER_CARDS = ["Quick Strike", "Heal Pulse", "Wood Shield"];

// Select a random card of rarity asked from loaded pool at run start
export function getRandomCardByRarity(catalog, rarity) {
  if (!catalog?.length) return null;

  const pool = catalog.filter((d) => mapRarity(d.rarity) === rarity);
  if (!pool.length) return null;

  const dbData = pool[Math.floor(Math.random() * pool.length)];
  return createCard(dbData);
}
