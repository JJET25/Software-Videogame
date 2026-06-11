// ShrinePortal.js — Animated portal object that advances the player to the next level on interaction.
// Requires the level to be completable before activating; plays a frame-looped sprite animation.

import GameObject from "./GameObject.js";

const SPRITE_URL = new URL(
  '../../../Assets/Sprites/objects/portal-Sheet.png',
  import.meta.url,
).href;

const FRAME_W     = 32;
const FRAME_H     = 64;
const TOTAL_FRAMES = 5;
// Native frame dimensions, no horizontal stretch applied.
const SPRITE_W     = 32;
const SPRITE_H     = 64;
// Duration in seconds for each animation frame.
const FRAME_DURATION = 0.12;

export default class ShrinePortal extends GameObject {
  // Creates the portal with a looping frame animation and marks it as solid.
  constructor(position) {
    super(position, 16, 16, "#b02a2a", "shrinePortal");
    this.isSolid = true;
    this.isUsed = false;
    this.interactionRange = 48;

    this._frame      = 0;
    this._frameTimer = 0;

    this._img = new Image();
    this._img.src = SPRITE_URL;
  }

  // Advances the animation frame each game tick.
  update(deltaTime) {
    this._frameTimer += deltaTime;
    if (this._frameTimer >= FRAME_DURATION) {
      this._frameTimer -= FRAME_DURATION;
      this._frame = (this._frame + 1) % TOTAL_FRAMES;
    }
  }

  // Checks if the level can be advanced before triggering the level transition.
  interact(player, context) {
    if (this.isUsed) return;
    if (!context.canAdvance?.()) {
      context.showNotification?.("The portal lies dormant...");
      return;
    }
    this.isUsed = true;
    this.isDead = true;
    player.audio?.playSFX("teleport");
    context.advanceLevel?.();
    context.showNotification?.("Advancing to next level...");
  }

  // Draws the animated portal sprite and shows the interaction prompt when the player is nearby.
  draw(renderer) {
    const sx = this.position.x - SPRITE_W / 2;
    const sy = this.position.y - SPRITE_H / 2;

    if (this._img?.complete && this._img.naturalWidth > 0) {
      renderer.drawSprite(
        this._img,
        this._frame * FRAME_W, 0,
        FRAME_W, FRAME_H,
        sx, sy, SPRITE_W, SPRITE_H,
      );
    } else {
      renderer.drawRect(sx, sy, SPRITE_W, SPRITE_H, this.color);
    }

    if (this.isPlayerNear && !this.isUsed) {
      renderer.drawText(
        "[E] Enter Portal",
        this.position.x,
        sy - 6,
        4,
        "#ffffff",
        { font: "'Press Start 2P', monospace" },
      );
    }
  }
}
