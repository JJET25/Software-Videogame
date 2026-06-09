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
  "Quick Strike": ACT + "quick-strike.jpeg",
  "Iron Fist": ACT + "iron-fist.jpeg",
  "Nova Burst": ACT + "nova-burst.jpeg",
  "Shadow Blade": ACT + "shadow-knife.png",

  // ── ACTIVE · HEAL ─────────────────────────────────────────────────────────
  "Heal Pulse": ACT + "healing-potion.png",
  "Mending Wave": ACT + "mending-wave.jpeg",
  "Phoenix Elixir": ACT + "phoenix-elixir.jpeg",

  // ── ACTIVE · DRAIN ────────────────────────────────────────────────────────
  "Blood Siphon": ACT + "blood-siphon.jpeg",

  // ── ACTIVE · DEFENSE ──────────────────────────────────────────────────────
  "Wood Shield": ACT + "wood-shield.png",
  "Stone Wall": ACT + "stone-wall.jpeg",
  "Mirror Guard": ACT + "mirror-guard.jpeg",
  "Diamond Fortress": ACT + "diamond-fortress.jpeg",

  // ── AUTOMATIC · COMMON ────────────────────────────────────────────────────
  Lifetap: AUT + "life-tap.jpeg",
  "Iron Skin": AUT + "iron-skin.jpeg",
  "Wound Echo": AUT + "wound-echo.jpeg",
  "Quick Recovery": AUT + "quick-recovery.jpeg",

  // ── AUTOMATIC · RARE ──────────────────────────────────────────────────────
  Rebound: AUT + "rebound.jpeg",
  "Berserker Rush": AUT + "berserket-rush.jpeg",
  "Phantom Step": AUT + "phantom-step.jpeg",
  "Soul Siphon": AUT + "sould-siphon.jpeg",

  // ── AUTOMATIC · EPIC ──────────────────────────────────────────────────────
  "Last Stand": AUT + "last-stand.jpeg",
  "Chain Kill": AUT + "chain-kill.jpeg",
  Aftershock: AUT + "after-shock.jpeg",

  // ── AUTOMATIC · LEGENDARY ─────────────────────────────────────────────────
  Decimator: AUT + "decimator.jpeg",
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
