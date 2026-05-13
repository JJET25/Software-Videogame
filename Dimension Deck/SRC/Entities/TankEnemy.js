import Enemy from "./Enemy.js";

export default class TankEnemy extends Enemy {

    constructor(position, player) {

        super(position, player);

        // Slow movement
        this.speed = 70;

        // High HP
        this.health = 150;
        this.maxHealth = 150;

        // Bigger size
        this.width = 48;
        this.height = 48;

        // Testing color
        this.color = "blue";

        this.originalColor = "blue";
    }
}