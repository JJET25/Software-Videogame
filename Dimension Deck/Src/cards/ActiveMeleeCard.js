import ActiveCard from './ActiveCard.js';

// Active card that deals area damage in a cone format of the player aim direction
export default class ActiveMeleeCard extends ActiveCard {
    constructor({ name, description, rarity, damage, range, cooldown, spread = Math.PI * 0.6, level = 1 }) {
        super({ name, description, rarity, baseCooldown: cooldown, level });
        this.damage = damage;
        this.range  = range;
        this.spread = spread;
    }

    // Sets the visual arc state on the player and applies damage to enemies within the cone
    effect({ player, enemies }) {
        player._strikeTimer  = 0.18 + (this.range / 1000);
        player._strikeDir    = player.aimDirection;
        player._strikeRange  = this.range;
        player._strikeSpread = this.spread;

        if (!enemies?.length) return;

        const aimAngle  = Math.atan2(player.aimDirection.y, player.aimDirection.x);
        const halfSpread = this.spread / 2;

        for (const enemy of enemies) {
            if (enemy.isDead) continue;
            const dx = enemy.position.x - player.position.x;
            const dy = enemy.position.y - player.position.y;
            if (dx * dx + dy * dy > this.range * this.range) continue;

            // Normalize angle difference to [-π, π] then check cone
            let diff = Math.atan2(dy, dx) - aimAngle;
            diff = ((diff + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
            const dmg = window.testingMode ? this.damage * 10 : this.damage;
            if (Math.abs(diff) <= halfSpread) enemy.takeDamage(dmg);
        }
    }
}
