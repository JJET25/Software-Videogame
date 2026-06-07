import { ROOM_WIDTH, ROOM_HEIGHT } from "../Utils/Constants.js";

// ── Constants ─────────────────────────────────────────────────────────────────
const RARITY_COLOR = {
  common:    "#888888",
  rare:      "#4488ff",
  epic:      "#aa44ff",
  legendary: "#ffaa00",
};

// Heart: 5×5 pixel art per heart, sz=1 game unit per pixel
const HEART_SZ  = 1;
const HEART_GAP = 2;   // game units between hearts
const HP_PER_H  = 20;  // HP each heart represents (5 hearts = 100 HP)
const MAX_HEARTS = 5;

// Panel (top-left)
const PNL_X = 2, PNL_Y = 2, PNL_W = 72, PNL_H = 46;
const CX = 5;   // content x start inside panel

// Row y positions (game coords)
const ROW_HEARTS  = 8;
const ROW_SHIELD  = 17;
const ROW_CREDITS = 26;
const ROW_DASH    = 37;

// Active card slots (compact, bottom edge)
const SLOT_SIZE = 16;
const SLOT_GAP  = 3;
const SLOTS_Y   = ROOM_HEIGHT - SLOT_SIZE - 4; // 156

const FLASH_DUR = 0.25;

// ─────────────────────────────────────────────────────────────────────────────
export default class HUD {
  constructor() {
    this._screenFlashTimer = 0;
    this._font = "monospace";
    document.fonts.load("5px 'Press Start 2P'").then(() => {
      this._font = "'Press Start 2P', monospace";
    });
  }

  triggerDamageFlash() {
    this._screenFlashTimer = FLASH_DUR;
  }

  update(deltaTime) {
    if (this._screenFlashTimer > 0) this._screenFlashTimer -= deltaTime;
  }

  draw(renderer, player, cardManager = null) {
    this._drawStatsPanel(renderer, player);
    if (cardManager) this._drawActiveSlots(renderer, cardManager);
    this._drawTestMode(renderer);
    this._drawScreenFlash(renderer);
  }

  // ── Stats panel (top-left) ───────────────────────────────────────────────

  _drawStatsPanel(renderer, player) {
    const f   = this._font;
    const ctx = renderer.context;
    const sc  = renderer.scale;


    // ── HP Hearts
    for (let i = 0; i < MAX_HEARTS; i++) {
      const hpSeg = Math.min(HP_PER_H, Math.max(0, player.health - i * HP_PER_H));
      const hx    = CX + i * (HEART_SZ * 5 + HEART_GAP);
      this._drawHeart(renderer, hx, ROW_HEARTS, HEART_SZ, this._heartColor(hpSeg));
    }

    // ── Shield pips (only when shield > 0)
    if (player.shield > 0) {
      const pipW = 6, pipH = 4, pipGap = 2;
      const maxPips = 4;
      for (let i = 0; i < maxPips; i++) {
        const px      = CX + i * (pipW + pipGap);
        const filled  = player.shield >= (i + 1) * 25;
        const partial = !filled && player.shield > i * 25;
        const color   = filled  ? "#3388cc"
                      : partial ? "#1a4466"
                      :           "#0a1020";
        renderer.drawRect(px, ROW_SHIELD, pipW, pipH, "#0a1020");
        renderer.drawRect(px, ROW_SHIELD, filled ? pipW : partial ? Math.floor(pipW * ((player.shield - i * 25) / 25)) : 0, pipH, "#3388cc");
        renderer.drawRect(px, ROW_SHIELD, pipW, 1, "#2a5580"); // top edge
      }
      renderer.drawText("DEF", CX + 4 * (pipW + pipGap) + 2, ROW_SHIELD + 3, 3, "#335588", { align: "left", font: f });
    }

    // ── Credits (coin + number)
    this._drawCoin(renderer, CX, ROW_CREDITS - 2, 1);
    ctx.shadowColor = "rgba(255,200,50,0.45)";
    ctx.shadowBlur  = Math.round(4 * sc);
    renderer.drawText(String(player.credits), CX + 11, ROW_CREDITS + 1, 5, "#ffcc33", { align: "left", font: f });
    ctx.shadowColor = "transparent";
    ctx.shadowBlur  = 0;

    // ── Dash indicator
    const dashReady = player._dashCooldownTimer <= 0;
    const dashColor = dashReady ? "#44ddff" : "#1e3f4f";

    // Arrow icon (5×3 game units)
    renderer.drawRect(CX,     ROW_DASH + 1, 4, 1, dashColor); // shaft
    renderer.drawRect(CX + 3, ROW_DASH,     2, 3, dashColor); // head vertical
    renderer.drawRect(CX + 2, ROW_DASH + 1, 3, 1, dashColor); // blend shaft to head

    if (dashReady) {
      ctx.shadowColor = "rgba(68,221,255,0.5)";
      ctx.shadowBlur  = Math.round(3 * sc);
      renderer.drawText("READY", CX + 9, ROW_DASH + 2, 4, "#44ddff", { align: "left", font: f });
      ctx.shadowColor = "transparent";
      ctx.shadowBlur  = 0;
    } else {
      renderer.drawText(player._dashCooldownTimer.toFixed(1) + "s", CX + 9, ROW_DASH + 2, 4, "#1e3f4f", { align: "left", font: f });
      // Cooldown bar
      const progress = Math.max(0, 1 - player._dashCooldownTimer / 0.8);
      const barW = 35;
      renderer.drawRect(CX, ROW_DASH + 6, barW, 2, "#070e14");
      renderer.drawRect(CX, ROW_DASH + 6, Math.floor(barW * progress), 2, "#2288aa");
    }
  }

