import Entity from "./Entity.js";
import Vector from "../Utils/Vector.js";

export default class Player extends Entity {

    constructor(position, input, mouse) {

        super(position, 32, 64, "#4488ff", {

            hitboxHeight: 32,
            hitboxWidth: 32,
            hitboxOffset: new Vector(0, 16)
        });

        this.input = input;

        this.mouse = mouse;

        this.speed = 300;

        this.state = "idle";

        this.cardManager = null;

        // Credits
        this.credits = 0;

        // Direction the player is currently aiming
        this.aimDirection = new Vector(1, 0);

        // Dash
        this._dashSpeed = 500;

        this._dashDuration = 0.15;

        this._dashCooldown = 0.8;

        this._dashTimer = 0;

        this._dashCooldownTimer = 0;
    }

    get isDashing() {

        return this._dashTimer > 0;
    }

    addCredits(amount) {

        this.credits += amount;
    }

    update(deltaTime) {

        if (this.isDead) return;

        // Gather movement direction
        const raw = new Vector(0, 0);

        if (
            this.input.isKeyDown("W") ||
            this.input.isKeyDown("ARROWUP")
        ) raw.y -= 1;

        if (
            this.input.isKeyDown("S") ||
            this.input.isKeyDown("ARROWDOWN")
        ) raw.y += 1;

        if (
            this.input.isKeyDown("A") ||
            this.input.isKeyDown("ARROWLEFT")
        ) raw.x -= 1;

        if (
            this.input.isKeyDown("D") ||
            this.input.isKeyDown("ARROWRIGHT")
        ) raw.x += 1;

        const isMoving =
            raw.squareLength() > 0;

        const direction =
            raw.normalize();

        // Aim direction
        if (this.mouse) {

            const toMouse =
                this.mouse.position.minus(
                    this.position
                );

            if (toMouse.squareLength() > 0) {

                this.aimDirection =
                    toMouse.normalize();
            }
        }

        // Dash cooldown
        if (this._dashCooldownTimer > 0) {

            this._dashCooldownTimer -= deltaTime;
        }

        if (this.isDashing) {

            this._dashTimer -= deltaTime;
        }

        else if (
            this.input.isKeyDown("SPACE") &&
            this._dashCooldownTimer <= 0
        ) {

            const dashDir =
                isMoving
                    ? direction
                    : this.aimDirection;

            this.velocity =
                dashDir.times(
                    this._dashSpeed
                );

            this._dashTimer =
                this._dashDuration;

            this._dashCooldownTimer =
                this._dashCooldown;

            this.grantInvincibility(
                this._dashDuration
            );
        }

        else {

            this.velocity =
                direction.times(
                    this.speed
                );
        }

        this.state =
            isMoving || this.isDashing
                ? "moving"
                : "idle";

        // Card slots
        if (this.cardManager) {

            for (let i = 0; i < 5; i++) {

                if (
                    this.input.wasKeyPressed(
                        String(i + 1)
                    )
                ) {

                    this.cardManager.selectSlot(i);
                }
            }

            if (this.mouse?.consumeClick()) {

                this.cardManager.playSelected({

                    player: this,

                    enemies: [],

                    mouse: this.mouse,
                });
            }
        }

        super.update(deltaTime);
    }
}