import Entity from "./Entity.js";
import Vector from "../Utils/Vector.js";

export default class Player extends Entity {
    constructor(position, input) {
        super(position, 32, 64, "red", {hitboxHeight: 32, hitboxWidth: 32, hitboxOffset: new Vector(0, 16)});

        this.input = input;
        this.speed = 300;
        this.state = "idle";
    }

    // Handless player logic
    update(deltaTime) {
        let direction = new Vector(0, 0);

        // Check input keys for vertical and horizontal movement
        if (this.input.isKeyDown("W") || (this.input.isKeyDown("ARROWUP"))) { direction.y -= 1; }
        if (this.input.isKeyDown("S") || (this.input.isKeyDown("ARROWDOWN"))) { direction.y += 1; }
        if (this.input.isKeyDown("A") || (this.input.isKeyDown("ARROWLEFT"))) { direction.x -= 1; }
        if (this.input.isKeyDown("D") || (this.input.isKeyDown("ARROWRIGHT"))) { direction.x += 1; }

        // Normalize prevents moving faster diagonally
        // Velocity = Direction * speed
        this.velocity = direction.normalize().times(this.speed);

        // Update state based on movement
        if (direction.x === 0 && direction.y === 0) {
            this.state = "idle";
        } else {
            this.state = "moving";
        }
        // Apply physics from Entity class
        super.update(deltaTime);
    }
}