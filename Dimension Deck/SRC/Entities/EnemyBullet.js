export default class EnemyBullet {

    constructor(position, direction) {

        this.position = position;

        this.velocity = direction.times(250);

        this.width = 20;
        this.height = 20;

        this.color = "yellow";

        this.damage = 15;
    }

    update(deltaTime) {

        this.position.x += this.velocity.x * deltaTime;

        this.position.y += this.velocity.y * deltaTime;
    }

    draw(renderer) {

        renderer.drawRect(
            this.position.x - 10,
            this.position.y - 10,
            this.width,
            this.height,
            this.color
        );
    }
}