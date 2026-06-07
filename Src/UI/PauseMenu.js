import { ROOM_WIDTH, ROOM_HEIGHT } from '../Utils/Constants.js';

const P = {
  bg:       "#0d0520",
  border:   "#2a1050",
  muted:    "#4a2870",
  sub:      "#866ea7",
  text:     "#d0b8ff",
  label:    "#a090cc",
  dim:      "#5a3878",
  sliderBg: "#14082a",
  sliderFg: "#5030a0",
  sliderHd: "#9060e0",
};

// ── Panel geometry ────────────────────────────────────────────────────────────
const PW = 220, PH = 158;
const PX = Math.floor((ROOM_WIDTH  - PW) / 2);   // 26
const PY = Math.floor((ROOM_HEIGHT - PH) / 2);   //  9

// Inner area: [PX+2 .. PX+PW-2] × [PY+2 .. PY+PH-2]  →  [28..244] × [11..165]

const HDR_DIV_Y = PY + 22;   // 31 — divider below title

// ── Column split ─────────────────────────────────────────────────────────────
const SPLIT_X   = PX + 100;  // 126
const RIGHT_X   = SPLIT_X + 2; // 128
const CX_LEFT   = PX + 2 + Math.floor((SPLIT_X - PX - 2) / 2); // 77
const CX_RIGHT  = RIGHT_X + Math.floor((PX + PW - 2 - RIGHT_X) / 2); // 186

// ── Sliders (inside left column [28..124]) ────────────────────────────────────
const TRACK_X = PX + 4;   // 30
const TRACK_W = 86;
const TRACK_H = 5;

const MUS_Y   = PY + 43;  // 52
const SFX_Y   = PY + 58;  // 67
const MID_DIV = PY + 69;  // 78
const BRI_Y   = PY + 88;  // 97

// ── Controls (right column) ───────────────────────────────────────────────────
const CTRL_Y0 = PY + 40;  // 49
const CTRL_DY = 10;

const CONTROLS = [
  ['W/A/S/D', 'MOVE'],
  ['SPACE',   'DASH'],
  ['1-5',     'CARD'],
  ['CLICK',   'USE'],
  ['TAB',     'DECK'],
  ['ESC',     'PAUSE'],
];

// ── Button area ───────────────────────────────────────────────────────────────
const BTN_SEP_Y = PY + 110;               // 119
const BTN_R1_Y  = BTN_SEP_Y + 2;          // 121
const BTN_R1_H  = 19;
const BTN_MID_Y = BTN_R1_Y + BTN_R1_H;   // 140
const BTN_R2_Y  = BTN_MID_Y + 2;          // 142
const BTN_R2_H  = PY + PH - 2 - BTN_R2_Y; // 23

const INNER_W = PW - 4;                   // 216
const HALF_W  = Math.floor(INNER_W / 2); // 108

const RESUME_BTN  = { x: PX+2,        y: BTN_R1_Y, w: HALF_W,         h: BTN_R1_H };
const RESTART_BTN = { x: PX+2+HALF_W, y: BTN_R1_Y, w: INNER_W-HALF_W, h: BTN_R1_H };
const MENU_BTN    = { x: PX+2,        y: BTN_R2_Y, w: INNER_W,         h: BTN_R2_H };

// ─────────────────────────────────────────────────────────────────────────────
export default class PauseMenu {
  constructor(audio = null) {
    this._audio    = audio;
    this._dragging = null;

    if (window.gameVolume    === undefined) window.gameVolume    = 1.0;
    if (window.gameSFXVolume === undefined) window.gameSFXVolume = 1.0;
    if (window.gameBrightness=== undefined) window.gameBrightness= 1.0;

    // Sync audio bus to persisted values on open
    audio?.setBGMVolume(window.gameVolume);
    audio?.setSFXVolume(window.gameSFXVolume);

    this._font = "monospace";
    document.fonts.load("5px 'Press Start 2P'").then(() => {
      this._font = "'Press Start 2P', monospace";
    });
  }

