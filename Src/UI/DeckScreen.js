import { ROOM_WIDTH, ROOM_HEIGHT } from "../Utils/Constants.js";
import { CardType } from "../cards/Card.js";

// --------------------- PALETTE ---------------------
const P = {
  bg: "#111111",
  border: "#333333",
  muted: "#3d3d3d",
  sub: "#7a7a7a",
  text: "#dddddd",
  label: "#999999",
  dim: "#4a4a4a",
};

const RARITY_COLOR = {
  common: "#888888",
  uncommon: "#55aa55",
  rare: "#4488ff",
  epic: "#aa44ff",
  legendary: "#ffaa00",
};

// --------------------- PANEL ---------------------
const PX = 2,
  PY = 2,
  PW = 268,
  PH = 172;

// --------------------- CARD DIMENSIONS ---------------------
const CARD_W = 38,
  CARD_H = 34,
  CARD_GAP = 4; // active + auto slots
const STORE_W = 22,
  STORE_H = 24,
  STORE_GAP = 3; // storage row (compact)
const STORE_PAGE_SIZE = 8;

// --------------------- LAYOUT ---------------------
// All Y values verified to fit inside ROOM_HEIGHT = 176
const TITLE_Y = 12;
const DIV1_Y = 18;
const ACT_LABEL_Y = 23;
const ACT_ROW_Y = 29; // cards: 29..63
const ACT_HINT_Y = ACT_ROW_Y + CARD_H + 3; // 66
const DIV2_Y = ACT_HINT_Y + 4; // 70
const AUTO_LABEL_Y = DIV2_Y + 5; // 75
const AUTO_ROW_Y = AUTO_LABEL_Y + 7; // 82 → cards: 82..116
const DIV3_Y = AUTO_ROW_Y + CARD_H + 3; // 119
const STORE_LABEL_Y = DIV3_Y + 5; // 124
const STORE_ROW_Y = STORE_LABEL_Y + 7; // 131 → cards: 131..155
const FOOTER_Y = 171; // ≤ PY + PH = 174 ✓

// --------------------- CLASS ---------------------
export default class DeckScreen {
  constructor() {
    this._open = false;
    this._selected = null; // { card, fromType, fromIndex } — card being moved
    this._inspected = null; // { card } — card shown in info bar on first click
    this._storePage = 0;

    // Load pixel font — falls back to monospace until ready
    this._font = "monospace";
    document.fonts.load("5px 'Press Start 2P'").then(() => {
      this._font = "'Press Start 2P', monospace";
    });
  }

  get isOpen() {
    return this._open;
  }

  update(input, mouse, cardManager, audio = null) {
    if (input.wasKeyPressed("TAB")) {
      this._open = !this._open;
      if (!this._open) {
        this._selected = null;
        this._inspected = null;
      }
    }
    if (!this._open) return;

    // Storage pagination with arrow keys
    const totalPages = Math.max(
      1,
      Math.ceil(cardManager.storage.length / STORE_PAGE_SIZE),
    );
    if (input.wasKeyPressed("ARROWLEFT"))
      this._storePage = Math.max(0, this._storePage - 1);
    if (input.wasKeyPressed("ARROWRIGHT"))
      this._storePage = Math.min(totalPages - 1, this._storePage + 1);
    this._storePage = Math.min(this._storePage, totalPages - 1);

    if (!mouse.consumeClick()) return;

    const hit = this._hitTest(mouse.position, cardManager);
    const card = hit ? this._cardAt(hit, cardManager) : null;

    if (!this._selected) {
      this.#handleInspectOrPickup(card, hit, audio);
    } else {
      this.#handleDrop(hit, cardManager, audio);
    }
  }

  draw(renderer, cardManager) {
    if (!this._open) return;

    const f = this._font;
    const ctx = renderer.context;
    const sc = renderer.scale;
    const cx = ROOM_WIDTH / 2;

    renderer.drawFlash("rgba(13,5,32,0.93)");
    this.#drawPanel(renderer, ctx, sc, cx, f);
    this.#drawActiveSection(renderer, cardManager, f, ctx, sc);
    this.#drawAutoSection(renderer, cardManager, f, ctx, sc);
    this.#drawStorageSection(renderer, cardManager, f, ctx, sc, cx);
    this.#drawFooter(renderer, ctx, sc, cx, f);
  }

  // --------------------- PRIVATE: update ---------------------

