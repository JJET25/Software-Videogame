import Entity from "./Entity.js";
import Vector from "../Utils/Vector.js";

export default class Enemy extends Entity {

    constructor(position, player, credits = null) {

        super(position, 32, 32, "green");

        this.player = player;

        this.credits = credits;

        this.speed = 80;

        this.health = 50;
        this.maxHealth = 50;

        this.originalColor = "green";

        this.damageCooldown = 0;

        this.contactDamage = 10;
    }

    update(deltaTime) {

        let direction = new Vector(
            this.player.position.x - this.position.x,
            this.player.position.y - this.position.y
        );

        this.velocity = direction.normalize().times(this.speed);

        if (this.damageCooldown > 0) {
            this.damageCooldown -= deltaTime;
        }

        const distanceX = Math.abs(
            this.player.position.x - this.position.x
        );

        const distanceY = Math.abs(
            this.player.position.y - this.position.y
        );

        if (
            distanceX < 32 &&
            distanceY < 32 &&
            this.damageCooldown <= 0
        ) {

            this.player.takeDamage(this.contactDamage);

            this.color = "red";

            this.damageCooldown = 0.5;
        }

        if (this.damageCooldown <= 0 && !this.isDead) {
            this.color = this.originalColor;
        }

        super.update(deltaTime);
    }

    die() {

        this.isDead = true;

        // Drop credits
        if (this.credits) {

            this.credits.push({
                x: this.position.x,
                y: this.position.y
            });
        }
    }
}