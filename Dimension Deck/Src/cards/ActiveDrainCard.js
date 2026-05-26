import ActiveCard from './ActiveCard.js';

// Active card that damages the enemies
export default class ActiveDrainCard extends ActiveCard {
    constructor({ name, description, rarity, damage, healAmount, cooldown, level = 1 }) {
        super({ name, description, rarity, baseCooldown: cooldown, level });
        this.damage     = damage;
        this.healAmount = healAmount;
    }

    // Finds the closest enemy, deals damage, then heals the player
    effect({ player, enemies }) {
        if (!enemies?.length) return;

        let nearest = null;
        let minDist  = Infinity;

        for (const enemy of enemies) {
            if (enemy.isDead) continue;
            const dx   = enemy.position.x - player.position.x;
            const dy   = enemy.position.y - player.position.y;
            const dist = dx * dx + dy * dy;
            if (dist < minDist) { minDist = dist; nearest = enemy; }
        }

        if (!nearest) return;

        nearest.takeDamage(this.damage);
        player.heal(this.healAmount);
    }
}
