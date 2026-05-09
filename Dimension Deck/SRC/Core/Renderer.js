export default class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.width = canvas.width;
        this.height = canvas.height;
    }

    // Metodos
    resize() {
        // Metodo para adaptar el tamaño de la ventana
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;

        this.canvas.width = newWidth;
        this.canvas.height = newHeight;

        this.width = newWidth;
        this.height = newHeight;
    }
    
    clear() {
        // Metodo para limpiar la pantalla
        this.context.fillStyle = "#000000";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawRect(x, y, width, height, color) {
        this.context.fillStyle = color;
        this.context.fillRect(x, y, width, height);
    }

    setupResizeListener(){
        window.addEventListener("resize", () => {
            this.resize();
        });
    }
}