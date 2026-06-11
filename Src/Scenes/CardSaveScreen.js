// CardSaveScreen.js — Lets the player select up to 3 cards to save as the starting deck for the next run
// Auto-saves all cards when three or fewer were acquired; otherwise shows a selection UI.
import Screen from "./Screen.js";
import { ROOM_HEIGHT, ROOM_WIDTH } from "../Utils/Constants.js";

// Color palette for this screen
const P = {
  bg:       "#0d0520",
  panel:    "#130838",
  divider:  "#2a1050",
  muted:    "#4a2870",
  sub:      "#866ea7",
  text:     "#d0b8ff",
  accent:   "#7c4dff",
  selected: "#44ff99",
  selBg:    "#0a2a1a",
  btnNorm:  "#1e0850",
  btnHover: "#3d1a70",
  btnTop:   "#36145c",
  btnTopH:  "#6a30b0",
  btnBot:   "#0a0320",
  border:   "#7c4dff",
  borderH:  "#aa88ff",
  corner:   "#0d0520",
  txtNorm:  "#d0b8ff",
  txtHover: "#00ffb9",
  cardBg:   "#0e0e0e",
};

// Maps rarity names to their highlight colors
const RARITY_COLOR = {
  common:    "#9b8fb0",
  rare:      "#4f8fff",
  epic:      "#b65cff",
  legendary: "#ffb43c",
};

// Card thumbnail dimensions
const CW = 22;
const CH = 30;
const GAP = 5;

// Save button dimensions
const BTN_W = 100;
const BTN_H = 13;

// Maximum cards the player can save
const MAX_SAVE = 3;
// localStorage key used to persist the saved deck
const LS_KEY   = "dimensionDeck_savedDeck";

export default class CardSaveScreen extends Screen {
  // Reads new cards from context and auto-saves if the count is within the limit
  enter(context = {}) {
    this._newCards = context.newCards ?? [];
    this._selected = new Set();
    this._autoSave = this._newCards.length <= MAX_SAVE;
    this._done     = false;

    this._btnHovered = false;

    this._font = "monospace";
    document.fonts.load("5px 'Press Start 2P'").then(() => {
      this._font = "'Press Start 2P', monospace";
    });

    if (this._autoSave) {
      this._save(this._newCards);
    }
  }

  // Handles card selection clicks and save/continue button interaction
  update(_dt) {
    if (this._done) return;

    const mx = this.mouse.position.x;
    const my = this.mouse.position.y;
    const clicked = this.mouse.consumeClick();

    if (this._autoSave) {
      if (clicked || this.input.wasKeyPressed("ENTER")) {
        this._goToStart();
      }
      return;
    }

    if (clicked) {
      const cards = this._newCards;
      const rects = this._cardRects(cards.length);
      for (let i = 0; i < cards.length; i++) {
        const r = rects[i];
        if (mx >= r.x && mx < r.x + CW && my >= r.y && my < r.y + CH) {
          // Toggle selection; enforce the MAX_SAVE limit
          if (this._selected.has(i)) {
            this._selected.delete(i);
          } else if (this._selected.size < MAX_SAVE) {
            this._selected.add(i);
          }
          return;
        }
      }

      if (this._isBtnHovered(mx, my)) {
        const toSave = [...this._selected].map(i => this._newCards[i]);
        this._save(toSave);
        this._goToStart();
        return;
      }
    }

    this._btnHovered = this._isBtnHovered(mx, my);
  }

  // Draws the title, auto-save confirmation or card grid, and the save button
  draw(renderer) {
    const cx = ROOM_WIDTH / 2;
    const f  = this._font;

    renderer.drawRect(0, 0, ROOM_WIDTH, ROOM_HEIGHT, P.bg);

    renderer.drawText("SAVE CARDS", cx, 14, 8, P.accent, { align: "center", font: f });
    renderer.drawRect((ROOM_WIDTH - 140) / 2, 22, 140, 1, P.divider);

    if (this._autoSave) {
      this.#drawAutoSave(renderer, cx, f);
      return;
    }

    const sel = this._selected.size;
    renderer.drawText(
      `SELECT UP TO 3 CARDS  (${sel}/3)`,
      cx, 32, 3.5, P.sub, { align: "center", font: f }
    );

    this.#drawCards(renderer, cx, f);

    const btnX = (ROOM_WIDTH - BTN_W) / 2;
    const btnY = ROOM_HEIGHT - 24;
    this.#drawButton(renderer, btnX, btnY, this._btnHovered, f);
  }

  // Shows a confirmation message and the auto-saved cards
  #drawAutoSave(renderer, cx, f) {
    const count = this._newCards.length;
    renderer.drawText(
      count === 0 ? "NO NEW CARDS FOUND" : `${count} CARD${count > 1 ? "S" : ""} SAVED!`,
      cx, 33, 7,
      count === 0 ? P.muted : P.selected,
      { align: "center", font: f }
    );

    if (count > 0) {
      this.#drawCards(renderer, cx, f, 52);
      renderer.drawText(
        "These cards will replace your starter deck.",
        cx, ROOM_HEIGHT - 30, 3, P.sub, { align: "center", font: f }
      );
    }

