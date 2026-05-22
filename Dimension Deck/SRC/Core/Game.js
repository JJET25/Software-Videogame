import InputManager from "./InputManager.js";
import MouseManager from "./MouseManager.js";
import Renderer from "./Renderer.js";
import ScreenManager from "../Systems/ScreenManager.js";
import GameplayScreen from "../Scenes/GameplayScreen.js";

export default class Game {
  constructor(canvas) {
    this.lastTime = 0;

    this.renderer = new Renderer(canvas);
    this.input = new InputManager();
    this.mouse = new MouseManager(canvas);

    this.renderer.resize();
    this.renderer.setupResizeListener();

    this.screens = new ScreenManager({
      renderer: this.renderer,
      input: this.input,
      mouse: this.mouse,
    });

    this.screens.changeTo(new GameplayScreen());

    this.start();
  }

  start() {
    requestAnimationFrame((ts) => this.gameLoop(ts));
  }

  gameLoop(timestamp) {
    const deltaTime = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    this.screens.update(deltaTime);
    this.screens.draw(this.renderer);
    this.input.update();

    requestAnimationFrame((ts) => this.gameLoop(ts));
  }
}
