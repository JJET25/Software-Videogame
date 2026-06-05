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
    // Visual arc draw by Player.draw
    const strikeDuration = 0.18;
    player._strikeTimer = strikeDuration;
    player._strikeDuration = strikeDuration;
    player._strikeDir = player.aimDirection;
    player._strikeRange = this.range;
    player._strikeSpread = this.spread;

    const aimAngle = Math.atan2(player.aimDirection.y, player.aimDirection.x);
    const halfSpread = this.spread / 2;

    // Real center of player hitbox
    const player_bounds = player.getBounds();
    const player_collision_x = (player_bounds.left + player_bounds.right) / 2;
    const player_collision_y = (player_bounds.top + player_bounds.bottom) / 2;

    // Apply damage
    for (const enemy of enemies) {
      if (enemy.isDead) continue;
      if (
        this._isTargetInsideCone(
          enemy,
          player_collision_x,
          player_collision_y,
          aimAngle,
          halfSpread,
        )
      ) {
        enemy.takeDamage(this.damage);
      }
    }

    for (const obj of objects) {
      if (!obj.takeDamage || obj.isDead) continue;
      if (
        this._isTargetInsideCone(
          obj,
          player_collision_x,
          player_collision_y,
          aimAngle,
          halfSpread,
        )
      ) {
        obj.takeDamage(this.damage);
      }
    }
  }

  _isTargetInsideCone(target, pcx, pcy, aimAngle, halfSpread) {
    const bounds = target.getBounds();
    const rangeSq = this.range * this.range;

    // Check 5 points of the target bounding box
    const cx = (bounds.left + bounds.right) / 2;
    const cy = (bounds.top + bounds.bottom) / 2;

    // Points reference of a entity
    const points = [
      { x: bounds.left, y: bounds.top }, // top-left corner
      { x: bounds.right, y: bounds.top }, // top-right corner
      { x: bounds.left, y: bounds.bottom }, // bottom-left corner
      { x: bounds.right, y: bounds.bottom }, // bottom-right corner
      { x: cx, y: cy }, // center
    ];

    for (const { x, y } of points) {
      if (this.#pointInsideCone(x, y, pcx, pcy, aimAngle, halfSpread, rangeSq))
        return true;
    }
    return false;
  }

  // Returns true if a single (x, y) point is inside the cone
  #pointInsideCone(x, y, pcx, pcy, aimAngle, halfSpread, rangeSq) {
    const dx = x - pcx;
    const dy = y - pcy;

    // Distance check
    if (dx * dx + dy * dy > rangeSq) return false;

    // Angle of this point relative to the player
    const pointAngle = Math.atan2(dy, dx);

    // Difference between the point angle and aim direction
    const rawDiff = pointAngle - aimAngle;

    // Normalized [-PI, PI] so wrap-around is handdle correctly
    const diff =
      (((rawDiff % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;

    // Inside  the arc?
    return Math.abs(diff) <= halfSpread;
  }
}
