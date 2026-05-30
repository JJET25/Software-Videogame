import { ROOM_WIDTH, ROOM_HEIGHT } from '../Utils/Constants.js';

// ── Panel — same geometry as ShopUI ─────────────────────────────────────────
const PW = 220;
const PH = 150;
const PX = Math.floor((ROOM_WIDTH  - PW) / 2);   // 26
const PY = Math.floor((ROOM_HEIGHT - PH) / 2);   // 13

// ── Inner content area (inside the 2px borders) ──────────────────────────────
// x: [PX+2=28 .. PX+PW-2=244]  width=216
// y: [PY+2=15 .. PY+PH-2=161]  height=146

// ── Section split ─────────────────────────────────────────────────────────────
// Left  section: x[28..124]  width=96
// Vert divider:  x=126, w=2
// Right section: x[128..244] width=116
const SEP_X   = PX + 100;     // 126
const RIGHT_X = SEP_X + 2;    // 128
const RIGHT_W = 116;

// ── Sliders (inside left section [28..124]) ───────────────────────────────────
// Slider x=30, w=86 → right edge 116 < 124 ✓
const TRACK_X = PX + 4;       // 30
const TRACK_W = 86;
const TRACK_H = 6;
const VOL_Y    = PY + 33;     // 46
const BRIGHT_Y = PY + 53;     // 66

// ── Bottom buttons (calculated from bottom of inner area upward) ──────────────
// Inner bottom: PY+PH-2 = 161
// RETURN:          y=135, h=26  → bottom=161 ✓ (fills to border)
// H-separator:     y=133, h=2
// RESUME/RESTART:  y=111, h=22  → bottom=133 ✓
// H-separator:     y=109, h=2
const BTN_H       = 22;
const BTN_Y       = PY + 98;  // 111
const HALF_W      = 108;      // 216 / 2

// Each button starts inside inner area (PX+2=28)
const RESUME_BTN  = { x: PX + 2,          y: BTN_Y,    w: HALF_W, h: BTN_H };
const RESTART_BTN = { x: PX + 2 + HALF_W, y: BTN_Y,    w: HALF_W, h: BTN_H };

const MENU_H   = 26;
const MENU_Y   = PY + PH - 2 - MENU_H;  // 135 → bottom = 161 ✓
const MENU_BTN = { x: PX + 2, y: MENU_Y, w: 216, h: MENU_H };

// ── Controls rows (inside right section [128..244], width=116) ────────────────
// Block: key-col(42px) + gap(8px) + act-col(48px) = 98px
// Center offset = (116-98)/2 = 9  → KEY_X=137, ACT_X=187
const KEY_X      = RIGHT_X + 9;   // 137
const ACT_X      = KEY_X + 50;    // 187  (42px key + 8px gap)
const CTRL_ROW_0 = PY + 38;       // 51  — first row baseline
const CTRL_STEP  = 10;

const CONTROLS = [
    ['W/A/S/D', 'MOVE'],
    ['SPACE',   'DASH'],
    ['1/2/3',   'SELECT'],
    ['CLICK',   'USE CARD'],
    ['TAB',     'DECK'],
    ['ESC',     'PAUSE'],
];

export default class PauseMenu {
    constructor() {
        this._dragging = null;
        if (window.gameVolume     === undefined) window.gameVolume     = 1.0;
        if (window.gameBrightness === undefined) window.gameBrightness = 1.0;
    }

    // Returns 'resume' | 'restart' | 'menu' | null
    update(mouse) {
        const mx = mouse.position.x;
        const my = mouse.position.y;

        if (!mouse.leftDown) {
            this._dragging = null;
        } else if (this._dragging === 'volume') {
            window.gameVolume = this._norm(mx, TRACK_X, TRACK_W);
        } else if (this._dragging === 'brightness') {
            window.gameBrightness = this._norm(mx, TRACK_X, TRACK_W);
        }

        if (!mouse.consumeClick()) return null;

        if (this._hit(mx, my, RESUME_BTN))  return 'resume';
        if (this._hit(mx, my, RESTART_BTN)) return 'restart';
        if (this._hit(mx, my, MENU_BTN))    return 'menu';

        if (this._hit(mx, my, { x: TRACK_X, y: VOL_Y - 6,    w: TRACK_W, h: TRACK_H + 12 })) {
            this._dragging = 'volume';
            window.gameVolume = this._norm(mx, TRACK_X, TRACK_W);
        }
        if (this._hit(mx, my, { x: TRACK_X, y: BRIGHT_Y - 6, w: TRACK_W, h: TRACK_H + 12 })) {
            this._dragging = 'brightness';
            window.gameBrightness = this._norm(mx, TRACK_X, TRACK_W);
        }

        return null;
    }

