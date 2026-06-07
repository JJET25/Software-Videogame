import { Router } from "express";
import pool from "../../database.js";
import requireAuth from "../middleware/auth.js";

const router = Router();

// Slot composition — mirrors ShopUI.#SLOT_RARITIES on the frontend.
// Each inner array is the priority list of rarities for that slot.
const SLOT_RARITIES = [
  ["common", "rare"],
  ["rare"],
  ["rare", "epic"],
  ["epic", "legendary"],
  ["common", "rare", "epic", "legendary"],
];

function toCard({
  effect_range,
  spread,
  shield,
  invincibility,
  trigger_event,
  threshold,
  heal_pct,
  full_heal,
  from_enemy,
  ...card
}) {
  return {
    ...card,
    effect_json: {
      range: effect_range ?? null,
      spread: spread ?? null,
      shield: shield ?? null,
      invincibility: invincibility ?? null,
      trigger: trigger_event ?? null,
      threshold: threshold ?? null,
      heal_pct: heal_pct ?? null,
      full_heal: full_heal ?? 0,
      from_enemy: from_enemy ?? 0,
    },
  };
}

// GET /shop/offerings/:runId
// Returns 5 cards with controlled rarity distribution, mirroring the
// frontend ShopUI slot table. Cards already owned by the run are excluded.
router.get("/offerings/:runId", requireAuth, async (req, res) => {
  try {
    // Cards already in this run — exclude them from the shop
    const [owned] = await pool.query(
      "SELECT card_id FROM run_cards WHERE run_id = ?",
      [req.params.runId],
    );
    const ownedIds = owned.map((r) => r.card_id);
    const excludeClause = ownedIds.length ? "AND c.id NOT IN (?)" : "";

    // Fetch all buyable cards grouped by rarity in one query
    const [allCards] = await pool.query(
      `SELECT
                c.id, c.card_name, cs.card_type, cs.subtype, r.name AS rarity,
                c.base_damage, c.base_heal, c.cooldown_seconds, c.shop_cost, c.description,
                ep.effect_range, ep.spread, ep.shield, ep.invincibility,
                ep.trigger_event, ep.threshold, ep.heal_pct, ep.full_heal, ep.from_enemy
            FROM cards c
            JOIN card_subtypes       cs ON cs.id = c.subtype_id
            JOIN rarities             r ON r.id  = c.rarity_id
            LEFT JOIN card_effect_params ep ON ep.card_id = c.id
            WHERE c.shop_cost > 0 ${excludeClause}
            ORDER BY RAND()`,
      ownedIds.length ? [ownedIds] : [],
    );

    // Group shuffled cards by rarity
    const byRarity = { common: [], rare: [], epic: [], legendary: [] };
    for (const card of allCards) {
      byRarity[card.rarity]?.push(card);
    }

    // Build 5 offerings following the slot composition table
    const usedIds = new Set();
    const offerings = [];

    for (const rarities of SLOT_RARITIES) {
      let picked = null;

      // Try each allowed rarity in priority order
      for (const rarity of rarities) {
        const candidate = byRarity[rarity]?.find((c) => !usedIds.has(c.id));
        if (candidate) {
          picked = candidate;
          break;
        }
      }

      // Catch-all: any remaining card not yet picked
      if (!picked) {
        picked = allCards.find((c) => !usedIds.has(c.id)) ?? null;
      }

      if (picked) {
        usedIds.add(picked.id);
        offerings.push(toCard(picked));
      }
    }

    res.json(offerings);
  } catch (err) {
    console.error("GET /shop/offerings:", err.message);
    res.status(500).json({ error: "Failed to generate shop offerings" });
  }
});

export default router;
