import { ROOM_HEIGHT, ROOM_WIDTH } from "../Utils/Constants.js";

const BAR_WIDTH = 58;
const BAR_HEIGHT = 6;


// TOP LEFT POSITION
const BAR_X = 10;
const BAR_Y = 26;

const FLASH_DURATION = 0.25;

// Card slots
const SLOT_SIZE = 20;
const SLOT_GAP = 4;

const SLOTS_Y = ROOM_HEIGHT - 40;

const RARITY_COLOR = {
  common: "#888888",
  rare: "#4488ff",
  epic: "#aa44ff",
  legendary: "#ffaa00",
};

export default class HUD {
  constructor() {
    this._screenFlashTimer = 0;
  }

  triggerDamageFlash() {
    this._screenFlashTimer = FLASH_DURATION;
  }

  update(deltaTime) {
    if (this._screenFlashTimer > 0) {
      this._screenFlashTimer -= deltaTime;
    }
  }

  draw(renderer, player, cardManager = null) {
    this._drawHealthBar(renderer, player);

    this._drawShieldBar(renderer, player);

    this._drawDashIndicator(renderer, player);

    this._drawCredits(renderer, player);

    if (cardManager) {
      this._drawCardSlots(renderer, cardManager);
    }

    this._drawTestModeIndicator(renderer);
    this._drawScreenFlash(renderer);
  }

  _drawHealthBar(renderer, player) {
    renderer.drawRect(
      BAR_X,
      BAR_Y,
      BAR_WIDTH,
      BAR_HEIGHT,
      "#333333",
    );

    const ratio = player.health / player.maxHealth;

    const fillWidth = Math.max(
      0,
      Math.floor(ratio * BAR_WIDTH),
    );

    renderer.drawRect(
      BAR_X,
      BAR_Y,
      fillWidth,
      BAR_HEIGHT,
      "#22cc44",
    );

    renderer.drawText(
      `HP ${player.health}/${player.maxHealth}`,
      BAR_X,
      BAR_Y - 6,
      "12px monospace",
      "#cccccc",
    );
  }

  _drawShieldBar(renderer, player) {
    if (!player.shield || player.shield <= 0) return;

    // Above HP bar
    const shieldY = BAR_Y - 18;

    renderer.drawRect(
      BAR_X,
      shieldY,
      BAR_WIDTH,
      BAR_HEIGHT,
      "#333333",
    );

    const fillWidth = Math.min(
      BAR_WIDTH,
      Math.floor((player.shield / 100) * BAR_WIDTH),
    );

    renderer.drawRect(
      BAR_X,
      shieldY,
      fillWidth,
      BAR_HEIGHT,
      "#44aaff",
    );
  }

  _drawDashIndicator(renderer, player) {
    const ready = player._dashCooldownTimer <= 0;

    renderer.drawText(
      ready
        ? "DASH READY"
        : `DASH ${player._dashCooldownTimer.toFixed(1)}`,
      BAR_X,
      BAR_Y + 12,
      "12px monospace",
      ready ? "#88eeff" : "#556677",
    );
  }

  _drawCredits(renderer, player) {
    renderer.drawText(
      `CREDITS ${player.credits}`,
      BAR_X,
      BAR_Y + 24,
      "12px monospace",
      "#ffcc33",
    );
  }

  _drawCardSlots(renderer, cardManager) {
    if (!cardManager.activeSlots) return;

    const count = cardManager.activeSlotCount;

    const totalW =
      count * SLOT_SIZE +
      (count - 1) * SLOT_GAP;

    const startX = Math.floor(
      (ROOM_WIDTH - totalW) / 2,
    );

    for (let i = 0; i < count; i++) {
      const x =
        startX + i * (SLOT_SIZE + SLOT_GAP);

      const y = SLOTS_Y;

      const card = cardManager.activeSlots[i];

      const selected =
        cardManager.selectedIndex === i;

      renderer.drawRect(
        x,
        y,
        SLOT_SIZE,
        SLOT_SIZE,
        "#1a1a1a",
      );

      const borderColor = selected
        ? "#ffffff"
        : "#444444";

      renderer.drawRect(
        x - 1,
        y - 1,
        SLOT_SIZE + 2,
        1,
        borderColor,
      );

      renderer.drawRect(
        x - 1,
        y + SLOT_SIZE,
        SLOT_SIZE + 2,
        1,
        borderColor,
      );

      renderer.drawRect(
        x - 1,
        y,
        1,
        SLOT_SIZE,
        borderColor,
      );

      renderer.drawRect(
        x + SLOT_SIZE,
        y,
        1,
        SLOT_SIZE,
        borderColor,
      );

      if (card) {
        const rarityColor =
          RARITY_COLOR[card.rarity] ??
          "#888888";

        renderer.drawRect(
          x,
          y + SLOT_SIZE - 2,
          SLOT_SIZE,
          2,
          rarityColor,
        );

        const label =
          card.name.length > 3
            ? card.name.slice(0, 3)
            : card.name;

        renderer.drawText(
          label,
          x + 3,
          y + 10,
          "8px monospace",
          "#dddddd",
        );
      }

      renderer.drawText(
        String(i + 1),
        x + SLOT_SIZE - 5,
        y + SLOT_SIZE - 3,
        "8px monospace",
        selected ? "#ffffff" : "#555555",
      );
    }
  }

  _drawTestModeIndicator(renderer) {
    if (!window.testingMode) return;
    renderer.drawText(
      "★ TEST MODE",
      ROOM_WIDTH - 62,
      14,
      "8px monospace",
      "#ff6600",
    );
  }

  _drawScreenFlash(renderer) {
    if (this._screenFlashTimer <= 0) return;

    const alpha =
      (this._screenFlashTimer / FLASH_DURATION) *
      0.38;

      
    renderer.drawFlash(
      `rgba(200, 0, 0, ${alpha.toFixed(2)})`,
    );
  }
}