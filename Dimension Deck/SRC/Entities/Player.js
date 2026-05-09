import GameObject from "./GameObject.js";
import Vector from "../Utils/Vector.js";

export default class Player extends GameObject {
    constructor(position, width, height, input) {
        super(position, width, height, "red");

        this.input = input;

        this.speed = 300;

        this.state = "idle";
    }

    update(deltaTime) {
        let direction = new Vector(0, 0);

        // Read WASD
        if (this.input.isKeyDown("W")) { direction.y -= 1; }
        if (this.input.isKeyDown("S")) { direction.y += 1; }
        if (this.input.isKeyDown("A")) { direction.x -= 1; }
        if (this.input.isKeyDown("D")) { direction.x += 1; }

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