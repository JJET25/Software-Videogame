// ShopUI.js — In-game merchant UI with Buy, Sell, and Upgrade tabs rendered as a card carousel
// Generates randomized card offerings per shop visit and persists them until the shop is left.
import {
  SHOP_CARD_POOL,
  SELL_VALUE,
  ACTIVE_SLOT_UPGRADE_COSTS,
  AUTO_SLOT_UPGRADE_COSTS,
} from "../Data/ShopItems.js";
import { randInt } from "../Utils/Random.js";
import { ROOM_WIDTH, ROOM_HEIGHT } from "../Utils/Constants.js";

// Color palette for the shop overlay
const P = {
  bg: "#111111",
  border: "#2a2a2a",
  muted: "#3a3a3a",
  sub: "#888888",
  text: "#d0d0d0",
  label: "#aaaaaa",
  dim: "#555555",
  accent: "#aaaaaa",
  cardBg: "#0e0e0e",
  gold: "#ffcc33",
  green: "#5ce08a",
  red: "#e0604a",
};

// Maps rarity names to their highlight colors
const RARITY_COLOR = {
  common: "#9b8fb0",
  rare: "#4f8fff",
  epic: "#b65cff",
  legendary: "#ffb43c",
};

// Panel pixel dimensions and position
const PW = 240,
  PH = 170;
const PX = Math.floor((ROOM_WIDTH - PW) / 2);
const PY = Math.floor((ROOM_HEIGHT - PH) / 2);

// Header and tab bar heights
const HDR_H = 15;
const TAB_Y = PY + HDR_H;
const TAB_H = 13;
const CARD_TOP = TAB_Y + TAB_H + 2;

// Center card dimensions (approximately 8:11 aspect ratio)
const CW = 64,
  CH = 88;
const CX = PX + 2 + Math.floor((PW - 4 - CW) / 2);
const CY = CARD_TOP;

// Side card dimensions and positions
const SW = 40,
  SH = 55;
const SY = CY + Math.floor((CH - SH) / 2);
const GAP = 8;
const LX = CX - GAP - SW;
const RX = CX + CW + GAP;

// Info strip and footer Y positions
const INFO_Y = CY + CH + 3;
const FOOTER_Y = PY + PH - 12;

// Tab label strings
const TAB_NAMES = ["BUY", "SELL", "UPGRADE"];

export default class StoreUI {
  // Initializes shop state with the UI closed and no generated offerings yet
  constructor() {
    this.isOpen = false;
    this.tab = 0;
    this.cursor = 0;
    this.offerings = [];
    this._justOpened = false;
    this._lastHovered = null;

    this._font = "monospace";
    document.fonts.load("5px 'Press Start 2P'").then(() => {
      this._font = "'Press Start 2P', monospace";
    });
  }

