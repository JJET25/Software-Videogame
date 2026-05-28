import { ROOM_WIDTH, ROOM_HEIGHT } from "../Utils/Constants.js";
import { CardType } from "../cards/Card.js";

// Card tile dimensions (game-space pixels)
const CARD_W   = 26;
const CARD_H   = 34;
const CARD_GAP = 3;

// Vertical positions for each section's card row
const ACTIVE_ROW_Y  = 23;
const AUTO_ROW_Y    = 72;
const STORE_ROW_Y   = 121;

// Number of storage slots shown per page (matches max auto count for visual consistency)
const STORE_PAGE_SIZE = 8;

const RARITY_COLOR = {
    common:    "#888888",
    uncommon:  "#55aa55",
    rare:      "#4488ff",
    epic:      "#aa44ff",
    legendary: "#ffaa00",
};

// Interactive deck management overlay — opened with TAB.
// Click a card to pick it up, click a destination slot to assign/swap it.
// Active cards can only go into active slots; auto cards into auto slots; both into storage.
export default class DeckScreen {
    constructor() {
        this._open      = false;
        this._selected  = null;  // { card, fromType, fromIndex } or null
        this._storePage = 0;
    }

    get isOpen() { return this._open; }

    update(input, mouse, cardManager) {
        if (input.wasKeyPressed("TAB")) {
            this._open = !this._open;
            if (!this._open) this._selected = null;
        }
        if (!this._open) return;

        // Storage page navigation via arrow keys
        const totalPages = Math.max(1, Math.ceil(cardManager.storage.length / STORE_PAGE_SIZE));
        if (input.wasKeyPressed("ARROWLEFT"))  this._storePage = Math.max(0, this._storePage - 1);
        if (input.wasKeyPressed("ARROWRIGHT")) this._storePage = Math.min(totalPages - 1, this._storePage + 1);
        this._storePage = Math.min(this._storePage, totalPages - 1);

        if (!mouse.consumeClick()) return;

        const pos = mouse.position;
        const hit = this._hitTest(pos, cardManager);

        if (!this._selected) {
            // Pick up the card at clicked location (ignore clicks on empty slots)
            const card = hit ? this._cardAt(hit, cardManager) : null;
            if (card) this._selected = { card, fromType: hit.type, fromIndex: hit.index };
        } else {
            if (hit) {
                const src  = this._selected.card;
                const ok   = hit.type === 'storage'
                    || (hit.type === 'active'  && src.type === CardType.ACTIVE)
                    || (hit.type === 'auto'    && src.type === CardType.AUTOMATIC);
                if (ok) cardManager.assignToSlot(src, hit.type, hit.index);
            }
            this._selected = null;
        }
    }

    draw(renderer, cardManager) {
        if (!this._open) return;

        renderer.drawFlash("rgba(0, 0, 0, 0.91)");

        // Title
        renderer.drawText("— MANAGE DECK —", ROOM_WIDTH / 2 - 38, 10, "8px monospace", "#ffffff");

        // Active section
        renderer.drawText("ACTIVE  [1-5]", 8, 21, "7px monospace", "#888888");
        this._drawRow(renderer, cardManager.activeSlots, cardManager.activeSlotCount, ACTIVE_ROW_Y, 'active');
        // Slot-number hints below active cards
        const activeRects = this._rowRects(cardManager.activeSlotCount, ACTIVE_ROW_Y);
        for (let i = 0; i < cardManager.activeSlotCount; i++) {
            const r = activeRects[i];
            renderer.drawText(String(i + 1), r.x + Math.floor(CARD_W / 2) - 2, ACTIVE_ROW_Y + CARD_H + 7, "6px monospace", "#444444");
        }

        // Auto section
        renderer.drawText("AUTO", 8, AUTO_ROW_Y - 7, "7px monospace", "#888888");
        this._drawRow(renderer, cardManager.autoSlots, cardManager.autoSlotCount, AUTO_ROW_Y, 'auto');

        // Storage section
        const total = cardManager.storage.length;
        const totalPages = Math.max(1, Math.ceil(total / STORE_PAGE_SIZE));
        const storeLabel = total === 0 ? "STORAGE  (empty)" : `STORAGE  [${total}]`;
        renderer.drawText(storeLabel, 8, STORE_ROW_Y - 7, "7px monospace", "#888888");
        const pageStart   = this._storePage * STORE_PAGE_SIZE;
        const pageCards   = cardManager.storage.slice(pageStart, pageStart + STORE_PAGE_SIZE);
        this._drawStoragePage(renderer, pageCards, pageStart, cardManager);
        if (totalPages > 1) {
            renderer.drawText(
                `< pg ${this._storePage + 1}/${totalPages} >`,
                ROOM_WIDTH / 2 - 24, STORE_ROW_Y + CARD_H + 9,
                "6px monospace", "#555555"
            );
        }

        // "Moving" indicator
        if (this._selected) {
            const name = this._selected.card.name;
            renderer.drawText(
                `MOVING: ${name}`,
                ROOM_WIDTH / 2 - Math.floor(name.length * 3.5) - 22, ROOM_HEIGHT - 16,
                "7px monospace", "#ffcc33"
            );
        }

        // Footer
        renderer.drawText(
            "[TAB] CLOSE   [CLICK] SELECT / ASSIGN",
            ROOM_WIDTH / 2 - 68, ROOM_HEIGHT - 5,
            "6px monospace", "#444444"
        );
    }

