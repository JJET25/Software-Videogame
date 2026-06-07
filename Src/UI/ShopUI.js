import {
  SHOP_CARD_POOL,
  SELL_VALUE,
  ACTIVE_SLOT_UPGRADE_COSTS,
  AUTO_SLOT_UPGRADE_COSTS,
} from "../Data/ShopItems.js";
import { randInt } from "../Utils/Random.js";
import { ROOM_WIDTH, ROOM_HEIGHT } from "../Utils/Constants.js";

// --------------------- PALETTE ---------------------
const P = {
  bg: "#111111",
  border: "#333333",
  muted: "#3d3d3d",
  sub: "#7a7a7a",
  text: "#dddddd",
  label: "#999999",
  dim: "#4a4a4a",
  cardBg: "#0c0c0c",
  activeBg: "#0d1522",
  activeFg: "#5588bb",
  autoBg: "#1a1100",
  autoFg: "#bb8833",
  gold: "#ffcc33",
  green: "#44cc88",
  red: "#cc4422",
};

const RARITY_COLOR = {
  common: "#888888",
  rare: "#4488ff",
  epic: "#aa44ff",
  legendary: "#ffaa00",
};

// --------------------- PANEL GEOMETRY ---------------------
const PW = 262,
  PH = 154;
const PX = Math.floor((ROOM_WIDTH - PW) / 2);
const PY = Math.floor((ROOM_HEIGHT - PH) / 2);

const HDR_H = 16;
const TAB_Y = PY + HDR_H;
const TAB_H = 14;
const CARD_TOP = TAB_Y + TAB_H + 1;
const CARD_H = 88;

// Center card
const CW = 72,
  CH = 84;
const CX = PX + 2 + Math.floor((PW - 4 - CW) / 2);
const CY = CARD_TOP + Math.floor((CARD_H - CH) / 2);

// Side cards (smaller, dimmed)
const SW = 56,
  SH = 68;
const SY = CARD_TOP + Math.floor((CARD_H - SH) / 2);
const GAP = 8;
const LX = CX - GAP - SW;
const RX = CX + CW + GAP;

// Info / footer
const INFO_Y = CARD_TOP + CARD_H + 2;
const INFO_H = 14;
const FOOTER_Y = INFO_Y + INFO_H;

const TAB_NAMES = ["BUY", "SELL", "UPGRADE"];

