import Vector from "../Utils/Vector.js";

export default class Mouse {
    constructor(canvas) {
        this.canvas        = canvas;
        this.position      = new Vector(0, 0);
        this.leftDown      = false;
        this._clickPending = false;
        this._setupListeners();
    }

    _setupListeners() {
        this.canvas.addEventListener("mousemove", (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width  / rect.width;
            const scaleY = this.canvas.height / rect.height;
            this.position = new Vector(
                (e.clientX - rect.left) * scaleX,
                (e.clientY - rect.top)  * scaleY
            );
        });

        this.canvas.addEventListener("mousedown", (e) => {
            if (e.button === 0) {
                this.leftDown     = true;
                this._clickPending = true;
            }
        });

        this.canvas.addEventListener("mouseup", (e) => {
            if (e.button === 0) this.leftDown = false;
        });
    }

    // Returns true once per click; clears the flag so it fires only on the frame it's read
    consumeClick() {
        if (!this._clickPending) return false;
        this._clickPending = false;
        return true;
    }
}
