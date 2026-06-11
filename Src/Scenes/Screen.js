// Screen.js — Abstract base class for all game screens, providing shared service references injected by ScreenManager
export default class Screen {
  // Initializes all service references to null until attach() is called
  constructor() {
    this.renderer = null;
    this.input = null;
    this.mouse = null;
    this.screenManager = null;
    this.audio = null;
  }

  // Called by ScreenManager before enter() to bind renderer, input, mouse, audio, and screenManager
  attach(services) {
    this.renderer = services.renderer;
    this.input = services.input;
    this.mouse = services.mouse;
    this.screenManager = services.screenManager;
    this.audio = services.audio;
  }

  // Override to run setup logic when this screen becomes active
  enter(context = {}) {}

  // Override to run teardown logic when this screen is replaced
  exit() {}

  // Override to advance screen state each frame
  update(deltaTime) {}

  // Override to render the screen each frame
  draw(deltaTime) {}
}
