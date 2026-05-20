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
    }

    update(deltaTime) {
        if (this.isDead) return;

        // Direction towards player
        const direction = new Vector(
            this.player.position.x - this.position.x,
            this.player.position.y - this.position.y
        );

        this.velocity = direction.normalize().times(this.speed);

        // Tick contact-damage cooldown
        if (this.damageCooldown > 0) this.damageCooldown -= deltaTime;

        // Contact damage to player
        const distanceX = Math.abs(this.player.position.x - this.position.x);
        const distanceY = Math.abs(this.player.position.y - this.position.y);

        if (distanceX < 32 && distanceY < 32 && this.damageCooldown <= 0) {
            this.player.takeDamage(this.contactDamage);
            this.damageCooldown = 0.5;
        }

        // Tick timers + apply movement (Entity.update)
        super.update(deltaTime);
    }

    // Enemies don't need player-style invincibility frames — only flash white on hit
    takeDamage(amount) {
        if (this.isDead) return;
        this.health = Math.max(0, this.health - amount);
        this._flashTimer = 0.12;
        if (this.health === 0) this.isDead = true;
    }

    draw(renderer) {
        super.draw(renderer);

        // Health bar above sprite
        const BAR_W = this.width;
        const BAR_H = 4;
        const bx    = this.position.x - this.width / 2;
        const by    = this.position.y - this.height / 2 - BAR_H - 2;
        renderer.drawRect(bx, by, BAR_W, BAR_H, "#333333");
        const fill = Math.max(0, (this.health / this.maxHealth) * BAR_W);
        renderer.drawRect(bx, by, fill, BAR_H, "#22cc44");
    }

    die() {

        this.isDead = true;
    }
}