const SPRITE_MAP = {
    darkAges: new URL('../../../Assets/Sprites/room/store-dungeon.png', import.meta.url).href,
    oldWest:  new URL('../../../Assets/Sprites/room/store-oldwest.png', import.meta.url).href,
};

// In-room NPC that opens the store UI when the player interacts with it
export default class Merchant {
    constructor({ x, y, dimensionId }) {
        this.position         = { x, y };  // center in game-space
        this.width            = 80;
        this.height           = 80;
        this.hitboxHeight     = 54; // sprite es 80px pero el hitbox es más pequeño
        this.isSolid          = true;
        this.interactionRange = 70;
        this.storeUI          = null;

        this._img = null;
        const src = SPRITE_MAP[dimensionId];
        if (src) {
            const img = new Image();
            img.src = src;
            this._img = img;
        }
    }

    getBounds() {
        return {
            left:   this.position.x - this.width       / 2,
            right:  this.position.x + this.width       / 2,
            top:    this.position.y - this.hitboxHeight / 2,
            bottom: this.position.y + this.hitboxHeight / 2,
        };
    }

    // Called by InteractionManager when player presses E within range
    interact(player) {
        if (this.storeUI) this.storeUI.open();
    }

    draw(renderer) {
        const x = this.position.x - this.width  / 2;
        const y = this.position.y - this.height / 2;

        if (this._img?.complete && this._img.naturalWidth > 0) {
            renderer.drawImage(this._img, x, y, this.width, this.height);
        } else {
            // Fallback mientras carga el sprite
            renderer.drawRect(x, y, this.width, this.height, '#8B6914');
            renderer.drawRect(x, y, this.width, 6,           '#C49A22');
        }
    }
}