  // First click on a card: inspect it; second click on the same card: pick it up
  #handleInspectOrPickup(card, hit, audio) {
    if (!card) {
      this._inspected = null;
      return;
    }
    if (this._inspected?.card === card) {
      this._selected = { card, fromType: hit.type, fromIndex: hit.index };
      this._inspected = null;
      audio?.playSFX("unequip");
    } else {
      this._inspected = { card };
    }
  }

  // Drop the moving card into the clicked slot if the type is compatible
  #handleDrop(hit, cardManager, audio) {
    if (hit) {
      const src = this._selected.card;
      const compatible =
        hit.type === "storage" ||
        (hit.type === "active" && src.type === CardType.ACTIVE) ||
        (hit.type === "auto" && src.type === CardType.AUTOMATIC);

      if (compatible) {
        cardManager.assignToSlot(src, hit.type, hit.index);
        audio?.playSFX("equip");
      }
    }
    this._selected = null;
    this._inspected = null;
  }

  // --------------------- PRIVATE: draw sections ---------------------

  // Panel background + border edges
  #drawPanel(renderer, ctx, sc, cx, f) {
    renderer.drawRect(PX, PY, PW, PH, P.bg);
    renderer.drawRect(PX, PY, PW, 2, P.border);
    renderer.drawRect(PX, PY + PH - 2, PW, 2, P.border);
    renderer.drawRect(PX, PY, 2, PH, P.border);
    renderer.drawRect(PX + PW - 2, PY, 2, PH, P.border);

    // Title with glow
    ctx.shadowColor = "rgba(200,200,200,0.35)";
    ctx.shadowBlur = Math.round(7 * sc);
    renderer.drawText("MANAGE DECK", cx, TITLE_Y, 7, P.text, {
      align: "center",
      font: f,
    });
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    renderer.drawRect(PX, DIV1_Y, PW, 1, P.border);
  }

  #drawActiveSection(renderer, cardManager, f, ctx, sc) {
    renderer.drawText("▶  ACTIVE CARDS", PX + 6, ACT_LABEL_Y, 4, P.sub, {
      align: "left",
      font: f,
    });

    const rects = this._rowRects(
      cardManager.activeSlotCount,
      CARD_W,
      CARD_GAP,
      ACT_ROW_Y,
    );
    for (let i = 0; i < cardManager.activeSlotCount; i++) {
      this._drawCard(
        renderer,
        cardManager.activeSlots[i],
        rects[i],
        CARD_W,
        CARD_H,
        f,
        ctx,
        sc,
      );
      // Hotkey hint below each slot
      renderer.drawText(
        String(i + 1),
        rects[i].x + Math.floor(CARD_W / 2),
        ACT_HINT_Y,
        3,
        P.dim,
        { align: "center", font: f },
      );
    }
  }

  #drawAutoSection(renderer, cardManager, f, ctx, sc) {
    renderer.drawRect(PX, DIV2_Y, PW, 1, P.border);
    renderer.drawText("⟳  AUTOMATIC CARDS", PX + 6, AUTO_LABEL_Y, 4, P.sub, {
      align: "left",
      font: f,
    });

    const rects = this._rowRects(
      cardManager.autoSlotCount,
      CARD_W,
      CARD_GAP,
      AUTO_ROW_Y,
    );
    for (let i = 0; i < cardManager.autoSlotCount; i++) {
      this._drawCard(
        renderer,
        cardManager.autoSlots[i],
        rects[i],
        CARD_W,
        CARD_H,
        f,
        ctx,
        sc,
      );
    }
  }

  #drawStorageSection(renderer, cardManager, f, ctx, sc, cx) {
    renderer.drawRect(PX, DIV3_Y, PW, 1, P.border);

    const total = cardManager.storage.length;
    const totalPages = Math.max(1, Math.ceil(total / STORE_PAGE_SIZE));
    const pageStart = this._storePage * STORE_PAGE_SIZE;
    const pageCards = cardManager.storage.slice(
      pageStart,
      pageStart + STORE_PAGE_SIZE,
    );

    renderer.drawText(
      total === 0 ? "STORAGE  (empty)" : `STORAGE  [${total}]`,
      PX + 6,
      STORE_LABEL_Y,
      4,
      P.sub,
      { align: "left", font: f },
    );
    if (totalPages > 1) {
      renderer.drawText(
        `< ${this._storePage + 1} / ${totalPages} >`,
        PX + PW - 6,
        STORE_LABEL_Y,
        4,
        P.dim,
        { align: "right", font: f },
      );
    }

    const rects = this._rowRects(
      STORE_PAGE_SIZE,
      STORE_W,
      STORE_GAP,
      STORE_ROW_Y,
    );
    for (let i = 0; i < STORE_PAGE_SIZE; i++) {
      this._drawCard(
        renderer,
        pageCards[i] ?? null,
        rects[i],
        STORE_W,
        STORE_H,
        f,
        ctx,
        sc,
      );
    }
  }

  // Footer area: shows moving indicator, card info panel, or hint text
  #drawFooter(renderer, ctx, sc, cx, f) {
    renderer.drawRect(PX, DIV3_Y + 1, PW, 1, P.border);

    if (this._selected) {
      this.#drawMovingIndicator(renderer, ctx, sc, cx, f);
    } else if (this._inspected) {
      this.#drawInspectPanel(renderer, ctx, sc, f);
    } else {
      renderer.drawText(
        "[TAB] CLOSE   [CLICK] INSPECT   [2x] MOVE",
        cx,
        FOOTER_Y - 2,
        3,
        P.dim,
        { align: "center", font: f },
      );
    }
  }

  #drawMovingIndicator(renderer, ctx, sc, cx, f) {
    renderer.drawRect(
      PX + 2,
      STORE_ROW_Y + STORE_H + 2,
      PW - 4,
      PY + PH - (STORE_ROW_Y + STORE_H + 2) - 2,
      "#111111",
    );
    ctx.shadowColor = "rgba(255,200,50,0.45)";
    ctx.shadowBlur = Math.round(4 * sc);
    renderer.drawText(
      `MOVING: ${this._selected.card.name}`,
      cx,
      FOOTER_Y - 2,
      4,
      "#ffcc33",
      { align: "center", font: f },
    );
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
  }

  #drawInspectPanel(renderer, ctx, sc, f) {
    const card = this._inspected.card;
    const rc = RARITY_COLOR[card.rarity] ?? "#888888";
    const infoY = STORE_ROW_Y + STORE_H + 2;
    const infoH = PY + PH - infoY - 2;

    renderer.drawRect(PX + 2, infoY, PW - 4, infoH, "#0e0e0e");
    renderer.drawRect(PX + 2, infoY, 3, infoH, rc); // left rarity accent

    // Name + type badge
    const typeLabel = card.type === CardType.AUTOMATIC ? "AUTO" : "ACT";
    const typeColor = card.type === CardType.AUTOMATIC ? "#bb8833" : "#5588bb";
    renderer.drawText(card.name.toUpperCase(), PX + 10, infoY + 6, 4, P.text, {
      align: "left",
      font: f,
    });
    renderer.drawText(`[${typeLabel}]`, PX + PW - 6, infoY + 6, 4, typeColor, {
      align: "right",
      font: f,
    });

    // Description and move hint
    renderer.drawText(
      (card.description ?? "No description available.").slice(0, 68),
      PX + 10,
      infoY + 14,
      3,
      P.label,
      { align: "left", font: f },
    );
    renderer.drawText(
      "click again to move",
      PX + PW - 6,
      infoY + 14,
      3,
      P.dim,
      { align: "right", font: f },
    );
  }

  // --------------------- PRIVATE: draw card tile ---------------------

  // Draws a filled card or an empty slot placeholder
  _drawCard(renderer, card, rect, cw, ch, f, ctx, sc) {
    const { x, y } = rect;
    const sel = this._selected?.card === card && card !== null;
    const inspected = this._inspected?.card === card && card !== null;

    if (!card) {
      this.#drawEmptySlot(renderer, x, y, cw, ch);
      return;
    }

    const rc = RARITY_COLOR[card.rarity] ?? "#888888";
    const bg = sel ? "#1e1e1e" : inspected ? "#181818" : "#0c0c0c";

    renderer.drawRect(x, y, cw, ch, bg);
    renderer.drawRect(x, y, 3, ch, rc); // rarity left strip
    renderer.drawRect(
      x + 3,
      y,
      cw - 3,
      2, // type top strip
      card.type === CardType.AUTOMATIC ? "#a06010" : "#1a3060",
    );

    // Card name abbreviation
    const maxChars = cw >= 32 ? 5 : 3;
    renderer.drawText(
      card.name.slice(0, maxChars).toUpperCase(),
      x + 3 + Math.floor((cw - 3) / 2),
      y + Math.floor(ch / 2) - 1,
      4,
      sel ? "#ffffff" : inspected ? "#dddddd" : P.label,
      { align: "center", font: f },
    );

    // Level pips at the bottom
    const pipW = cw >= 32 ? 5 : 3;
    const pipGap = cw >= 32 ? 3 : 2;
    const pipsW = 3 * pipW + 2 * pipGap;
    const pipX0 = x + Math.floor((cw - pipsW) / 2);
    for (let lv = 0; lv < 3; lv++) {
      renderer.drawRect(
        pipX0 + lv * (pipW + pipGap),
        y + ch - 4,
        pipW,
        2,
        lv < (card.level ?? 0) ? rc : "#111120",
      );
    }

    this.#drawCardBorder(renderer, ctx, sc, x, y, cw, ch, sel, inspected);
  }

  // Draws the card border — gold when moving, white when inspected, grey otherwise
  #drawCardBorder(renderer, ctx, sc, x, y, cw, ch, sel, inspected) {
    let color = P.muted;
    if (sel) {
      color = "#ffcc33";
      ctx.shadowColor = "rgba(255,200,50,0.65)";
      ctx.shadowBlur = Math.round(6 * sc);
    }
    if (inspected) {
      color = "#cccccc";
      ctx.shadowColor = "rgba(255,255,255,0.4)";
      ctx.shadowBlur = Math.round(4 * sc);
    }

    renderer.drawRect(x - 1, y - 1, cw + 2, 1, color);
    renderer.drawRect(x - 1, y + ch, cw + 2, 1, color);
    renderer.drawRect(x - 1, y, 1, ch, color);
    renderer.drawRect(x + cw, y, 1, ch, color);

    if (sel || inspected) {
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
    }
  }

  // Empty slot: dark box with a small dash in the center
  #drawEmptySlot(renderer, x, y, cw, ch) {
    renderer.drawRect(x, y, cw, ch, "#080808");
    renderer.drawRect(x - 1, y - 1, cw + 2, 1, P.border);
    renderer.drawRect(x - 1, y + ch, cw + 2, 1, P.border);
    renderer.drawRect(x - 1, y, 1, ch, P.border);
    renderer.drawRect(x + cw, y, 1, ch, P.border);
    renderer.drawRect(
      x + Math.floor(cw / 2) - 2,
      y + Math.floor(ch / 2),
      4,
      1,
      P.dim,
    );
  }

  // --------------------- PRIVATE: helpers ---------------------

  // Returns screen rects for a centered row of cards
  _rowRects(count, cardW, gap, rowY) {
    const rowW = count * cardW + Math.max(0, count - 1) * gap;
    const startX = Math.floor((ROOM_WIDTH - rowW) / 2);
    return Array.from({ length: count }, (_, i) => ({
      x: startX + i * (cardW + gap),
      y: rowY,
      w: cardW,
    }));
  }

  // Returns which slot was clicked, or null if none
  _hitTest(pos, cardManager) {
    const activeRects = this._rowRects(
      cardManager.activeSlotCount,
      CARD_W,
      CARD_GAP,
      ACT_ROW_Y,
    );
    for (let i = 0; i < cardManager.activeSlotCount; i++) {
      if (this._inRect(pos, activeRects[i], CARD_H))
        return { type: "active", index: i };
    }

    const autoRects = this._rowRects(
      cardManager.autoSlotCount,
      CARD_W,
      CARD_GAP,
      AUTO_ROW_Y,
    );
    for (let i = 0; i < cardManager.autoSlotCount; i++) {
      if (this._inRect(pos, autoRects[i], CARD_H))
        return { type: "auto", index: i };
    }

    const storeRects = this._rowRects(
      STORE_PAGE_SIZE,
      STORE_W,
      STORE_GAP,
      STORE_ROW_Y,
    );
    const pageStart = this._storePage * STORE_PAGE_SIZE;
    for (let i = 0; i < STORE_PAGE_SIZE; i++) {
      if (this._inRect(pos, storeRects[i], STORE_H))
        return { type: "storage", index: pageStart + i };
    }

    return null;
  }

  _cardAt(hit, cardManager) {
    if (hit.type === "active")
      return cardManager.activeSlots[hit.index] ?? null;
    if (hit.type === "auto") return cardManager.autoSlots[hit.index] ?? null;
    if (hit.type === "storage") return cardManager.storage[hit.index] ?? null;
    return null;
  }

  _inRect(pos, rect, h) {
    return (
      pos.x >= rect.x &&
      pos.x < rect.x + rect.w &&
      pos.y >= rect.y &&
      pos.y < rect.y + h
    );
  }
}
