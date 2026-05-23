import ActiveCard from './ActiveCard.js';

// Active card that adds shield and optionally gives a burst of invincibility to the player
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
