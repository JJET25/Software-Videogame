// VictoryScreen.js — Overlay shown after defeating a boss, displaying the boss type, dimension, and what comes next
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
  gold:    "#ffd700",
};

export default class VictoryScreen extends Screen {
  // Reads context values and starts the input-lock timer
  enter(context = {}) {
    this.bossType      = context.bossType      ?? "miniBoss";
    this.dimensionName = context.dimensionName ?? "???";
    this.nextLabel     = context.nextLabel     ?? "";
    this.onContinue    = context.onContinue    ?? (() => {});

    this._timer   = 0;
    this._ready   = false;
    this._readyAt = 1.0;

    this._font = "monospace";
    document.fonts.load("5px 'Press Start 2P'").then(() => {
      this._font = "'Press Start 2P', monospace";
    });
  }

  exit() {}

  // Advances the timer and fires onContinue when the player clicks or presses ENTER
  update(deltaTime) {
    this._timer += deltaTime;
    if (this._timer >= this._readyAt) this._ready = true;
    if (!this._ready) return;

    const clicked = this.mouse.consumeClick();
    if (clicked || this.input.wasKeyPressed("ENTER")) {
      this.onContinue();
    }
  }

  // Draws the boss-defeated title with a glow, boss info, next-step label, and a blinking continue prompt
  draw(renderer) {
    const cx  = ROOM_WIDTH / 2;
    const f   = this._font;
    const ctx = renderer.context;
    const sc  = renderer.scale;

    const bossLabel = this.bossType === "miniBoss" ? "MINI BOSS" : "FINAL BOSS";

    renderer.drawRect(0, 0, ROOM_WIDTH, ROOM_HEIGHT, P.bg);

    // Title with a gold glow effect
    ctx.shadowColor = "rgba(255,230,80,0.9)";
    ctx.shadowBlur  = Math.round(14 * sc);
    renderer.drawText("BOSS DEFEATED!", cx, 20, 9, P.gold, { align: "center", font: f });
    ctx.shadowColor = "transparent";
    ctx.shadowBlur  = 0;

    renderer.drawRect((ROOM_WIDTH - 160) / 2, 32, 160, 1, P.divider);

    renderer.drawText(bossLabel, cx, 44, 4, P.muted, { align: "center", font: f });
    renderer.drawText(
      this.dimensionName.toUpperCase(),
      cx, 56, 6, P.sub,
      { align: "center", font: f }
    );

    renderer.drawRect((ROOM_WIDTH - 160) / 2, 68, 160, 1, P.divider);

    renderer.drawText("NEXT", cx, 80, 3.5, P.sub, { align: "center", font: f });
    renderer.drawText(
      this.nextLabel,
      cx, 96, 7, P.text,
      { align: "center", font: f }
    );

    renderer.drawRect((ROOM_WIDTH - 160) / 2, 110, 160, 1, P.divider);

    // Blink the continue prompt after the lock timer expires
    if (this._ready && Math.floor(this._timer * 1.6) % 2 === 0) {
      renderer.drawText(
        "CLICK TO CONTINUE",
        cx, 130, 4, P.accent,
        { align: "center", font: f }
      );
    }
  }
}
