export default class ScreenManager {
  constructor(services) {
    // services = {renderer, input, mouse}
    // We add references itself for screen can call this.screenManager.changeTo(...)
    this.services = { ...services, screenManager: this };
    this.current = null;
  }

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
