// ActiveDrainCard.js — Active card that damages the nearest enemy and heals the player.
// Finds the closest living enemy using squared-distance comparison for efficiency.

import ActiveCard from "./ActiveCard.js";

export default class ActiveDrainCard extends ActiveCard {
  // Constructs a drain card with damage and heal amounts.
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

  // Locates the nearest enemy, deals damage to it, and restores health to the player.
  effect({ player, enemies }) {
    if (!enemies?.length) return;

    // Use the center of the player hitbox as the distance origin.
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