    // ── private helpers ──────────────────────────────────────────────────────

    _drawRow(renderer, slots, count, rowY, type) {
        const rects = this._rowRects(count, rowY);
        for (let i = 0; i < count; i++) {
            const card      = slots[i];
            const isPickedUp = this._selected?.card === card && card !== null;
            this._drawCard(renderer, card, rects[i], isPickedUp);
        }
    }

    _drawStoragePage(renderer, pageCards, pageStart, cardManager) {
        const rects = this._rowRects(STORE_PAGE_SIZE, STORE_ROW_Y);
        for (let i = 0; i < STORE_PAGE_SIZE; i++) {
            const card      = pageCards[i] ?? null;
            const isPickedUp = this._selected?.card === card && card !== null;
            this._drawCard(renderer, card, rects[i], isPickedUp);
        }
    }

    _drawCard(renderer, card, rect, isPickedUp) {
        const { x, y, w, h } = rect;

        if (card) {
            const col  = RARITY_COLOR[card.rarity] ?? "#888888";
            const bg   = isPickedUp ? "#2a261a" : "#1a1a1a";

            renderer.drawRect(x, y, w, h, bg);
            renderer.drawRect(x, y, 3, h, col);

            // Abbreviated name — up to 4 characters
            const abbr = card.name.length > 4 ? card.name.slice(0, 4) : card.name;
            renderer.drawText(abbr, x + 5, y + 12, "6px monospace", "#cccccc");

            // Level pips at bottom
            for (let lv = 0; lv < 3; lv++) {
                renderer.drawRect(x + 5 + lv * 7, y + h - 6, 5, 3, lv < card.level ? col : "#2a2a2a");
            }

            // Bright border when picked up
            if (isPickedUp) {
                renderer.drawRect(x,         y,         w, 1, "#ffcc33");
                renderer.drawRect(x,         y + h - 1, w, 1, "#ffcc33");
                renderer.drawRect(x,         y,         1, h, "#ffcc33");
                renderer.drawRect(x + w - 1, y,         1, h, "#ffcc33");
            }
        } else {
            // Empty slot
            renderer.drawRect(x, y, w, h, "#0d0d0d");
            renderer.drawRect(x, y, 3, h, "#1e1e1e");
        }
    }

    // Returns the rectangular bounds for `count` cards centered horizontally at `rowY`
    _rowRects(count, rowY) {
        const rowW   = count * CARD_W + (count - 1) * CARD_GAP;
        const startX = Math.floor((ROOM_WIDTH - rowW) / 2);
        return Array.from({ length: count }, (_, i) => ({
            x: startX + i * (CARD_W + CARD_GAP),
            y: rowY,
            w: CARD_W,
            h: CARD_H,
        }));
    }

    // Returns { type, index } for the slot under `pos`, or null
    _hitTest(pos, cardManager) {
        const activeRects = this._rowRects(cardManager.activeSlotCount, ACTIVE_ROW_Y);
        for (let i = 0; i < cardManager.activeSlotCount; i++) {
            if (this._inRect(pos, activeRects[i])) return { type: 'active', index: i };
        }

        const autoRects = this._rowRects(cardManager.autoSlotCount, AUTO_ROW_Y);
        for (let i = 0; i < cardManager.autoSlotCount; i++) {
            if (this._inRect(pos, autoRects[i])) return { type: 'auto', index: i };
        }

        const storeRects = this._rowRects(STORE_PAGE_SIZE, STORE_ROW_Y);
        const pageStart  = this._storePage * STORE_PAGE_SIZE;
        for (let i = 0; i < STORE_PAGE_SIZE; i++) {
            if (this._inRect(pos, storeRects[i])) return { type: 'storage', index: pageStart + i };
        }

        return null;
    }

    _cardAt(hit, cardManager) {
        if (hit.type === 'active')  return cardManager.activeSlots[hit.index] ?? null;
        if (hit.type === 'auto')    return cardManager.autoSlots[hit.index]   ?? null;
        if (hit.type === 'storage') return cardManager.storage[hit.index]     ?? null;
        return null;
    }

    _inRect(pos, rect) {
        return pos.x >= rect.x && pos.x < rect.x + rect.w
            && pos.y >= rect.y && pos.y < rect.y + rect.h;
    }
}
