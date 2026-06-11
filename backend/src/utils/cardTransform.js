// Reconstructs effect_json from the flat DB columns so the API response shape
// matches what CardFactory.js expects. Shared by cards.js and shop.js routes.
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
