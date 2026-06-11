// HUD.js — Renders the in-game heads-up display including hearts, shield pips, credits, dash readiness, and active card slots
import { ROOM_WIDTH, ROOM_HEIGHT } from "../Utils/Constants.js";

// Maps card rarity names to their display colors
const RARITY_COLOR = {
  common: "#9b8fb0",
  rare: "#4f8fff",
  epic: "#b65cff",
  legendary: "#ffb43c",
};

// Pixel size per heart segment and spacing between hearts
const HEART_SZ = 1;
const HEART_GAP = 2;
// HP units represented by one full heart
const HP_PER_H = 20;
// Maximum number of hearts displayed
const MAX_HEARTS = 5;

// X anchor for the top-left stats panel
const CX = 5;
// Vertical row positions for each stat element
const ROW_HEARTS = 8;
const ROW_SHIELD = 17;
const ROW_CREDITS = 26;
const ROW_DASH = 37;

// Active card slot pixel dimensions and layout constants
const SLOT_W = 24;
const SLOT_H = 33;
const SLOT_GAP = 3;
const SLOTS_X = 3;
const SLOTS_Y = ROOM_HEIGHT - SLOT_H - 7;
// Height of the name strip at the bottom of each card slot
const NAME_STRIP_H = 6;

const SLOT_BG = "#111111";
const SLOT_BORDER = "#2a2a2a";
const SLOT_SELECT = "#dddddd";

// Duration of the red damage flash overlay in seconds
const FLASH_DUR = 0.25;

export default class HUD {
  // Loads the pixel font and initializes the flash timer
  constructor() {
    this._screenFlashTimer = 0;
    this._font = "monospace";
    document.fonts.load("5px 'Press Start 2P'").then(() => {
      this._font = "'Press Start 2P', monospace";
    });
  }

  // Starts the red screen flash that plays when the player takes damage
  triggerDamageFlash() {
    this._screenFlashTimer = FLASH_DUR;
  }

  // Decrements the flash timer each frame
  update(deltaTime) {
    if (this._screenFlashTimer > 0) this._screenFlashTimer -= deltaTime;
  }

  // Draws the stats panel, active card slots, test-mode label, and damage flash overlay
  draw(renderer, player, cardManager = null) {
    this._drawStatsPanel(renderer, player);
    if (cardManager) this._drawActiveSlots(renderer, cardManager);
    this._drawTestMode(renderer);
    this._drawScreenFlash(renderer);
  }

  // Draws hearts, shield pips, credit counter, and dash readiness indicator in the top-left corner
  _drawStatsPanel(renderer, player) {
    const f = this._font;
    const ctx = renderer.context;
    const sc = renderer.scale;

    for (let i = 0; i < MAX_HEARTS; i++) {
      const hpSeg = Math.min(
        HP_PER_H,
        Math.max(0, player.health - i * HP_PER_H),
      );
      const hx = CX + i * (HEART_SZ * 5 + HEART_GAP);
      this._drawHeart(
        renderer,
        hx,
        ROW_HEARTS,
        HEART_SZ,
        this._heartColor(hpSeg),
      );
    }

    // Shield pips: four segments filled proportionally to the player's shield value
    if (player.shield > 0) {
      const pipW = 6,
        pipH = 4,
        pipGap = 2,
        maxPips = 4;
      for (let i = 0; i < maxPips; i++) {
        const px = CX + i * (pipW + pipGap);
        const filled = player.shield >= (i + 1) * 25;
        const partial = !filled && player.shield > i * 25;
        renderer.drawRect(px, ROW_SHIELD, pipW, pipH, "#0a1020");
        renderer.drawRect(
          px,
          ROW_SHIELD,
          filled
            ? pipW
            : partial
              ? Math.floor(pipW * ((player.shield - i * 25) / 25))
              : 0,
          pipH,
          "#3388cc",
        );
        renderer.drawRect(px, ROW_SHIELD, pipW, 1, "#2a5580");
      }
      renderer.drawText(
        "DEF",
        CX + 4 * (pipW + pipGap) + 2,
        ROW_SHIELD + 3,
        3,
        "#335588",
        { align: "left", font: f },
      );
    }

    this._drawCoin(renderer, CX, ROW_CREDITS - 2, 1);
    ctx.shadowColor = "rgba(255,200,50,0.45)";
    ctx.shadowBlur = Math.round(4 * sc);
    renderer.drawText(
      String(player.credits),
      CX + 11,
      ROW_CREDITS + 1,
      5,
      "#ffcc33",
      { align: "left", font: f },
    );
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    // Dash indicator: icon with READY label or a cooldown bar and countdown
    const dashReady = player._dashCooldownTimer <= 0;
    const dashColor = dashReady ? "#44ddff" : "#1e3f4f";
    renderer.drawRect(CX, ROW_DASH + 1, 4, 1, dashColor);
    renderer.drawRect(CX + 3, ROW_DASH, 2, 3, dashColor);
    renderer.drawRect(CX + 2, ROW_DASH + 1, 3, 1, dashColor);

    if (dashReady) {
      ctx.shadowColor = "rgba(68,221,255,0.5)";
      ctx.shadowBlur = Math.round(3 * sc);
      renderer.drawText("READY", CX + 9, ROW_DASH + 2, 4, "#44ddff", {
        align: "left",
        font: f,
      });
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
    } else {
      renderer.drawText(
        player._dashCooldownTimer.toFixed(1) + "s",
        CX + 9,
        ROW_DASH + 2,
        4,
        "#1e3f4f",
        { align: "left", font: f },
      );
      const progress = Math.max(0, 1 - player._dashCooldownTimer / 0.8);
      const barW = 35;
      renderer.drawRect(CX, ROW_DASH + 6, barW, 2, "#070e14");
      renderer.drawRect(
        CX,
        ROW_DASH + 6,
        Math.floor(barW * progress),
        2,
        "#2288aa",
      );
    }
  }

