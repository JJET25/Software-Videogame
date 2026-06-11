// StartScreen.js — Renders the main menu with Play, Restart, Credits, and Exit buttons
// Displays a credits overlay on request and detects a saved deck from localStorage.
import { ROOM_HEIGHT, ROOM_WIDTH } from "../Utils/Constants.js";
import GameplayScreen from "./GameplayScreen.js";
import Screen from "./Screen.js";

// Color palette for all UI elements on this screen
const P = {
  bg: "#0d0520",
  btnNorm: "#1e0850",
  btnHover: "#3d1a70",
  btnTop: "#36145c",
  btnTopHov: "#6a30b0",
  btnBot: "#0a0320",
  border: "#7c4dff",
  borderHov: "#aa88ff",
  corner: "#0d0520",
  txtNorm: "#d0b8ff",
  txtHover: "#00ffb9",
  overlay: "rgba(5,0,18,0.82)",
  boxBg: "#130838",
  divider: "#2a1050",
  muted: "#4a2870",
  accent: "#7c4dff",
};

// Pixel dimensions of each menu button
const BTN_W = 84;
const BTN_H = 13;

// Names displayed in the credits overlay
const TEAM_NAMES = ["Jesus Espinoza", "Gonzalo Zamarron", "Vladimir Reyes"];

const SFX_BASE = "../../Assets/Audios/SFX/";

export default class StartScreen extends Screen {
  // Builds the button list, loads the logo image, and preloads UI sound effects
  enter() {
    this.btnX = (ROOM_WIDTH - BTN_W) / 2;

    this._showCredits = false;
    this._lastHovered = null;
    this._hasSavedDeck = !!localStorage.getItem("dimensionDeck_savedDeck");

    const baseButtons = [
      {
        label: "PLAY",
        y: 100,
        hovered: false,
        action: () => this.screenManager.changeTo(new GameplayScreen()),
      },
      {
        label: "CREDITS",
        y: this._hasSavedDeck ? 136 : 118,
        hovered: false,
        action: () => {
          this._showCredits = true;
        },
      },
      {
        label: "EXIT",
        y: this._hasSavedDeck ? 154 : 136,
        hovered: false,
        // Navigate to root so npx serve always finds index.html with its CSS
        action: () => { window.location.href = "/index.html"; },
      },
    ];

    // Insert a Restart button when a saved deck exists
    if (this._hasSavedDeck) {
      baseButtons.splice(1, 0, {
        label: "RESTART",
        y: 118,
        hovered: false,
        action: () => {
          localStorage.removeItem("dimensionDeck_savedDeck");
          this.screenManager.changeTo(new GameplayScreen());
        },
      });
    }

    this.buttons = baseButtons;

    // Back button displayed inside the credits overlay
    this._backBtn = {
      x: (ROOM_WIDTH - BTN_W) / 2,
      y: ROOM_HEIGHT - 26,
      hovered: false,
    };

    this._logo = new Image();
    this._logo.src = "/Assets/Website/DimensionDeck_Logo.png";

    // Load pixel font and fall back to monospace until ready
    this._font = "monospace";
    document.fonts.load("5px 'Press Start 2P'").then(() => {
      this._font = "'Press Start 2P', monospace";
    });

    this.audio?.loadSFX("hoverUI", SFX_BASE + "HoverUI.wav");
    this.audio?.loadSFX("confirmUI", SFX_BASE + "ConfirmUI.wav");
  }

  // Updates button hover states, handles clicks, and delegates to the credits overlay when open
  update(deltaTime) {
    this.#updateHoverSFX();

    const clicked = this.mouse.consumeClick();

    if (this._showCredits) {
      this.#updateCreditsOverlay(clicked);
      return;
    }

    for (const btn of this.buttons) {
      btn.hovered = this.#isHovered(btn);
      if (clicked && btn.hovered) {
        this.audio?.playSFX("confirmUI");
        btn.action();
      }
    }
  }

  // Draws the background, logo, menu buttons, version label, and credits overlay if active
  draw(renderer) {
    renderer.drawRect(0, 0, ROOM_WIDTH, ROOM_HEIGHT, P.bg);
    this.#drawLogo(renderer);
    renderer.drawRect((ROOM_WIDTH - 90) / 2, 84, 90, 1, P.divider);

    for (const btn of this.buttons) {
      this.#drawButton(renderer, this.btnX, btn.y, btn.hovered, btn.label);
    }

    renderer.drawText("v1.0", ROOM_WIDTH - 4, ROOM_HEIGHT - 5, 3, P.muted, {
      align: "right",
      baseline: "bottom",
      font: this._font,
    });

    if (this._showCredits) this.#drawCredits(renderer);
  }

  // Plays hover SFX when the mouse moves onto a new button
  #updateHoverSFX() {
    const mainHovered = this._showCredits
      ? null
      : (this.buttons.find((b) => this.#isHovered(b))?.label ?? null);

    const backHovered =
      this._showCredits && this.#isHovered(this._backBtn) ? "BACK" : null;

    const nowHovered = mainHovered ?? backHovered;

    if (nowHovered !== this._lastHovered) {
      if (nowHovered) this.audio?.playSFX("hoverUI");
      this._lastHovered = nowHovered;
    }
  }

  // Handles hover and click logic while the credits overlay is open
  #updateCreditsOverlay(clicked) {
    const b = this._backBtn;
    const mx = this.mouse.position.x;
    const my = this.mouse.position.y;
    b.hovered =
      mx >= b.x && mx <= b.x + BTN_W && my >= b.y && my <= b.y + BTN_H;

    if (clicked && b.hovered) {
      this.audio?.playSFX("confirmUI");
      this._showCredits = false;
    }
  }

