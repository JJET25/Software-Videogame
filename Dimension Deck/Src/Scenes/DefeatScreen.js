import Screen from "./Screen.js";
import { endRun } from "../Utils/Api.js";
import { ROOM_HEIGHT, ROOM_WIDTH } from "../Utils/Constants.js";

// Shown when the player dies or wins — saves the run to the backend and displays the result
export default class DefeatScreen extends Screen {
  enter(context = {}) {
    this.status = context.status ?? "defeat";
    this.score = null; // null = waiting for API response

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

  update() {}

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
  }
}
