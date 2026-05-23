import Entity from "./Entity.js";
import Vector from "../Utils/Vector.js";
import { Trigger } from "../Cards/AutomaticCard.js";

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

        // Melee strike visual (set by damage cards)
        this._strikeTimer  = 0;
        this._strikeDir    = new Vector(1, 0);
        this._strikeRange  = 120;
        this._strikeSpread = Math.PI * 0.6;
    }

    get isDashing() {

        return this._dashTimer > 0;
    }

    takeDamage(amount) {
        const healthBefore = this.health;
        super.takeDamage(amount);
        if (this.cardManager && this.health < healthBefore) {
            const enemies = this.getEnemies ? this.getEnemies() : [];
            this.cardManager.fireTrigger(Trigger.ON_DAMAGE, { player: this, enemies });
        }
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

            if (this.cardManager) {
                const dashEnemies = this.getEnemies ? this.getEnemies() : [];
                this.cardManager.fireTrigger(Trigger.ON_DASH, { player: this, enemies: dashEnemies });
            }
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

                const enemies   = this.getEnemies ? this.getEnemies() : [];
                const snapshots = enemies.map(e => ({ enemy: e, health: e.health, wasDead: e.isDead }));

                this.cardManager.playSelected({ player: this, enemies, mouse: this.mouse });

                for (const snap of snapshots) {
                    if (snap.wasDead) continue;
                    const combatState = { player: this, enemies, enemy: snap.enemy };
                    if (snap.enemy.isDead) {
                        this.cardManager.fireTrigger(Trigger.ON_KILL, combatState);
                    } else if (snap.enemy.health < snap.health) {
                        this.cardManager.fireTrigger(Trigger.ON_HIT, combatState);
                    }
                }
            }
        }

        if (this._strikeTimer > 0) this._strikeTimer = Math.max(0, this._strikeTimer - deltaTime);

        super.update(deltaTime);
    }

    draw(renderer) {
        // Draw melee arc behind the player sprite
        if (this._strikeTimer > 0) {
            const DURATION = 0.18;
            const alpha    = this._strikeTimer / DURATION;
            const angle    = Math.atan2(this._strikeDir.y, this._strikeDir.x);
            const SPREAD   = this._strikeSpread;
            const r        = this._strikeRange;
            const ctx      = renderer.context;
            const s        = renderer.scale;
            const cx       = this.position.x * s;
            const cy       = this.position.y * s;

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, r * s, angle - SPREAD / 2, angle + SPREAD / 2);
            ctx.closePath();
            ctx.fillStyle   = `rgba(255, 230, 80, ${(alpha * 0.30).toFixed(2)})`;
            ctx.fill();
            ctx.strokeStyle = `rgba(255, 200, 50, ${(alpha * 0.90).toFixed(2)})`;
            ctx.lineWidth   = 2 * s;
            ctx.stroke();
            ctx.restore();
        }

        super.draw(renderer);
    }
}