import Vector from "../Utils/Vector.js";
import { ROOM_WIDTH, ROOM_HEIGHT } from "../Utils/Constants.js";

export default class MouseManager {
    constructor(canvas) {
        this.canvas        = canvas;
        this.position      = new Vector(0, 0);
        this.leftDown      = false;
        this._clickPending = false;
        this._setupListeners();
    }

    _setupListeners() {
        this.canvas.addEventListener("mousemove", (e) => {
            const rect      = this.canvas.getBoundingClientRect();
            // Convert from CSS pixels to game-space pixels so that
            // mouse.position is comparable to entity positions (0–480, 0–352)
            const gameScaleX = this.canvas.width  / ROOM_WIDTH;
            const gameScaleY = this.canvas.height / ROOM_HEIGHT;
            this.position = new Vector(
                (e.clientX - rect.left) / gameScaleX,
                (e.clientY - rect.top)  / gameScaleY
            );
        });

        this.canvas.addEventListener("mousedown", (e) => {
            if (e.button === 0) { // 0 is the Left Mouse Button
                this.leftDown      = true;
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