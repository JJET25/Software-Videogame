import { ROOM_HEIGHT, ROOM_WIDTH } from "../Utils/Constants.js";

export default class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");

        // Set the internal game resolution
        this.GAME_WIDTH = ROOM_WIDTH; 
        this.GAME_HEIGHT = ROOM_HEIGHT; 

        this.canvas.width = this.GAME_WIDTH;
        this.canvas.height = this.GAME_HEIGHT;
    }

    // Adjusts the canvas size to fit the window
    // It uses whole numbers (1x, 2x, 3x) to keep pixels sharp
    resize() {
        const scaleX = Math.floor(window.innerWidth / this.GAME_WIDTH);
        const scaleY = Math.floor(window.innerHeight / this.GAME_HEIGHT);

        // Choose the best scale to fit the screen
        const scale = Math.max(1, Math.min(scaleX, scaleY));

        this.canvas.style.width = (this.GAME_WIDTH * scale) + "px";
        this.canvas.style.height = (this.GAME_HEIGHT * scale) + "px";
    }

    // Registers the resize listener once; safe to call multiple times
    setupResizeListener() {
        if (this._resizeListenerAttached) return;
        this._resizeListenerAttached = true;
        window.addEventListener("resize", () => { this.resize(); });
    }

    // Fills the screen with black to start a new frame
    clear() {
        this.context.fillStyle = "#000000";
        this.context.fillRect(0, 0, this.GAME_WIDTH, this.GAME_HEIGHT);
    }

    // Draws a colored rectangle on the screen
    drawRect(x, y, width, height, color) {
        this.context.fillStyle = color;
        this.context.fillRect(x, y, width, height);
    }

    // Draws text at (x, y) — y is the baseline
    drawText(text, x, y, font = "10px monospace", color = "#ffffff") {
        this.context.font      = font;
        this.context.fillStyle = color;
        this.context.fillText(text, x, y);
    }

    // Fills the entire canvas with a semi-transparent color (used for damage flash)
    drawFlash(color) {
        this.context.fillStyle = color;
        this.context.fillRect(0, 0, this.GAME_WIDTH, this.GAME_HEIGHT);
    }
}