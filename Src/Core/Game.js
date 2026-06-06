import InputManager from "./InputManager.js";
import MouseManager from "./MouseManager.js";
import Renderer from "./Renderer.js";
import ScreenManager from "../Systems/ScreenManager.js";
import StartScreen from "../Scenes/StartScreen.js";
import AudioManager from "./AudioManager.js";

// Root object, owns all core services and drives the game loop
export default class Game {
  constructor(canvas) {
    this.lastTime = 0;

    // Core services: instantiated once and injected into all screens
    this.renderer = new Renderer(canvas);
    this.input = new InputManager();
    this.mouse = new MouseManager(canvas);
    this.audio = new AudioManager();

    this.renderer.resize();
    this.renderer.setupResizeListener();

    this.screens = new ScreenManager({
      renderer: this.renderer,
      input: this.input,
      mouse: this.mouse,
      audio: this.audio,
    });

    this.screens.changeTo(new StartScreen());
    this.#startLoop();
  }

  // --------------------- PRIVATE ---------------------
  #startLoop() {
    requestAnimationFrame((ts) => this.#gameLoop(ts));
  }

  // Caps deltaTime at 50ms to prevent spiral-of-death on focus loss
  #gameLoop(timestamp) {
    const deltaTime = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    this.screens.update(deltaTime);
    this.screens.draw(this.renderer);
    this.input.update();

    requestAnimationFrame((ts) => this.#gameLoop(ts));
  }
}
