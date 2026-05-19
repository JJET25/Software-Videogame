export default class InputManager {
    constructor() {
        this.keys = {};
        this._pressedThisFrame = new Set();
        this.setUpListeners();
    }

    setUpListeners() {
        window.addEventListener("keydown", (event) => {
            const k = this._normalize(event.key);
            // event.repeat is true when the browser fires repeated keydown while key is held
            if (!event.repeat) this._pressedThisFrame.add(k);
            this.keys[k] = true;
            // Prevent Tab from switching browser focus / scrolling the page
            if (k === "TAB") event.preventDefault();
        });
        window.addEventListener("keyup", (event) => {
            this.keys[this._normalize(event.key)] = false;
        });
    }

    // Call once at the END of each game loop frame, after all systems have read input
    update() {
        this._pressedThisFrame.clear();
    }

    // True every frame the key is held down
    isKeyDown(key) {
        return this.keys[key.toUpperCase()] ?? false;
    }

    // True only on the single frame the key was first pressed (not while held)
    wasKeyPressed(key) {
        return this._pressedThisFrame.has(key.toUpperCase());
    }

    _normalize(key) {
        if (key === " ") return "SPACE";
        return key.toUpperCase();
    }
}
