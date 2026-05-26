import {
    SHOP_CARD_POOL,
    SELL_VALUE,
    ACTIVE_SLOT_UPGRADE_COSTS,
    AUTO_SLOT_UPGRADE_COSTS,
} from '../Data/ShopItems.js';
import { ROOM_WIDTH, ROOM_HEIGHT } from '../Utils/Constants.js';

const RARITY_COLOR = {
    common:    '#888888',
    rare:      '#4488ff',
    epic:      '#aa44ff',
    legendary: '#ffaa00',
};

const TAB_NAMES   = ['BUY', 'SELL', 'UPGRADE'];
const PX          = 30;
const PY          = 18;
const PW          = 420;
const PH          = 316;
const CONTENT_Y   = PY + 62;
const ROW_H       = 24;
const MAX_VISIBLE = 8;

// Three-tab store overlay — buy cards, sell cards, upgrade active/auto slot counts
export default class StoreUI {
    constructor() {
        this.isOpen     = false;
        this.tab        = 0;
        this.cursor     = 0;
        this._scrollTop = 0;
        this.offerings  = [];
    }

    // Opens the store; generates the five card offerings once per shop room visit
    open() {
        if (this.isOpen) return;
        this.isOpen     = true;
        this.tab        = 0;
        this.cursor     = 0;
        this._scrollTop = 0;
        if (this.offerings.length === 0) this._generateOfferings();
    }

    // Picks five unique random cards from the pool for this shop instance
    _generateOfferings() {
        const pool = [...SHOP_CARD_POOL];
        while (this.offerings.length < 5 && pool.length > 0) {
            const i = Math.floor(Math.random() * pool.length);
            const { factory, cost } = pool.splice(i, 1)[0];
            this.offerings.push({ card: factory(), cost, sold: false });
        }
    }

    // Returns the item list for the current tab based on live game state
    _getTabItems(cardManager) {
        if (this.tab === 0) return this.offerings.filter(o => !o.sold);

        if (this.tab === 1) {
            const active = cardManager.activeSlots.slice(0, cardManager.activeSlotCount).filter(Boolean);
            const auto   = cardManager.autoSlots.slice(0, cardManager.autoSlotCount).filter(Boolean);
            return [...active, ...auto].map(card => ({ card, cost: SELL_VALUE[card.rarity] }));
        }

        // UPGRADE tab — one row per slot type
        const aIdx = cardManager.activeSlotCount - 3;
        const uIdx = cardManager.autoSlotCount   - 4;
        return [
            aIdx < ACTIVE_SLOT_UPGRADE_COSTS.length
                ? { label: `Active Slots (${cardManager.activeSlotCount}/5)`, cost: ACTIVE_SLOT_UPGRADE_COSTS[aIdx], action: 'upgradeActive' }
                : { label: 'Active Slots  (MAX)',                             cost: null,                            action: null },
            uIdx < AUTO_SLOT_UPGRADE_COSTS.length
                ? { label: `Auto Slots (${cardManager.autoSlotCount}/8)`,    cost: AUTO_SLOT_UPGRADE_COSTS[uIdx],   action: 'upgradeAuto' }
                : { label: 'Auto Slots  (MAX)',                               cost: null,                            action: null },
        ];
    }

    // Scrolls the visible window to keep the cursor in view
    _syncScroll(totalItems) {
        if (this.cursor < this._scrollTop) this._scrollTop = this.cursor;
        else if (this.cursor >= this._scrollTop + MAX_VISIBLE) this._scrollTop = this.cursor - MAX_VISIBLE + 1;
        this._scrollTop = Math.max(0, Math.min(this._scrollTop, Math.max(0, totalItems - MAX_VISIBLE)));
    }

    // Executes the buy, sell, or upgrade action for the selected item
    _confirm(player, cardManager) {
        const items = this._getTabItems(cardManager);
        if (items.length === 0) return;

        const idx  = Math.min(this.cursor, items.length - 1);
        const item = items[idx];

        if (this.tab === 0) {
            if (item.sold || player.credits < item.cost) return;
            const result = cardManager.addCard(item.card);
            if (result.added || result.creditsAwarded > 0) {
                player.credits -= item.cost;
                item.sold = true;
                if (result.creditsAwarded > 0) player.addCredits(result.creditsAwarded);
                const remaining = this.offerings.filter(o => !o.sold).length;
                this.cursor = Math.min(this.cursor, Math.max(0, remaining - 1));
            }
        } else if (this.tab === 1) {
            cardManager.removeCard(item.card);
            player.addCredits(item.cost);
            const after = this._getTabItems(cardManager);
            this.cursor = Math.min(this.cursor, Math.max(0, after.length - 1));
        } else {
            if (!item.action || item.cost === null || player.credits < item.cost) return;
            player.credits -= item.cost;
            if (item.action === 'upgradeActive') cardManager.activeSlotCount++;
            else if (item.action === 'upgradeAuto') cardManager.autoSlotCount++;
        }
    }

    // Called every frame while the shop is open
    // Keys: W/S navigate, 1/2/3 switch tabs, E confirm, Q close
    update(input, player, cardManager) {
        if (!this.isOpen) return;

        if (input.wasKeyPressed('Q')) { this.isOpen = false; return; }

        if (input.wasKeyPressed('1')) { this.tab = 0; this.cursor = 0; this._scrollTop = 0; }
        if (input.wasKeyPressed('2')) { this.tab = 1; this.cursor = 0; this._scrollTop = 0; }
        if (input.wasKeyPressed('3')) { this.tab = 2; this.cursor = 0; this._scrollTop = 0; }

        const items = this._getTabItems(cardManager);
        const max   = Math.max(0, items.length - 1);

        if (input.wasKeyPressed('W') || input.wasKeyPressed('ARROWUP')) {
            this.cursor = Math.max(0, this.cursor - 1);
            this._syncScroll(items.length);
        }
        if (input.wasKeyPressed('S') || input.wasKeyPressed('ARROWDOWN')) {
            this.cursor = Math.min(max, this.cursor + 1);
            this._syncScroll(items.length);
        }

        if (input.wasKeyPressed('E')) this._confirm(player, cardManager);
    }

