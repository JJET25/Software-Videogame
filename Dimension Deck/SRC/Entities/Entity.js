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

        this._invincibleTimer = 0;
        this._flashTimer = 0;
    }

    get isInvincible() {
        return this._invincibleTimer > 0;
    }

    // Apply damage, respecting invincibility frames and death state
    takeDamage(amount) {
        if (this.isInvincible || this.isDead) return;
        this.health = Math.max(0, this.health - amount);
        this._flashTimer = 0.15;
        if (this.health === 0) {
            this.isDead = true;
        } else {
            this._invincibleTimer = 0.6;
        }
    }

    // Grant invincibility for at least `duration` seconds (does not shorten existing frames)
    grantInvincibility(duration) {
        this._invincibleTimer = Math.max(this._invincibleTimer, duration);
    }

    // Returns the hitbox edges for collisions
    getBounds() {
        return {
            left:   this.position.x + this.hitboxOffset.x - this.hitboxWidth / 2,
            right:  this.position.x + this.hitboxOffset.x + this.hitboxWidth / 2,
            top:    this.position.y + this.hitboxOffset.y - this.hitboxHeight / 2,
            bottom: this.position.y + this.hitboxOffset.y + this.hitboxHeight / 2
        };
    }

    // Draws the entity centered on position; flashes white on damage
    draw(renderer) {
        const drawX = this.position.x - this.width / 2;
        const drawY = this.position.y - this.height / 2;
        const color = this._flashTimer > 0 ? "#ffffff" : this.color;
        renderer.drawRect(drawX, drawY, this.width, this.height, color);
    }

    // Update position and tick damage timers; halts if dead
    update(deltaTime) {
        if (this.isDead) return;
        if (this._invincibleTimer > 0) this._invincibleTimer -= deltaTime;
        if (this._flashTimer > 0)      this._flashTimer     -= deltaTime;
        this.position = this.position.plus(this.velocity.times(deltaTime));
    }
}