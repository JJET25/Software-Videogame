// PauseMenu.js — In-game pause overlay with audio sliders, brightness control, key bindings, and action buttons
import { ROOM_WIDTH, ROOM_HEIGHT } from "../Utils/Constants.js";

// Color palette for this menu
const P = {
  bg: "#0d0520",
  border: "#2a1050",
  muted: "#4a2870",
  sub: "#866ea7",
  text: "#d0b8ff",
  label: "#a090cc",
  dim: "#5a3878",
  sliderBg: "#14082a",
  sliderFg: "#5030a0",
  sliderHd: "#9060e0",
};

// Panel pixel dimensions and position
const PW = 220,
  PH = 158;
const PX = Math.floor((ROOM_WIDTH - PW) / 2);
const PY = Math.floor((ROOM_HEIGHT - PH) / 2);

// Y position of the divider below the title
const HDR_DIV_Y = PY + 22;

// Column split for left (audio/visual) and right (controls)
const SPLIT_X = PX + 100;
const RIGHT_X = SPLIT_X + 2;
const CX_LEFT = PX + 2 + Math.floor((SPLIT_X - PX - 2) / 2);
const CX_RIGHT = RIGHT_X + Math.floor((PX + PW - 2 - RIGHT_X) / 2);

// Slider track position and size
const TRACK_X = PX + 4;
const TRACK_W = 86;
const TRACK_H = 5;

// Vertical positions for each slider
const MUS_Y = PY + 43;
const SFX_Y = PY + 58;
const MID_DIV = PY + 69;
const BRI_Y = PY + 88;

// Colorblind mode buttons row (below brightness slider)
const CB_LBL_Y = BRI_Y + 11;
const CB_BTN_Y = BRI_Y + 15;
const CB_BTN_H = 5;
const CB_BTN_W = 19;
const CB_BTN_GAP = 2;
const CB_MODES = ['off', 'protanopia', 'deuteranopia', 'tritanopia'];
const CB_LBLS  = ['OFF', 'PRO', 'DEU', 'TRI'];
const CB_BTNS  = CB_MODES.map((mode, i) => ({
  x: TRACK_X + i * (CB_BTN_W + CB_BTN_GAP),
  y: CB_BTN_Y,
  w: CB_BTN_W,
  h: CB_BTN_H,
  mode,
  label: CB_LBLS[i],
}));

// Controls list starting Y and row spacing
const CTRL_Y0 = PY + 40;
const CTRL_DY = 10;

// Key-action pairs shown in the controls column
const CONTROLS = [
  ["W/A/S/D", "MOVE"],
  ["SPACE", "DASH"],
  ["1-5", "CARD"],
  ["CLICK", "USE"],
  ["TAB", "DECK"],
  ["ESC", "PAUSE"],
];

// Button row geometry
const BTN_SEP_Y = PY + 110;
const BTN_R1_Y = BTN_SEP_Y + 2;
const BTN_R1_H = 19;
const BTN_MID_Y = BTN_R1_Y + BTN_R1_H;
const BTN_R2_Y = BTN_MID_Y + 2;
const BTN_R2_H = PY + PH - 2 - BTN_R2_Y;

const INNER_W = PW - 4;
const HALF_W = Math.floor(INNER_W / 2);

// Bounding rects for each action button
const RESUME_BTN = { x: PX + 2, y: BTN_R1_Y, w: HALF_W, h: BTN_R1_H };
const RESTART_BTN = {
  x: PX + 2 + HALF_W,
  y: BTN_R1_Y,
  w: INNER_W - HALF_W,
  h: BTN_R1_H,
};
const MENU_BTN = { x: PX + 2, y: BTN_R2_Y, w: INNER_W, h: BTN_R2_H };

