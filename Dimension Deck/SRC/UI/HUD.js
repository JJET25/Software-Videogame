import { ROOM_HEIGHT, ROOM_WIDTH } from "../Utils/Constants.js";

const BAR_WIDTH    = 120;
const BAR_HEIGHT   = 10;
const BAR_X        = 10;
const BAR_Y        = ROOM_HEIGHT - 26;
const FLASH_DURATION = 0.25; // seconds

const SLOT_SIZE = 28;
const SLOT_GAP  = 4;
const SLOTS_Y   = ROOM_HEIGHT - 34;

const RARITY_COLOR = {
    common:    "#888888",
    rare:      "#4488ff",
    epic:      "#aa44ff",
    legendary: "#ffaa00",
};

export default class HUD {
    constructor() {
        this._screenFlashTimer = 0;
    }

    triggerDamageFlash() {
        this._screenFlashTimer = FLASH_DURATION;
    }

    update(deltaTime) {
        if (this._screenFlashTimer > 0) this._screenFlashTimer -= deltaTime;
    }

    draw(renderer, player, cardManager = null) {
        this._drawHealthBar(renderer, player);
        this._drawDashIndicator(renderer, player);
        if (cardManager) this._drawCardSlots(renderer, cardManager);
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

    _drawCardSlots(renderer, cardManager) {
        const count  = cardManager.activeSlotCount;
        const totalW = count * SLOT_SIZE + (count - 1) * SLOT_GAP;
        const startX = Math.floor((ROOM_WIDTH - totalW) / 2);

        for (let i = 0; i < count; i++) {
            const x    = startX + i * (SLOT_SIZE + SLOT_GAP);
            const y    = SLOTS_Y;
            const card = cardManager.activeSlots[i];
            const selected = cardManager.selectedIndex === i;

            // Slot background
            renderer.drawRect(x, y, SLOT_SIZE, SLOT_SIZE, "#1a1a1a");

            // Border — 1px drawn as four thin rects
            const borderColor = selected ? "#ffffff" : "#444444";
            renderer.drawRect(x - 1, y - 1, SLOT_SIZE + 2, 1, borderColor);
            renderer.drawRect(x - 1, y + SLOT_SIZE, SLOT_SIZE + 2, 1, borderColor);
            renderer.drawRect(x - 1, y, 1, SLOT_SIZE, borderColor);
            renderer.drawRect(x + SLOT_SIZE, y, 1, SLOT_SIZE, borderColor);

            if (card) {
                // Rarity strip along the bottom of the slot
                const rarityColor = RARITY_COLOR[card.rarity] ?? "#888888";
                renderer.drawRect(x, y + SLOT_SIZE - 3, SLOT_SIZE, 3, rarityColor);

                // Card name — truncated to fit
                const label = card.name.length > 5 ? card.name.slice(0, 4) + "." : card.name;
                renderer.drawText(label, x + 2, y + 9, "7px monospace", "#dddddd");

                // Cooldown pie-wipe overlay drawn directly on the canvas context
                if (!cardManager.cooldown.isReady(card.name)) {
                    const progress = cardManager.cooldown.getProgress(card.name);
                    const cx  = x + SLOT_SIZE / 2;
                    const cy  = y + SLOT_SIZE / 2;
                    const r   = SLOT_SIZE / 2;
                    const ctx = renderer.context;

                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(cx, cy);
                    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (1 - progress) * Math.PI * 2);
                    ctx.closePath();
                    ctx.fillStyle = "rgba(0, 0, 0, 0.68)";
                    ctx.fill();
                    ctx.restore();

                    // Remaining seconds centred in the slot
                    const rem = cardManager.cooldown.getRemaining(card.name).toFixed(1);
                    renderer.drawText(rem, x + 7, y + 18, "8px monospace", "#aaaaaa");
                }
            }

            // Key-number label — bottom-right corner
            renderer.drawText(
                String(i + 1),
                x + SLOT_SIZE - 8, y + SLOT_SIZE - 5,
                "7px monospace",
                selected ? "#ffffff" : "#555555"
            );
        }
    }

    _drawScreenFlash(renderer) {
        if (this._screenFlashTimer <= 0) return;
        const alpha = (this._screenFlashTimer / FLASH_DURATION) * 0.38;
        renderer.drawFlash(`rgba(200, 0, 0, ${alpha.toFixed(2)})`);
    }
}