  // ── Active card slots (bottom center, compact) ────────────────────────────

  _drawActiveSlots(renderer, cardManager) {
    const count  = cardManager.activeSlotCount;
    const total  = count * SLOT_SIZE + (count - 1) * SLOT_GAP;
    const startX = Math.floor((ROOM_WIDTH - total) / 2);
    const ctx    = renderer.context;
    const sc     = renderer.scale;
    const f      = this._font;

    for (let i = 0; i < count; i++) {
      const x   = startX + i * (SLOT_SIZE + SLOT_GAP);
      const card = cardManager.activeSlots[i];
      const sel  = cardManager.selectedIndex === i;
      const rc   = card ? (RARITY_COLOR[card.rarity] ?? "#888888") : null;

      // Background
      renderer.drawRect(x, SLOTS_Y, SLOT_SIZE, SLOT_SIZE, "#0e0e0e");

      // Border + glow on selected
      if (sel) {
        ctx.shadowColor = "rgba(220,220,220,0.55)";
        ctx.shadowBlur  = Math.round(5 * sc);
      }
      const bc = sel ? "#cccccc" : "#404040";
      renderer.drawRect(x - 1,         SLOTS_Y - 1,         SLOT_SIZE + 2, 1, bc);
      renderer.drawRect(x - 1,         SLOTS_Y + SLOT_SIZE, SLOT_SIZE + 2, 1, bc);
      renderer.drawRect(x - 1,         SLOTS_Y,             1, SLOT_SIZE,     bc);
      renderer.drawRect(x + SLOT_SIZE, SLOTS_Y,             1, SLOT_SIZE,     bc);
      if (sel) { ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; }

      if (card) {
        // Rarity left strip (2px)
        renderer.drawRect(x, SLOTS_Y, 2, SLOT_SIZE, rc);

        // Abbreviation — 3 chars, vertically centered
        const abbr = card.name.slice(0, 3).toUpperCase();
        renderer.drawText(abbr,
          x + 2 + Math.floor((SLOT_SIZE - 2) / 2),
          SLOTS_Y + Math.floor(SLOT_SIZE / 2) - 1,
          3, sel ? "#ffffff" : "#aaaaaa",
          { align: "center", font: f });

        // Cooldown: dark overlay from top + remaining time
        const onCD = !cardManager.cooldown.isReady(card.name);
        if (onCD) {
          const prog     = cardManager.cooldown.getProgress(card.name);
          const overlayH = Math.ceil((1 - prog) * SLOT_SIZE);
          renderer.drawRect(x, SLOTS_Y, SLOT_SIZE, overlayH, "rgba(0,0,0,0.75)");
          renderer.drawText(cardManager.cooldown.getRemaining(card.name).toFixed(1),
            x + Math.floor(SLOT_SIZE / 2), SLOTS_Y + SLOT_SIZE - 4,
            3, "#aaaaaa", { align: "center", font: f });
        }

        // Rarity bottom strip (1px)
        renderer.drawRect(x, SLOTS_Y + SLOT_SIZE - 1, SLOT_SIZE, 1, rc);
      } else {
        // Empty slot: slot number faint
        renderer.drawText(String(i + 1),
          x + Math.floor(SLOT_SIZE / 2),
          SLOTS_Y + Math.floor(SLOT_SIZE / 2) - 1,
          3, "#2a2a2a", { align: "center", font: f });
      }

      // Slot number: small label below the slot
      renderer.drawText(String(i + 1),
        x + Math.floor(SLOT_SIZE / 2),
        SLOTS_Y + SLOT_SIZE + 3,
        3, sel ? "#cccccc" : "#555555",
        { align: "center", font: f });
    }
  }

