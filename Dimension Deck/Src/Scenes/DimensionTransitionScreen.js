import Screen from "./Screen.js";
import { ROOM_WIDTH, ROOM_HEIGHT } from "../Utils/Constants.js";

// Overlay de transición entre dimensiones — se cierra solo
export default class DimensionTransitionScreen extends Screen {
  enter(context = {}) {
    this.fromName = context.fromName ?? "???";
    this.toName   = context.toName   ?? "???";
    this.onDone   = context.onDone   ?? (() => {});

    this._timer   = 0;
    this._fadeIn  = 0.4;
    this._hold    = 1.6;
    this._fadeOut = 0.4;
    this._total   = this._fadeIn + this._hold + this._fadeOut;
  }

  exit() {}

  update(deltaTime) {
    this._timer += deltaTime;
    if (this._timer >= this._total) {
      this.onDone();
    }
  }

  draw(renderer) {
    const t = this._timer;
    let alpha;
    if      (t < this._fadeIn)                        alpha = t / this._fadeIn;
    else if (t < this._fadeIn + this._hold)           alpha = 1;
    else alpha = 1 - (t - this._fadeIn - this._hold) / this._fadeOut;
    alpha = Math.max(0, Math.min(1, alpha));

    renderer.drawRect(0, 0, ROOM_WIDTH, ROOM_HEIGHT, `rgba(0,0,0,${(alpha * 0.9).toFixed(2)})`);

    if (alpha < 0.05) return;

    const ctx = renderer.context;
    const sc  = renderer.scale;
    const cy  = ROOM_HEIGHT / 2;

    ctx.globalAlpha = alpha;
    ctx.shadowColor = "rgba(180,100,255,0.9)";
    ctx.shadowBlur  = Math.round(12 * sc);

    renderer.drawText(
      "DIMENSION SHIFT",
      ROOM_WIDTH / 2,
      cy - 16,
      8,
      "#cc88ff",
      { font: "monospace", align: "center" },
    );

    ctx.shadowBlur = 0;

    renderer.drawText(
      `${this.fromName.toUpperCase()}  →  ${this.toName.toUpperCase()}`,
      ROOM_WIDTH / 2,
      cy,
      7,
      "#ffffff",
      { font: "monospace", align: "center" },
    );

    renderer.drawText(
      `ENTERING: ${this.toName.toUpperCase()}`,
      ROOM_WIDTH / 2,
      cy + 14,
      6,
      "#aaaaff",
      { font: "monospace", align: "center" },
    );

    ctx.shadowColor = "transparent";
    ctx.shadowBlur  = 0;
    ctx.globalAlpha = 1;
  }
}