import { ROOM_WIDTH, ROOM_HEIGHT } from "../Utils/Constants.js";
import { CardType } from "../cards/Card.js";

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:     "#111111",
  border: "#333333",
  muted:  "#3d3d3d",
  sub:    "#7a7a7a",
  text:   "#dddddd",
  label:  "#999999",
  dim:    "#4a4a4a",
};

const RARITY_COLOR = {
  common:    "#888888",
  uncommon:  "#55aa55",
  rare:      "#4488ff",
  epic:      "#aa44ff",
  legendary: "#ffaa00",
};

// ── Panel ─────────────────────────────────────────────────────────────────────
const PX = 2, PY = 2, PW = 268, PH = 172;

// ── Card dimensions ───────────────────────────────────────────────────────────
const CARD_W  = 38, CARD_H  = 34, CARD_GAP  = 4;   // active + auto slots
const STORE_W = 22, STORE_H = 24, STORE_GAP = 3;   // storage row (compact)
const STORE_PAGE_SIZE = 8;

// ── Layout — all y values verified to fit in ROOM_HEIGHT=176 ──────────────────
const TITLE_Y       = 12;
const DIV1_Y        = 18;
const ACT_LABEL_Y   = 23;
const ACT_ROW_Y     = 29;                           // cards: 29..63
const ACT_HINT_Y    = ACT_ROW_Y + CARD_H + 3;      // 66
const DIV2_Y        = ACT_HINT_Y + 4;              // 70
const AUTO_LABEL_Y  = DIV2_Y + 5;                  // 75
const AUTO_ROW_Y    = AUTO_LABEL_Y + 7;             // 82 → cards: 82..116
const DIV3_Y        = AUTO_ROW_Y + CARD_H + 3;     // 119
const STORE_LABEL_Y = DIV3_Y + 5;                  // 124
const STORE_ROW_Y   = STORE_LABEL_Y + 7;           // 131 → cards: 131..155
const FOOTER_Y      = 171;                          // ≤ PY+PH=174 ✓

// ─────────────────────────────────────────────────────────────────────────────
export default class DeckScreen {
  constructor() {
    this._open      = false;
    this._selected  = null;   // { card, fromType, fromIndex } | null
    this._inspected = null;   // { card } — shown in info bar, first click
    this._storePage = 0;
    this._font = "monospace";
    document.fonts.load("5px 'Press Start 2P'").then(() => {
      this._font = "'Press Start 2P', monospace";
    });
  }

  get isOpen() { return this._open; }

  update(input, mouse, cardManager) {
    if (input.wasKeyPressed("TAB")) {
      this._open = !this._open;
      if (!this._open) { this._selected = null; this._inspected = null; }
    }
    if (!this._open) return;

    const totalPages = Math.max(1, Math.ceil(cardManager.storage.length / STORE_PAGE_SIZE));
    if (input.wasKeyPressed("ARROWLEFT"))  this._storePage = Math.max(0, this._storePage - 1);
    if (input.wasKeyPressed("ARROWRIGHT")) this._storePage = Math.min(totalPages - 1, this._storePage + 1);
    this._storePage = Math.min(this._storePage, totalPages - 1);

    if (!mouse.consumeClick()) return;

    const pos = mouse.position;
    const hit = this._hitTest(pos, cardManager);

    if (!this._selected) {
      const card = hit ? this._cardAt(hit, cardManager) : null;
      if (card) {
        if (this._inspected?.card === card) {
          // Second click on same card → pick it up for moving
          this._selected  = { card, fromType: hit.type, fromIndex: hit.index };
          this._inspected = null;
        } else {
          // First click → inspect (show description)
          this._inspected = { card };
        }
      } else {
        this._inspected = null;
      }
    } else {
      if (hit) {
        const src = this._selected.card;
        const ok  = hit.type === "storage"
          || (hit.type === "active" && src.type === CardType.ACTIVE)
          || (hit.type === "auto"   && src.type === CardType.AUTOMATIC);
        if (ok) cardManager.assignToSlot(src, hit.type, hit.index);
      }
      this._selected  = null;
      this._inspected = null;
    }
  }

