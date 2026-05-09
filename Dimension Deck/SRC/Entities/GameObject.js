import Vector from "../Utils/Vector.js";

export default class GameObject {
    constructor(position, width, height, color) {
        this.position = position;
        this.velocity = new Vector(0, 0);

        this.width = width;
        this.height = height;

        this.color = color;
    }

    // Metodos
    draw(renderer) {
        renderer.drawRect(
            this.position.x,
            this.position.y,
            this.width,
            this.height,
            this.color
        );
    }

    update(deltaTime) {
        this.position = this.position.plus(this.velocity.times(deltaTime));
    }
}