import { ROOM_WIDTH, ROOM_HEIGHT } from "../Utils/Constants.js";

const CARD_W   = 82;
const CARD_H   = 36;
const CARD_GAP = 6;
const MARGIN_X = 12;

const RARITY_COLOR = {
    common:    "#888888",
    rare:      "#4488ff",
    epic:      "#aa44ff",
    legendary: "#ffaa00",
};

export default class DeckScreen {
    constructor() {
        this._open = false;
    }

    update(input) {
        if (input.wasKeyPressed("TAB")) this._open = !this._open;
    }

    get isOpen() { return this._open; }

    draw(renderer, cardManager) {
        if (!this._open) return;

        // Semi-transparent backdrop
        renderer.drawFlash("rgba(0, 0, 0, 0.88)");

        // Title
        renderer.drawText("— DECK —", ROOM_WIDTH / 2 - 24, 16, "9px monospace", "#ffffff");

        // Active cards section
        renderer.drawText("ACTIVE  CARDS", MARGIN_X, 32, "7px monospace", "#aaaaaa");
        this._drawSlotRow(
            renderer,
            cardManager.activeSlots,
            cardManager.activeSlotCount,
            44,
            "A"
        );

        // Auto cards section
        const autoY = 44 + CARD_H + 20;
        renderer.drawText("AUTO  CARDS", MARGIN_X, autoY - 8, "7px monospace", "#aaaaaa");
        this._drawSlotRow(
            renderer,
            cardManager.autoSlots,
            cardManager.autoSlotCount,
            autoY,
            "AUTO"
        );

        // Footer hint
        renderer.drawText(
            "[TAB] CLOSE",
            ROOM_WIDTH / 2 - 26, ROOM_HEIGHT - 8,
            "7px monospace", "#555555"
        );
    }

    _drawSlotRow(renderer, slots, count, startY, typeBadge) {
        const rowW   = count * CARD_W + (count - 1) * CARD_GAP;
        const startX = Math.floor((ROOM_WIDTH - rowW) / 2);

        for (let i = 0; i < count; i++) {
            const x    = startX + i * (CARD_W + CARD_GAP);
            const card = slots[i];

            if (card) {
                const rarityColor = RARITY_COLOR[card.rarity] ?? "#888888";

                // Card background + rarity left strip
                renderer.drawRect(x, startY, CARD_W, CARD_H, "#1e1e1e");
                renderer.drawRect(x, startY, 4, CARD_H, rarityColor);

                // Card name
                const name = card.name.length > 10 ? card.name.slice(0, 9) + "." : card.name;
                renderer.drawText(name, x + 8, startY + 11, "8px monospace", "#dddddd");

                // Type badge — top right
                renderer.drawRect(x + CARD_W - 22, startY + 2, 20, 10, "#333333");
                renderer.drawText(typeBadge, x + CARD_W - 20, startY + 10, "7px monospace", rarityColor);

                // Level pips
                const pipY = startY + CARD_H - 8;
                for (let lv = 0; lv < 3; lv++) {
                    const filled = lv < card.level;
                    renderer.drawRect(
                        x + 8 + lv * 8, pipY,
                        6, 4,
                        filled ? rarityColor : "#333333"
                    );
                }
            } else {
                // Empty slot
                renderer.drawRect(x, startY, CARD_W, CARD_H, "#111111");
                renderer.drawRect(x, startY, 4, CARD_H, "#333333");
                renderer.drawText("EMPTY", x + 8, startY + 20, "7px monospace", "#333333");
            }
        }
    }
}
