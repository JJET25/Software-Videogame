import { ROOM_HEIGHT, ROOM_WIDTH } from "../Utils/Constants.js";
import GameplayScreen from "./GameplayScreen.js";
import Screen from "./Screen.js";

const P = {
  bg:        "#0d0520",
  btnNorm:   "#1e0850",
  btnHover:  "#3d1a70",
  btnTop:    "#36145c",
  btnTopHov: "#6a30b0",
  btnBot:    "#0a0320",
  border:    "#7c4dff",
  borderHov: "#aa88ff",
  corner:    "#0d0520",
  txtNorm:   "#d0b8ff",
  txtHover:  "#00ffb9",
  overlay:   "rgba(5,0,18,0.82)",
  boxBg:     "#130838",
  divider:   "#2a1050",
  muted:     "#4a2870",
  accent:    "#7c4dff",
};

const BTN_W = 84;
const BTN_H = 13;

export default class StartScreen extends Screen {
  enter() {
    this.btnX = (ROOM_WIDTH - BTN_W) / 2;
    this._showCredits = false;

    this.buttons = [
      {
        label: "PLAY",
        y: 100,
        hovered: false,
        action: () => this.screenManager.changeTo(new GameplayScreen()),
      },
      {
        label: "CREDITS",
        y: 118,
        hovered: false,
        action: () => { this._showCredits = true; },
      },
      {
        label: "EXIT",
        y: 136,
        hovered: false,
        action: () => { window.location.href = "/index.html"; },
      },
    ];

    // Back button inside the credits overlay
    this._backBtn = {
      x: (ROOM_WIDTH - BTN_W) / 2,
      y: ROOM_HEIGHT - 26,
      hovered: false,
    };

    this._logo = new Image();
    this._logo.src = "/Assets/Website/DimensionDeck_Logo.png";

    this._font = "monospace";
    document.fonts.load("5px 'Press Start 2P'").then(() => {
      this._font = "'Press Start 2P', monospace";
    });
  }

  update(deltaTime) {
    const clicked = this.mouse.consumeClick();
    const mx = this.mouse.position.x;
    const my = this.mouse.position.y;

    if (this._showCredits) {
      const b = this._backBtn;
      b.hovered = mx >= b.x && mx <= b.x + BTN_W
               && my >= b.y && my <= b.y + BTN_H;
      if (clicked && b.hovered) this._showCredits = false;
      return;
    }

    for (const btn of this.buttons) {
      btn.hovered = this.#isHovered(btn);
      if (clicked && btn.hovered) btn.action();
    }
  }

  draw(renderer) {
    renderer.drawRect(0, 0, ROOM_WIDTH, ROOM_HEIGHT, P.bg);

    // Logo
    if (this._logo.complete && this._logo.naturalWidth > 0) {
      const lh = 60;
      const lw = Math.round(lh * (this._logo.naturalWidth / this._logo.naturalHeight));
      renderer.drawImage(this._logo, (ROOM_WIDTH - lw) / 2, 14, lw, lh);
    } else {
      renderer.drawText("DIMENSION DECK", ROOM_WIDTH / 2, 38, 10, "#d0b8ff",
        { font: this._font });
    }

    renderer.drawRect((ROOM_WIDTH - 90) / 2, 84, 90, 1, P.divider);

    for (const btn of this.buttons) {
      this.#drawButton(renderer, this.btnX, btn.y, btn.hovered, btn.label);
    }

    renderer.drawText("v1.0", ROOM_WIDTH - 4, ROOM_HEIGHT - 5, 3, P.muted,
      { align: "right", baseline: "bottom", font: this._font });

    if (this._showCredits) this.#drawCredits(renderer);
  }

  // ── Credits overlay ───────────────────────────────────────────────────────
  #drawCredits(renderer) {
    // Dim the background
    const ctx = renderer.context;
    const s   = renderer.scale;
    ctx.fillStyle = P.overlay;
    ctx.fillRect(0, 0, ROOM_WIDTH * s, ROOM_HEIGHT * s);

