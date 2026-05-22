import Screen from "./Screen.js";

export default class DefeatScreen extends Screen {
  update() {}
  draw(renderer) {
    renderer.drawText("GAME OVER", 200, 180, "32px monospace", "#ff4444");
  }
}