export default class PauseMenu {
  // Initializes audio reference, slider drag state, and syncs global volume/brightness globals
  constructor(audio = null) {
    this._audio = audio;
    this._dragging = null;
    this._lastHovered = null;
    this._lastDragVolume = -1;

    // Initialize session globals only on first construction
    if (window.gameVolume === undefined) window.gameVolume = 1.0;
    if (window.gameSFXVolume === undefined) window.gameSFXVolume = 1.0;
    if (window.gameBrightness === undefined) window.gameBrightness = 1.0;

    // Sync the audio bus to the persisted values
    audio?.setBGMVolume(window.gameVolume);
    audio?.setSFXVolume(window.gameSFXVolume);

    if (window.colorblindMode === undefined)
      window.colorblindMode = localStorage.getItem('cbMode') || 'off';

    // Load pixel font and fall back to monospace until ready
    this._font = "monospace";
    document.fonts.load("5px 'Press Start 2P'").then(() => {
      this._font = "'Press Start 2P', monospace";
    });
  }

  // Processes slider drags, hover SFX, and clicks; returns 'resume' | 'restart' | 'menu' | null
  update(mouse) {
    const { x: mx, y: my } = mouse.position;

    this.#updateDrag(mouse, mx);
    this.#updateHoverSFX(mx, my);

    if (!mouse.consumeClick()) return null;
    return this.#handleClick(mx, my);
  }

  // Draws the dimmed overlay, panel, left column, right column, and action buttons
  draw(renderer, mouse) {
    const { x: mx, y: my } = mouse.position;
    const f = this._font;
    const cx = ROOM_WIDTH / 2;

    renderer.drawRect(0, 0, ROOM_WIDTH, ROOM_HEIGHT, "rgba(13,5,32,0.88)");

    this.#drawPanel(renderer, cx, f);
    this.#drawLeftColumn(renderer, f);
    this.#drawRightColumn(renderer, f);
    this.#drawButtons(renderer, mx, my, f);
  }

  // Continues an active slider drag while the mouse button is held
  #updateDrag(mouse, mx) {
    if (!mouse.leftDown) {
      this._dragging = null;
      this._lastDragVolume = -1;
      return;
    }

    const v = this._norm(mx);

    if (this._dragging === "music") {
      window.gameVolume = v;
      this._audio?.setBGMVolume(v);
    } else if (this._dragging === "sfx") {
      window.gameSFXVolume = v;
      this._audio?.setSFXVolume(v);
    } else if (this._dragging === "brightness") {
      window.gameBrightness = v;
    } else {
      return;
    }

