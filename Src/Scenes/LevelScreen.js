import Screen from "./Screen.js";
import { ROOM_WIDTH, ROOM_HEIGHT } from "../Utils/Constants.js";

const P = {
  bg:      "#0d0520",
  divider: "#2a1050",
  muted:   "#4a2870",
  sub:     "#866ea7",
  text:    "#d0b8ff",
  accent:  "#7c4dff",
};

export default class LevelScreen extends Screen {
  enter(context = {}) {
    this.levelNumber   = context.levelNumber   ?? 1;
    this.dimensionName = context.dimensionName ?? null;
    this.phaseName     = context.phaseName     ?? null;
    this.onDone        = context.onDone        ?? (() => {});

    this._timer   = 0;
    this._fadeIn  = 0.5;
    this._hold    = 1.8;
    this._fadeOut = 0.5;
    this._total   = this._fadeIn + this._hold + this._fadeOut;

    this._font = "monospace";
    document.fonts.load("5px 'Press Start 2P'").then(() => {
      this._font = "'Press Start 2P', monospace";
    });
  }

  exit() {}

  update(deltaTime) {
    this._timer += deltaTime;
    if (this._timer >= this._total) this.onDone();
  }

  draw(renderer) {
    const t = this._timer;
    let alpha;
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

    // Title with glow
    ctx.shadowColor = "rgba(200,210,255,0.9)";
    ctx.shadowBlur  = Math.round(16 * sc);
    renderer.drawText(
      `LEVEL ${this.levelNumber}`,
      cx, 56, 18, "#ffffff",
      { align: "center", font: f }
    );
    ctx.shadowColor = "transparent";
    ctx.shadowBlur  = 0;

    // Divider
    renderer.drawRect((ROOM_WIDTH - 160) / 2, 72, 160, 1, P.divider);

    if (this.dimensionName) {
      renderer.drawText(
        this.dimensionName.toUpperCase(),
        cx, 86, 6, P.sub,
        { align: "center", font: f }
      );
    }
    if (this.phaseName) {
      renderer.drawText(
        this.phaseName,
        cx, 100, 4, P.muted,
        { align: "center", font: f }
      );
    }

    ctx.globalAlpha = 1;
  }
}