  // Draws the logo image, or a text fallback if it has not loaded yet
  #drawLogo(renderer) {
    if (this._logo.complete && this._logo.naturalWidth > 0) {
      const lh = 60;
      const lw = Math.round(
        lh * (this._logo.naturalWidth / this._logo.naturalHeight),
      );
      renderer.drawImage(this._logo, (ROOM_WIDTH - lw) / 2, 14, lw, lh);
    } else {
      renderer.drawText("DIMENSION DECK", ROOM_WIDTH / 2, 38, 10, "#d0b8ff", {
        font: this._font,
      });
    }
  }

  // Draws the full-screen credits overlay with panel, team names, course info, and back button
  #drawCredits(renderer) {
    const ctx = renderer.context;
    ctx.fillStyle = P.overlay;
    ctx.fillRect(
      0,
      0,
      ROOM_WIDTH * renderer.scale,
      ROOM_HEIGHT * renderer.scale,
    );

    const pw = 220,
      ph = 138;
    const px = (ROOM_WIDTH - pw) / 2;
    const py = (ROOM_HEIGHT - ph) / 2 - 6;
    const cx = ROOM_WIDTH / 2;

    this.#drawCreditsPanel(renderer, px, py, pw, ph);

    renderer.drawText("CREDITS", cx, py + 14, 7, P.accent, {
      align: "center",
      font: this._font,
    });
    renderer.drawRect(px + 10, py + 22, pw - 20, 1, P.divider);

    TEAM_NAMES.forEach((name, i) => {
      renderer.drawText(name, cx, py + 32 + i * 13, 4.5, P.txtNorm, {
        align: "center",
        font: this._font,
      });
    });

    renderer.drawRect(px + 10, py + 74, pw - 20, 1, P.divider);
    renderer.drawText("TC2005B", cx, py + 82, 5, P.accent, {
      align: "center",
      font: this._font,
    });
    renderer.drawText("Construccion de Software", cx, py + 94, 3.5, P.muted, {
      align: "center",
      font: this._font,
    });
    renderer.drawText("Tec de Monterrey  2026", cx, py + 104, 3.5, P.muted, {
      align: "center",
      font: this._font,
    });

    const b = this._backBtn;
    this.#drawButton(renderer, b.x, b.y, b.hovered, "BACK");
  }

  // Draws the panel background with a 2px border and single-pixel corner cuts
  #drawCreditsPanel(renderer, px, py, pw, ph) {
    renderer.drawRect(px, py, pw, ph, P.boxBg);
    renderer.drawRect(px, py, pw, 2, P.accent);
    renderer.drawRect(px, py + ph - 2, pw, 2, P.accent);
    renderer.drawRect(px, py, 2, ph, P.accent);
    renderer.drawRect(px + pw - 2, py, 2, ph, P.accent);
    // Corner pixels overdrawn with background color to create a beveled look
    renderer.drawRect(px, py, 1, 1, P.bg);
    renderer.drawRect(px + pw - 1, py, 1, 1, P.bg);
    renderer.drawRect(px, py + ph - 1, 1, 1, P.bg);
    renderer.drawRect(px + pw - 1, py + ph - 1, 1, 1, P.bg);
  }

  // Draws a pixel-art RPG button with a top highlight, bottom shadow, borders, and corner cuts
  #drawButton(renderer, x, y, hovered, label) {
    const bg = hovered ? P.btnHover : P.btnNorm;
    const top = hovered ? P.btnTopHov : P.btnTop;
    const bdr = hovered ? P.borderHov : P.border;

    renderer.drawRect(x, y, BTN_W, BTN_H, bg);
    renderer.drawRect(x + 1, y + 1, BTN_W - 2, 1, top);
    renderer.drawRect(x + 1, y + BTN_H - 2, BTN_W - 2, 1, P.btnBot);
    renderer.drawRect(x, y, 2, BTN_H, bdr);
    renderer.drawRect(x + BTN_W - 2, y, 2, BTN_H, bdr);
    renderer.drawRect(x, y, 1, 1, P.corner);
    renderer.drawRect(x + BTN_W - 1, y, 1, 1, P.corner);
    renderer.drawRect(x, y + BTN_H - 1, 1, 1, P.corner);
    renderer.drawRect(x + BTN_W - 1, y + BTN_H - 1, 1, 1, P.corner);

    renderer.drawText(
      label,
      x + BTN_W / 2,
      y + BTN_H / 2,
      5,
      hovered ? P.txtHover : P.txtNorm,
      { align: "center", font: this._font },
    );
  }

  // Returns true if the mouse cursor is inside the button's bounding rectangle
  #isHovered(btn) {
    const { x: mx, y: my } = this.mouse.position;
    return (
      mx >= this.btnX &&
      mx <= this.btnX + BTN_W &&
      my >= btn.y &&
      my <= btn.y + BTN_H
    );
  }
}