// --------------------- CLASS ---------------------
export default class StoreUI {
  constructor() {
    this.isOpen = false;
    this.tab = 0;
    this.cursor = 0;
    this.offerings = [];
    this._justOpened = false;

    // Load pixel font — falls back to monospace until ready
    this._font = "monospace";
    document.fonts.load("5px 'Press Start 2P'").then(() => {
      this._font = "'Press Start 2P', monospace";
    });
  }

  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.tab = 0;
    this.cursor = 0;
    this._justOpened = true;
    if (this.offerings.length === 0) this._generateOfferings();
  }

  // --------------------- UPDATE ---------------------

  update(input, player, cardManager, mouse = null, audio = null) {
    if (!this.isOpen) return;

    // Skip the first frame to avoid consuming the E that opened the shop
    if (this._justOpened) {
      this._justOpened = false;
      return;
    }

    if (input.wasKeyPressed("Q") || input.wasKeyPressed("ESCAPE")) {
      this.isOpen = false;
      audio?.playSFX("declineUI");
      return;
    }

    // Tab shortcuts
    if (input.wasKeyPressed("1")) {
      this._setTab(0);
      audio?.playSFX("hoverUI");
    }
    if (input.wasKeyPressed("2")) {
      this._setTab(1);
      audio?.playSFX("hoverUI");
    }
    if (input.wasKeyPressed("3")) {
      this._setTab(2);
      audio?.playSFX("hoverUI");
    }

    if (this.tab === 2) {
      this.#updateUpgradeInput(input, cardManager, player);
    } else {
      this.#updateCarouselInput(input, cardManager, player, audio);
    }

    if (mouse?.consumeClick())
      this.#handleClick(mouse.position, player, cardManager);
  }

  // --------------------- DRAW ---------------------

  draw(renderer, player, cardManager, mouse = null) {
    if (!this.isOpen) return;

    const f = this._font;
    const cx = ROOM_WIDTH / 2;

    renderer.drawRect(0, 0, ROOM_WIDTH, ROOM_HEIGHT, "rgba(8,8,8,0.88)");

    this.#drawPanel(renderer);
    this.#drawHeader(renderer, player, f, cx);
    this.#drawTabs(renderer, f);

    if (this.tab === 2) {
      this._drawUpgrades(renderer, player, cardManager, f);
    } else {
      this._drawCarousel(renderer, player, cardManager, f, renderer.context);
    }

    // Footer hint
    renderer.drawRect(PX, FOOTER_Y, PW, 1, P.border);
    const hint =
      this.tab === 0
        ? "[A/D] BROWSE  [E] BUY  [Q] CLOSE"
        : this.tab === 1
          ? "[A/D] BROWSE  [E] SELL  [Q] CLOSE"
          : "[W/S] MOVE  [E] UPGRADE  [Q] CLOSE";
    renderer.drawText(hint, cx, FOOTER_Y + 8, 3, P.dim, {
      align: "center",
      font: f,
    });
  }

  // --------------------- PRIVATE: input ---------------------

  // W/S navigation + E confirm for the upgrade tab
  #updateUpgradeInput(input, cardManager, player) {
    const max = this._upgradeItems(cardManager).length - 1;
    if (input.wasKeyPressed("W") || input.wasKeyPressed("ARROWUP"))
      this.cursor = Math.max(0, this.cursor - 1);
    if (input.wasKeyPressed("S") || input.wasKeyPressed("ARROWDOWN"))
      this.cursor = Math.min(max, this.cursor + 1);
    if (input.wasKeyPressed("E")) this._confirm(player, cardManager);
  }

  // A/D navigation + E confirm for buy/sell carousel
  #updateCarouselInput(input, cardManager, player, audio) {
    const max = Math.max(0, this._carouselItems(cardManager).length - 1);
    if (input.wasKeyPressed("A") || input.wasKeyPressed("ARROWLEFT")) {
      if (this.cursor > 0) {
        this.cursor--;
        audio?.playSFX("hoverUI");
      }
    }
    if (input.wasKeyPressed("D") || input.wasKeyPressed("ARROWRIGHT")) {
      if (this.cursor < max) {
        this.cursor++;
        audio?.playSFX("hoverUI");
      }
    }
    if (input.wasKeyPressed("E")) this._confirm(player, cardManager, audio);
  }

  // Routes a mouse click to tab bar, carousel, or upgrade rows
  #handleClick({ x: mx, y: my }, player, cardManager) {
    // Tab bar
    const tw = Math.floor((PW - 8) / 3);
    for (let i = 0; i < 3; i++) {
      const tx = PX + 4 + i * (tw + 2);
      if (mx >= tx && mx <= tx + tw && my >= TAB_Y && my <= TAB_Y + TAB_H) {
        this._setTab(i);
        return;
      }
    }

    if (this.tab !== 2) {
      this.#handleCarouselClick(mx, my, player, cardManager);
    } else {
      this.#handleUpgradeClick(mx, my, player, cardManager);
    }
  }

  #handleCarouselClick(mx, my, player, cardManager) {
    const items = this._carouselItems(cardManager);
    const cur = Math.min(this.cursor, Math.max(0, items.length - 1));

    if (cur > 0 && mx >= LX && mx <= LX + SW && my >= SY && my <= SY + SH)
      this.cursor = cur - 1;
    else if (
      cur < items.length - 1 &&
      mx >= RX &&
      mx <= RX + SW &&
      my >= SY &&
      my <= SY + SH
    )
      this.cursor = cur + 1;
    else if (mx >= CX && mx <= CX + CW && my >= CY && my <= CY + CH)
      this._confirm(player, cardManager);
  }

  #handleUpgradeClick(mx, my, player, cardManager) {
    const upItems = this._upgradeItems(cardManager);
    const ROW_H = 30;
    for (let i = 0; i < upItems.length; i++) {
      const ry = CARD_TOP + 14 + i * (ROW_H + 8);
      if (mx >= PX + 4 && mx <= PX + PW - 4 && my >= ry && my <= ry + ROW_H) {
        this.cursor = i;
        this._confirm(player, cardManager);
        return;
      }
    }
  }

  // --------------------- PRIVATE: draw ---------------------

  // Draws the panel background and its 4 border edges
  #drawPanel(renderer) {
    renderer.drawRect(PX, PY, PW, PH, P.bg);
    renderer.drawRect(PX, PY, PW, 2, P.border);
    renderer.drawRect(PX, PY + PH - 2, PW, 2, P.border);
    renderer.drawRect(PX, PY, 2, PH, P.border);
    renderer.drawRect(PX + PW - 2, PY, 2, PH, P.border);
  }

  // Draws credits, title and close hint in the header row
  #drawHeader(renderer, player, f, cx) {
    renderer.drawText(`${player.credits} CR`, PX + 6, PY + 11, 5, P.gold, {
      align: "left",
      font: f,
    });

    const ctx = renderer.context;
    ctx.shadowColor = "rgba(200,200,200,0.3)";
    ctx.shadowBlur = Math.round(6 * renderer.scale);
    renderer.drawText("MERCHANT", cx, PY + 11, 6, P.text, {
      align: "center",
      font: f,
    });
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    renderer.drawText("[Q]", PX + PW - 6, PY + 11, 4, P.dim, {
      align: "right",
      font: f,
    });
    renderer.drawRect(PX, PY + HDR_H, PW, 1, P.border);
  }

  // Draws the three BUY / SELL / UPGRADE tab buttons
  #drawTabs(renderer, f) {
    const tw = Math.floor((PW - 8) / 3);
    for (let i = 0; i < 3; i++) {
      const tx = PX + 4 + i * (tw + 2);
      const on = i === this.tab;
      renderer.drawRect(tx, TAB_Y, tw, TAB_H, on ? "#252525" : "#0d0d0d");
      renderer.drawText(
        TAB_NAMES[i],
        tx + Math.floor(tw / 2),
        TAB_Y + 9,
        5,
        on ? P.text : P.muted,
        { align: "center", font: f },
      );
    }
    renderer.drawRect(PX, TAB_Y + TAB_H, PW, 1, P.border);
  }

  _drawCarousel(renderer, player, cardManager, f, ctx) {
    const items = this._carouselItems(cardManager);
    const count = items.length;
    const cur = Math.min(this.cursor, Math.max(0, count - 1));

    if (count === 0) {
      renderer.drawText(
        this.tab === 0 ? "NO CARDS FOR SALE" : "NO CARDS TO SELL",
        ROOM_WIDTH / 2,
        CARD_TOP + 44,
        5,
        P.muted,
        { align: "center", font: f },
      );
      return;
    }

    // Navigation arrows
    if (cur > 0)
      renderer.drawText("◀", LX - 12, CARD_TOP + 44, 7, P.label, {
        align: "center",
        font: f,
      });
    if (cur < count - 1)
      renderer.drawText("▶", RX + SW + 12, CARD_TOP + 44, 7, P.label, {
        align: "center",
        font: f,
      });

    // Dimmed side cards
    if (cur > 0) {
      ctx.globalAlpha = 0.55;
      this._drawCard(renderer, items[cur - 1].card, LX, SY, SW, SH, false, f);
      ctx.globalAlpha = 1;
    }
    if (cur < count - 1) {
      ctx.globalAlpha = 0.55;
      this._drawCard(renderer, items[cur + 1].card, RX, SY, SW, SH, false, f);
      ctx.globalAlpha = 1;
    }

    // Center card + cost strip + description
    const centerItem = items[cur];
    this._drawCard(renderer, centerItem.card, CX, CY, CW, CH, true, f);
    this._drawCostStrip(renderer, centerItem, player, f);

    renderer.drawRect(PX, INFO_Y, PW, 1, P.border);
    renderer.drawText(
      (centerItem.card.description ?? "").slice(0, 82),
      ROOM_WIDTH / 2,
      INFO_Y + 9,
      3,
      P.label,
      { align: "center", font: f },
    );
  }

  _drawCard(renderer, card, x, y, w, h, isCenter, f) {
    const rColor = RARITY_COLOR[card.rarity] ?? "#888888";
    const isAuto = card.type === "automatic";
    const badgeH = isCenter ? 12 : 10;
    const midX = x + 3 + Math.floor((w - 3) / 2);

    // Background + rarity strips
    renderer.drawRect(x, y, w, h, P.cardBg);
    renderer.drawRect(x, y, 3, h, rColor);
    renderer.drawRect(x + 3, y, w - 3, 2, rColor);
    renderer.drawRect(x, y + h - 2, w, 2, rColor);

    // Type badge
    renderer.drawRect(
      x + 3,
      y + 2,
      w - 3,
      badgeH,
      isAuto ? P.autoBg : P.activeBg,
    );
    renderer.drawText(
      isAuto ? "⟳ AUTO" : "⚡ ACTIVE",
      midX,
      y + 2 + Math.floor(badgeH / 2),
      isCenter ? 4 : 3,
      isAuto ? P.autoFg : P.activeFg,
      { align: "center", font: f },
    );

    // Separator
    const sep1Y = y + 2 + badgeH;
    renderer.drawRect(x + 3, sep1Y, w - 3, 1, P.border);

    // Name
    const nameY = sep1Y + 1 + (isCenter ? 10 : 7);
    const nameStr =
      card.name.length > 12 ? card.name.slice(0, 11) + "…" : card.name;
    renderer.drawText(nameStr, midX, nameY, isCenter ? 4 : 3, P.text, {
      align: "center",
      font: f,
    });

    // Subtype
    const subY = nameY + (isCenter ? 11 : 9);
    renderer.drawText(this._subtype(card), midX, subY, 3, P.sub, {
      align: "center",
      font: f,
    });

    // Stat line
    renderer.drawText(
      this._statLine(card),
      midX,
      subY + (isCenter ? 10 : 9),
      3,
      P.label,
      { align: "center", font: f },
    );
  }

  // Cost strip overlaid on the bottom of the center card
  _drawCostStrip(renderer, item, player, f) {
    const { cost, sold } = item;
    const stripY = CY + CH - 18;

    renderer.drawRect(CX, stripY, CW, 18, "rgba(10,10,10,0.92)");
    renderer.drawRect(CX + 3, stripY, CW - 3, 1, P.border);

    const label = sold ? "SOLD" : this.tab === 1 ? `+${cost} CR` : `${cost} CR`;

    const color = sold
      ? P.muted
      : this.tab === 1
        ? P.green
        : player.credits >= cost
          ? P.gold
          : P.red;

    renderer.drawText(label, CX + Math.floor(CW / 2), stripY + 10, 4, color, {
      align: "center",
      font: f,
    });
  }

  _drawUpgrades(renderer, player, cardManager, f) {
    const items = this._upgradeItems(cardManager);
    const ROW_H = 30;
    const cx = ROOM_WIDTH / 2;

    renderer.drawText("EXPAND YOUR DECK", cx, CARD_TOP + 10, 5, P.sub, {
      align: "center",
      font: f,
    });

    for (let i = 0; i < items.length; i++) {
      const { label, cost } = items[i];
      const ry = CARD_TOP + 22 + i * (ROW_H + 8);
      const selected = i === this.cursor;

      renderer.drawRect(
        PX + 4,
        ry,
        PW - 8,
        ROW_H,
        selected ? "#222222" : "#0e0e0e",
      );
      renderer.drawRect(PX + 4, ry, PW - 8, 1, P.border);
      renderer.drawRect(PX + 4, ry + ROW_H - 1, PW - 8, 1, P.border);

      renderer.drawText(label, cx, ry + 11, 4, selected ? P.text : P.label, {
        align: "center",
        font: f,
      });

      const costLabel = cost === null ? "MAX" : `${cost} CR`;
      const costColor =
        cost === null ? P.green : player.credits >= cost ? P.gold : P.red;
      renderer.drawText(costLabel, cx, ry + 23, 4, costColor, {
        align: "center",
        font: f,
      });
    }
  }

  // --------------------- PRIVATE: data ---------------------

  _carouselItems(cardManager) {
    if (this.tab === 0) return this.offerings.filter((o) => !o.sold);
    const active = cardManager.activeSlots
      .slice(0, cardManager.activeSlotCount)
      .filter(Boolean);
    const auto = cardManager.autoSlots
      .slice(0, cardManager.autoSlotCount)
      .filter(Boolean);
    return [...active, ...auto].map((card) => ({
      card,
      cost: SELL_VALUE[card.rarity],
    }));
  }

  _upgradeItems(cardManager) {
    const aIdx = cardManager.activeSlotCount - 3;
    const uIdx = cardManager.autoSlotCount - 4;
    return [
      aIdx < ACTIVE_SLOT_UPGRADE_COSTS.length
        ? {
            label: `ACTIVE SLOTS  (${cardManager.activeSlotCount}/5)`,
            cost: ACTIVE_SLOT_UPGRADE_COSTS[aIdx],
            action: "upgradeActive",
          }
        : { label: "ACTIVE SLOTS  (MAX)", cost: null, action: null },
      uIdx < AUTO_SLOT_UPGRADE_COSTS.length
        ? {
            label: `AUTO SLOTS  (${cardManager.autoSlotCount}/8)`,
            cost: AUTO_SLOT_UPGRADE_COSTS[uIdx],
            action: "upgradeAuto",
          }
        : { label: "AUTO SLOTS  (MAX)", cost: null, action: null },
    ];
  }

  _confirm(player, cardManager, audio = null) {
    // ----- UPGRADE tab -----
    if (this.tab === 2) {
      const item = this._upgradeItems(cardManager)[this.cursor];

      // Can't upgrade: no action, already maxed, or not enough credits
      if (!item?.action || item.cost === null || player.credits < item.cost) {
        audio?.playSFX("deniedUI");
        return;
      }

      player.credits -= item.cost;
      if (item.action === "upgradeActive") cardManager.activeSlotCount++;
      else cardManager.autoSlotCount++;
      audio?.playSFX("confirmUI");
      return;
    }

    // ----- BUY / SELL tab -----
    const items = this._carouselItems(cardManager);
    if (!items.length) return;
    const item = items[Math.min(this.cursor, items.length - 1)];

    if (this.tab === 0) {
      // BUY: reject if already sold or player can't afford it
      if (item.sold || player.credits < item.cost) {
        audio?.playSFX("deniedUI");
        return;
      }

      const result = cardManager.addCard(item.card);

      // Purchase succeeds only if the card was added or converted to credits
      if (result.added || result.creditsAwarded > 0) {
        player.credits -= item.cost;
        item.sold = true;

        // Full deck: card was converted to bonus credits instead
        if (result.creditsAwarded > 0) player.addCredits(result.creditsAwarded);

        // Keep cursor in bounds after removing the sold item from the list
        this.cursor = Math.min(
          this.cursor,
          Math.max(0, this.offerings.filter((o) => !o.sold).length - 1),
        );
        audio?.playSFX("buySell");
      }
    } else if (this.tab === 1) {
      // SELL: remove card from deck and refund its rarity value
      cardManager.removeCard(item.card);
      player.addCredits(item.cost);

      // Keep cursor in bounds after the sold card disappears from the list
      this.cursor = Math.min(
        this.cursor,
        Math.max(0, this._carouselItems(cardManager).length - 1),
      );
      audio?.playSFX("buySell");
    }
  }

  _setTab(t) {
    this.tab = t;
    this.cursor = 0;
  }

  // Picks 5 random cards from the pool without repeats
  _generateOfferings() {
    const pool = [...SHOP_CARD_POOL];
    while (this.offerings.length < 5 && pool.length > 0) {
      const i = randInt(0, pool.length - 1);
      const { factory, cost } = pool.splice(i, 1)[0];
      this.offerings.push({ card: factory(), cost, sold: false });
    }
  }

  // Returns a readable subtype label for a card
  _subtype(card) {
    if (card.type === "automatic") {
      const map = {
        onKill: "ON KILL",
        onHit: "ON HIT",
        onDamage: "ON HIT",
        onDash: "ON DASH",
      };
      return map[card.trigger] ?? "PASSIVE";
    }
    if (card.damage > 0 && card.healAmount > 0) return "DRAIN";
    if (card.healAmount > 0) return "HEAL";
    if (card.shieldAmount > 0 || card.invincibility > 0) return "DEFENSE";
    return "MELEE";
  }

  // Builds a short stat summary string for a card
  _statLine(card) {
    const parts = [];
    if (card.damage > 0) parts.push(`${card.damage}DMG`);
    if (card.healAmount > 0) parts.push(`+${card.healAmount}HP`);
    if (card.shieldAmount > 0) parts.push(`+${card.shieldAmount}DEF`);
    if (card.baseCooldown > 0) parts.push(`${card.baseCooldown}sCD`);
    return parts.join("  ") || "—";
  }
}
