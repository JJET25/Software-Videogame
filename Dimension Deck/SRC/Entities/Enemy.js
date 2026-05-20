import Entity from "./Entity.js";
import Vector from "../Utils/Vector.js";

export default class Enemy extends Entity {

    constructor(position, player) {

        super(position, 32, 32, "green");

        this.player = player;

        // Slower movement
        this.speed = 55;

        this.health = 50;
        this.maxHealth = 50;

        this.originalColor = "green";

        this.damageCooldown = 0;

        // Damage to player
        this.contactDamage = 10;

        this.isDead = false;

        this.droppedCredits = false;
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
            distanceY < 32
        ) {

            // DAMAGE PLAYER
            if (this.damageCooldown <= 0) {

                this.player.takeDamage(
                    this.contactDamage
                );

                this.damageCooldown = 0.5;
            }

            // TEMP DAMAGE TO ENEMY
            this.health -= 2;

            // Flash red
            this.color = "red";
        }

        else {

            this.color = this.originalColor;
        }

        // Death
        if (this.health <= 0) {

            this.die();
        }

        // Apply movement
        super.update(deltaTime);
    }

    die() {

        this.isDead = true;
    }
}