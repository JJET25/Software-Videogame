import Vector from "../Utils/Vector.js";

export default class Entity {
    constructor(position, width, height, color, options = {}) {
        this.position = position;
        this.velocity = new Vector(0, 0);
        this.width = width;
        this.height = height;

        // Hitbox settings
        // Use options to change size/offset if you want other hitbox it doesn't fit with sprite size
        this.hitboxWidth = options.hitboxWidth ?? width;
        this.hitboxHeight = options.hitboxHeight ?? height;
        this.hitboxOffset = options.hitboxOffset ?? new Vector(0, 0);

        this.color = color;

        this.health = 100;
        this.maxHealth = 100;

        this.isDead = false;
    }

    // Returns the hitbox edges for collisions
    getBounds() {
        return {
            left: this.position.x + this.hitboxOffset.x - this.hitboxWidth / 2,
            right: this.position.x + this.hitboxOffset.x + this.hitboxWidth / 2,
            top: this.position.y + this.hitboxOffset.y - this.hitboxHeight / 2,
            bottom: this.position.y + this.hitboxOffset.y + this.hitboxHeight / 2
        }
    }

    takeDamage(amount) {
        this.health -= amount;

        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }
    }

    heal(amount) {
        this.health += amount;

        if (this.health > this.maxHealth) {
            this.health = this.maxHealth;
        }
    }

    die() {
        this.isDead = true;
    }

    // Draws the entity, it centers the obj on its position
    draw(renderer) {
        const drawX = this.position.x - this.width / 2;
        const drawY = this.position.y - this.height / 2;

        renderer.drawRect(drawX, drawY, this.width, this.height, this.color);
    }

    // Update position based on velocity and time passed
    update(deltaTime) {
        this.position = this.position.plus(this.velocity.times(deltaTime));
    }
}