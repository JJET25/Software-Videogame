import FinalBossEnemy from "../archetypes/FinalBossEnemy.js";
import DesertRat from "./DesertRat.js";
import Bandit from "./Bandit.js";

// Old West finalBoss — The Iron Marshal
// The iron marshal, relentless lawman turned tyrant
export default class TheIronMarshal extends FinalBossEnemy {
  constructor(position, deps) {
    super(position, deps);

    this.color = "#bb9955";
    this.originalColor = "#bb9955";
  }

  // Phase 3 enraged: badge glows red — law has broken
  onUpdate(deltaTime) {
    super.onUpdate(deltaTime);
    if (this.isEnraged) {
      this.color = "#dd4422";
    }
  }
}
