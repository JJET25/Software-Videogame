import Enemy from "./Enemy.js";

export default class SwarmEnemy extends Enemy {

    constructor(position, player) {

        super(position, player);

        // Fast movement but balanced
        this.speed = 100;

        // Very low HP
        this.health = 10;
        this.maxHealth = 10;

        // Smaller size
        this.width = 20;
        this.height = 20;

        // Different color for testing
        this.color = "purple";

        this.originalColor = "purple";

        // Less damage
        this.contactDamage = 5;
    }
}