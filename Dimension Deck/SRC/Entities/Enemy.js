import Entity from "./Entity.js";
import Vector from "../Utils/Vector.js";

export default class Enemy extends Entity {

    constructor(position, player) {

        super(position, 32, 32, "green");

        this.player = player;

        this.speed = 120;

        this.health = 50;
        this.maxHealth = 50;

        this.originalColor = "green";

        this.damageCooldown = 0;

        // Damage to player
        this.contactDamage = 10;
    }

    update(deltaTime) {

        // Direction towards player
        let direction = new Vector(
            this.player.position.x - this.position.x,
            this.player.position.y - this.position.y
        );

        // Normalize direction and apply speed
        this.velocity = direction.normalize().times(this.speed);

        // Cooldown timer
        if (this.damageCooldown > 0) {
            this.damageCooldown -= deltaTime;
        }

        // Distance check
        const distanceX = Math.abs(
            this.player.position.x - this.position.x
        );

        const distanceY = Math.abs(
            this.player.position.y - this.position.y
        );

        // Collision with player
        if (
            distanceX < 32 &&
            distanceY < 32 &&
            this.damageCooldown <= 0
        ) {

            // DAMAGE PLAYER
            this.player.takeDamage(this.contactDamage);

            // Visual feedback
            this.color = "red";

            this.damageCooldown = 0.5;
        }

        // Restore color
        if (this.damageCooldown <= 0 && !this.isDead) {
            this.color = this.originalColor;
        }

        // Apply movement
        super.update(deltaTime);
    }

    die() {
        this.isDead = true;
    }
}