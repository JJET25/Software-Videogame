// Abstract base for all game screens — provides shared service references injected by ScreenManager
export default class Screen {
  constructor() {
    this.renderer = null;
    this.input = null;
    this.mouse = null;
    this.screenManager = null;
    this.audio = null;
  }

  // Called by ScreenManager before enter() to bind renderer, input, mouse, and screenManager
  attach(services) {
    this.renderer = services.renderer;
    this.input = services.input;
    this.mouse = services.mouse;
    this.screenManager = services.screenManager;
    this.audio = services.audio;
  }

  enter(context = {}) {}
  exit() {}
  update(deltaTime) {}
  draw(deltaTime) {}
}
