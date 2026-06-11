// ScreenManager.js — Routes update and draw calls to the active screen and handles screen transitions
export default class ScreenManager {
  // Merges provided services with a self-reference so screens can request transitions
  constructor(services) {
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

  // Delegates the frame update to the currently active screen
  update(deltaTime) {
    this.current?.update(deltaTime);
  }

  // Delegates the frame draw to the currently active screen
  draw(renderer) {
    this.current?.draw(renderer);
  }
}
