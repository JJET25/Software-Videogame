import BossEnemy from "../BossEnemy.js";
import DungeonRat from "./DungeonRat.js";

export default class SkeletonKing extends BossEnemy {

    constructor(position, player, bullets, credits) {
        super(position, player, bullets, credits);

        this.health = 900;
        this.maxHealth = 900;
        this.color = "#aaaaff";
        this.originalColor = "#aaaaff";
    }

    enterPhase2() {
        super.enterPhase2();
        this.color = "#4444ff";
    }

    getMinionClass() {
        return DungeonRat; 
    }
}