export default class InputManager {
    constructor() {
        this.keys = {};
        this.setUpListeners();
    }

    // Metodos
    setUpListeners() {
        // Listener key down
        window.addEventListener("keydown", (event) => {
            const key = event.key.toUpperCase();
            this.keys[key] = true;
        });

        // Listener key up
        window.addEventListener("keyup", (event) => {
            const key = event.key.toUpperCase();
            this.keys[key] = false;
        })
    }

    isKeyDown(key) {
        key = key.toUpperCase();
        if (!(key in this.keys)) { return false; }

        return this.keys[key];
    }
}