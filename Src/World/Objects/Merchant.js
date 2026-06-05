// In-room NPC that opens the store UI when the player interacts with it
export default class Merchant {
    constructor({ x, y }) {
        this.position         = { x, y };  // center in game-space
        this.width            = 40;
        this.height           = 36;
        this.interactionRange = 70;
        this.storeUI          = null;
    }

    // Called by InteractionManager when player presses E within range
    interact(player) {
        if (this.storeUI) this.storeUI.open();
    }

    draw(renderer) {
        const x = this.position.x - this.width  / 2;
        const y = this.position.y - this.height / 2;

        renderer.drawRect(x,     y,            this.width, this.height, '#8B6914');
        renderer.drawRect(x,     y,            this.width, 6,           '#C49A22');
        renderer.drawRect(x + 4, y + 10,       this.width - 8, 2,       '#A07B10');
        renderer.drawText('MERCHANT', x - 2, y - 4, '7px monospace', '#ffcc33');
    }
}
