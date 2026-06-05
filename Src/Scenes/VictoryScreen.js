import Screen from "./Screen.js";
import { ROOM_WIDTH, ROOM_HEIGHT } from "../Utils/Constants.js";

// Mostrada al limpiar una fase — espera que el jugador presione ENTER para continuar
export default class VictoryScreen extends Screen {
  enter(context = {}) {
    this.nextLevelNumber = context.nextLevelNumber ?? 2;
    this.onContinue      = context.onContinue ?? (() => {});

    this._timer   = 0;
    this._ready   = false;
    this._readyAt = 1.0;
  }

  exit() {}

  update(deltaTime) {
    this._timer += deltaTime;
    if (this._timer >= this._readyAt) this._ready = true;

    if (this._ready && this.input.wasKeyPressed("ENTER")) {
      this.onContinue();
    }
  }

  draw(renderer) {
    renderer.drawRect(0, 0, ROOM_WIDTH, ROOM_HEIGHT, "rgba(0,0,0,0.88)");

    const cy  = ROOM_HEIGHT / 2;
    const ctx = renderer.context;
    const sc  = renderer.scale;

    ctx.shadowColor = "rgba(80,255,160,0.85)";
    ctx.shadowBlur  = Math.round(14 * sc);

    renderer.drawText(
      "LEVEL CLEAR!",
      ROOM_WIDTH / 2,
      cy - 18,
      18,
      "#44ff99",
      { font: "monospace", align: "center" },
    );

    ctx.shadowBlur = 0;

    renderer.drawText(
      `NEXT: LEVEL ${this.nextLevelNumber}`,
      ROOM_WIDTH / 2,
      cy + 2,
      7,
      "#aaffcc",
      { font: "monospace", align: "center" },
    );

    if (this._ready) {
      const blink = Math.floor(this._timer * 2) % 2 === 0;
      if (blink) {
        renderer.drawText(
          "PRESS ENTER TO CONTINUE",
          ROOM_WIDTH / 2,
          cy + 18,
          6,
          "#ffffff",
          { font: "monospace", align: "center" },
        );
      }
    }

    ctx.shadowColor = "transparent";
    ctx.shadowBlur  = 0;
  }
}