import Screen from "./Screen.js";
import { ROOM_WIDTH, ROOM_HEIGHT } from "../Utils/Constants.js";

// Overlay que muestra "LEVEL X" al inicio de cada fase — se cierra solo después de unos segundos
export default class LevelScreen extends Screen {
  enter(context = {}) {
    this.levelNumber = context.levelNumber ?? 1;
    this.onDone      = context.onDone ?? (() => {});

    this._timer   = 0;
    this._fadeIn  = 0.5;
    this._hold    = 1.5;
    this._fadeOut = 0.5;
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

    renderer.drawRect(0, 0, ROOM_WIDTH, ROOM_HEIGHT, `rgba(0,0,0,${(alpha * 0.85).toFixed(2)})`);

    if (alpha < 0.05) return;

    const ctx = renderer.context;
    const sc  = renderer.scale;

    ctx.globalAlpha  = alpha;
    ctx.shadowColor  = "rgba(200,220,255,0.9)";
    ctx.shadowBlur   = Math.round(16 * sc);

    renderer.drawText(
      `LEVEL ${this.levelNumber}`,
      ROOM_WIDTH / 2,
      ROOM_HEIGHT / 2,
      22,
      "#ffffff",
      { font: "monospace", align: "center" },
    );

    ctx.shadowColor = "transparent";
    ctx.shadowBlur  = 0;
    ctx.globalAlpha = 1;
  }
}