    // Play hover SFX only when the value crosses a 10% threshold to avoid flooding
    if (Math.abs(v - this._lastDragVolume) >= 0.1) {
      this._audio?.playSFX("hoverUI");
      this._lastDragVolume = v;
    }
  }

  // Plays hover SFX when the mouse moves onto a new button
  #updateHoverSFX(mx, my) {
    const nowHovered = this._hit(mx, my, RESUME_BTN)
      ? "resume"
      : this._hit(mx, my, RESTART_BTN)
        ? "restart"
        : this._hit(mx, my, MENU_BTN)
          ? "menu"
          : null;

    if (nowHovered !== this._lastHovered) {
      if (nowHovered) this._audio?.playSFX("hoverUI");
      this._lastHovered = nowHovered;
    }
  }

  // Handles a click; returns an action string or begins a slider drag
  #handleClick(mx, my) {
    if (this._hit(mx, my, RESUME_BTN)) {
      this._audio?.playSFX("confirmUI");
      return "resume";
    }
    if (this._hit(mx, my, RESTART_BTN)) {
      this._audio?.playSFX("confirmUI");
      return "restart";
    }
    if (this._hit(mx, my, MENU_BTN)) {
      this._audio?.playSFX("confirmUI");
      return "menu";
    }

    // Colorblind mode buttons — clicking the active mode turns it off (toggle)
    for (const btn of CB_BTNS) {
      if (this._hit(mx, my, btn)) {
        const next = (window.colorblindMode || 'off') === btn.mode ? 'off' : btn.mode;
        window.colorblindMode = next;
        if (typeof window.applyColorblindMode === 'function') {
          window.applyColorblindMode(next);
        }
        return null;
      }
    }

    // Slider hit areas are taller than the visible track for easier mouse targeting
    const sh = { x: TRACK_X, w: TRACK_W, h: TRACK_H + 12 };

    sh.y = MUS_Y - 6;
    if (this._hit(mx, my, sh)) {
      this._dragging = "music";
      window.gameVolume = this._norm(mx);
      this._audio?.setBGMVolume(window.gameVolume);
    }
    sh.y = SFX_Y - 6;
    if (this._hit(mx, my, sh)) {
      this._dragging = "sfx";
      window.gameSFXVolume = this._norm(mx);
      this._audio?.setSFXVolume(window.gameSFXVolume);
    }
    sh.y = BRI_Y - 6;
    if (this._hit(mx, my, sh)) {
      this._dragging = "brightness";
      window.gameBrightness = this._norm(mx);
    }

    return null;
  }

  // Draws the panel background, border edges, title with glow, and column divider
  #drawPanel(renderer, cx, f) {
    renderer.drawRect(PX, PY, PW, PH, P.bg);
    renderer.drawRect(PX, PY, PW, 2, P.border);
    renderer.drawRect(PX, PY + PH - 2, PW, 2, P.border);
    renderer.drawRect(PX, PY, 2, PH, P.border);
    renderer.drawRect(PX + PW - 2, PY, 2, PH, P.border);

    // Title with a purple glow
    const ctx = renderer.context;
    ctx.shadowColor = "rgba(180,100,255,0.85)";
    ctx.shadowBlur = Math.round(10 * renderer.scale);
    renderer.drawText("PAUSED", cx, PY + 14, 8, P.text, {
      align: "center",
      font: f,
    });
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    renderer.drawRect(PX, HDR_DIV_Y, PW, 1, P.border);
    renderer.drawRect(
      SPLIT_X,
      HDR_DIV_Y + 1,
      1,
      BTN_SEP_Y - HDR_DIV_Y - 1,
      P.border,
    );
  }

  // Draws the audio section with music and SFX sliders and the brightness slider
  #drawLeftColumn(renderer, f) {
    renderer.drawText("AUDIO", CX_LEFT, PY + 30, 5, P.sub, {
      align: "center",
      font: f,
    });

    renderer.drawText("MUSIC", TRACK_X + 1, MUS_Y - 7, 4, P.label, {
      align: "left",
      font: f,
    });
    this._drawSlider(renderer, MUS_Y, window.gameVolume);

    renderer.drawText("SFX", TRACK_X + 1, SFX_Y - 7, 4, P.label, {
      align: "left",
      font: f,
    });
    this._drawSlider(renderer, SFX_Y, window.gameSFXVolume);

    renderer.drawRect(TRACK_X, MID_DIV, TRACK_W, 1, P.muted);

    renderer.drawText("VISUAL", CX_LEFT, MID_DIV + 9, 5, P.sub, {
      align: "center",
      font: f,
    });
    renderer.drawText("BRIGHT.", TRACK_X + 1, BRI_Y - 7, 4, P.label, {
      align: "left",
      font: f,
    });
    this._drawSlider(renderer, BRI_Y, window.gameBrightness);

    // Colorblind mode toggle buttons
    renderer.drawText("COLOR", TRACK_X + 1, CB_LBL_Y, 4, P.label, {
      align: "left",
      font: f,
    });
    const currentCB = window.colorblindMode || 'off';
    for (const btn of CB_BTNS) {
      const active = currentCB === btn.mode;
      renderer.drawRect(btn.x, btn.y, btn.w, btn.h, active ? P.sliderFg : P.sliderBg);
      renderer.drawText(
        btn.label,
        btn.x + Math.floor(btn.w / 2),
        btn.y + Math.floor(btn.h / 2),
        3,
        active ? P.text : P.dim,
        { align: "center", font: f },
      );
    }
  }

  // Draws the controls column with a key-action list
  #drawRightColumn(renderer, f) {
    renderer.drawText("CONTROLS", CX_RIGHT, PY + 30, 5, P.sub, {
      align: "center",
      font: f,
    });

    for (let i = 0; i < CONTROLS.length; i++) {
      const [key, action] = CONTROLS[i];
      const y = CTRL_Y0 + i * CTRL_DY;
      renderer.drawText(key, RIGHT_X + 3, y, 4, P.text, {
        align: "left",
        font: f,
      });
      renderer.drawText(action, PX + PW - 4, y, 4, P.dim, {
        align: "right",
        font: f,
      });
    }
  }

  // Draws the three action buttons: Resume, Restart, and Return to Menu
  #drawButtons(renderer, mx, my, f) {
    renderer.drawRect(PX, BTN_SEP_Y, PW, 1, P.border);

    const resumeHov = this._hit(mx, my, RESUME_BTN);
    renderer.drawRect(
      RESUME_BTN.x,
      RESUME_BTN.y,
      RESUME_BTN.w,
      RESUME_BTN.h,
      resumeHov ? "#18083a" : "#0e051e",
    );
    renderer.drawText(
      "RESUME",
      RESUME_BTN.x + Math.floor(RESUME_BTN.w / 2),
      RESUME_BTN.y + Math.floor(RESUME_BTN.h / 2),
      5,
      resumeHov ? P.text : P.label,
      { align: "center", font: f },
    );

    renderer.drawRect(PX + 2 + HALF_W, BTN_R1_Y, 1, BTN_R1_H, P.border);

    const restartHov = this._hit(mx, my, RESTART_BTN);
    renderer.drawRect(
      RESTART_BTN.x,
      RESTART_BTN.y,
      RESTART_BTN.w,
      RESTART_BTN.h,
      restartHov ? "#280a08" : "#100303",
    );
    renderer.drawText(
      "RESTART",
      RESTART_BTN.x + Math.floor(RESTART_BTN.w / 2),
      RESTART_BTN.y + Math.floor(RESTART_BTN.h / 2),
      5,
      restartHov ? "#ff7755" : "#662211",
      { align: "center", font: f },
    );

    renderer.drawRect(PX, BTN_MID_Y, PW, 1, P.border);

    const menuHov = this._hit(mx, my, MENU_BTN);
    renderer.drawRect(
      MENU_BTN.x,
      MENU_BTN.y,
      MENU_BTN.w,
      MENU_BTN.h,
      menuHov ? "#200606" : "#0a0202",
    );
    renderer.drawText(
      "RETURN TO MENU",
      MENU_BTN.x + Math.floor(MENU_BTN.w / 2),
      MENU_BTN.y + Math.floor(MENU_BTN.h / 2),
      5,
      menuHov ? "#ff6644" : "#662211",
      { align: "center", font: f },
    );
  }

  // Draws a horizontal slider track filled to the given 0-to-1 value with a draggable handle
  _drawSlider(renderer, y, value) {
    renderer.drawRect(TRACK_X, y, TRACK_W, TRACK_H, P.sliderBg);
    const fill = Math.max(0, Math.floor(TRACK_W * value));
    if (fill > 0) renderer.drawRect(TRACK_X, y, fill, TRACK_H, P.sliderFg);
    renderer.drawRect(TRACK_X + fill - 1, y - 2, 3, TRACK_H + 4, P.sliderHd);
  }

  // Normalizes mouse X to a 0-to-1 value relative to the slider track
  _norm(mx) {
    return Math.max(0, Math.min(1, (mx - TRACK_X) / TRACK_W));
  }

  // Returns true if (mx, my) is within rect r
  _hit(mx, my, r) {
    return mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h;
  }
}
