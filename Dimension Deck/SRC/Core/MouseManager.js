import Vector from "../Utils/Vector.js";

export default class MouseManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.position = new Vector(0, 0);
        this._setupListeners();
    }

    _setupListeners() {
        this.canvas.addEventListener("mousemove", (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            this.position = new Vector(
                (e.clientX - rect.left) * scaleX,
                (e.clientY - rect.top) * scaleY
            );
        });
    }
}
