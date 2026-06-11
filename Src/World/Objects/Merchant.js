// Merchant.js — In-room NPC that opens the shop UI when the player interacts with it.
// Displays a dimension-specific sprite and delegates to StoreUI on interaction.

// Maps dimension IDs to their corresponding merchant sprite URLs.
const SPRITE_MAP = {
    darkAges: new URL('../../../Assets/Sprites/room/store-dungeon.png', import.meta.url).href,
    oldWest:  new URL('../../../Assets/Sprites/room/store-oldwest.png', import.meta.url).href,
};

export default class Merchant {
  // Creates the merchant at the given position with the correct sprite for the active dimension.
  constructor({ x, y, dimensionId }) {
    this.position         = { x, y };
    this.width            = 80;
    this.height           = 80;
    // Hitbox is smaller than the visual sprite to match the character silhouette.
    this.hitboxHeight     = 54;
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

  // Returns the axis-aligned bounding box using the smaller hitbox height.
  getBounds() {
    return {
      left:   this.position.x - this.width       / 2,
      right:  this.position.x + this.width       / 2,
      top:    this.position.y - this.hitboxHeight / 2,
      bottom: this.position.y + this.hitboxHeight / 2,
    };
  }

  // Opens the store UI when called by InteractionManager on player E press.
  interact(player) {
    if (this.storeUI) this.storeUI.open();
  }

  // Draws the merchant sprite; falls back to a colored rectangle while the image loads.
  draw(renderer) {
    const x = this.position.x - this.width  / 2;
    const y = this.position.y - this.height / 2;

    if (this._img?.complete && this._img.naturalWidth > 0) {
      renderer.drawImage(this._img, x, y, this.width, this.height);
    } else {
      renderer.drawRect(x, y, this.width, this.height, '#8B6914');
      renderer.drawRect(x, y, this.width, 6,           '#C49A22');
    }
  }
}
