import { ROOM_HEIGHT } from "../Utils/Constants.js";

const BAR_WIDTH    = 120;
const BAR_HEIGHT   = 10;
const BAR_X        = 10;
const BAR_Y        = ROOM_HEIGHT - 26;
const FLASH_DURATION = 0.25; // seconds

export default class HUD {
    constructor() {
        this._screenFlashTimer = 0;
    }

    // Called when the player takes a hit — triggers the red screen overlay
    triggerDamageFlash() {
        this._screenFlashTimer = FLASH_DURATION;
    }

    update(deltaTime) {
        if (this._screenFlashTimer > 0) this._screenFlashTimer -= deltaTime;
    }

    draw(renderer, player) {
        this._drawHealthBar(renderer, player);
        this._drawDashIndicator(renderer, player);
        this._drawScreenFlash(renderer);
    }

    _drawHealthBar(renderer, player) {
        // Background track
        renderer.drawRect(BAR_X, BAR_Y, BAR_WIDTH, BAR_HEIGHT, "#333333");

        // Health fill — green above 40%, red below
        const ratio     = player.health / player.maxHealth;
        const fillWidth = Math.max(0, Math.floor(ratio * BAR_WIDTH));
        const fillColor = ratio > 0.4 ? "#22cc44" : "#dd2222";
        renderer.drawRect(BAR_X, BAR_Y, fillWidth, BAR_HEIGHT, fillColor);

        // HP label
        renderer.drawText(
            `HP  ${player.health} / ${player.maxHealth}`,
            BAR_X,
            BAR_Y - 4,
            "9px monospace",
            "#cccccc"
        );
    }

    _drawDashIndicator(renderer, player) {
        // Show DASH READY tag or a cooldown block below the health bar
        const ready = player._dashCooldownTimer <= 0;
        renderer.drawText(
            ready ? "DASH  READY" : `DASH  ${player._dashCooldownTimer.toFixed(1)}s`,
            BAR_X,
            BAR_Y + BAR_HEIGHT + 12,
            "9px monospace",
            ready ? "#88eeff" : "#556677"
        );
    }

    _drawScreenFlash(renderer) {
        if (this._screenFlashTimer <= 0) return;
        const alpha = (this._screenFlashTimer / FLASH_DURATION) * 0.38;
        renderer.drawFlash(`rgba(200, 0, 0, ${alpha.toFixed(2)})`);
    }
}
