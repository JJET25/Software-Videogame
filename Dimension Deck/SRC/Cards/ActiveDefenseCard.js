import ActiveCard from './ActiveCard.js';

// invincibility: optional seconds of iframes granted alongside the shield.
export default class ActiveDefenseCard extends ActiveCard {
    constructor({ name, description, rarity, shieldAmount, cooldown, level = 1, invincibility = 0 }) {
        super({ name, description, rarity, baseCooldown: cooldown, level });
        this.shieldAmount  = shieldAmount;
        this.invincibility = invincibility;
    }

    effect({ player }) {
        player.shield += this.shieldAmount;
        if (this.invincibility > 0) {
            player.grantInvincibility(this.invincibility);
        }
    }
}
