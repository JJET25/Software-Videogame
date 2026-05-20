import ActiveCard from './ActiveCard.js';
import { Rarity } from './Card.js';

const RANGE  = 120; // pixels — melee reach
const DAMAGE = 200;

export default class QuickStrike extends ActiveCard {
    constructor() {
        super({
            name:         'Quick Strike',
            description:  `Deal ${DAMAGE} damage to enemies in front within ${RANGE}px.`,
            rarity:       Rarity.COMMON,
            baseCooldown: 3,
        });
    }

    effect({ player, enemies }) {
        // Always show the swing visual in the aim direction
        player._strikeTimer = 0.18;
        player._strikeDir   = player.aimDirection;
        player._strikeRange = RANGE;

        if (!enemies || enemies.length === 0) return;

        // Hit every living enemy within RANGE — no angle restriction so
        // the attack reliably connects with nearby targets
        for (const enemy of enemies) {
            if (enemy.isDead) continue;

            const dx   = enemy.position.x - player.position.x;
            const dy   = enemy.position.y - player.position.y;

            if (dx * dx + dy * dy <= RANGE * RANGE) {
                enemy.takeDamage(DAMAGE);
            }
        }
    }
}
