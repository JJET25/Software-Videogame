import Animation from "../../Animation/Animation.js";
import SpriteSheet from "../../Animation/SpriteSheet.js";
import GameObject from "./GameObject.js";

const PILLAR_SHEET = new SpriteSheet({
  src: "../../Assets/Sprites/objects/glitch_pilar.png",
  frameWidth: 64,
  frameHeight: 64,
  frameCount: 9,
});

export default class GlitchPillar extends GameObject {
  constructor(position) {
    super(position, 64, 64, "#3bb0a6", "glitchPillar");
    this.hitboxHeight = 16;
    this.hitboxWidth = 8;
    this.isSolid = false;
    this.isTriggered = false;

    this.animation = new Animation({ sheet: PILLAR_SHEET, fps: 10, loop: true });
  }

  onPlayerContact(player) {
    if (this.isTriggered) return;

    this.isTriggered = true;
    this.isDead = true;

    // Heres the glitch pillar action
    console.log("GlitchPillar activated!");
  }

  update(deltaTime) {
    this.animation?.update(deltaTime);
  }

  draw(renderer) {
    if (this.animation) {
      renderer.drawAnimation(
        this.animation,
        this.position.x - this.width / 2,
        this.position.y - this.height / 2,
        this.width,
        this.height,
      );
    }
  }
}