  // Draws the active card slot row anchored to the bottom-left corner
  _drawActiveSlots(renderer, cardManager) {
    const count = cardManager.activeSlotCount;
    const ctx = renderer.context;
    const sc = renderer.scale;
    const f = this._font;

    for (let i = 0; i < count; i++) {
      const x = SLOTS_X + i * (SLOT_W + SLOT_GAP);
      const card = cardManager.activeSlots[i];
      const sel = cardManager.selectedIndex === i;
      const rc = card ? (RARITY_COLOR[card.rarity] ?? "#888888") : null;

      renderer.drawRect(x, SLOTS_Y, SLOT_W, SLOT_H, SLOT_BG);

      if (card) {
        if (sel) {
          ctx.shadowColor = "rgba(200,200,200,0.45)";
          ctx.shadowBlur = Math.round(5 * sc);
        }

        // Card image occupies the slot minus the name strip height
        const imgH = SLOT_H - NAME_STRIP_H;
        if (card._img?.complete && card._img.naturalWidth > 0) {
          renderer.drawImage(
            card._img,
            x + 1,
            SLOTS_Y + 1,
            SLOT_W - 2,
            imgH - 1,
          );
        } else {
          renderer.drawRect(
            x + 1,
            SLOTS_Y + 1,
            SLOT_W - 2,
            imgH - 1,
            "#1a1a1a",
          );
          renderer.drawText(
            card.name.slice(0, 3).toUpperCase(),
            x + Math.floor(SLOT_W / 2),
            SLOTS_Y + Math.floor(imgH / 2),
            3,
            "#666666",
            { align: "center", font: f },
          );
        }

        const nameY = SLOTS_Y + SLOT_H - NAME_STRIP_H;
        renderer.drawRect(x, nameY, SLOT_W, NAME_STRIP_H, "#0a0a0a");
        renderer.drawText(
          card.name.slice(0, 3).toUpperCase(),
          x + Math.floor(SLOT_W / 2),
          nameY + Math.floor(NAME_STRIP_H / 2),
          3,
          sel ? "#ffffff" : "#aaaaaa",
          { align: "center", font: f },
        );

        // Cooldown fill draws a top-down semi-transparent overlay with a countdown number
        if (!cardManager.cooldown.isReady(card.name)) {
          const prog = cardManager.cooldown.getProgress(card.name);
          const overlayH = Math.ceil((1 - prog) * SLOT_H);
          renderer.drawRect(x, SLOTS_Y, SLOT_W, overlayH, "rgba(10,10,10,0.78)");
          if (overlayH > 7) {
            renderer.drawText(
              cardManager.cooldown.getRemaining(card.name).toFixed(1),
              x + Math.floor(SLOT_W / 2),
              SLOTS_Y + Math.floor(overlayH / 2),
              3,
              "#cccccc",
              { align: "center", font: f },
            );
          }
        }

        this.#frame1px(
          renderer,
          x,
          SLOTS_Y,
          SLOT_W,
          SLOT_H,
          sel ? SLOT_SELECT : rc,
        );
        if (sel) {
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
        }
      } else {
        this.#frame1px(renderer, x, SLOTS_Y, SLOT_W, SLOT_H, SLOT_BORDER);
        renderer.drawText(
          String(i + 1),
          x + Math.floor(SLOT_W / 2),
          SLOTS_Y + Math.floor(SLOT_H / 2),
          3,
          "#555555",
          { align: "center", font: f },
        );
      }

      // Slot number label drawn below each slot
      renderer.drawText(
        String(i + 1),
        x + Math.floor(SLOT_W / 2),
        SLOTS_Y + SLOT_H + 3,
        3,
        sel ? "#dddddd" : "#888888",
        { align: "center", font: f },
      );
    }
  }

  // Draws a 1px rectangular outline using four drawRect calls
  #frame1px(renderer, x, y, w, h, color) {
    renderer.drawRect(x, y, w, 1, color);
    renderer.drawRect(x, y + h - 1, w, 1, color);
    renderer.drawRect(x, y, 1, h, color);
    renderer.drawRect(x + w - 1, y, 1, h, color);
  }

  // Draws a 5x5 pixel-art coin icon at the given position
  _drawCoin(renderer, x, y, sz) {
    const gold = "#ffcc00",
      shine = "#fff5a0",
      dark = "#b38500";
    renderer.drawRect(x + sz, y, sz * 3, sz, gold);
    renderer.drawRect(x, y + sz, sz * 5, sz, gold);
    renderer.drawRect(x, y + sz * 2, sz * 5, sz, gold);
    renderer.drawRect(x, y + sz * 3, sz * 5, sz, gold);
    renderer.drawRect(x + sz, y + sz * 4, sz * 3, sz, gold);
    renderer.drawRect(x + sz, y + sz, sz * 2, sz, shine);
    renderer.drawRect(x + sz, y + sz * 2, sz, sz, shine);
    renderer.drawRect(x + sz * 4, y + sz, sz, sz * 2, dark);
    renderer.drawRect(x + sz * 3, y + sz * 3, sz * 2, sz, dark);
    renderer.drawRect(x + sz * 3, y + sz * 4, sz, sz, dark);
  }

  // Draws a 5x5 pixel-art heart icon in the specified color
  _drawHeart(renderer, x, y, sz, color) {
    renderer.drawRect(x + sz, y, sz, sz, color);
    renderer.drawRect(x + sz * 3, y, sz, sz, color);
    renderer.drawRect(x, y + sz, sz * 5, sz * 2, color);
    renderer.drawRect(x + sz, y + sz * 3, sz * 3, sz, color);
    renderer.drawRect(x + sz * 2, y + sz * 4, sz, sz, color);
  }

  // Returns a red shade matching the fill level of the given HP segment
  _heartColor(hpSeg) {
    if (hpSeg <= 0) return "#220d14";
    if (hpSeg < HP_PER_H * 0.25) return "#661528";
    if (hpSeg < HP_PER_H * 0.5) return "#992234";
    if (hpSeg < HP_PER_H * 0.75) return "#cc3040";
    return "#ee2244";
  }

  // Draws the TEST MODE label when window.testingMode is active
  _drawTestMode(renderer) {
    if (!window.testingMode) return;
    renderer.drawText("TEST MODE", ROOM_WIDTH - 62, 14, 4, "#ff6600", {
      align: "left",
      font: this._font,
    });
  }

  // Draws a red transparent overlay that fades out over FLASH_DUR seconds
  _drawScreenFlash(renderer) {
    if (this._screenFlashTimer <= 0) return;
    const alpha = ((this._screenFlashTimer / FLASH_DUR) * 0.38).toFixed(2);
    renderer.drawFlash(`rgba(200,0,0,${alpha})`);
  }
}
