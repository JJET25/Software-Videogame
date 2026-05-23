import ActiveCard from './ActiveCard.js';

export default class ActiveMeleeCard extends ActiveCard {
    constructor({ name, description, rarity, damage, range, cooldown, spread = Math.PI * 0.6, level = 1 }) {
        super({ name, description, rarity, baseCooldown: cooldown, level });
        this.damage = damage;
        this.range  = range;
        this.spread = spread;
    }

    effect({ player, enemies }) {
        player._strikeTimer  = 0.18 + (this.range / 1000);
        player._strikeDir    = player.aimDirection;
        player._strikeRange  = this.range;
        player._strikeSpread = this.spread;

        if (!enemies?.length) return;

        for (const enemy of enemies) {
            if (enemy.isDead) continue;
            const dx = enemy.position.x - player.position.x;
            const dy = enemy.position.y - player.position.y;
            if (dx * dx + dy * dy <= this.range * this.range) {
                enemy.takeDamage(this.damage);
            }
        }
    }
}