  // Returns 'resume' | 'restart' | 'menu' | null
  update(mouse) {
    const mx = mouse.position.x;
    const my = mouse.position.y;

    // Continuous drag while mouse button held
    if (!mouse.leftDown) {
      this._dragging = null;
    } else if (this._dragging === 'music') {
      const v = this._norm(mx);
      window.gameVolume = v;
      this._audio?.setBGMVolume(v);
    } else if (this._dragging === 'sfx') {
      const v = this._norm(mx);
      window.gameSFXVolume = v;
      this._audio?.setSFXVolume(v);
    } else if (this._dragging === 'brightness') {
      window.gameBrightness = this._norm(mx);
    }

    if (!mouse.consumeClick()) return null;

    // Buttons
    if (this._hit(mx, my, RESUME_BTN))  return 'resume';
    if (this._hit(mx, my, RESTART_BTN)) return 'restart';
    if (this._hit(mx, my, MENU_BTN))    return 'menu';

    // Slider click → start drag
    const sh = { x: TRACK_X, w: TRACK_W, h: TRACK_H + 12 };

    sh.y = MUS_Y - 6;
    if (this._hit(mx, my, sh)) {
      this._dragging = 'music';
      window.gameVolume = this._norm(mx);
      this._audio?.setBGMVolume(window.gameVolume);
    }
    sh.y = SFX_Y - 6;
    if (this._hit(mx, my, sh)) {
      this._dragging = 'sfx';
      window.gameSFXVolume = this._norm(mx);
      this._audio?.setSFXVolume(window.gameSFXVolume);
    }
    sh.y = BRI_Y - 6;
    if (this._hit(mx, my, sh)) {
      this._dragging = 'brightness';
      window.gameBrightness = this._norm(mx);
    }

    return null;
  }

