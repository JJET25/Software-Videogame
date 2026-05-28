import {
    SHOP_CARD_POOL,
    SELL_VALUE,
    ACTIVE_SLOT_UPGRADE_COSTS,
    AUTO_SLOT_UPGRADE_COSTS,
} from '../Data/ShopItems.js';

import {
    ROOM_WIDTH,
    ROOM_HEIGHT
} from '../Utils/Constants.js';

const RARITY_COLOR = {
    common: '#888888',
    rare: '#4488ff',
    epic: '#aa44ff',
    legendary: '#ffaa00',
};

const TAB_NAMES = ['BUY', 'SELL', 'UPGRADE'];

// SHOP SIZE
const PW = 220;
const PH = 150;

// CENTERED
const PX = Math.floor((ROOM_WIDTH - PW) / 2);
const PY = Math.floor((ROOM_HEIGHT - PH) / 2);

const CONTENT_Y = PY + 40;

const ROW_H = 18;

const MAX_VISIBLE = 5;

export default class StoreUI {

    constructor() {

        this.isOpen = false;

        this.tab = 0;

        this.cursor = 0;

        this._scrollTop = 0;

        this.offerings = [];
    }

    open() {

        if (this.isOpen) return;

        this.isOpen = true;

        this.tab = 0;

        this.cursor = 0;

        this._scrollTop = 0;

        if (this.offerings.length === 0) {
            this._generateOfferings();
        }
    }

    _generateOfferings() {

        const pool = [...SHOP_CARD_POOL];

        while (
            this.offerings.length < 5 &&
            pool.length > 0
        ) {

            const i = Math.floor(
                Math.random() * pool.length
            );

            const {
                factory,
                cost
            } = pool.splice(i, 1)[0];

            this.offerings.push({
                card: factory(),
                cost,
                sold: false
            });
        }
    }

    _getTabItems(cardManager) {

        if (this.tab === 0) {

            return this.offerings.filter(
                o => !o.sold
            );
        }

        if (this.tab === 1) {

            const active =
                cardManager.activeSlots
                    .slice(
                        0,
                        cardManager.activeSlotCount
                    )
                    .filter(Boolean);

            const auto =
                cardManager.autoSlots
                    .slice(
                        0,
                        cardManager.autoSlotCount
                    )
                    .filter(Boolean);

            return [...active, ...auto]
                .map(card => ({
                    card,
                    cost: SELL_VALUE[card.rarity]
                }));
        }

        const aIdx =
            cardManager.activeSlotCount - 3;

        const uIdx =
            cardManager.autoSlotCount - 4;

        return [

            aIdx < ACTIVE_SLOT_UPGRADE_COSTS.length

                ? {
                    label:
                        `Active (${cardManager.activeSlotCount}/5)`,

                    cost:
                        ACTIVE_SLOT_UPGRADE_COSTS[aIdx],

                    action: 'upgradeActive'
                }

                : {
                    label: 'Active MAX',
                    cost: null,
                    action: null
                },

            uIdx < AUTO_SLOT_UPGRADE_COSTS.length

                ? {
                    label:
                        `Auto (${cardManager.autoSlotCount}/8)`,

                    cost:
                        AUTO_SLOT_UPGRADE_COSTS[uIdx],

                    action: 'upgradeAuto'
                }

                : {
                    label: 'Auto MAX',
                    cost: null,
                    action: null
                }
        ];
    }

    _syncScroll(totalItems) {

        if (this.cursor < this._scrollTop) {

            this._scrollTop = this.cursor;
        }

        else if (
            this.cursor >=
            this._scrollTop + MAX_VISIBLE
        ) {

            this._scrollTop =
                this.cursor - MAX_VISIBLE + 1;
        }

        this._scrollTop = Math.max(
            0,

            Math.min(
                this._scrollTop,

                Math.max(
                    0,
                    totalItems - MAX_VISIBLE
                )
            )
        );
    }

    _confirm(player, cardManager) {

        const items =
            this._getTabItems(cardManager);

        if (items.length === 0) return;

        const idx = Math.min(
            this.cursor,
            items.length - 1
        );

        const item = items[idx];

        // BUY
        if (this.tab === 0) {

            if (
                item.sold ||
                player.credits < item.cost
            ) return;

            const result =
                cardManager.addCard(item.card);

            if (
                result.added ||
                result.creditsAwarded > 0
            ) {

                player.credits -= item.cost;

                item.sold = true;

                if (result.creditsAwarded > 0) {

                    player.addCredits(
                        result.creditsAwarded
                    );
                }

                const remaining =
                    this.offerings.filter(
                        o => !o.sold
                    ).length;

                this.cursor = Math.min(
                    this.cursor,
                    Math.max(0, remaining - 1)
                );
            }
        }

        // SELL
        else if (this.tab === 1) {

            cardManager.removeCard(item.card);

            player.addCredits(item.cost);

            const after =
                this._getTabItems(cardManager);

            this.cursor = Math.min(
                this.cursor,
                Math.max(0, after.length - 1)
            );
        }

        // UPGRADE
        else {

            if (
                !item.action ||
                item.cost === null ||
                player.credits < item.cost
            ) return;

            player.credits -= item.cost;

            if (item.action === 'upgradeActive') {

                cardManager.activeSlotCount++;
            }

            else if (item.action === 'upgradeAuto') {

                cardManager.autoSlotCount++;
            }
        }
    }

