export default class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");

        // FIXED-SIZE DISPLAY
        this.GAME_WIDTH = 480; // 15 tiles
        this.GAME_HEIGHT = 352; // 11 tiles

        this.canvas.width = this.GAME_WIDTH;
        this.canvas.height = this.GAME_HEIGHT;
    }

    // Metodos
    resize() {
        // Integer Scalling
        const scaleX = Math.floor(window.innerWidth / this.GAME_WIDTH);
        const scaleY = Math.floor(window.innerHeight / this.GAME_HEIGHT);
        const scale = Math.max(1, Math.min(scaleX, scaleY));

        this.canvas.style.width = (this.GAME_WIDTH * scale) + "px";
        this.canvas.style.height = (this.GAME_HEIGHT * scale) + "px";
    }

    setupResizeListener() {
        window.addEventListener("resize", () => { this.resize(); });
    }

    clear() {
        // Metodo para limpiar la pantalla
        this.context.fillStyle = "#000000";
        this.context.fillRect(0, 0, this.GAME_WIDTH, this.GAME_HEIGHT);
    }

    drawRect(x, y, width, height, color) {
        this.context.fillStyle = color;
        this.context.fillRect(x, y, width, height);
    }
}