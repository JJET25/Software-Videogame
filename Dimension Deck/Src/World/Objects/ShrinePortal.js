import GameObject from "./GameObject.js";

export default class ShrinePortal extends GameObject {
  constructor(position) {
    super(position, 16, 16, "#b02a2a", "shrinePortal");
    this.isSolid = true;
    this.isUsed = false;
  }

  interact(player, context) {
    if (this.isUsed) return;
    if (!context.canAdvance?.()) {
      context.showNotification?.("The portal lies dormant...");
      return;
    }
    this.isUsed = true;
    this.isDead = true;
    context.advanceLevel?.();
    context.showNotification?.("Advancing to next level...");
  }

  draw(renderer) {
    renderer.drawRect(
      this.position.x - this.width / 2,
      this.position.y - this.height / 2,
      this.width,
      this.height,
      this.color,
    );

    if (this.isPlayerNear && !this.isUsed) {
      renderer.drawText(
        "[E] Enter Portal",
        this.position.x,
        this.position.y - 16,
        5,
        "#000000",
      );
    }
  }
}