    // Panel
    const pw = 220;
    const ph = 138;
    const px = (ROOM_WIDTH  - pw) / 2;
    const py = (ROOM_HEIGHT - ph) / 2 - 6;

    renderer.drawRect(px, py, pw, ph, P.boxBg);

    // Panel border (2 px violet)
    renderer.drawRect(px,          py,          pw, 2,  P.accent);
    renderer.drawRect(px,          py + ph - 2, pw, 2,  P.accent);
    renderer.drawRect(px,          py,          2,  ph, P.accent);
    renderer.drawRect(px + pw - 2, py,          2,  ph, P.accent);

    // Corner cuts
    renderer.drawRect(px,          py,          1, 1, P.bg);
    renderer.drawRect(px + pw - 1, py,          1, 1, P.bg);
    renderer.drawRect(px,          py + ph - 1, 1, 1, P.bg);
    renderer.drawRect(px + pw - 1, py + ph - 1, 1, 1, P.bg);

    // Title
    renderer.drawText("CREDITS", ROOM_WIDTH / 2, py + 14, 7, P.accent,
      { align: "center", font: this._font });

    // Thin divider
    renderer.drawRect(px + 10, py + 22, pw - 20, 1, P.divider);

    // Names
    const names = ["Jesus Espinoza", "Gonzalo Zamarron", "Vladimir Reyes"];
    names.forEach((name, i) => {
      renderer.drawText(name, ROOM_WIDTH / 2, py + 32 + i * 13, 4.5, P.txtNorm,
        { align: "center", font: this._font });
    });

    // Class
    renderer.drawRect(px + 10, py + 74, pw - 20, 1, P.divider);
    renderer.drawText("TC2005B", ROOM_WIDTH / 2, py + 82, 5, P.accent,
      { align: "center", font: this._font });
    renderer.drawText("Construccion de Software", ROOM_WIDTH / 2, py + 94, 3.5, P.muted,
      { align: "center", font: this._font });
    renderer.drawText("Tec de Monterrey  2026", ROOM_WIDTH / 2, py + 104, 3.5, P.muted,
      { align: "center", font: this._font });

    // Back button
    const b = this._backBtn;
    this.#drawButton(renderer, b.x, b.y, b.hovered, "BACK");
  }

  // ── Pixel-art RPG button ─────────────────────────────────────────────────
  #drawButton(renderer, x, y, hovered, label) {
    const w   = BTN_W;
    const h   = BTN_H;
    const bg  = hovered ? P.btnHover  : P.btnNorm;
    const top = hovered ? P.btnTopHov : P.btnTop;
    const bdr = hovered ? P.borderHov : P.border;

    renderer.drawRect(x, y, w, h, bg);
    renderer.drawRect(x + 1, y + 1,     w - 2, 1, top);
    renderer.drawRect(x + 1, y + h - 2, w - 2, 1, P.btnBot);

    renderer.drawRect(x,         y, 2, h, bdr);
    renderer.drawRect(x + w - 2, y, 2, h, bdr);

    renderer.drawRect(x,         y,         1, 1, P.corner);
    renderer.drawRect(x + w - 1, y,         1, 1, P.corner);
    renderer.drawRect(x,         y + h - 1, 1, 1, P.corner);
    renderer.drawRect(x + w - 1, y + h - 1, 1, 1, P.corner);

    renderer.drawText(label, x + w / 2, y + h / 2, 5,
      hovered ? P.txtHover : P.txtNorm,
      { align: "center", font: this._font });
  }

  #isHovered(btn) {
    const mx = this.mouse.position.x;
    const my = this.mouse.position.y;
    return mx >= this.btnX && mx <= this.btnX + BTN_W
        && my >= btn.y    && my <= btn.y  + BTN_H;
  }
}