  // Opens the shop on the Buy tab and generates offerings if not already done
  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.tab = 0;
    this.cursor = 0;
    this._justOpened = true;
    if (this.offerings.length === 0) this._generateOfferings();
  }

  // Processes keyboard and mouse input for tab switching, carousel navigation, and purchase/sell/upgrade
  update(input, player, cardManager, mouse = null, audio = null) {
    if (!this.isOpen) return;
    // Skip input for the first frame to prevent accidental actions on open
    if (this._justOpened) {
      this._justOpened = false;
      return;
    }

    if (input.wasKeyPressed("Q") || input.wasKeyPressed("ESCAPE")) {
      this.isOpen = false;
      audio?.playSFX("declineUI");
      return;
    }

    // Number keys 1-3 switch between tabs
    for (let i = 0; i < 3; i++) {
      if (input.wasKeyPressed(String(i + 1))) {
        this._setTab(i);
        audio?.playSFX("hoverUI");
      }
    }

    if (this.tab === 2)
      this.#updateUpgradeInput(input, cardManager, player, audio);
    else this.#updateCarouselInput(input, cardManager, player, audio);

    if (mouse?.consumeClick())
      this.#handleClick(mouse.position, player, cardManager, audio);
  }

  // Handles W/S or arrow key navigation and E confirm for the upgrade list
  #updateUpgradeInput(input, cardManager, player, audio) {
    const max = this._upgradeItems(cardManager).length - 1;
    if (input.wasKeyPressed("W") || input.wasKeyPressed("ARROWUP"))
      this.cursor = Math.max(0, this.cursor - 1);
    if (input.wasKeyPressed("S") || input.wasKeyPressed("ARROWDOWN"))
      this.cursor = Math.min(max, this.cursor + 1);
    if (input.wasKeyPressed("E")) this._confirm(player, cardManager, audio);
  }

  // Handles A/D or arrow key navigation and E confirm for the Buy/Sell carousel
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

  // Routes mouse clicks to the tab bar, carousel, or upgrade list
  #handleClick({ x: mx, y: my }, player, cardManager, audio) {
    const tw = Math.floor((PW - 8) / 3);
    for (let i = 0; i < 3; i++) {
      const tx = PX + 4 + i * (tw + 2);
      if (mx >= tx && mx <= tx + tw && my >= TAB_Y && my <= TAB_Y + TAB_H) {
        this._setTab(i);
        audio?.playSFX("hoverUI");
        return;
      }
    }
    if (this.tab !== 2)
      this.#handleCarouselClick(mx, my, player, cardManager, audio);
    else this.#handleUpgradeClick(mx, my, player, cardManager, audio);
  }

  // Handles carousel side-card navigation and center-card purchase/sell on click
  #handleCarouselClick(mx, my, player, cardManager, audio) {
    const items = this._carouselItems(cardManager);
    const cur = Math.min(this.cursor, Math.max(0, items.length - 1));
    if (cur > 0 && mx >= LX && mx <= LX + SW && my >= SY && my <= SY + SH) {
      this.cursor = cur - 1;
      audio?.playSFX("hoverUI");
    } else if (
      cur < items.length - 1 &&
      mx >= RX &&
      mx <= RX + SW &&
      my >= SY &&
      my <= SY + SH
    ) {
      this.cursor = cur + 1;
      audio?.playSFX("hoverUI");
    } else if (mx >= CX && mx <= CX + CW && my >= CY && my <= CY + CH) {
      this._confirm(player, cardManager, audio);
    }
  }

  // Selects and confirms the upgrade row clicked in the upgrade tab
  #handleUpgradeClick(mx, my, player, cardManager, audio) {
    const upItems = this._upgradeItems(cardManager);
    const ROW_H = 30;
    for (let i = 0; i < upItems.length; i++) {
      const ry = CARD_TOP + 22 + i * (ROW_H + 8);
      if (mx >= PX + 4 && mx <= PX + PW - 4 && my >= ry && my <= ry + ROW_H) {
        this.cursor = i;
        this._confirm(player, cardManager, audio);
        return;
      }
    }
  }

  // Draws the shop panel, tabs, and the content for the active tab
  draw(renderer, player, cardManager, mouse = null) {
    if (!this.isOpen) return;
    const f = this._font;
    const ctx = renderer.context;
    const sc = renderer.scale;
    const cx = ROOM_WIDTH / 2;

    renderer.drawRect(0, 0, ROOM_WIDTH, ROOM_HEIGHT, "rgba(8,8,8,0.88)");
    this.#drawPanel(renderer, ctx, sc, cx, f, player);
    this.#drawTabs(renderer, f);

    if (this.tab === 2) this._drawUpgrades(renderer, player, cardManager, f);
    else this._drawCarousel(renderer, player, cardManager, ctx, sc, f);

    renderer.drawRect(PX, FOOTER_Y, PW, 1, P.border);
    const hint =
      this.tab === 0
        ? "[A/D] BROWSE  [E] BUY  [Q] CLOSE"
        : this.tab === 1
          ? "[A/D] BROWSE  [E] SELL  [Q] CLOSE"
          : "[W/S] MOVE  [E] UPGRADE  [Q] CLOSE";
    renderer.drawText(hint, cx, FOOTER_Y + 7, 3, P.dim, {
      align: "center",
      font: f,
    });
  }

  // Draws the panel background, credit display, merchant title, and close hint
  #drawPanel(renderer, ctx, sc, cx, f, player) {
    renderer.drawRect(PX, PY, PW, PH, P.bg);
    this.#frame2px(renderer, PX, PY, PW, PH, P.border);

    renderer.drawText(`${player.credits} CR`, PX + 6, PY + 10, 5, P.gold, {
      align: "left",
      font: f,
    });

    ctx.shadowColor = "rgba(200,200,200,0.45)";
    ctx.shadowBlur = Math.round(9 * sc);
    renderer.drawText("MERCHANT", cx, PY + 10, 6, P.text, {
      align: "center",
      font: f,
    });
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    renderer.drawText("[Q]", PX + PW - 6, PY + 10, 4, P.dim, {
      align: "right",
      font: f,
    });
    renderer.drawRect(PX, PY + HDR_H, PW, 1, P.border);
  }

  // Draws a 2px panel border with single-pixel corner cuts
  #frame2px(renderer, x, y, w, h, color) {
    renderer.drawRect(x, y, w, 2, color);
    renderer.drawRect(x, y + h - 2, w, 2, color);
    renderer.drawRect(x, y, 2, h, color);
    renderer.drawRect(x + w - 2, y, 2, h, color);
    renderer.drawRect(x, y, 1, 1, P.bg);
    renderer.drawRect(x + w - 1, y, 1, 1, P.bg);
    renderer.drawRect(x, y + h - 1, 1, 1, P.bg);
    renderer.drawRect(x + w - 1, y + h - 1, 1, 1, P.bg);
  }

  // Draws the three tab labels with an underline on the active tab
  #drawTabs(renderer, f) {
    const tw = Math.floor((PW - 8) / 3);
    for (let i = 0; i < 3; i++) {
      const tx = PX + 4 + i * (tw + 2);
      const on = i === this.tab;
      renderer.drawRect(tx, TAB_Y, tw, TAB_H, on ? P.muted : "#111111");
      if (on) renderer.drawRect(tx, TAB_Y + TAB_H - 1, tw, 1, P.accent);
      renderer.drawText(
        TAB_NAMES[i],
        tx + Math.floor(tw / 2),
        TAB_Y + 7,
        4,
        on ? P.text : P.dim,
        { align: "center", font: f },
      );
    }
    renderer.drawRect(PX, TAB_Y + TAB_H, PW, 1, P.border);
  }

  // Draws the three-card carousel with dimmed side cards, navigation arrows, cost strip, and info
  _drawCarousel(renderer, player, cardManager, ctx, sc, f) {
    const items = this._carouselItems(cardManager);
    const count = items.length;
    const cur = Math.min(this.cursor, Math.max(0, count - 1));

    if (count === 0) {
      renderer.drawText(
        this.tab === 0 ? "NO CARDS FOR SALE" : "NO CARDS TO SELL",
        ROOM_WIDTH / 2,
        CY + 44,
        5,
        P.muted,
        { align: "center", font: f },
      );
      return;
    }

    if (cur > 0)
      renderer.drawText("◀", LX - 10, CY + 44, 7, P.label, {
        align: "center",
        font: f,
      });
    if (cur < count - 1)
      renderer.drawText("▶", RX + SW + 10, CY + 44, 7, P.label, {
        align: "center",
        font: f,
      });

    // Adjacent cards are drawn at half opacity to indicate they are not the active selection
    if (cur > 0) {
      ctx.globalAlpha = 0.5;
      this.#drawCardArt(renderer, items[cur - 1].card, LX, SY, SW, SH);
      ctx.globalAlpha = 1;
    }
    if (cur < count - 1) {
      ctx.globalAlpha = 0.5;
      this.#drawCardArt(renderer, items[cur + 1].card, RX, SY, SW, SH);
      ctx.globalAlpha = 1;
    }

    const item = items[cur];
    const rc = RARITY_COLOR[item.card.rarity] ?? P.sub;

    // Center card drawn with a rarity-colored glow
    ctx.shadowColor = rc + "99";
    ctx.shadowBlur = Math.round(6 * sc);
    this.#drawCardArt(renderer, item.card, CX, CY, CW, CH, rc);
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    this.#drawCostStrip(renderer, item, player, f);
    this.#drawInfo(renderer, item.card, f);
  }

  // Draws a card image inside a 1px rarity contour; uses the name as a fallback
  #drawCardArt(renderer, card, x, y, w, h, contour = null) {
    const rc = contour ?? RARITY_COLOR[card.rarity] ?? P.sub;
    renderer.drawRect(x, y, w, h, P.cardBg);
    if (card._img?.complete && card._img.naturalWidth > 0) {
      renderer.drawImage(card._img, x + 1, y + 1, w - 2, h - 2);
    } else {
      const name =
        card.name.length > 9 ? card.name.slice(0, 8) + "..." : card.name;
      renderer.drawText(
        name.toUpperCase(),
        x + Math.floor(w / 2),
        y + Math.floor(h / 2),
        3,
        P.label,
        { align: "center", font: this._font },
      );
    }
    renderer.drawRect(x, y, w, 1, rc);
    renderer.drawRect(x, y + h - 1, w, 1, rc);
    renderer.drawRect(x, y, 1, h, rc);
    renderer.drawRect(x + w - 1, y, 1, h, rc);
  }

  // Draws a price strip at the bottom of the center card in a color reflecting affordability
  #drawCostStrip(renderer, item, player, f) {
    const { cost, sold } = item;
    const stripH = 12;
    const stripY = CY + CH - stripH - 1;

    renderer.drawRect(CX + 1, stripY, CW - 2, stripH, "rgba(8,4,18,0.94)");
    renderer.drawRect(CX + 1, stripY, CW - 2, 1, P.border);

    const label = sold ? "SOLD" : this.tab === 1 ? `+${cost} CR` : `${cost} CR`;
    const color = sold
      ? P.muted
      : this.tab === 1
        ? P.green
        : player.credits >= cost
          ? P.gold
          : P.red;

    renderer.drawText(
      label,
      CX + Math.floor(CW / 2),
      stripY + Math.floor(stripH / 2),
      4,
      color,
      { align: "center", font: f },
    );
  }

  // Draws the subtype tag, stat line, and description below the center card
  #drawInfo(renderer, card, f) {
    const cx = ROOM_WIDTH / 2;
    renderer.drawRect(PX, INFO_Y, PW, 1, P.border);

    const lvl = card.level ?? 1;
    renderer.drawText(
      `${this._subtype(card)}  •  LV ${lvl}`,
      cx,
      INFO_Y + 7,
      3,
      P.sub,
      { align: "center", font: f },
    );
    renderer.drawText(this._statLine(card), cx, INFO_Y + 15, 3, P.label, {
      align: "center",
      font: f,
    });
    renderer.drawText(
      (card.description ?? "").slice(0, 46),
      cx,
      INFO_Y + 23,
      3,
      P.dim,
      { align: "center", font: f },
    );
  }

  // Draws the list of slot upgrade options with selection highlight and cost color
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
        selected ? P.muted : "#111111",
      );
      if (selected) renderer.drawRect(PX + 4, ry, 2, ROW_H, P.accent);

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

  // Rarity distribution buckets used when generating shop offerings
  static #SLOT_RARITIES = [
    ["common", "rare"],
    ["rare"],
    ["rare", "epic"],
    ["epic", "legendary"],
    ["common", "rare", "epic", "legendary"],
  ];

  // Randomly selects unique cards from the pool following the rarity distribution
  _generateOfferings() {
    const byRarity = { common: [], rare: [], epic: [], legendary: [] };
    for (const entry of SHOP_CARD_POOL) byRarity[entry.rarity]?.push(entry);

    // Shuffle each rarity bucket independently
    for (const bucket of Object.values(byRarity)) {
      for (let i = bucket.length - 1; i > 0; i--) {
        const j = randInt(0, i);
        [bucket[i], bucket[j]] = [bucket[j], bucket[i]];
      }
    }

    const usedNames = new Set();
    for (const rarities of StoreUI.#SLOT_RARITIES) {
      let picked = null;
      for (const rarity of rarities) {
        const entry = byRarity[rarity].find((e) => !usedNames.has(e.name));
        if (entry) {
          picked = entry;
          break;
        }
      }
      if (!picked)
        picked = SHOP_CARD_POOL.find((e) => !usedNames.has(e.name)) ?? null;
      if (picked) {
        usedNames.add(picked.name);
        this.offerings.push({
          card: picked.factory(),
          cost: picked.cost,
          sold: false,
        });
      }
    }
  }

  // Returns the item array for the active tab: unsold offerings for Buy, equipped cards for Sell
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

  // Returns the two slot-count upgrade items with costs and actions
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

  // Executes the buy, sell, or upgrade action for the currently selected item
  _confirm(player, cardManager, audio = null) {
    if (this.tab === 2) {
      const item = this._upgradeItems(cardManager)[this.cursor];
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

    const items = this._carouselItems(cardManager);
    if (!items.length) return;
    const item = items[Math.min(this.cursor, items.length - 1)];

    if (this.tab === 0) {
      if (item.sold || player.credits < item.cost) {
        audio?.playSFX("deniedUI");
        return;
      }
      const result = cardManager.addCard(item.card);
      if (result.added || result.creditsAwarded > 0) {
        player.credits -= item.cost;
        item.sold = true;
        // Refund credits if the card was a duplicate and converted to credits
        if (result.creditsAwarded > 0) player.addCredits(result.creditsAwarded);
        this.cursor = Math.min(
          this.cursor,
          Math.max(0, this.offerings.filter((o) => !o.sold).length - 1),
        );
        audio?.playSFX("buySell");
      }
    } else if (this.tab === 1) {
      cardManager.removeCard(item.card);
      player.addCredits(item.cost);
      this.cursor = Math.min(
        this.cursor,
        Math.max(0, this._carouselItems(cardManager).length - 1),
      );
      audio?.playSFX("buySell");
    }
  }

  // Switches to a new tab and resets the cursor
  _setTab(t) {
    this.tab = t;
    this.cursor = 0;
  }

  // Returns a human-readable subtype string derived from the card's type and trigger
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

  // Builds a concise stat string showing damage, healing, shield, and cooldown values
  _statLine(card) {
    const parts = [];
    if (card.damage > 0) parts.push(`${card.damage} DMG`);
    if (card.healAmount > 0) parts.push(`+${card.healAmount} HP`);
    if (card.shieldAmount > 0) parts.push(`+${card.shieldAmount} DEF`);
    if (card.baseCooldown > 0) parts.push(`${card.baseCooldown}s CD`);
    return parts.join("   ") || "-";
  }
}
