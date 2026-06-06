import ActiveCard from "./ActiveCard.js";

// Deals damage in a cone in front of the player's aim direction
export default class ActiveMeleeCard extends ActiveCard {
  constructor({
    name,
    description,
    rarity,
    damage,
    range,
    cooldown,
    spread = Math.PI * 0.6,
    level = 1,
  }) {
    super({ name, description, rarity, baseCooldown: cooldown, level });
    this.damage = damage;
    this.range = range;
    this.spread = spread;
  }

  // Activates the visual arc and applies damage to all targets inside the cone
  effect({ player, enemies, objects = [] }) {
    this.#activateArc(player);

    const aimAngle = Math.atan2(player.aimDirection.y, player.aimDirection.x);
    const halfSpread = this.spread / 2;

    // Use the center of the player hitbox as the cone origin
    const bounds = player.getBounds();
    const pcx = (bounds.left + bounds.right) / 2;
    const pcy = (bounds.top + bounds.bottom) / 2;

    for (const enemy of enemies) {
      if (
        !enemy.isDead &&
        this._isTargetInsideCone(enemy, pcx, pcy, aimAngle, halfSpread)
      )
        enemy.takeDamage(this.damage);
    }

    for (const obj of objects) {
      if (
        !obj.isDead &&
        obj.takeDamage &&
        this._isTargetInsideCone(obj, pcx, pcy, aimAngle, halfSpread)
      )
        obj.takeDamage(this.damage);
    }
  }

  // --------------------- PRIVATE ---------------------
  // Sets the visual arc state on the player — read by Player.draw()
  #activateArc(player) {
    const duration = 0.5;
    player._strikeTimer = duration;
    player._strikeDuration = duration;
    player._strikeDir = player.aimDirection;
    player._strikeRange = this.range;
    player._strikeSpread = this.spread;
  }

  // Returns true if any corner or center of the target bounds falls inside the cone
  _isTargetInsideCone(target, pcx, pcy, aimAngle, halfSpread) {
    const b = target.getBounds();
    const cx = (b.left + b.right) / 2;
    const cy = (b.top + b.bottom) / 2;
    const rangeSq = this.range * this.range;

    // Test 4 corners + center for a hit detection
    const points = [
      { x: b.left, y: b.top },
      { x: b.right, y: b.top },
      { x: b.left, y: b.bottom },
      { x: b.right, y: b.bottom },
      { x: cx, y: cy },
    ];

    return points.some(({ x, y }) =>
      this.#pointInsideCone(x, y, pcx, pcy, aimAngle, halfSpread, rangeSq),
    );
  }

  // Returns true if a single point is within range and inside the angle arc
  #pointInsideCone(x, y, pcx, pcy, aimAngle, halfSpread, rangeSq) {
    const dx = x - pcx;
    const dy = y - pcy;

    if (dx * dx + dy * dy > rangeSq) return false;

    // Normalize angle difference to [-PI, PI] to handle wrap-around
    const raw = Math.atan2(dy, dx) - aimAngle;
    const diff =
      (((raw % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;

    return Math.abs(diff) <= halfSpread;
  }
}
