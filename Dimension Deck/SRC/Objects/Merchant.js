export default class Merchant {

    constructor(position) {

        this.position = position;

        this.width = 40;
        this.height = 40;

        this.color = "gold";

        this.interactionRange = 90;
    }

    render(renderer) {

        renderer.drawRect(

            this.position.x,
            this.position.y,

            this.width,
            this.height,

            this.color
        );
    }

    canInteract(player) {

        const dx =
            player.position.x - this.position.x;

        const dy =
            player.position.y - this.position.y;

        const distance =
            Math.sqrt(dx * dx + dy * dy);

        return distance <=
            this.interactionRange;
    }
}