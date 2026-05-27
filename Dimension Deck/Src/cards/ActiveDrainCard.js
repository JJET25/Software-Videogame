import ActiveCard from "./ActiveCard.js";

// Active card that damages the enemies
export default class ActiveDrainCard extends ActiveCard {
  constructor({
    name,
    description,
    rarity,
    damage,
    healAmount,
    cooldown,
    level = 1,
  }) {
    super({ name, description, rarity, baseCooldown: cooldown, level });
    this.damage = damage;
    this.healAmount = healAmount;
  }

  // Finds the closest enemy, deals damage, then heals the player
  effect({ player, enemies }) {
    if (!enemies?.length) return;

    // Real center player hitbox
    const pb = player.getBounds();
    const pcx = (pb.left + pb.right) / 2;
    const pcy = (pb.top + pb.bottom) / 2;

    let nearest = null;
    let minDist = Infinity;

    for (const enemy of enemies) {
      if (enemy.isDead) continue;
      const dx = enemy.position.x - pcx;
      const dy = enemy.position.y - pcy;
      const dist = dx * dx + dy * dy;
      if (dist < minDist) {
        minDist = dist;
        nearest = enemy;
      }
    }

    if (!nearest) return;

    nearest.takeDamage(this.damage);
    player.heal(this.healAmount);
  }
}
