export const Rarity = Object.freeze({
  COMMON: "common",
  RARE: "rare",
  EPIC: "epic",
  LEGENDARY: "legendary",
});

export const CardType = Object.freeze({
  ACTIVE: "active",
  AUTOMATIC: "automatic",
});

// --------------------- CARD IMAGE MAP ---------------------
// Maps each card name to its artwork path.
// Kept here so Card is the single file to update when art changes.
const ACT = "../../Assets/Sprites/cards/action cards/";
const AUT = "../../Assets/Sprites/cards/automatic cards/";

const CARD_IMAGE_MAP = {
  // ── ACTIVE · MELEE ────────────────────────────────────────────────────────
  "Quick Strike": ACT + "quick-strike.png",
  "Iron Fist": ACT + "iron-fist.png",
  "Nova Burst": ACT + "nova-burst.png",
  "Shadow Blade": ACT + "shadow-knife.png",

  // ── ACTIVE · HEAL ─────────────────────────────────────────────────────────
  "Heal Pulse": ACT + "healing-potion.png",
  "Remedy Vial": ACT + "remedy-vial.png",
  "Mending Wave": ACT + "mending-wave.png",
  "Phoenix Elixir": ACT + "phoenix-elixir.png",

  // ── ACTIVE · DRAIN ────────────────────────────────────────────────────────
  "Blood Siphon": ACT + "blood-siphon.png",

  // ── ACTIVE · DEFENSE ──────────────────────────────────────────────────────
  "Wood Shield": ACT + "wood-shield.png",
  "Stone Wall": ACT + "stone-wall.png",
  "Mirror Guard": ACT + "mirror-guard.png",
  "Diamond Fortress": ACT + "diamond-fortress.jpeg",

  // ── AUTOMATIC · COMMON ────────────────────────────────────────────────────
  Lifetap: AUT + "life-tap.png",
  "Iron Skin": AUT + "iron-skin.png",
  "Wound Echo": AUT + "wound-echo.png",
  "Quick Recovery": AUT + "quick-recovery.png",

  // ── AUTOMATIC · RARE ──────────────────────────────────────────────────────
  Rebound: AUT + "rebound.png",
  "Berserker Rush": AUT + "berserker-rush.png",
  "Phantom Step": AUT + "phantom-step.png",
  "Soul Siphon": AUT + "soul-siphon.png",

  // ── AUTOMATIC · EPIC ──────────────────────────────────────────────────────
  "Last Stand": AUT + "last-stand.png",
  "Chain Kill": AUT + "chain-kill.png",
  Aftershock: AUT + "aftershock.png",

  // ── AUTOMATIC · LEGENDARY ─────────────────────────────────────────────────
  Decimator: AUT + "decimator.png",
};

// Abstract base class for all cards
// Check the rarity, type and level of the card
export default class Card {
  constructor({
    name,
    description,
    rarity,
    type,
    level = 1,
    baseCooldown = 0,
  }) {
    if (!Object.values(Rarity).includes(rarity)) {
      throw new Error(`Card "${name}": invalid rarity "${rarity}"`);
    }
    if (!Object.values(CardType).includes(type)) {
      throw new Error(`Card "${name}": invalid type "${type}"`);
    }
    if (level < 1 || level > 3) {
      throw new Error(`Card "${name}": level must be 1-3, got ${level}`);
    }

    this.name = name;
    this.description = description;
    this.rarity = rarity;
    this.type = type;
    this.level = level;
    this.baseCooldown = baseCooldown;

    // Preload card artwork — same pattern as SpriteSheet / Merchant.
    // _img is null if no path is registered; callers must guard with _img?.complete.
    const src = CARD_IMAGE_MAP[name] ?? null;
    if (src) {
      this._img = new Image();
      this._img.src = src;
    } else {
      this._img = null;
    }
  }

  effect(combatState) {
    throw new Error(`Card "${this.name}" must implement effect(combatState)`);
  }

  get isMaxLevel() {
    return this.level === 3;
  }

  // Scales the cooldown based on the level of the card: level 1 = 100%, level 2 = 70%, level 3 = 49%
  get cooldown() {
    if (window.testingMode) return 0;
    const scale = this.level >= 2 ? (this.level === 3 ? 0.49 : 0.7) : 1;
    return this.baseCooldown * scale;
  }
}