  draw(renderer, mouse) {
    const mx  = mouse.position.x;
    const my  = mouse.position.y;
    const ctx = renderer.context;
    const sc  = renderer.scale;
    const f   = this._font;
    const cx  = ROOM_WIDTH / 2;

    // ── Dark overlay
    renderer.drawRect(0, 0, ROOM_WIDTH, ROOM_HEIGHT, 'rgba(13,5,32,0.88)');

    // ── Panel
    renderer.drawRect(PX, PY, PW, PH, P.bg);
    renderer.drawRect(PX,          PY,          PW, 2,  P.border);
    renderer.drawRect(PX,          PY + PH - 2, PW, 2,  P.border);
    renderer.drawRect(PX,          PY,          2,  PH, P.border);
    renderer.drawRect(PX + PW - 2, PY,          2,  PH, P.border);

    // ── Title "PAUSED" with purple glow
    ctx.shadowColor = 'rgba(180,100,255,0.85)';
    ctx.shadowBlur  = Math.round(10 * sc);
    renderer.drawText('PAUSED', cx, PY + 14, 8, P.text, { align: 'center', font: f });
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur  = 0;

    renderer.drawRect(PX, HDR_DIV_Y, PW, 1, P.border);

    // ── Vertical column divider
    renderer.drawRect(SPLIT_X, HDR_DIV_Y + 1, 1, BTN_SEP_Y - HDR_DIV_Y - 1, P.border);

    // ════ LEFT COLUMN — SETTINGS ════

    renderer.drawText('AUDIO', CX_LEFT, PY + 30, 5, P.sub, { align: 'center', font: f });

    renderer.drawText('MUSIC', TRACK_X + 1, MUS_Y - 7, 4, P.label, { align: 'left', font: f });
    this._drawSlider(renderer, MUS_Y, window.gameVolume);

    renderer.drawText('SFX', TRACK_X + 1, SFX_Y - 7, 4, P.label, { align: 'left', font: f });
    this._drawSlider(renderer, SFX_Y, window.gameSFXVolume);

    renderer.drawRect(TRACK_X, MID_DIV, TRACK_W, 1, P.muted);

    renderer.drawText('VISUAL', CX_LEFT, MID_DIV + 9, 5, P.sub, { align: 'center', font: f });
    renderer.drawText('BRIGHT.', TRACK_X + 1, BRI_Y - 7, 4, P.label, { align: 'left', font: f });
    this._drawSlider(renderer, BRI_Y, window.gameBrightness);

    // ════ RIGHT COLUMN — CONTROLS ════

    renderer.drawText('CONTROLS', CX_RIGHT, PY + 30, 5, P.sub, { align: 'center', font: f });

    for (let i = 0; i < CONTROLS.length; i++) {
      const [key, action] = CONTROLS[i];
      const y = CTRL_Y0 + i * CTRL_DY;
      renderer.drawText(key,    RIGHT_X + 3,  y, 4, P.text, { align: 'left',  font: f });
      renderer.drawText(action, PX + PW - 4,  y, 4, P.dim,  { align: 'right', font: f });
    }

    // ════ BUTTON AREA ════

    renderer.drawRect(PX, BTN_SEP_Y, PW, 1, P.border);

    // RESUME
    const resumeHov = this._hit(mx, my, RESUME_BTN);
    renderer.drawRect(RESUME_BTN.x, RESUME_BTN.y, RESUME_BTN.w, RESUME_BTN.h,
      resumeHov ? '#18083a' : '#0e051e');
    renderer.drawText('RESUME',
      RESUME_BTN.x + Math.floor(RESUME_BTN.w / 2),
      RESUME_BTN.y + Math.floor(RESUME_BTN.h / 2),
      5, resumeHov ? P.text : P.label, { align: 'center', font: f });

    renderer.drawRect(PX + 2 + HALF_W, BTN_R1_Y, 1, BTN_R1_H, P.border);

    // RESTART
    const restartHov = this._hit(mx, my, RESTART_BTN);
    renderer.drawRect(RESTART_BTN.x, RESTART_BTN.y, RESTART_BTN.w, RESTART_BTN.h,
      restartHov ? '#280a08' : '#100303');
    renderer.drawText('RESTART',
      RESTART_BTN.x + Math.floor(RESTART_BTN.w / 2),
      RESTART_BTN.y + Math.floor(RESTART_BTN.h / 2),
      5, restartHov ? '#ff7755' : '#662211', { align: 'center', font: f });

    renderer.drawRect(PX, BTN_MID_Y, PW, 1, P.border);

    // RETURN TO MENU
    const menuHov = this._hit(mx, my, MENU_BTN);
    renderer.drawRect(MENU_BTN.x, MENU_BTN.y, MENU_BTN.w, MENU_BTN.h,
      menuHov ? '#200606' : '#0a0202');
    renderer.drawText('RETURN TO MENU',
      MENU_BTN.x + Math.floor(MENU_BTN.w / 2),
      MENU_BTN.y + Math.floor(MENU_BTN.h / 2),
      5, menuHov ? '#ff6644' : '#662211', { align: 'center', font: f });
  }

  // --------------------- PRIVATE ---------------------
  _drawSlider(renderer, y, value) {
    renderer.drawRect(TRACK_X, y, TRACK_W, TRACK_H, P.sliderBg);
    const fill = Math.max(0, Math.floor(TRACK_W * value));
    if (fill > 0) renderer.drawRect(TRACK_X, y, fill, TRACK_H, P.sliderFg);
    const hx = TRACK_X + fill;
    renderer.drawRect(hx - 1, y - 2, 3, TRACK_H + 4, P.sliderHd);
  }

  _norm(mx) {
    return Math.max(0, Math.min(1, (mx - TRACK_X) / TRACK_W));
  }

  _hit(mx, my, r) {
    return mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h;
  }
}
