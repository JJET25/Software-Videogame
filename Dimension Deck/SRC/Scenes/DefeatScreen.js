import Screen from "./Screen.js";

// Shown when the player dies — renders the game over message
export default class DefeatScreen extends Screen {
  update() {}

  draw(renderer) {
    renderer.drawText("GAME OVER", 200, 180, "32px monospace", "#ff4444");
  }
}
