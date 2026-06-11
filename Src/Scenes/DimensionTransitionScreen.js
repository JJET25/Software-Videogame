// DimensionTransitionScreen.js — Timed overlay showing the dimension shift between the outgoing and incoming dimension
import Screen from "./Screen.js";
import { ROOM_WIDTH, ROOM_HEIGHT } from "../Utils/Constants.js";

// Color palette for this screen
const P = {
  bg:      "#0d0520",
  divider: "#2a1050",
  muted:   "#4a2870",
  sub:     "#866ea7",
  text:    "#d0b8ff",
  accent:  "#7c4dff",
};

export default class DimensionTransitionScreen extends Screen {
  // Reads context values and sets up fade-in, hold, and fade-out timing constants
  enter(context = {}) {
    this.fromName = context.fromName ?? "???";
    this.toName   = context.toName   ?? "???";
    this.onDone   = context.onDone   ?? (() => {});

    this._timer   = 0;
    this._fadeIn  = 0.4;
    this._hold    = 2.0;
    this._fadeOut = 0.5;
    this._total   = this._fadeIn + this._hold + this._fadeOut;

    this._font = "monospace";
    document.fonts.load("5px 'Press Start 2P'").then(() => {
      this._font = "'Press Start 2P', monospace";
    });
  }

  exit() {}

  // Advances the timer and fires onDone when the full animation sequence completes
  update(deltaTime) {
    this._timer += deltaTime;
    if (this._timer >= this._total) this.onDone();
  }

  // Draws a fading overlay with the dimension-shift title, source name, arrow, and destination name
  draw(renderer) {
    const t = this._timer;
    let alpha;
    // Compute alpha based on which phase of the fade animation is active
    if      (t < this._fadeIn)                        alpha = t / this._fadeIn;
    else if (t < this._fadeIn + this._hold)           alpha = 1;
    else alpha = 1 - (t - this._fadeIn - this._hold) / this._fadeOut;
    alpha = Math.max(0, Math.min(1, alpha));

    renderer.drawRect(0, 0, ROOM_WIDTH, ROOM_HEIGHT,
      `rgba(13,5,32,${(alpha * 0.95).toFixed(2)})`);

    if (alpha < 0.05) return;

    const ctx = renderer.context;
    const sc  = renderer.scale;
    const cx  = ROOM_WIDTH / 2;
    const f   = this._font;

    ctx.globalAlpha = alpha;

    // Title with a purple glow
    ctx.shadowColor = "rgba(180,100,255,0.9)";
    ctx.shadowBlur  = Math.round(14 * sc);
    renderer.drawText("DIMENSION SHIFT", cx, 22, 8, P.accent, { align: "center", font: f });
    ctx.shadowColor = "transparent";
    ctx.shadowBlur  = 0;

    renderer.drawRect((ROOM_WIDTH - 160) / 2, 34, 160, 1, P.divider);

    renderer.drawText(
      this.fromName.toUpperCase(),
      cx, 48, 6, P.sub,
      { align: "center", font: f }
    );
    renderer.drawText("↓", cx, 62, 7, P.muted, { align: "center", font: f });
    renderer.drawText(
      this.toName.toUpperCase(),
      cx, 78, 7, P.text,
      { align: "center", font: f }
    );

    renderer.drawRect((ROOM_WIDTH - 160) / 2, 90, 160, 1, P.divider);

    renderer.drawText(
      `ENTERING: ${this.toName.toUpperCase()}`,
      cx, 104, 4, P.muted,
      { align: "center", font: f }
    );

    ctx.globalAlpha = 1;
  }
}
