import Entity from "./Entity.js";

export default class EnemyBullet extends Entity {

    constructor(position, direction) {

        super(position, 12, 12, "yellow");

        this.speed = 250;

        this.velocity = direction.times(
            this.speed
        );

        this.damage = 15;

        this.isDead = false;
    }

    update(deltaTime) {

        this.position = this.position.plus(
            this.velocity.times(deltaTime)
        );

        // Remove if too far away
        if (
            this.position.x < -200 ||
            this.position.x > 4000 ||
            this.position.y < -200 ||
            this.position.y > 4000
        ) {

            this.isDead = true;
        }
    }
}