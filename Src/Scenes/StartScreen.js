import { ROOM_HEIGHT, ROOM_WIDTH } from "../Utils/Constants.js";
import GameplayScreen from "./GameplayScreen.js";
import Screen from "./Screen.js";

export default class StartScreen extends Screen {
  enter(context) {
    this.btnW = 80;
    this.btnH = 15;
    this.btnX = (ROOM_WIDTH - this.btnW) / 2;

    this.buttons = [
      {
        label: "PLAY",
        y: 90,
        hovered: false,
        action: () => this.screenManager.changeTo(new GameplayScreen()),
      },
      {
        label: "CREDITS",
        y: 110,
        hovered: false,
        action: () => console.log("CREDITS"),
      },
      {
        label: "EXIT",
        y: 130,
        hovered: false,
        action: () => (window.location.href = "../../index.html"),
      },
    ];
  }

  update(deltaTime) {
    const clicked = this.mouse.consumeClick();
    for (const btn of this.buttons) {
      btn.hovered = this.#isHovered(btn);
      if (clicked && btn.hovered) btn.action();
    }
  }

  draw(renderer) {
    renderer.drawRect(0, 0, ROOM_WIDTH, ROOM_HEIGHT, "#ffffff");
    renderer.drawText("DIMENSION DECK", ROOM_WIDTH / 2, 40, 20, "#000000");

    // Buttons
    for (const btn of this.buttons) {
      renderer.drawRect(
        this.btnX,
        btn.y,
        this.btnW,
        this.btnH,
        btn.hovered ? "#8a4dd0" : "#36145c",
      );
      renderer.drawText(
        btn.label,
        this.btnX + this.btnW / 2,
        btn.y + this.btnH / 2,
        5,
        "#ff8f33",
      );
    }
  }

  #isHovered(btn) {
    return (
      this.btnX <= this.mouse.position.x &&
      this.btnX + this.btnW >= this.mouse.position.x &&
      btn.y <= this.mouse.position.y &&
      btn.y + this.btnH >= this.mouse.position.y
    );
  }
}