    draw(renderer, mouse) {
        const mx = mouse.position.x;
        const my = mouse.position.y;

        // ── Backdrop ─────────────────────────────────────────────────────────
        renderer.drawRect(0, 0, ROOM_WIDTH, ROOM_HEIGHT, 'rgba(0,0,0,0.84)');

        // ── Panel ────────────────────────────────────────────────────────────
        renderer.drawRect(PX, PY, PW, PH, '#0c0c18');
        renderer.drawRect(PX,          PY,          PW, 2,  '#2a3a5a');
        renderer.drawRect(PX,          PY + PH - 2, PW, 2,  '#2a3a5a');
        renderer.drawRect(PX,          PY,          2,  PH, '#2a3a5a');
        renderer.drawRect(PX + PW - 2, PY,          2,  PH, '#2a3a5a');

        // ── Header "PAUSED" ───────────────────────────────────────────────────
        // 12px monospace: ~7.2px/char × 6 chars = 43px → center: PX+(PW-43)/2 ≈ PX+88=114
        renderer.drawText('PAUSED', PX + 88, PY + 13, '12px monospace', '#ffffff');
        renderer.drawRect(PX, PY + 17, PW, 2, '#2a3a5a');

        // ── Vertical section divider ──────────────────────────────────────────
        // Runs from header separator down to button separator
        renderer.drawRect(SEP_X, PY + 19, 2, BTN_Y - (PY + 21), '#2a3a5a');

        // ════ LEFT — SETTINGS ════════════════════════════════════════════════

        // "VOLUME" centered in left inner width (96px): 6ch×6px=36px → offset=(96-36)/2=30 → x=28+30=58
        renderer.drawText('VOLUME', PX + 34, PY + 28, '10px monospace', '#99bbee');
        this._drawSlider(renderer, TRACK_X, VOL_Y, TRACK_W, TRACK_H, window.gameVolume);

        // "BRIGHT." centered: 7ch×6px=42px → offset=(96-42)/2=27 → x=28+27=55
        renderer.drawText('BRIGHT.', PX + 34, PY + 48, '10px monospace', '#99bbee');
        this._drawSlider(renderer, TRACK_X, BRIGHT_Y, TRACK_W, TRACK_H, window.gameBrightness);

        // ════ RIGHT — CONTROLS ════════════════════════════════════════════════

        // "CONTROLS" centered in RIGHT_W=116: 8ch×6px=48px → offset=(116-48)/2=34 → x=128+34=162
        renderer.drawText('CONTROLS', RIGHT_X + 34, PY + 28, '10px monospace', '#99bbee');

        CONTROLS.forEach(([key, action], i) => {
            const y = CTRL_ROW_0 + i * CTRL_STEP;
            renderer.drawText(key,    KEY_X, y, '8px monospace', '#cccccc');
            renderer.drawText(action, ACT_X, y, '8px monospace', '#556677');
        });

        // ════ BOTTOM — BUTTONS ════════════════════════════════════════════════

        // Top separator of button area
        renderer.drawRect(PX, BTN_Y - 2, PW, 2, '#2a3a5a');

        // ── RESUME (left half: x[28..136], w=108) ────────────────────────────
        const resumeHov = this._hit(mx, my, RESUME_BTN);
        renderer.drawRect(
            RESUME_BTN.x, RESUME_BTN.y, RESUME_BTN.w, RESUME_BTN.h,
            resumeHov ? '#182030' : '#0e1520',
        );
        // "RESUME" 6ch×6px=36px, centered in w=108: offset=(108-36)/2=36 → x=28+36=64
        renderer.drawText(
            'RESUME',
            RESUME_BTN.x + 36, RESUME_BTN.y + 14,
            '10px monospace', resumeHov ? '#ffffff' : '#99bbee',
        );

        // Divider between the two buttons
        renderer.drawRect(PX + 2 + HALF_W, BTN_Y, 2, BTN_H, '#2a3a5a');

        // ── RESTART (right half: x[136..244], w=108) ─────────────────────────
        const restartHov = this._hit(mx, my, RESTART_BTN);
        renderer.drawRect(
            RESTART_BTN.x, RESTART_BTN.y, RESTART_BTN.w, RESTART_BTN.h,
            restartHov ? '#200808' : '#130404',
        );
        // "RESTART" 7ch×6px=42px, centered in w=108: offset=(108-42)/2=33 → x=136+33=169
        renderer.drawText(
            'RESTART',
            RESTART_BTN.x + 33, RESTART_BTN.y + 14,
            '10px monospace', restartHov ? '#ff7755' : '#883322',
        );

        // Separator between row 1 and row 2
        renderer.drawRect(PX, BTN_Y + BTN_H, PW, 2, '#2a3a5a');

        // ── RETURN TO MENU (full inner width: x[28..244], w=216) ─────────────
        // Fills exactly to bottom border: y=135, h=26, bottom=161=PY+PH-2 ✓
        const menuHov = this._hit(mx, my, MENU_BTN);
        renderer.drawRect(
            MENU_BTN.x, MENU_BTN.y, MENU_BTN.w, MENU_BTN.h,
            menuHov ? '#200808' : '#0e0404',
        );
        // "RETURN TO MENU" 14ch×6px=84px, centered in w=216: offset=(216-84)/2=66 → x=28+66=94
        renderer.drawText(
            'RETURN TO MENU',
            MENU_BTN.x + 66, MENU_BTN.y + 17,
            '10px monospace', menuHov ? '#ff6644' : '#883322',
        );
    }

    _drawSlider(renderer, x, y, w, h, value) {
        renderer.drawRect(x, y, w, h, '#080812');
        renderer.drawRect(x, y, Math.max(0, Math.floor(w * value)), h, '#4488ff');
        const tx = x + Math.floor(w * value) - 3;
        renderer.drawRect(tx, y - 2, 6, h + 4, '#99bbee');
    }

    _norm(mx, trackX, trackW) {
        return Math.max(0, Math.min(1, (mx - trackX) / trackW));
    }

    _hit(mx, my, r) {
        return mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h;
    }
}
