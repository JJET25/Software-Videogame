// DeckScreen.js — Full-screen deck management overlay for inspecting, moving, and organizing cards
// Displays a preview panel on the left and active/auto/storage grids on the right.
import { ROOM_WIDTH, ROOM_HEIGHT } from "../Utils/Constants.js";
import { CardType } from "../cards/Card.js";

// Color palette for this screen
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
};

// Maps rarity names to their highlight colors
const RARITY_COLOR = {
  common: "#9b8fb0",
  rare: "#4f8fff",
  epic: "#b65cff",
  legendary: "#ffb43c",
};

// Cooldown-reduction percentage per card level
const LEVEL_CD_REDUCTION = { 1: 0, 2: 30, 3: 51 };

// Outer panel bounds
const PX = 2,
  PY = 2,
  PW = 268,
  PH = 172;
const TITLE_Y = 11;
const DIV1_Y = 18;

// Left column width and derived positions
const LEFT_W = 92;
const SPLIT_X = PX + LEFT_W;
const LEFT_CX = PX + Math.floor(LEFT_W / 2);
const RX0 = SPLIT_X + 3;
const RW = PX + PW - 2 - RX0;

// Preview card dimensions (approximately 8:11 aspect ratio)
const PV_W = 50,
  PV_H = 69;
const PV_X = LEFT_CX - Math.floor(PV_W / 2);
const PV_CARD_Y = 30;
const PV_RAR_Y = PV_CARD_Y + PV_H + 5;
const PV_DESC_Y = PV_RAR_Y + 8;
const PV_LEVEL_Y = 152;
const PV_CD_Y = 162;

// Grid card dimensions and spacing
const G_W = 18,
  G_H = 25,
  G_GAP = 3;
// Number of cards visible in storage per page
const STORE_PAGE_SIZE = 8;

// Row positions for each section label and card row in the right column
const R_ACT_LABEL = 24;
const R_ACT_ROW = 28;
const R_ACT_HINT = R_ACT_ROW + G_H + 1;
const R_AUTO_LABEL = R_ACT_HINT + 6;
const R_AUTO_ROW = R_AUTO_LABEL + 5;
const R_STORE_LABEL = R_AUTO_ROW + G_H + 6;
const R_STORE_ROW = R_STORE_LABEL + 5;
const R_HINT_Y = 140;

export default class DeckScreen {
  // Initializes closed state, selection tracking, and loads the pixel font
  constructor() {
    this._open = false;
    this._selected = null;
    this._inspected = null;
    this._storePage = 0;

    this._font = "monospace";
    document.fonts.load("5px 'Press Start 2P'").then(() => {
      this._font = "'Press Start 2P', monospace";
    });
  }

  // Returns true when the deck screen is currently open
  get isOpen() {
    return this._open;
  }

  // Handles TAB toggle, page navigation, and click-based card interaction
  update(input, mouse, cardManager, audio = null) {
    if (input.wasKeyPressed("TAB")) {
      this._open = !this._open;
      if (!this._open) {
        this._selected = null;
        this._inspected = null;
      }
    }
    if (!this._open) return;

    const totalPages = this.#totalPages(cardManager);
    if (input.wasKeyPressed("ARROWLEFT"))
      this._storePage = Math.max(0, this._storePage - 1);
    if (input.wasKeyPressed("ARROWRIGHT"))
      this._storePage = Math.min(totalPages - 1, this._storePage + 1);
    this._storePage = Math.min(this._storePage, totalPages - 1);

    if (!mouse.consumeClick()) return;

    const hit = this._hitTest(mouse.position, cardManager);
    const card = hit ? this._cardAt(hit, cardManager) : null;

    if (this._selected) this.#handleDrop(hit, cardManager, audio);
    else this.#handleInspectOrPickup(card, hit, audio);
  }

  // Draws the full-screen overlay with panel chrome, preview, and management sections
  draw(renderer, cardManager) {
    if (!this._open) return;
    const f = this._font;
    const ctx = renderer.context;
    const sc = renderer.scale;
    const cx = ROOM_WIDTH / 2;

    renderer.drawFlash("rgba(13,5,32,0.92)");
    this.#drawPanel(renderer, ctx, sc, cx, f);
    this.#drawPreview(renderer, ctx, sc, f, cardManager);
    this.#drawManagement(renderer, ctx, sc, f, cardManager);
  }

