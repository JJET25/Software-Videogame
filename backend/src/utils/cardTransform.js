// cardTransform.js — Utility that reshapes flat DB card rows into the effect_json structure CardFactory expects.
// Shared by cards.js and shop.js routes to keep the response shape consistent.

// Destructures effect-related flat columns and nests them under effect_json in the returned object.
export function toCard({ effect_range, spread, shield, invincibility,
                         trigger_event, threshold, heal_pct, full_heal, from_enemy,
                         ...card }) {
  return {
    ...card,
    effect_json: {
      range:         effect_range   ?? null,
      spread:        spread         ?? null,
      shield:        shield         ?? null,
      invincibility: invincibility  ?? null,
      trigger:       trigger_event  ?? null,
      threshold:     threshold      ?? null,
      heal_pct:      heal_pct       ?? null,
      full_heal:     full_heal      ?? 0,
      from_enemy:    from_enemy     ?? 0,
    },
  };
}
