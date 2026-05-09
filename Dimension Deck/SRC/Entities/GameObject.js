import Vector from "../Utils/Vector.js";

export default class GameObject {
    constructor(position, width, height, color, type) {
        this.position = position;
        this.velocity = new Vector(0, 0);

        this.width = width;
        this.height = height;

        this.color = color;
        this.type = type;
    }

    // Metodos
    draw(renderer) {
        const drawX = this.position.x - this.width / 2;
        const drawY = this.position.y - this.height / 2;

        renderer.drawRect(
            drawX,
            drawY,
            this.width,
            this.height,
            this.color
        );
    }

    getBounds() {
        return {
            left: this.position.x - this.width / 2,
            right: this.position.x + this.width / 2,
            top: this.position.y - this.height / 2,
            bottom: this.position.y + this.height / 2
        };
    }

    update(deltaTime) {
        this.position = this.position.plus(this.velocity.times(deltaTime));
    }
}