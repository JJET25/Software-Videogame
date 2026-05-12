import Entity from "./Entity.js";
import Vector from "../Utils/Vector.js";

export default class Enemy extends Entity {
    constructor(position, player) {
        super(position, 32, 32, "green");

        this.player = player;

        this.speed = 120;

        this.health = 50;
        this.maxHealth = 50;
    }

    update(deltaTime) {

        // Direction towards player
        let direction = new Vector(
            this.player.position.x - this.position.x,
            this.player.position.y - this.position.y
        );

        // Normalize direction and apply speed
        this.velocity = direction.normalize().times(this.speed);

        // Apply movement
        super.update(deltaTime);
    }
}