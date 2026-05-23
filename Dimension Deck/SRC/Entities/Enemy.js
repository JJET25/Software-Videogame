import Entity from "./Entity.js";
import Vector from "../Utils/Vector.js";

// Base enemy — moves directly toward the player and deals contact damage
export default class Enemy extends Entity {
    constructor(position, player) {
        super(position, 32, 32, "green");

        this.player        = player;
        this.speed         = 55;
        this.health        = 50;
        this.maxHealth     = 50;
        this.originalColor = "green";
        this.damageCooldown = 0;
        this.contactDamage = 10;
        this.isDead        = false;
        this.droppedCredits = false;
    }

    update(deltaTime) {
        if (this.isDead) return;

        const direction = new Vector(
            this.player.position.x - this.position.x,
            this.player.position.y - this.position.y
        );

        this.velocity = direction.normalize().times(this.speed);

        if (this.damageCooldown > 0) {
            this.damageCooldown -= deltaTime;
        }

        const distanceX = Math.abs(this.player.position.x - this.position.x);
        const distanceY = Math.abs(this.player.position.y - this.position.y);

        if (distanceX < 32 && distanceY < 32) {
            if (this.damageCooldown <= 0) {
                this.player.takeDamage(this.contactDamage);
                this.damageCooldown = 0.5;
            }
            this.health -= 2;
            this.color   = "red";
        } else {
            this.color = this.originalColor;
        }

        if (this.health <= 0) this.die();

        super.update(deltaTime);
    }

    // Skips iframes on enemies — only flashes white on hit
    takeDamage(amount) {
        if (this.isDead) return;
        this.health      = Math.max(0, this.health - amount);
        this._flashTimer = 0.12;
        if (this.health === 0) this.isDead = true;
    }

    // Draws the enemy sprite and a health bar above it
    draw(renderer) {
        super.draw(renderer);

        const BAR_W = this.width;
        const BAR_H = 4;
        const bx    = this.position.x - this.width  / 2;
        const by    = this.position.y - this.height / 2 - BAR_H - 2;
        renderer.drawRect(bx, by, BAR_W, BAR_H, "#333333");
        const fill = Math.max(0, (this.health / this.maxHealth) * BAR_W);
        renderer.drawRect(bx, by, fill, BAR_H, "#22cc44");
    }

    die() {
        this.isDead = true;
    }
}
