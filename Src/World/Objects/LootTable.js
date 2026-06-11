// LootTable.js — Static weighted loot table used by chests and other reward sources.
// Rolls a random number against probability thresholds to produce credits or a card of a given rarity.

import { Rarity } from "../../cards/Card.js";
import { randInt } from "../../Utils/Random.js";

// Weighted entries: each entry has a probability weight and a factory function returning the loot result.
const TABLE = [
  {
    weight: 60,
    roll: () => ({ type: "credits", amount: randInt(2, 10) * 10 }),
  },
  { weight: 25, roll: () => ({ type: "card", rarity: Rarity.RARE }) },
  { weight: 10, roll: () => ({ type: "card", rarity: Rarity.EPIC }) },
  { weight: 5, roll: () => ({ type: "card", rarity: Rarity.LEGENDARY }) },
];

export default class LootTable {
  // Rolls the table and returns a loot result object with type and amount or rarity.
  static roll() {
    const n = randInt(1, 100);
    let sum = 0;
    for (const entry of TABLE) {
      sum += entry.weight;
      if (n < sum) return entry.roll();
    }
    return TABLE[0].roll();
  }
}
