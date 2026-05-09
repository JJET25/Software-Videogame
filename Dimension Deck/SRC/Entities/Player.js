import GameObject from "./GameObject.js";
import Vector from "../Utils/Vector.js";

export default class Player extends GameObject {
    constructor(position, width, height, input) {
        super(position, width, height, "red", "player");

        this.input = input;

        this.speed = 300;

        this.state = "idle";
    }

    // Methods 
    update(deltaTime) {
        let direction = new Vector(0, 0);

        // Read WASD and Arrows directions
        if (this.input.isKeyDown("W") || (this.input.isKeyDown("ARROWUP"))) { direction.y -= 1; }
        if (this.input.isKeyDown("S") || (this.input.isKeyDown("ARROWDOWN"))) { direction.y += 1; }
        if (this.input.isKeyDown("A") || (this.input.isKeyDown("ARROWLEFT"))) { direction.x -= 1; }
        if (this.input.isKeyDown("D") || (this.input.isKeyDown("ARROWRIGHT"))) { direction.x += 1; }

        // Player velocity
        this.velocity = direction.normalize().times(this.speed);

        // Player state
        if (direction.x === 0 && direction.y === 0) {
            this.state = "idle";
        } else {
            this.state = "moving";
        }
        // Player update
        super.update(deltaTime);
    }
}