  draw(renderer, cardManager) {
    if (!this._open) return;
    const f   = this._font;
    const ctx = renderer.context;
    const sc  = renderer.scale;
    const cx  = ROOM_WIDTH / 2;

    // ── Dark overlay + panel ──────────────────────────────────────────────────
    renderer.drawFlash("rgba(13,5,32,0.93)");
    renderer.drawRect(PX, PY, PW, PH, P.bg);
    renderer.drawRect(PX,          PY,          PW, 2,  P.border);
    renderer.drawRect(PX,          PY + PH - 2, PW, 2,  P.border);
    renderer.drawRect(PX,          PY,          2,  PH, P.border);
    renderer.drawRect(PX + PW - 2, PY,          2,  PH, P.border);

    // ── Title ─────────────────────────────────────────────────────────────────
    ctx.shadowColor = "rgba(200,200,200,0.35)";
    ctx.shadowBlur  = Math.round(7 * sc);
    renderer.drawText("MANAGE DECK", cx, TITLE_Y, 7, P.text, { align: "center", font: f });
    ctx.shadowColor = "transparent";
    ctx.shadowBlur  = 0;
    renderer.drawRect(PX, DIV1_Y, PW, 1, P.border);

    // ════ ACTIVE section ══════════════════════════════════════════════════════
    renderer.drawText("▶  ACTIVE CARDS", PX + 6, ACT_LABEL_Y, 4, P.sub, { align: "left", font: f });

    const activeRects = this._rowRects(cardManager.activeSlotCount, CARD_W, CARD_GAP, ACT_ROW_Y);
    for (let i = 0; i < cardManager.activeSlotCount; i++) {
      const card = cardManager.activeSlots[i];
      this._drawCard(renderer, card, activeRects[i], CARD_W, CARD_H, f, ctx, sc);
    }
    // Slot key hints below active cards
    for (let i = 0; i < cardManager.activeSlotCount; i++) {
      const r = activeRects[i];
      renderer.drawText(String(i + 1),
        r.x + Math.floor(CARD_W / 2), ACT_HINT_Y,
        3, P.dim, { align: "center", font: f });
    }

    // ════ AUTO section ════════════════════════════════════════════════════════
    renderer.drawRect(PX, DIV2_Y, PW, 1, P.border);
    renderer.drawText("⟳  AUTOMATIC CARDS", PX + 6, AUTO_LABEL_Y, 4, P.sub, { align: "left", font: f });

    const autoRects = this._rowRects(cardManager.autoSlotCount, CARD_W, CARD_GAP, AUTO_ROW_Y);
    for (let i = 0; i < cardManager.autoSlotCount; i++) {
      const card = cardManager.autoSlots[i];
      this._drawCard(renderer, card, autoRects[i], CARD_W, CARD_H, f, ctx, sc);
    }

    // ════ STORAGE section ═════════════════════════════════════════════════════
    renderer.drawRect(PX, DIV3_Y, PW, 1, P.border);

    const total      = cardManager.storage.length;
    const totalPages = Math.max(1, Math.ceil(total / STORE_PAGE_SIZE));
    const pageStart  = this._storePage * STORE_PAGE_SIZE;
    const pageCards  = cardManager.storage.slice(pageStart, pageStart + STORE_PAGE_SIZE);

    renderer.drawText(total === 0 ? "STORAGE  (empty)" : `STORAGE  [${total}]`,
      PX + 6, STORE_LABEL_Y, 4, P.sub, { align: "left", font: f });
    if (totalPages > 1) {
      renderer.drawText(`< ${this._storePage + 1} / ${totalPages} >`,
        PX + PW - 6, STORE_LABEL_Y, 4, P.dim, { align: "right", font: f });
    }

    const storeRects = this._rowRects(STORE_PAGE_SIZE, STORE_W, STORE_GAP, STORE_ROW_Y);
    for (let i = 0; i < STORE_PAGE_SIZE; i++) {
      this._drawCard(renderer, pageCards[i] ?? null, storeRects[i], STORE_W, STORE_H, f, ctx, sc);
    }

    // ════ Footer / info panel ════════════════════════════════════════════════
    renderer.drawRect(PX, DIV3_Y + 1, PW, 1, P.border); // thin divider above info area

    if (this._selected) {
      // Moving indicator
      renderer.drawRect(PX + 2, STORE_ROW_Y + STORE_H + 2, PW - 4, PY + PH - (STORE_ROW_Y + STORE_H + 2) - 2, "#111111");
      ctx.shadowColor = "rgba(255,200,50,0.45)";
      ctx.shadowBlur  = Math.round(4 * sc);
      renderer.drawText(`MOVING: ${this._selected.card.name}`,
        cx, FOOTER_Y - 2, 4, "#ffcc33", { align: "center", font: f });
      ctx.shadowColor = "transparent";
      ctx.shadowBlur  = 0;

    } else if (this._inspected) {
      // Card info panel
      const card = this._inspected.card;
      const rc   = RARITY_COLOR[card.rarity] ?? "#888888";
      const infoY = STORE_ROW_Y + STORE_H + 2;
      const infoH = PY + PH - infoY - 2;

      renderer.drawRect(PX + 2, infoY, PW - 4, infoH, "#0e0e0e");
      // Left rarity accent
      renderer.drawRect(PX + 2, infoY, 3, infoH, rc);

      // Name + type badge on same line
      const typeLabel = card.type === CardType.AUTOMATIC ? "AUTO" : "ACT";
      const typeColor = card.type === CardType.AUTOMATIC ? "#bb8833" : "#5588bb";
      renderer.drawText(card.name.toUpperCase(),
        PX + 10, infoY + 6, 4, P.text, { align: "left", font: f });
      renderer.drawText(`[${typeLabel}]`,
        PX + PW - 6, infoY + 6, 4, typeColor, { align: "right", font: f });

      // Description (truncated to fit panel width)
      const desc = (card.description ?? "No description available.").slice(0, 68);
      renderer.drawText(desc,
        PX + 10, infoY + 14, 3, P.label, { align: "left", font: f });

      // Hint: click again to move
      renderer.drawText("click again to move",
        PX + PW - 6, infoY + 14, 3, P.dim, { align: "right", font: f });

    } else {
      renderer.drawText("[TAB] CLOSE   [CLICK] INSPECT   [2x] MOVE",
        cx, FOOTER_Y - 2, 3, P.dim, { align: "center", font: f });
    }
  }

