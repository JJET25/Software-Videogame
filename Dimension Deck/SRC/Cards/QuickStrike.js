import ActiveCard from './ActiveCard.js';
import { Rarity } from './Card.js';

export default class QuickStrike extends ActiveCard {
    constructor({ damage = 200, range = 120, cooldown = 3 } = {}) {
        super({
            name:         'Quick Strike',
            description:  `Deal ${damage} damage to enemies within ${range}px.`,
            rarity:       Rarity.COMMON,
            baseCooldown: cooldown,
        });
        this.damage = damage;
        this.range  = range;
    }

    effect({ player, enemies }) {
        player._strikeTimer = 0.18;
        player._strikeDir   = player.aimDirection;
        player._strikeRange = this.range;

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
