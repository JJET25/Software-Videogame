// Card.js — Abstract base class for all game cards.
// Defines rarity, type, level, cooldown scaling, and preloads card artwork from a central image map.

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

// Base paths for action and automatic card art directories.
const ACT = "../../Assets/Sprites/cards/action cards/";
const AUT = "../../Assets/Sprites/cards/automatic cards/";

// Maps each card name to its artwork path; update here when art assets change.
const CARD_IMAGE_MAP = {
  "Quick Strike": ACT + "quick-strike.png",
  "Iron Fist": ACT + "iron-fist.png",
  "Nova Burst": ACT + "nova-burst.png",
  "Shadow Blade": ACT + "shadow-knife.png",

  "Heal Pulse": ACT + "healing-potion.png",
  "Remedy Vial": ACT + "remedy-vial.png",
  "Mending Wave": ACT + "mending-wave.png",
  "Phoenix Elixir": ACT + "phoenix-elixir.png",

  "Blood Siphon": ACT + "blood-siphon.png",

  "Wood Shield": ACT + "wood-shield.png",
  "Stone Wall": ACT + "stone-wall.png",
  "Mirror Guard": ACT + "mirror-guard.png",
  "Diamond Fortress": ACT + "diamond-fortress.jpeg",

  Lifetap: AUT + "life-tap.png",
  "Iron Skin": AUT + "iron-skin.png",
  "Wound Echo": AUT + "wound-echo.png",
  "Quick Recovery": AUT + "quick-recovery.png",

  Rebound: AUT + "rebound.png",
  "Berserker Rush": AUT + "berserker-rush.png",
  "Phantom Step": AUT + "phantom-step.png",
  "Soul Siphon": AUT + "soul-siphon.png",

  "Last Stand": AUT + "last-stand.png",
  "Chain Kill": AUT + "chain-kill.png",
  Aftershock: AUT + "aftershock.png",

  Decimator: AUT + "decimator.png",
};

// Base class for all cards; validates rarity, type, and level, then preloads artwork.
export default class Card {
  // Initializes card properties and throws if rarity, type, or level are out of range.
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

    // Preload card artwork; _img is null when no path is registered in CARD_IMAGE_MAP.
    const src = CARD_IMAGE_MAP[name] ?? null;
    if (src) {
      this._img = new Image();
      this._img.src = src;
    } else {
      this._img = null;
    }
  }

  // Must be overridden by subclasses; throws if called directly on the base class.
  effect(combatState) {
    throw new Error(`Card "${this.name}" must implement effect(combatState)`);
  }

  // Returns true when the card has reached the maximum upgrade level.
  get isMaxLevel() {
    return this.level === 3;
  }

  // Returns the effective cooldown after level scaling: level 1 = 100%, level 2 = 70%, level 3 = 49%.
  get cooldown() {
    if (window.testingMode) return 0;
    const scale = this.level >= 2 ? (this.level === 3 ? 0.49 : 0.7) : 1;
    return this.baseCooldown * scale;
  }
}
