// MrBombastic.js — Easter-egg NPC that plays a dance animation and shows a cheat code hint on interaction.
// Loops through seven sprite frames when active; stays idle (frame 0) before the player talks to it.

// Sprite sheet dimensions: 224px wide / 7 columns = 32px per frame.
const FRAME_W    = 32;
const FRAME_H    = 19;
const TOTAL_FRAMES = 7;

// Hitbox size used by the collision system.
const HITBOX_W = 16;
const HITBOX_H = 16;

// Visual render size matching the original frame proportions.
const SPRITE_W = 32;
const SPRITE_H = 19;

const SPRITE_URL = new URL(
    '../../../Assets/Sprites/enemies/rat/mr-bombastic.png',
    import.meta.url,
).href;

export default class MrBombastic {
  // Creates MrBombastic at the given position with a loaded sprite and idle state.
  constructor({ x, y }) {
    this.position         = { x, y };
    this.width            = HITBOX_W;
    this.height           = HITBOX_H;
    this.isSolid          = true;
    this.interactionRange = 60;

    this.isDancing    = false;
    this._frame       = 0;
    this._frameTimer  = 0;
    this._frameDuration = 0.12;

    this._img = new Image();
    this._img.src = SPRITE_URL;
  }

  // Returns the hitbox bounds centered on the NPC position.
  getBounds() {
    return {
      left:   this.position.x - this.width  / 2,
      right:  this.position.x + this.width  / 2,
      top:    this.position.y - this.height / 2,
      bottom: this.position.y + this.height / 2,
    };
  }

  // Starts the dance animation and displays the testing cheat code notification.
  interact(player, context) {
    if (this.isDancing) return;
    this.isDancing = true;
    this._frame = 1;
    context?.showNotification?.(
      'CHEAT CODE: SHIFT + T — activa el modo testing',
    );
  }

  // Advances the dance animation frame while the NPC is dancing.
  update(deltaTime) {
    if (!this.isDancing) return;
    this._frameTimer += deltaTime;
    if (this._frameTimer >= this._frameDuration) {
      this._frameTimer -= this._frameDuration;
      // Cycle through frames 1 to TOTAL_FRAMES-1; frame 0 is reserved for idle.
      this._frame = this._frame < TOTAL_FRAMES - 1 ? this._frame + 1 : 1;
    }
  }

  // Draws the current animation frame centered on position; falls back to a colored rectangle.
  draw(renderer) {
    const x = this.position.x - SPRITE_W / 2;
    const y = this.position.y - SPRITE_H / 2;

    if (this._img?.complete && this._img.naturalWidth > 0) {
      renderer.drawSprite(
        this._img,
        this._frame * FRAME_W, 0,
        FRAME_W, FRAME_H,
        x, y, SPRITE_W, SPRITE_H,
      );
    } else {
      renderer.drawRect(x, y, SPRITE_W, SPRITE_H, '#cc44ff');
    }
  }
}
