export default class InputManager {
    constructor() {
        this.keys = {};
        this.setUpListeners();
    }

    // Initializes global event listeners to track key presses
    setUpListeners() {
        window.addEventListener("keydown", (event) => {
            const key = event.key.toUpperCase();
            this.keys[key] = true;
        });

        window.addEventListener("keyup", (event) => {
            const key = event.key.toUpperCase();
            this.keys[key] = false;
        })
    }

    // Check if a specific key is currently pressed
    isKeyDown(key) {
        key = key.toUpperCase();
        if (!(key in this.keys)) { return false; }

        return this.keys[key];
    }
}