  // Returns the total number of storage pages for the current card count
  #totalPages(cardManager) {
    return Math.max(1, Math.ceil(cardManager.storage.length / STORE_PAGE_SIZE));
  }

  // On first click selects for inspection; on second click picks up for moving
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

  // Drops the held card into a valid target slot or cancels the move
  #handleDrop(hit, cardManager, audio) {
    if (hit) {
      const src = this._selected.card;
      const ok =
        hit.type === "storage" ||
        (hit.type === "active" && src.type === CardType.ACTIVE) ||
        (hit.type === "auto" && src.type === CardType.AUTOMATIC);
      if (ok) {
        cardManager.assignToSlot(src, hit.type, hit.index);
        audio?.playSFX("equip");
      }
    }
    this._selected = null;
    this._inspected = null;
  }

  // Returns the card to show in the preview: inspected card, held card, or first available card
  #previewCard(cardManager) {
    if (this._inspected?.card) return this._inspected.card;
    if (this._selected?.card) return this._selected.card;
    const active = cardManager.activeSlots
      .slice(0, cardManager.activeSlotCount)
      .find(Boolean);
    if (active) return active;
    const auto = cardManager.autoSlots
      .slice(0, cardManager.autoSlotCount)
      .find(Boolean);
    if (auto) return auto;
    return cardManager.storage[0] ?? null;
  }

  // Draws the outer panel background, title, horizontal divider, and vertical column separator
  #drawPanel(renderer, ctx, sc, cx, f) {
    renderer.drawRect(PX, PY, PW, PH, P.bg);
    this.#frame2px(renderer, PX, PY, PW, PH, P.border);

    ctx.shadowColor = "rgba(200,200,200,0.45)";
    ctx.shadowBlur = Math.round(9 * sc);
    renderer.drawText("MANAGE DECK", cx, TITLE_Y, 7, P.text, {
      align: "center",
      font: f,
    });
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    renderer.drawRect(PX, DIV1_Y, PW, 1, P.border);
    renderer.drawRect(SPLIT_X, DIV1_Y + 1, 1, PY + PH - DIV1_Y - 3, P.border);
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

  // Draws the large card preview, rarity label, name, description, level stars, and cooldown reduction
  #drawPreview(renderer, ctx, sc, f, cardManager) {
    const card = this.#previewCard(cardManager);

    if (!card) {
      renderer.drawText("NO CARDS", LEFT_CX, 80, 4, P.dim, {
        align: "center",
        font: f,
      });
      return;
    }

    const rc = RARITY_COLOR[card.rarity] ?? P.sub;

    // Big card art with a rarity-colored glow
    ctx.shadowColor = rc + "99";
    ctx.shadowBlur = Math.round(6 * sc);
    this.#drawCardArt(renderer, card, PV_X, PV_CARD_Y, PV_W, PV_H, rc, f);
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    renderer.drawText(card.rarity.toUpperCase(), LEFT_CX, PV_RAR_Y, 3, rc, {
      align: "center",
      font: f,
    });

    // Name wrapped to a maximum of 2 lines
    const nameLines = this.#wrap(card.name.toUpperCase(), 13).slice(0, 2);
    nameLines.forEach((ln, i) =>
      renderer.drawText(ln, LEFT_CX, PV_DESC_Y + i * 7, 4, P.text, {
        align: "center",
        font: f,
      }),
    );

    // Description wrapped below the name
    const descStart = PV_DESC_Y + nameLines.length * 7 + 3;
    const descLines = this.#wrap(
      card.description ?? "No description.",
      16,
    ).slice(0, 4);
    descLines.forEach((ln, i) =>
      renderer.drawText(ln, LEFT_CX, descStart + i * 7, 3, P.label, {
        align: "center",
        font: f,
      }),
    );

    // Level display with filled and empty star characters
    const lvl = card.level ?? 1;
    const stars = "★".repeat(lvl) + "☆".repeat(3 - lvl);
    renderer.drawText(`LV ${lvl}`, LEFT_CX - 14, PV_LEVEL_Y, 4, P.sub, {
      align: "center",
      font: f,
    });
    renderer.drawText(stars, LEFT_CX + 12, PV_LEVEL_Y, 4, P.accent, {
      align: "center",
      font: f,
    });

    const cd = LEVEL_CD_REDUCTION[lvl] ?? 0;
    renderer.drawText(
      cd > 0 ? `COOLDOWN -${cd}%` : "BASE COOLDOWN",
      LEFT_CX,
      PV_CD_Y,
      3,
      cd > 0 ? P.accent : P.dim,
      { align: "center", font: f },
    );
  }

  // Draws the active slots, auto slots, and paginated storage grid with labels
  #drawManagement(renderer, ctx, sc, f, cardManager) {
    renderer.drawText("ACTIVE", RX0, R_ACT_LABEL, 4, P.sub, {
      align: "left",
      font: f,
    });
    const actRects = this._rowRects(cardManager.activeSlotCount, R_ACT_ROW);
    for (let i = 0; i < cardManager.activeSlotCount; i++) {
      this.#drawCard(
        renderer,
        cardManager.activeSlots[i],
        actRects[i],
        ctx,
        sc,
        f,
      );
      renderer.drawText(
        String(i + 1),
        actRects[i].x + Math.floor(G_W / 2),
        R_ACT_HINT,
        3,
        P.dim,
        { align: "center", font: f },
      );
    }

    renderer.drawText("AUTOMATIC", RX0, R_AUTO_LABEL, 4, P.sub, {
      align: "left",
      font: f,
    });
    const autoRects = this._rowRects(cardManager.autoSlotCount, R_AUTO_ROW);
    for (let i = 0; i < cardManager.autoSlotCount; i++) {
      this.#drawCard(
        renderer,
        cardManager.autoSlots[i],
        autoRects[i],
        ctx,
        sc,
        f,
      );
    }

    const total = cardManager.storage.length;
    const totalPages = this.#totalPages(cardManager);
    const pageStart = this._storePage * STORE_PAGE_SIZE;
    const pageCards = cardManager.storage.slice(
      pageStart,
      pageStart + STORE_PAGE_SIZE,
    );

    renderer.drawText(
      total === 0 ? "STORAGE (EMPTY)" : `STORAGE [${total}]`,
      RX0,
      R_STORE_LABEL,
      4,
      P.sub,
      { align: "left", font: f },
    );
    if (totalPages > 1) {
      renderer.drawText(
        `< ${this._storePage + 1}/${totalPages} >`,
        PX + PW - 4,
        R_STORE_LABEL,
        3,
        P.dim,
        { align: "right", font: f },
      );
    }

    const storeRects = this._rowRects(STORE_PAGE_SIZE, R_STORE_ROW);
    for (let i = 0; i < STORE_PAGE_SIZE; i++) {
      this.#drawCard(renderer, pageCards[i] ?? null, storeRects[i], ctx, sc, f);
    }

    renderer.drawText(
      "[CLICK] INSPECT   [2x] MOVE   [TAB] CLOSE",
      RX0 + Math.floor(RW / 2),
      R_HINT_Y,
      3,
      P.dim,
      { align: "center", font: f },
    );
  }

  // Draws a single grid card: art, glow when selected/inspected, level tag, and pips
  #drawCard(renderer, card, rect, ctx, sc, f) {
    const { x, y } = rect;

    if (!card) {
      renderer.drawRect(x, y, G_W, G_H, "#0a0a0a");
      this.#frame1px(renderer, x, y, G_W, G_H, P.muted);
      return;
    }

    const rc = RARITY_COLOR[card.rarity] ?? P.sub;
    const sel = this._selected?.card === card;
    const inspected = this._inspected?.card === card;

    if (sel || inspected) {
      ctx.shadowColor = (sel ? "#ffcc33" : P.accent) + "aa";
      ctx.shadowBlur = Math.round(5 * sc);
    }
    this.#drawCardArt(renderer, card, x, y, G_W, G_H, sel ? "#ffcc33" : rc, f);
    if (sel || inspected) {
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
    }

    // Level tag in the top-right corner for upgraded cards
    const lvl = card.level ?? 1;
    if (lvl > 1) {
      const tagW = 8;
      renderer.drawRect(
        x + G_W - tagW - 1,
        y + 1,
        tagW,
        6,
        "rgba(80,80,80,0.92)",
      );
      renderer.drawText(
        `L${lvl}`,
        x + G_W - Math.floor(tagW / 2) - 1,
        y + 4,
        3,
        "#ffffff",
        { align: "center", font: f },
      );
    }

    // Three level pips along the bottom of the card
    const pipW = 3,
      pipGap = 1;
    const pipsW = 3 * pipW + 2 * pipGap;
    const pipX0 = x + Math.floor((G_W - pipsW) / 2);
    for (let i = 0; i < 3; i++) {
      renderer.drawRect(
        pipX0 + i * (pipW + pipGap),
        y + G_H - 3,
        pipW,
        2,
        i < lvl ? P.accent : "#1a1a1a",
      );
    }
  }

  // Draws a card background, image or name fallback, and a 1px colored border
  #drawCardArt(renderer, card, x, y, w, h, contour, f) {
    renderer.drawRect(x, y, w, h, P.cardBg);
    if (card._img?.complete && card._img.naturalWidth > 0) {
      renderer.drawImage(card._img, x + 1, y + 1, w - 2, h - 2);
    } else {
      renderer.drawText(
        card.name.slice(0, 3).toUpperCase(),
        x + Math.floor(w / 2),
        y + Math.floor(h / 2),
        3,
        P.label,
        { align: "center", font: f },
      );
    }
    this.#frame1px(renderer, x, y, w, h, contour);
  }

  // Draws a 1px rectangular outline using four drawRect calls
  #frame1px(renderer, x, y, w, h, color) {
    renderer.drawRect(x, y, w, 1, color);
    renderer.drawRect(x, y + h - 1, w, 1, color);
    renderer.drawRect(x, y, 1, h, color);
    renderer.drawRect(x + w - 1, y, 1, h, color);
  }

  // Splits text into lines no longer than maxChars words
  #wrap(text, maxChars) {
    const words = String(text ?? "").split(/\s+/);
    const lines = [];
    let line = "";
    for (const w of words) {
      const next = line ? line + " " + w : w;
      if (next.length > maxChars && line) {
        lines.push(line);
        line = w;
      } else line = next;
    }
    if (line) lines.push(line);
    return lines;
  }

  // Returns centered bounding rects for a row of count cards starting at rowY
  _rowRects(count, rowY) {
    const rowW = count * G_W + Math.max(0, count - 1) * G_GAP;
    const startX = RX0 + Math.floor((RW - rowW) / 2);
    return Array.from({ length: count }, (_, i) => ({
      x: startX + i * (G_W + G_GAP),
      y: rowY,
      w: G_W,
    }));
  }

  // Returns a hit descriptor for the slot under the given mouse position, or null
  _hitTest(pos, cardManager) {
    const act = this._rowRects(cardManager.activeSlotCount, R_ACT_ROW);
    for (let i = 0; i < cardManager.activeSlotCount; i++)
      if (this._inRect(pos, act[i], G_H)) return { type: "active", index: i };

    const auto = this._rowRects(cardManager.autoSlotCount, R_AUTO_ROW);
    for (let i = 0; i < cardManager.autoSlotCount; i++)
      if (this._inRect(pos, auto[i], G_H)) return { type: "auto", index: i };

    const store = this._rowRects(STORE_PAGE_SIZE, R_STORE_ROW);
    const pageStart = this._storePage * STORE_PAGE_SIZE;
    for (let i = 0; i < STORE_PAGE_SIZE; i++)
      if (this._inRect(pos, store[i], G_H))
        return { type: "storage", index: pageStart + i };

    return null;
  }

  // Returns the card object at the given hit location, or null if the slot is empty
  _cardAt(hit, cardManager) {
    if (hit.type === "active")
      return cardManager.activeSlots[hit.index] ?? null;
    if (hit.type === "auto") return cardManager.autoSlots[hit.index] ?? null;
    if (hit.type === "storage") return cardManager.storage[hit.index] ?? null;
    return null;
  }

  // Returns true if the position falls within the given rect bounds
  _inRect(pos, rect, h) {
    return (
      pos.x >= rect.x &&
      pos.x < rect.x + rect.w &&
      pos.y >= rect.y &&
      pos.y < rect.y + h
    );
  }
}
