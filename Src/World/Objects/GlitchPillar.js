import Animation from "../../Animation/Animation.js";
import SpriteSheet from "../../Animation/SpriteSheet.js";
import { getRandomCardByRarity } from "../../cards/CardFactory.js";
import { randInt } from "../../Utils/Random.js";
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
    this.hitboxHeight = 34;
    this.hitboxWidth = 18;
    this.isSolid = true;
    this.isTriggered = false;

    this.animation = new Animation({
      sheet: PILLAR_SHEET,
      fps: 10,
      loop: true,
    });
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

    if (this.isPlayerNear && !this.isTriggered) {
      renderer.drawText(
        "[E] ???",
        this.position.x,
        this.position.y - 22,
        5,
        "#000000",
      );
    }
  }

  interact(player, context = {}) {
    if (this.isTriggered) return;
    this.isTriggered = true;
    this.isDead = true;

    const rarity = this.#rarityRoll();
    this.#giveCard(player, rarity, context);
  }

  #rarityRoll() {
    const weight = randInt(1, 100);
    if (weight <= 40) return "common";
    else if (weight <= 75) return "rare";
    else if (weight <= 93) return "epic";
    else return "legendary";
  }

  #giveCard(player, rarity, context) {
    const card = getRandomCardByRarity(context.cardCatalog, rarity);

    if (card && context.cardManager) {
      context.cardManager.addCard(card);
      context.showNotification?.(`You got ${card.name}!`);
      return;
    }

    // No card available, no happens nothing
    context.showNotification?.("The pillar hums... but nothing appears.");
  }
}
