import FinalBossEnemy from "../archetypes/FinalBossEnemy.js";
import DungeonRat from "./DungeonRat.js";
import Skeleton from "./Skeleton.js";

// Dark Ages finalBoss — Skeleton King
// The undead lord of the dungeon, 5000 HP, 3 phases
export default class SkeletonKing extends FinalBossEnemy {
  constructor(position, deps) {
    super(position, deps);

    this.color = "#aaaaff";
    this.originalColor = "#aaaaff";
  }

  // Phase 3 enraged: glows bright violet
  onUpdate(deltaTime) {
    super.onUpdate(deltaTime);
    if (this.isEnraged) {
      this.color = "#cc88ff";
    }
  }
}