    renderer.drawText(
      "CLICK TO CONTINUE",
      cx, ROOM_HEIGHT - 10, 4, P.accent, { align: "center", font: f }
    );
  }

  // Renders each card thumbnail with art, a rarity border, level pips, and the card name
  #drawCards(renderer, _cx, f, startY = 48) {
    const cards = this._newCards;
    const rects = this._cardRects(cards.length, startY);

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const r    = rects[i];
      const sel  = this._selected.has(i) || this._autoSave;
      const rc   = RARITY_COLOR[card.rarity] ?? P.sub;

      renderer.drawRect(r.x, r.y, CW, CH, sel ? P.selBg : P.cardBg);

      if (card._img?.complete && card._img.naturalWidth > 0) {
        renderer.drawImage(card._img, r.x + 1, r.y + 1, CW - 2, CH - 2);
      } else {
        renderer.drawText(
          card.name.slice(0, 3).toUpperCase(),
          r.x + Math.floor(CW / 2),
          r.y + Math.floor(CH / 2),
          3, P.sub, { align: "center", font: f }
        );
      }

      // Green border when selected, rarity color otherwise
      const borderColor = sel ? P.selected : rc;
      this.#frame1px(renderer, r.x, r.y, CW, CH, borderColor);

      // Three level pips at the bottom of the card
      const lvl = card.level ?? 1;
      const pipW = 3; const pipGap = 1;
      const pipsW = 3 * pipW + 2 * pipGap;
      const pipX0 = r.x + Math.floor((CW - pipsW) / 2);
      for (let p = 0; p < 3; p++) {
        renderer.drawRect(
          pipX0 + p * (pipW + pipGap),
          r.y + CH - 3,
          pipW, 2,
          p < lvl ? P.accent : "#1a1a1a"
        );
      }

      const name = card.name.length > 9 ? card.name.slice(0, 8) + "." : card.name;
      renderer.drawText(
        name.toUpperCase(), r.x + Math.floor(CW / 2), r.y + CH + 6,
        2.5, sel ? P.selected : P.muted, { align: "center", font: f }
      );
    }
  }

  // Draws the Save / Skip button with a pixel-art style
  #drawButton(renderer, x, y, hovered, f) {
    const bg  = hovered ? P.btnHover : P.btnNorm;
    const top = hovered ? P.btnTopH  : P.btnTop;
    const bdr = hovered ? P.borderH  : P.border;

    renderer.drawRect(x, y, BTN_W, BTN_H, bg);
    renderer.drawRect(x + 1, y + 1, BTN_W - 2, 1, top);
    renderer.drawRect(x + 1, y + BTN_H - 2, BTN_W - 2, 1, P.btnBot);
    renderer.drawRect(x, y, 2, BTN_H, bdr);
    renderer.drawRect(x + BTN_W - 2, y, 2, BTN_H, bdr);
    renderer.drawRect(x, y, 1, 1, P.corner);
    renderer.drawRect(x + BTN_W - 1, y, 1, 1, P.corner);
    renderer.drawRect(x, y + BTN_H - 1, 1, 1, P.corner);
    renderer.drawRect(x + BTN_W - 1, y + BTN_H - 1, 1, 1, P.corner);

    const label = this._selected.size === 0 ? "SKIP & CONTINUE" : "SAVE & CONTINUE";
    renderer.drawText(
      label,
      x + BTN_W / 2, y + BTN_H / 2,
      4, hovered ? P.txtHover : P.txtNorm,
      { align: "center", font: f }
    );
  }

  // Draws a 1px rectangular border using four drawRect calls
  #frame1px(renderer, x, y, w, h, color) {
    renderer.drawRect(x, y, w, 1, color);
    renderer.drawRect(x, y + h - 1, w, 1, color);
    renderer.drawRect(x, y, 1, h, color);
    renderer.drawRect(x + w - 1, y, 1, h, color);
  }

  // Returns centered (x,y) positions for each card thumbnail, up to two rows
  _cardRects(count, startY = 48) {
    if (count === 0) return [];
    const maxPerRow = Math.min(count, 9);
    const rows = Math.ceil(count / maxPerRow);
    const rects = [];
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / maxPerRow);
      const col = i % maxPerRow;
      const rowCount = row < rows - 1 ? maxPerRow : count - row * maxPerRow;
      const rowW = rowCount * CW + Math.max(0, rowCount - 1) * GAP;
      const sx = Math.floor((ROOM_WIDTH - rowW) / 2);
      rects.push({
        x: sx + col * (CW + GAP),
        y: startY + row * (CH + 14),
      });
    }
    return rects;
  }

  // Returns true if the mouse is within the save button bounds
  _isBtnHovered(mx, my) {
    const btnX = (ROOM_WIDTH - BTN_W) / 2;
    const btnY = ROOM_HEIGHT - 24;
    return mx >= btnX && mx < btnX + BTN_W && my >= btnY && my < btnY + BTN_H;
  }

  // Persists the selected card names and levels to localStorage, or clears the key if empty
  _save(cards) {
    if (cards.length === 0) {
      localStorage.removeItem(LS_KEY);
      return;
    }
    const data = cards.map(c => ({ name: c.name, level: c.level ?? 1 }));
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  }

  // Marks the screen as done and navigates back to the start menu
  _goToStart() {
    this._done = true;
    import("./StartScreen.js").then(({ default: StartScreen }) => {
      this.screenManager.changeTo(new StartScreen());
    });
  }
}
