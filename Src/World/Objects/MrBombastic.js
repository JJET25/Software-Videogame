const FRAME_W    = 32;  // 224px / 7 columnas = 32px por frame
const FRAME_H    = 19;
const TOTAL_FRAMES = 7; // frame 0 = idle, frames 1-6 = baile

// Hitbox — lo que usa el sistema de colisión
const HITBOX_W = 16;
const HITBOX_H = 16;

// Tamaño visual — misma proporción que el frame original (32x19)
const SPRITE_W = 32;
const SPRITE_H = 19;

const SPRITE_URL = new URL(
    '../../../Assets/Sprites/enemies/rat/mr-bombastic.png',
    import.meta.url,
).href;

export default class MrBombastic {
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

    getBounds() {
        return {
            left:   this.position.x - this.width  / 2,
            right:  this.position.x + this.width  / 2,
            top:    this.position.y - this.height / 2,
            bottom: this.position.y + this.height / 2,
        };
    }

    // context.showNotification y player.audio vienen del InteractionManager
    interact(player, context) {
        if (this.isDancing) return;
        this.isDancing = true;
        this._frame = 1;
        player.audio?.playBGM('mrBombastic');
        context?.showNotification?.(
            'CHEAT CODE: SHIFT + T — activa el modo testing',
        );
    }

    update(deltaTime) {
        if (!this.isDancing) return;
        this._frameTimer += deltaTime;
        if (this._frameTimer >= this._frameDuration) {
            this._frameTimer -= this._frameDuration;
            // cicla entre frames 1 y TOTAL_FRAMES-1 (frame 0 = idle)
            this._frame = this._frame < TOTAL_FRAMES - 1 ? this._frame + 1 : 1;
        }
    }

    draw(renderer) {
        // El sprite se centra en position pero puede ser mayor que el hitbox
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