    draw(renderer, player, cardManager) {
        if (!this.isOpen) return;

        const items         = this._getTabItems(cardManager);
        const clampCursor   = Math.min(this.cursor, Math.max(0, items.length - 1));
        const visible       = items.slice(this._scrollTop, this._scrollTop + MAX_VISIBLE);
        const visibleCursor = clampCursor - this._scrollTop;

        // Dimmed backdrop and panel border
        renderer.drawRect(0, 0, ROOM_WIDTH, ROOM_HEIGHT, 'rgba(0,0,0,0.84)');
        renderer.drawRect(PX,          PY,          PW,  PH,  '#0c0c18');
        renderer.drawRect(PX,          PY,          PW,  1,   '#2a3a5a');
        renderer.drawRect(PX,          PY + PH - 1, PW,  1,   '#2a3a5a');
        renderer.drawRect(PX,          PY,          1,   PH,  '#2a3a5a');
        renderer.drawRect(PX + PW - 1, PY,          1,   PH,  '#2a3a5a');

        // Header: credits (left), title (center), close hint (right)
        renderer.drawText(`Credits: ${player.credits}`, PX + 8, PY + 12, '8px monospace', '#ffcc33');
        renderer.drawText('MERCHANT',                   PX + PW / 2 - 28, PY + 12, '10px monospace', '#ffffff');
        renderer.drawText('[Q] CLOSE',                  PX + PW - 58, PY + 12, '7px monospace', '#444455');

        // Tab bar
        const tabW = Math.floor(PW / 3);
        for (let i = 0; i < 3; i++) {
            const tx = PX + i * tabW;
            renderer.drawRect(tx + 1, PY + 16, tabW - 2, 16, i === this.tab ? '#182030' : '#080812');
            renderer.drawText(
                `[${i + 1}] ${TAB_NAMES[i]}`,
                tx + tabW / 2 - 22, PY + 28,
                '7px monospace',
                i === this.tab ? '#99bbee' : '#333344'
            );
        }

        renderer.drawRect(PX, PY + 34, PW, 1, '#1a2040');

        // Column headers
        renderer.drawText('NAME', PX + 26, PY + 48, '7px monospace', '#334466');
        renderer.drawText(this.tab === 1 ? 'SELL' : 'COST', PX + PW - 56, PY + 48, '7px monospace', '#334466');
        renderer.drawRect(PX, PY + 52, PW, 1, '#0e1220');

        // Item rows
        if (visible.length === 0) {
            const empty = this.tab === 0 ? 'SOLD OUT' : this.tab === 1 ? 'INVENTORY EMPTY' : '';
            renderer.drawText(empty, PX + PW / 2 - 30, CONTENT_Y + 30, '8px monospace', '#333344');
        }

        for (let i = 0; i < visible.length; i++) {
            const item       = visible[i];
            const iy         = CONTENT_Y + i * ROW_H;
            const isSelected = i === visibleCursor;

            if (isSelected) renderer.drawRect(PX + 4, iy - 3, PW - 8, ROW_H, '#111828');

            renderer.drawText(isSelected ? '>' : ' ', PX + 8, iy + 13, '8px monospace', '#6688aa');

            if (this.tab === 0 || this.tab === 1) {
                const { card, cost } = item;
                const rColor = RARITY_COLOR[card.rarity] ?? '#888888';
                renderer.drawRect(PX + 18, iy + 3, 3, ROW_H - 6, rColor);
                renderer.drawText(card.name, PX + 26, iy + 13, '8px monospace', '#cccccc');

                if (this.tab === 0) {
                    const color = player.credits >= cost ? '#ffcc33' : '#883322';
                    renderer.drawText(`${cost} cr`, PX + PW - 56, iy + 13, '8px monospace', color);
                } else {
                    renderer.drawText(`+${cost} cr`, PX + PW - 58, iy + 13, '8px monospace', '#44cc88');
                }
            } else {
                const { label, cost } = item;
                renderer.drawText(label, PX + 26, iy + 13, '8px monospace', '#cccccc');
                if (cost !== null) {
                    const color = player.credits >= cost ? '#ffcc33' : '#883322';
                    renderer.drawText(`${cost} cr`, PX + PW - 56, iy + 13, '8px monospace', color);
                } else {
                    renderer.drawText('MAX', PX + PW - 46, iy + 13, '8px monospace', '#44cc88');
                }
            }
        }

        // Scroll indicators
        if (this._scrollTop > 0) {
            renderer.drawText('^ more', PX + PW / 2 - 14, CONTENT_Y - 6, '7px monospace', '#2a3a5a');
        }
        if (this._scrollTop + MAX_VISIBLE < items.length) {
            renderer.drawText('v more', PX + PW / 2 - 14, CONTENT_Y + MAX_VISIBLE * ROW_H + 2, '7px monospace', '#2a3a5a');
        }

        // Footer hints
        const action = this.tab === 0 ? 'Buy' : this.tab === 1 ? 'Sell' : 'Upgrade';
        renderer.drawText(
            `[W/S] Navigate   [E] ${action}`,
            PX + 8, PY + PH - 10,
            '7px monospace', '#2a3a5a'
        );
    }
}
