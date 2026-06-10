import Screen from "./Screen.js";
import { endRun } from "../Utils/Api.js";
import { ROOM_HEIGHT, ROOM_WIDTH } from "../Utils/Constants.js";

const P = {
  bg:      "#0d0520",
  panel:   "#130838",
  divider: "#2a1050",
  muted:   "#4a2870",
  sub:     "#866ea7",
  text:    "#d0b8ff",
  win:     "#44ff99",
  lose:    "#ff4455",
  accent:  "#7c4dff",
  gold:    "#ffd700",
};

export default class DefeatScreen extends Screen {
  enter(context = {}) {
    this.status = context.status ?? "defeat";
    this.score  = null;   // null = waiting for API

    this.roomsCleared  = context.roomsCleared  ?? 0;
    this.enemiesKilled = context.enemiesKilled ?? 0;
    this.damageDealt   = context.damageDealt   ?? 0;

    this._newCards    = context.newCards    ?? [];
    this._cardCatalog = context.cardCatalog ?? [];

    this._timer   = 0;
    this._ready   = false;
    this._readyAt = 1.4;   // prevent accidental instant-click

    this._font = "monospace";
    document.fonts.load("5px 'Press Start 2P'").then(() => {
      this._font = "'Press Start 2P', monospace";
    });

    if (context.runId) {
      this._saveRun(context.runId, context);
    } else if (context.runPromise) {
      context.runPromise
        .then(data => {
          const id = data?.runId ?? null;
          if (id) this._saveRun(id, context);
          else    this.score = 0;
        })
        .catch(() => { this.score = 0; });
    } else {
      this.score = 0;
    }
  }

  _saveRun(runId, ctx) {
    endRun(runId, {
      status:          ctx.status,
      rooms_cleared:   Math.round(ctx.roomsCleared   ?? 0),
      enemies_killed:  Math.round(ctx.enemiesKilled  ?? 0),
      damage_dealt:    Math.round(ctx.damageDealt    ?? 0),
      damage_taken:    Math.round(ctx.damageTaken    ?? 0),
      credits_earned:  Math.round(ctx.creditsEarned  ?? 0),
      cards_collected: Math.round(ctx.cardsCollected ?? 0),
      cardIds:         ctx.cardIds ?? [],
    })
      .then(data => { this.score = data?.score ?? 0; })
      .catch(err => { console.error("[saveRun] Failed:", err); this.score = 0; });
  }

  update(deltaTime) {
    this._timer += deltaTime;
    if (this._timer >= this._readyAt) this._ready = true;
    if (!this._ready) return;

    // ANY click or ENTER → continue
    const clicked = this.mouse.consumeClick();
    if (clicked || this.input.wasKeyPressed("ENTER")) {
      if (this.status === "defeat" && this._newCards.length > 0) {
        import("./CardSaveScreen.js").then(({ default: CardSaveScreen }) => {
          this.screenManager.changeTo(new CardSaveScreen(), {
            newCards: this._newCards,
            cardCatalog: this._cardCatalog,
          });
        });
      } else {
        import("./StartScreen.js").then(({ default: StartScreen }) => {
          this.screenManager.changeTo(new StartScreen());
        });
      }
    }
  }

  draw(renderer) {
    const isWin  = this.status === "victory";
    const cx     = ROOM_WIDTH / 2;
    const f      = this._font;

    // ── Background ──────────────────────────────────────────────────────────
    renderer.drawRect(0, 0, ROOM_WIDTH, ROOM_HEIGHT, P.bg);

    // ── Title ───────────────────────────────────────────────────────────────
    renderer.drawText(
      isWin ? "YOU WIN!" : "GAME OVER",
      cx, 20, 13,
      isWin ? P.win : P.lose,
      { align: "center", font: f }
    );

    // ── Divider ─────────────────────────────────────────────────────────────
    renderer.drawRect((ROOM_WIDTH - 160) / 2, 32, 160, 1, P.divider);

    // ── Score ───────────────────────────────────────────────────────────────
    renderer.drawText("SCORE", cx, 42, 3.5, P.sub, { align: "center", font: f });

    if (this.score === null) {
      // Blink while waiting for API
      if (Math.floor(this._timer * 2) % 2 === 0) {
        renderer.drawText("SAVING...", cx, 58, 6, P.muted, { align: "center", font: f });
      }
    } else {
      renderer.drawText(
        this.score.toLocaleString(),
        cx, 58, 13,
        isWin ? P.gold : P.text,
        { align: "center", font: f }
      );
    }

    // ── Divider ─────────────────────────────────────────────────────────────
    renderer.drawRect((ROOM_WIDTH - 160) / 2, 74, 160, 1, P.divider);

    // ── Stats (3 columns) ───────────────────────────────────────────────────
    const col = [ROOM_WIDTH / 4, ROOM_WIDTH / 2, (3 * ROOM_WIDTH) / 4];

    renderer.drawText("ROOMS",  col[0], 84, 3.2, P.sub, { align: "center", font: f });
    renderer.drawText("KILLS",  col[1], 84, 3.2, P.sub, { align: "center", font: f });
    renderer.drawText("DAMAGE", col[2], 84, 3.2, P.sub, { align: "center", font: f });

    renderer.drawText(String(this.roomsCleared),          col[0], 96, 7, P.text, { align: "center", font: f });
    renderer.drawText(String(this.enemiesKilled),          col[1], 96, 7, P.text, { align: "center", font: f });
    renderer.drawText(this.damageDealt.toLocaleString(),   col[2], 96, 7, P.text, { align: "center", font: f });

    // ── Divider ─────────────────────────────────────────────────────────────
    renderer.drawRect((ROOM_WIDTH - 160) / 2, 108, 160, 1, P.divider);

    // ── Continue prompt (blink after ready) ──────────────────────────────────
    if (this._ready && Math.floor(this._timer * 1.6) % 2 === 0) {
      renderer.drawText(
        "CLICK TO CONTINUE",
        cx, 136, 4,
        P.accent,
        { align: "center", font: f }
      );
    }
  }
}
