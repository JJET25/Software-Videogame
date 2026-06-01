import ActiveCard from "./ActiveCard.js";

// Active card that deals area damage in a cone format of the player aim direction
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

  // Sets the visual arc state on the player and applies damage to enemies within the cone
  effect({ player, enemies, objects = [] }) {
    player._strikeTimer = 0.18 + this.range / 1000;
    player._strikeDir = player.aimDirection;
    player._strikeRange = this.range;
    player._strikeSpread = this.spread;

    const aimAngle = Math.atan2(player.aimDirection.y, player.aimDirection.x);
    const halfSpread = this.spread / 2;

    // Real center player hitbox
    const pb = player.getBounds();
    const pcx = (pb.left + pb.right) / 2;
    const pcy = (pb.top + pb.bottom) / 2;

    // Hits enemiys in the cone
    for (const enemy of enemies) {
      if (enemy.isDead) continue;

      if (this._isTargetInsideCone(enemy, pcx, pcy, aimAngle, halfSpread)) {
        enemy.takeDamage(this.damage);
      }
    }

    // Hits solid objects in the cone
    for (const obj of objects) {
      if (!obj.takeDamage || obj.isDead) continue;

      if (this._isTargetInsideCone(obj, pcx, pcy, aimAngle, halfSpread)) {
        obj.takeDamage(this.damage);
      }
    }
  }

  _isTargetInsideCone(target, pcx, pcy, aimAngle, halfSpread) {
    const bounds = target.getBounds();
    const cx = (bounds.left + bounds.right) / 2; // Entity center
    const cy = (bounds.top + bounds.bottom) / 2;

    // Points reference of a entity
    const points = [
      { x: bounds.left, y: bounds.top },
      { x: bounds.right, y: bounds.top },
      { x: bounds.left, y: bounds.bottom },
      { x: bounds.right, y: bounds.bottom },
      { x: cx, y: cy },
    ];

    for (const point of points) {
      const dx = point.x - pcx;
      const dy = point.y - pcy;

      // Outside attack radius
      if (dx * dx + dy * dy > this.range * this.range) {
        continue;
      }

      let diff = Math.atan2(dy, dx) - aimAngle;
      diff =
        ((((diff + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) -
        Math.PI;

      if (Math.abs(diff) <= halfSpread) {
        return true;
      }
    }
    return false;
  }
}
