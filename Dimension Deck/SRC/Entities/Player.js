import Entity from "./Entity.js";
import Vector from "../Utils/Vector.js";

export default class Player extends Entity {
    constructor(position, input, mouse) {
        super(position, 32, 48, "#4488ff", {
            hitboxHeight: 16,
            hitboxWidth:  16,
            hitboxOffset: new Vector(0, 16)
        });

        this.input = input;
        this.mouse = mouse;
        this.speed = 300;
        this.state = "idle";

        // Direction the player is currently aiming (toward mouse cursor)
        this.aimDirection = new Vector(1, 0);

        // Dash
        this._dashSpeed         = 500;
        this._dashDuration      = 0.15;  // seconds the burst lasts
        this._dashCooldown      = 0.8;   // seconds before next dash is allowed
        this._dashTimer         = 0;
        this._dashCooldownTimer = 0;
    }

    get isDashing() {
        return this._dashTimer > 0;
    }

    update(deltaTime) {
        if (this.isDead) return;

        // Gather movement direction from keyboard
        const raw = new Vector(0, 0);
        if (this.input.isKeyDown("W") || this.input.isKeyDown("ARROWUP"))    raw.y -= 1;
        if (this.input.isKeyDown("S") || this.input.isKeyDown("ARROWDOWN"))  raw.y += 1;
        if (this.input.isKeyDown("A") || this.input.isKeyDown("ARROWLEFT"))  raw.x -= 1;
        if (this.input.isKeyDown("D") || this.input.isKeyDown("ARROWRIGHT")) raw.x += 1;
        const isMoving  = raw.squareLength() > 0;
        const direction = raw.normalize();

        // Track aim direction toward mouse cursor
        if (this.mouse) {
            const toMouse = this.mouse.position.minus(this.position);
            if (toMouse.squareLength() > 0) this.aimDirection = toMouse.normalize();
        }

        // Tick dash cooldown
        if (this._dashCooldownTimer > 0) this._dashCooldownTimer -= deltaTime;

        if (this.isDashing) {
            // Dash in progress: hold velocity, just tick down the timer
            this._dashTimer -= deltaTime;
        } else if (this.input.isKeyDown("SPACE") && this._dashCooldownTimer <= 0) {
            // Trigger dash in movement direction; fall back to aim direction when standing still
            const dashDir = isMoving ? direction : this.aimDirection;
            this.velocity = dashDir.times(this._dashSpeed);
            this._dashTimer         = this._dashDuration;
            this._dashCooldownTimer = this._dashCooldown;
            this.grantInvincibility(this._dashDuration);
        } else {
            // Normal movement
            this.velocity = direction.times(this.speed);
        }

        this.state = isMoving || this.isDashing ? "moving" : "idle";
        super.update(deltaTime);
    }
}