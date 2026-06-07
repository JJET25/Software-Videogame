import BossEnemy from "../archetypes/BossEnemy.js";
import DesertRat from "./DesertRat.js";
import Bandit from "./Bandit.js";

// Old West miniBoss — Dead-Eye
// A legendary outlaw with uncanny aim
export default class DeadEye extends BossEnemy {
  constructor(position, deps) {
    super(position, deps);

    this.health = 2500;
    this.maxHealth = 2500;
    this.color = "#cc8844";
    this.originalColor = "#cc8844";
  }

  // Phase 2: hat shot off, goes berserk
  enterPhase2() {
    super.enterPhase2?.();
    this.color = "#aa4422";
  }

  getMinionClass() {
    return Bandit;
  }
}
