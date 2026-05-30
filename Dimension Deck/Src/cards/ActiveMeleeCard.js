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

    if (!enemies?.length) return;

    const aimAngle = Math.atan2(player.aimDirection.y, player.aimDirection.x);
    const halfSpread = this.spread / 2;

    // Real center player hitbox
    const pb = player.getBounds();
    const pcx = (pb.left + pb.right) / 2;
    const pcy = (pb.top + pb.bottom) / 2;

    for (const enemy of enemies) {
      if (enemy.isDead) continue;

      // We get 5 point reference of enemy
      // left, right, top, botto, and center
      const eb = enemy.getBounds(); // left, right, top, botton
      const ecx = (eb.left + eb.right) / 2; // enemy center
      const ecy = (eb.top + eb.bottom) / 2;

      const enemyPoint = [
        { x: eb.left, y: eb.top },
        { x: eb.right, y: eb.top },
        { x: eb.left, y: eb.bottom },
        { x: eb.right, y: eb.bottom },
        { x: ecx, y: ecy },
      ];

      let hit = false;

      // Check if any enemy point collides with card range
      for (const point of enemyPoint) {
        const dx = point.x - pcx;
        const dy = point.y - pcy;
        
        // Distance between a circle to square
        if (dx * dx + dy * dy > this.range * this.range) continue

        // Normalize angle difference to [-π, π] then check
        let diff = Math.atan2(dy, dx) - aimAngle;

        diff =
          ((((diff + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) -
          Math.PI;

        if (Math.abs(diff) <= halfSpread) {
          hit = true;
          break;
        }
      }

      if (hit) enemy.takeDamage(this.damage);
    }

    // Hits solid objects in the cone
    for (const obj of objects) {
      if (!obj.takeDamage || obj.isDead) continue;

      const eb = obj.getBounds();
      const ocx = (eb.left + eb.right) / 2;
      const ocy = (eb.top + eb.bottom) / 2;

      const dx = ocx - pcx;
      const dy = ocy - pcy;
      if (dx * dx + dy * dy > this.range * this.range) continue;
      let diff = Math.atan2(dy, dx) - aimAngle;
      diff =
        ((((diff + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) -
        Math.PI;
      if (Math.abs(diff) <= halfSpread) obj.takeDamage(this.damage);
    }
  }
}
