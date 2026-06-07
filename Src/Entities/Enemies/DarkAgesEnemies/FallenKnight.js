import BossEnemy from "../archetypes/BossEnemy.js";
import DungeonRat from "./DungeonRat.js";
import Skeleton from "./Skeleton.js";

// Dark Ages miniBoss — Fallen Knight
// A fallen knight in rusted armor, slow but relentless
export default class FallenKnight extends BossEnemy {
  constructor(position, deps) {
    super(position, deps);

    this.health = 2500;
    this.maxHealth = 2500;
    this.color = "#8899aa"; 
    this.originalColor = "#8899aa";
  }

  // Phase 2: armor cracks, reveals darker metal underneath
  enterPhase2() {
    super.enterPhase2?.();
    this.color = "#556677";
  }

  getMinionClass() {
    return Skeleton;
  }
}