    update(input, player, cardManager) {

        if (!this.isOpen) return;

        if (input.wasKeyPressed('Q')) {

            this.isOpen = false;

            return;
        }

        if (input.wasKeyPressed('1')) {

            this.tab = 0;

            this.cursor = 0;

            this._scrollTop = 0;
        }

        if (input.wasKeyPressed('2')) {

            this.tab = 1;

            this.cursor = 0;

            this._scrollTop = 0;
        }

        if (input.wasKeyPressed('3')) {

            this.tab = 2;

            this.cursor = 0;

            this._scrollTop = 0;
        }

        const items =
            this._getTabItems(cardManager);

        const max = Math.max(
            0,
            items.length - 1
        );

        if (
            input.wasKeyPressed('W') ||
            input.wasKeyPressed('ARROWUP')
        ) {

            this.cursor = Math.max(
                0,
                this.cursor - 1
            );

            this._syncScroll(items.length);
        }

        if (
            input.wasKeyPressed('S') ||
            input.wasKeyPressed('ARROWDOWN')
        ) {

            this.cursor = Math.min(
                max,
                this.cursor + 1
            );

            this._syncScroll(items.length);
        }

        if (input.wasKeyPressed('E')) {

            this._confirm(
                player,
                cardManager
            );
        }
    }

    draw(renderer, player, cardManager) {

        if (!this.isOpen) return;

        const items =
            this._getTabItems(cardManager);

        const clampCursor = Math.min(
            this.cursor,
            Math.max(0, items.length - 1)
        );

        const visible =
            items.slice(
                this._scrollTop,
                this._scrollTop + MAX_VISIBLE
            );

        const visibleCursor =
            clampCursor - this._scrollTop;

        // BACKDROP
        renderer.drawRect(
            0,
            0,
            ROOM_WIDTH,
            ROOM_HEIGHT,
            'rgba(0,0,0,0.84)'
        );

        // PANEL
        renderer.drawRect(
            PX,
            PY,
            PW,
            PH,
            '#0c0c18'
        );

        renderer.drawRect(
            PX,
            PY,
            PW,
            2,
            '#2a3a5a'
        );

        renderer.drawRect(
            PX,
            PY + PH - 2,
            PW,
            2,
            '#2a3a5a'
        );

        renderer.drawRect(
            PX,
            PY,
            2,
            PH,
            '#2a3a5a'
        );

        renderer.drawRect(
            PX + PW - 2,
            PY,
            2,
            PH,
            '#2a3a5a'
        );

        // HEADER
        renderer.drawText(
            `CR ${player.credits}`,
            PX + 8,
            PY + 12,
            '11px monospace',
            '#ffcc33'
        );

        renderer.drawText(
            'SHOP',
            PX + PW / 2 - 18,
            PY + 12,
            '12px monospace',
            '#ffffff'
        );

        renderer.drawText(
            '[Q]',
            PX + PW - 26,
            PY + 12,
            '10px monospace',
            '#444455'
        );

        // TABS
        const tabPadding = 4;

        const tabW =
            Math.floor(
                (PW - tabPadding * 4) / 3
            );

        for (let i = 0; i < 3; i++) {

            const tx =
                PX +
                tabPadding +
                i * (tabW + tabPadding);

            renderer.drawRect(
                tx,
                PY + 18,
                tabW,
                14,
                i === this.tab
                    ? '#182030'
                    : '#080812'
            );

            renderer.drawText(
                TAB_NAMES[i],

                tx + Math.floor(tabW / 2) - 18,

                PY + 29,

                '10px monospace',

                i === this.tab
                    ? '#99bbee'
                    : '#333344'
            );
        }

        // ITEMS
        for (let i = 0; i < visible.length; i++) {

            const item = visible[i];

            const iy =
                CONTENT_Y + i * ROW_H;

            const isSelected =
                i === visibleCursor;

            if (isSelected) {

                renderer.drawRect(
                    PX + 4,
                    iy - 1,
                    PW - 8,
                    ROW_H,
                    '#111828'
                );
            }

            renderer.drawText(
                isSelected ? '>' : ' ',

                PX + 6,

                iy + 12,

                '10px monospace',

                '#6688aa'
            );

            if (
                this.tab === 0 ||
                this.tab === 1
            ) {

                const {
                    card,
                    cost
                } = item;

                const rColor =
                    RARITY_COLOR[card.rarity]
                    ?? '#888888';

                renderer.drawRect(
                    PX + 14,
                    iy + 2,
                    4,
                    ROW_H - 4,
                    rColor
                );

                renderer.drawText(
                    card.name,

                    PX + 24,

                    iy + 12,

                    '10px monospace',

                    '#cccccc'
                );

                if (this.tab === 0) {

                    const color =
                        player.credits >= cost
                            ? '#ffcc33'
                            : '#883322';

                    renderer.drawText(
                        `${cost}`,

                        PX + PW - 34,

                        iy + 12,

                        '10px monospace',

                        color
                    );
                }

                else {

                    renderer.drawText(
                        `+${cost}`,

                        PX + PW - 40,

                        iy + 12,

                        '10px monospace',

                        '#44cc88'
                    );
                }
            }

            else {

                const {
                    label,
                    cost
                } = item;

                renderer.drawText(
                    label,

                    PX + 24,

                    iy + 12,

                    '10px monospace',

                    '#cccccc'
                );

                if (cost !== null) {

                    const color =
                        player.credits >= cost
                            ? '#ffcc33'
                            : '#883322';

                    renderer.drawText(
                        `${cost}`,

                        PX + PW - 34,

                        iy + 12,

                        '10px monospace',

                        color
                    );
                }

                else {

                    renderer.drawText(
                        'MAX',

                        PX + PW - 30,

                        iy + 12,

                        '10px monospace',

                        '#44cc88'
                    );
                }
            }
        }

        // FOOTER
        renderer.drawText(

            '[W/S] MOVE   [E] SELECT',

            PX + 8,

            PY + PH - 8,

            '8px monospace',

            '#2a3a5a'
        );
    }
}