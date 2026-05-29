import { Rarity } from "../../cards/Card.js";
import { randInt } from "../../Utils/Random.js";

// Loot chances table
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
