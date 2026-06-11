// GlitchPillar.js — Interactable glitch pillar that rewards the player with a card when activated.
// Plays an animated sprite loop and performs a weighted rarity roll on interaction.

import Animation from "../../Animation/Animation.js";
import SpriteSheet from "../../Animation/SpriteSheet.js";
import { getRandomCardByRarity } from "../../cards/CardFactory.js";
import { randInt } from "../../Utils/Random.js";
import GameObject from "./GameObject.js";

// Sprite sheet definition for the glitch pillar animation.
const PILLAR_SHEET = new SpriteSheet({
  src: "../../Assets/Sprites/objects/glitch_pilar.png",
  frameWidth: 64,
  frameHeight: 64,
  frameCount: 9,
});

export default class GlitchPillar extends GameObject {
  // Creates the pillar with a looping animation; sets a smaller hitbox than the visual sprite.
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

  // Advances the pillar animation each frame.
  update(deltaTime) {
    this.animation?.update(deltaTime);
  }

  // Draws the animation and the interaction prompt when the player is nearby.
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
        4,
        "#ffffff",
        { font: "'Press Start 2P', monospace" },
      );
    }
  }

  // Triggers the pillar once; rolls a rarity and attempts to give the player a card.
  interact(player, context = {}) {
    if (this.isTriggered) return;
    this.isTriggered = true;
    this.isDead = true;

    const rarity = this.#rarityRoll();
    this.#giveCard(player, rarity, context);
  }

  // Returns a rarity string based on a weighted random roll (common 40%, rare 35%, epic 18%, legendary 7%).
  #rarityRoll() {
    const weight = randInt(1, 100);
    if (weight <= 40) return "common";
    else if (weight <= 75) return "rare";
    else if (weight <= 93) return "epic";
    else return "legendary";
  }

  // Attempts to give the player a card of the given rarity; shows a fallback message if no card is found.
  #giveCard(player, rarity, context) {
    const card = getRandomCardByRarity(context.cardCatalog, rarity);

    if (card && context.cardManager) {
      context.cardManager.addCard(card);
      context.showNotification?.(`You got ${card.name}!`);
      return;
    }

    context.showNotification?.("The pillar hums... but nothing appears.");
  }
}
