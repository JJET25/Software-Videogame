// Tracks keyboard inputs
export default class InputManager {
  constructor() {
    this.keys = {};
    this._pressedThisFrame = new Set();
    this.setUpListeners();
  }

  setUpListeners() {
    window.addEventListener("keydown", (event) => {
      const k = this._normalize(event.key);
      if (!event.repeat) this._pressedThisFrame.add(k);
      this.keys[k] = true;
      if (k === "TAB" || k === "ESCAPE" || k === "SPACE")
        event.preventDefault();

      // ── DEBUG TOGGLES ──────────────────────────────────────────────────
      if (event.shiftKey && k === "H") {
        window.__debugHitboxes = !window.__debugHitboxes;
      }
      // ───────────────────────────────────────────────────────────────────
    });

    window.addEventListener("keyup", (event) => {
      this.keys[this._normalize(event.key)] = false;
    });
  }

  // Must be called at the end of each game loop after all systems have read the input
  update() {
    this._pressedThisFrame.clear();
  }

  // Returns true every frame the key is held down
  isKeyDown(key) {
    return this.keys[key.toUpperCase()] ?? false;
  }

  // Returns true only on the single frame the key was first pressed, not while held
  wasKeyPressed(key) {
    return this._pressedThisFrame.has(key.toUpperCase());
  }

  _normalize(key) {
    if (key === " ") return "SPACE";
    return key.toUpperCase();
  }
}
