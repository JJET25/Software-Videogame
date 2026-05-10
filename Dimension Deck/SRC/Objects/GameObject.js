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

    // Returns the hitbox edges for collisions
    getBounds() {
        return {
            left: this.position.x - this.width / 2,
            right: this.position.x + this.width / 2,
            top: this.position.y - this.height / 2,
            bottom: this.position.y + this.height / 2
        };
    }

    // Draws the gameObject, it centers the obj on its position
    draw(renderer) {
        const drawX = this.position.x - this.width / 2;
        const drawY = this.position.y - this.height / 2;

        renderer.drawRect(drawX, drawY, this.width, this.height, this.color);
    }
}