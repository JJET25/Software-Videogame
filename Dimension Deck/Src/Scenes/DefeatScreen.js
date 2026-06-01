import Screen from "./Screen.js";
import { endRun } from "../Utils/Api.js";
import { ROOM_HEIGHT, ROOM_WIDTH } from "../Utils/Constants.js";

// Shown when the player dies or wins — saves the run to the backend and displays the result
export default class DefeatScreen extends Screen {
  enter(context = {}) {
    this.status = context.status ?? "defeat";
    this.score = null; // null = waiting for API response

    // Button state
    this._timer      = 0;
    this._ready      = false;
    this._readyAt    = 1.2;
    this._btnW       = 90;
    this._btnH       = 16;
    this._btnX       = (ROOM_WIDTH - 90) / 2;
    this._btnY       = ROOM_HEIGHT / 2 + 36;
    this._btnHovered = false;

    if (context.runId) {
      const {
        runId,
        status,
        roomsCleared,
        enemiesKilled,
        damageTaken,
        creditsEarned,
        cardsCollected,
      } = context;
      // Backend expects snake_case field names
      endRun(runId, {
        status,
        rooms_cleared: roomsCleared,
        enemies_killed: enemiesKilled,
        damage_taken: damageTaken,
        credits_earned: creditsEarned,
        cards_collected: cardsCollected,
      })
        .then((data) => {
          this.score = data?.score ?? 0;
        })
        .catch(() => {
          this.score = 0;
        });
    } else {
      this.score = 0;
    }
  }

  update(deltaTime) {
    this._timer += deltaTime;
    if (this._timer >= this._readyAt) this._ready = true;

    if (!this._ready) return;

    const mx = this.mouse.position.x;
    const my = this.mouse.position.y;
    this._btnHovered =
      mx >= this._btnX && mx <= this._btnX + this._btnW &&
      my >= this._btnY && my <= this._btnY + this._btnH;

    const clicked = this.mouse.consumeClick();
    if ((clicked && this._btnHovered) || this.input.wasKeyPressed("ENTER")) {
      import("./GameplayScreen.js").then(({ default: GameplayScreen }) => {
        this.screenManager.changeTo(new GameplayScreen());
      });
    }
  }

  draw(renderer) {
    const isVictory = this.status === "victory";
    const label = isVictory ? "YOU WIN!" : "GAME OVER";
    const color = isVictory ? "#44ff88" : "#ff4444";

    renderer.drawText(label, ROOM_WIDTH / 2, ROOM_HEIGHT / 2, "32px monospace", color);

    if (this.score === null) {
      renderer.drawText("Saving run...", ROOM_WIDTH / 2, ROOM_HEIGHT / 2 + 10, "14px monospace", "#888888");
    } else {
      renderer.drawText(
        `Score: ${this.score}`,
        ROOM_WIDTH / 2,
        ROOM_HEIGHT / 2 + 20,
        "20px monospace",
        "#ffffff",
      );
    }

    // --- Botón NEW RUN ---
    if (this._ready) {
      const bx  = this._btnX;
      const by  = this._btnY;
      const bw  = this._btnW;
      const bh  = this._btnH;
      const hov = this._btnHovered;

      renderer.drawRect(bx, by, bw, bh, hov ? "#882222" : "#440000");
      renderer.drawRect(bx,          by,          bw, 1,  "#ff4444");
      renderer.drawRect(bx,          by + bh - 1, bw, 1,  "#ff4444");
      renderer.drawRect(bx,          by,          1,  bh, "#ff4444");
      renderer.drawRect(bx + bw - 1, by,          1,  bh, "#ff4444");

      renderer.drawText(
        "NEW RUN  [ENTER]",
        bx + bw / 2,
        by + bh / 2,
        6,
        hov ? "#ffffff" : "#ffaaaa",
        { font: "monospace", align: "center" },
      );
    }
  }
}