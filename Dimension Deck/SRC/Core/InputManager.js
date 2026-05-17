export default class InputManager {
    constructor() {
        this.keys = {};
        this.setUpListeners();
    }

    setUpListeners() {
        window.addEventListener("keydown", (event) => {
            this.keys[this._normalize(event.key)] = true;
        });
        window.addEventListener("keyup", (event) => {
            this.keys[this._normalize(event.key)] = false;
        });
    }

    isKeyDown(key) {
        return this.keys[key.toUpperCase()] ?? false;
    }

    _normalize(key) {
        if (key === " ") return "SPACE";
        return key.toUpperCase();
    }
}