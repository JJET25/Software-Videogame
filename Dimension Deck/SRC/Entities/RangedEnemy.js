import Enemy from "./Enemy.js";

export default class RangedEnemy extends Enemy {

    constructor(position, player) {

        super(position, player);

        this.speed = 60;

        this.health = 40;

        this.maxHealth = 40;

        this.color = "orange";

        this.originalColor = "orange";

        this.shootCooldown = 2;
    }

    update(deltaTime) {

        this.shootCooldown -= deltaTime;

        // Stop far away from player
        const distanceX = this.player.position.x - this.position.x;
        const distanceY = this.player.position.y - this.position.y;

        const distance = Math.sqrt(
            distanceX * distanceX +
            distanceY * distanceY
        );

        if (distance > 200) {
            super.update(deltaTime);
        } else {
            this.velocity.x = 0;
            this.velocity.y = 0;
        }
    }
}