  // ── Private: draw a single card tile or empty slot ────────────────────────

  _drawCard(renderer, card, rect, cw, ch, f, ctx, sc) {
    const { x, y } = rect;
    const sel      = this._selected?.card  === card && card !== null;
    const inspected = this._inspected?.card === card && card !== null;

    if (card) {
      const rc = RARITY_COLOR[card.rarity] ?? "#888888";
      const bg = sel ? "#1e1e1e" : inspected ? "#181818" : "#0c0c0c";

      renderer.drawRect(x, y, cw, ch, bg);

      // Rarity left strip
      renderer.drawRect(x, y, 3, ch, rc);

      // Type top strip — blue for active, amber for auto
      const stripColor = card.type === CardType.AUTOMATIC ? "#a06010" : "#1a3060";
      renderer.drawRect(x + 3, y, cw - 3, 2, stripColor);

      // Card name (up to 5 chars for wide cards, 3 for compact)
      const maxChars = cw >= 32 ? 5 : 3;
      const abbr = card.name.slice(0, maxChars).toUpperCase();
      renderer.drawText(abbr,
        x + 3 + Math.floor((cw - 3) / 2),
        y + Math.floor(ch / 2) - 1,
        4, sel ? "#ffffff" : inspected ? "#dddddd" : P.label,
        { align: "center", font: f });

      // Level pips at bottom
      const pipW = cw >= 32 ? 5 : 3, pipH = 2, pipGap = cw >= 32 ? 3 : 2;
      const pipsW  = 3 * pipW + 2 * pipGap;
      const pipX0  = x + Math.floor((cw - pipsW) / 2);
      for (let lv = 0; lv < 3; lv++) {
        renderer.drawRect(
          pipX0 + lv * (pipW + pipGap), y + ch - 4,
          pipW, pipH,
          lv < (card.level ?? 0) ? rc : "#111120"
        );
      }

      // Border — gold when moving, white when inspected, grey otherwise
      if (sel) {
        ctx.shadowColor = "rgba(255,200,50,0.65)";
        ctx.shadowBlur  = Math.round(6 * sc);
        const bc = "#ffcc33";
        renderer.drawRect(x - 1, y - 1, cw + 2, 1, bc);
        renderer.drawRect(x - 1, y + ch, cw + 2, 1, bc);
        renderer.drawRect(x - 1, y,      1, ch,     bc);
        renderer.drawRect(x + cw,y,      1, ch,     bc);
        ctx.shadowColor = "transparent";
        ctx.shadowBlur  = 0;
      } else if (inspected) {
        ctx.shadowColor = "rgba(255,255,255,0.4)";
        ctx.shadowBlur  = Math.round(4 * sc);
        const bc = "#cccccc";
        renderer.drawRect(x - 1, y - 1, cw + 2, 1, bc);
        renderer.drawRect(x - 1, y + ch, cw + 2, 1, bc);
        renderer.drawRect(x - 1, y,      1, ch,     bc);
        renderer.drawRect(x + cw,y,      1, ch,     bc);
        ctx.shadowColor = "transparent";
        ctx.shadowBlur  = 0;
      } else {
        renderer.drawRect(x - 1, y - 1, cw + 2, 1, P.muted);
        renderer.drawRect(x - 1, y + ch, cw + 2, 1, P.muted);
        renderer.drawRect(x - 1, y,      1, ch,      P.muted);
        renderer.drawRect(x + cw,y,      1, ch,      P.muted);
      }

    } else {
      // Empty slot — subtle dark box with dotted center
      renderer.drawRect(x, y, cw, ch, "#080808");
      renderer.drawRect(x - 1, y - 1, cw + 2, 1, P.border);
      renderer.drawRect(x - 1, y + ch, cw + 2, 1, P.border);
      renderer.drawRect(x - 1, y,      1, ch,      P.border);
      renderer.drawRect(x + cw,y,      1, ch,      P.border);
      renderer.drawRect(x + Math.floor(cw / 2) - 2, y + Math.floor(ch / 2), 4, 1, P.dim);
    }
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  _rowRects(count, cardW, gap, rowY) {
    const rowW   = count * cardW + Math.max(0, count - 1) * gap;
    const startX = Math.floor((ROOM_WIDTH - rowW) / 2);
    return Array.from({ length: count }, (_, i) => ({
      x: startX + i * (cardW + gap),
      y: rowY,
      w: cardW,
    }));
  }

  _hitTest(pos, cardManager) {
    const activeRects = this._rowRects(cardManager.activeSlotCount, CARD_W, CARD_GAP, ACT_ROW_Y);
    for (let i = 0; i < cardManager.activeSlotCount; i++) {
      if (this._inRect(pos, activeRects[i], CARD_H)) return { type: "active", index: i };
    }

    const autoRects = this._rowRects(cardManager.autoSlotCount, CARD_W, CARD_GAP, AUTO_ROW_Y);
    for (let i = 0; i < cardManager.autoSlotCount; i++) {
      if (this._inRect(pos, autoRects[i], CARD_H)) return { type: "auto", index: i };
    }

    const storeRects = this._rowRects(STORE_PAGE_SIZE, STORE_W, STORE_GAP, STORE_ROW_Y);
    const pageStart  = this._storePage * STORE_PAGE_SIZE;
    for (let i = 0; i < STORE_PAGE_SIZE; i++) {
      if (this._inRect(pos, storeRects[i], STORE_H)) return { type: "storage", index: pageStart + i };
    }

    return null;
  }

  _cardAt(hit, cardManager) {
    if (hit.type === "active")  return cardManager.activeSlots[hit.index] ?? null;
    if (hit.type === "auto")    return cardManager.autoSlots[hit.index]   ?? null;
    if (hit.type === "storage") return cardManager.storage[hit.index]     ?? null;
    return null;
  }

  _inRect(pos, rect, h) {
    return pos.x >= rect.x && pos.x < rect.x + rect.w
        && pos.y >= rect.y && pos.y < rect.y + h;
  }
}
