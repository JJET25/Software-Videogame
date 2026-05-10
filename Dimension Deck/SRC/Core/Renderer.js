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

    // Tells the browser to resize the game when the window changes
    setupResizeListener() {
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
}