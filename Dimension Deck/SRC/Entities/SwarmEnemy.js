import Enemy from "./Enemy.js";

export default class SwarmEnemy extends Enemy {

    constructor(position, player) {

        super(position, player);

        // Fast movement
        this.speed = 220;

        // Low HP
        this.health = 20;
        this.maxHealth = 20;

        // Different color for testing
        this.color = "purple";

        this.originalColor = "purple";
    }
}