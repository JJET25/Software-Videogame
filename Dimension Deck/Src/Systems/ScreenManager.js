// Routes update and draw calls to the active screen and handles screen transitions
export default class ScreenManager {
  constructor(services) {
    // Inject self so screens can call this.screenManager.changeTo(...)
    this.services = { ...services, screenManager: this };
    this.current  = null;
  }

  // Exits the current screen, attaches services to the new one, and calls its enter hook
  changeTo(newScreen, context = {}) {
    if (this.current) this.current.exit();
    this.current = newScreen;
    this.current.attach(this.services);
    this.current.enter(context);
  }

  update(deltaTime) {
    this.current?.update(deltaTime);
  }

  draw(renderer) {
    this.current?.draw(renderer);
  }
}
