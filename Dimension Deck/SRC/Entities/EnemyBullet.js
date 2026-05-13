import Entity from "./Entity.js";
import Vector from "../Utils/Vector.js";

export default class EnemyBullet extends Entity {

    constructor(position, direction) {

        super(position, 10, 10, "yellow");

        this.speed = 300;

        this.velocity = direction.normalize().times(this.speed);

        this.damage = 15;
    }

    update(deltaTime) {

        super.update(deltaTime);
    }
}