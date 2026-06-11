// InputManager.js — Tracks keyboard state and distinguishes held keys from single-frame presses.
export default class InputManager {
  constructor() {
    this.keys = {};
    this._pressedThisFrame = new Set();
    this.setUpListeners();
  }

  // Registers keydown and keyup listeners on the window.
  setUpListeners() {
    window.addEventListener("keydown", (event) => {
      const k = this._normalize(event.key);
      // Only register the press on the first keydown event, not on repeat.
      if (!event.repeat) this._pressedThisFrame.add(k);
      this.keys[k] = true;
      if (k === "TAB" || k === "ESCAPE" || k === "SPACE")
        event.preventDefault();

      // Toggles the hitbox debug overlay when Shift+H is pressed.
      if (event.shiftKey && k === "H") {
        window.__debugHitboxes = !window.__debugHitboxes;
      }
    });

    window.addEventListener("keyup", (event) => {
      this.keys[this._normalize(event.key)] = false;
    });
  }

  // Clears the single-frame press set; must be called at the end of each game loop tick.
  update() {
    this._pressedThisFrame.clear();
  }

  // Returns true every frame the key is held down.
  isKeyDown(key) {
    return this.keys[key.toUpperCase()] ?? false;
  }

  // Returns true only on the single frame the key was first pressed, not while held.
  wasKeyPressed(key) {
    return this._pressedThisFrame.has(key.toUpperCase());
  }

  // Normalizes raw key values to uppercase, mapping the space bar to "SPACE".
  _normalize(key) {
    if (key === " ") return "SPACE";
    return key.toUpperCase();
  }
}