  // ── Coin helper ───────────────────────────────────────────────────────────

  _drawCoin(renderer, x, y, sz) {
    // 5×5 pixel-art coin:
    //  . G G G .
    //  G S S G D
    //  G S G G D
    //  G G G D D
    //  . G G G .
    // G = gold, S = shine, D = dark rim
    const gold  = "#ffcc00";
    const shine = "#fff5a0";
    const dark  = "#b38500";

    // Body
    renderer.drawRect(x + sz,     y,        sz * 3, sz,     gold);  // row 0
    renderer.drawRect(x,          y + sz,   sz * 5, sz,     gold);  // row 1
    renderer.drawRect(x,          y + sz*2, sz * 5, sz,     gold);  // row 2
    renderer.drawRect(x,          y + sz*3, sz * 5, sz,     gold);  // row 3
    renderer.drawRect(x + sz,     y + sz*4, sz * 3, sz,     gold);  // row 4

    // Shine (top-left)
    renderer.drawRect(x + sz,     y + sz,   sz * 2, sz,     shine);
    renderer.drawRect(x + sz,     y + sz*2, sz,     sz,     shine);

    // Dark rim (right + bottom for depth)
    renderer.drawRect(x + sz*4,   y + sz,   sz,     sz * 2, dark);
    renderer.drawRect(x + sz*3,   y + sz*3, sz * 2, sz,     dark);
    renderer.drawRect(x + sz*3,   y + sz*4, sz,     sz,     dark);
  }

  // ── Heart helpers ─────────────────────────────────────────────────────────

  _drawHeart(renderer, x, y, sz, color) {
    // 5×5 pixel art heart:
    //  . X . X .
    //  X X X X X
    //  X X X X X
    //  . X X X .
    //  . . X . .
    renderer.drawRect(x + sz,     y,        sz,     sz,     color); // left bump
    renderer.drawRect(x + sz * 3, y,        sz,     sz,     color); // right bump
    renderer.drawRect(x,          y + sz,   sz * 5, sz * 2, color); // middle rows
    renderer.drawRect(x + sz,     y + sz*3, sz * 3, sz,     color); // row 3
    renderer.drawRect(x + sz * 2, y + sz*4, sz,     sz,     color); // tip
  }

  _heartColor(hpSeg) {
    if (hpSeg <= 0)          return "#220d14"; // empty ghost
    if (hpSeg < HP_PER_H * 0.25) return "#661528";
    if (hpSeg < HP_PER_H * 0.5)  return "#992234";
    if (hpSeg < HP_PER_H * 0.75) return "#cc3040";
    return "#ee2244";                            // full
  }

  // ── Misc ──────────────────────────────────────────────────────────────────

  _drawTestMode(renderer) {
    if (!window.testingMode) return;
    renderer.drawText("★ TEST MODE", ROOM_WIDTH - 62, 14, 4, "#ff6600",
      { align: "left", font: this._font });
  }

  _drawScreenFlash(renderer) {
    if (this._screenFlashTimer <= 0) return;
    const alpha = (this._screenFlashTimer / FLASH_DUR * 0.38).toFixed(2);
    renderer.drawFlash(`rgba(200,0,0,${alpha})`);
  }
}
