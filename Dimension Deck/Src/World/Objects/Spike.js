import GameObject from "./GameObject.js";

const SPIKE_DAMAGE = 8;
const SPIKE_COOLDOWN = 1;
const SLOW_DURATION = 1.2;

export default class Spike extends GameObject {
  constructor(position) {
    super(position, 16, 16, "#555555", "spike");
    this.isSolid = false;
    this._damageCooldown = 0;
  }

  onPlayerContact(player, deltaTime) {
    if (this._damageCooldown > 0) {
      this._damageCooldown -= deltaTime;
      return;
    }
    player.takeDamage(SPIKE_DAMAGE);
    player._slowTimer = SLOW_DURATION;
    this._damageCooldown = SPIKE_COOLDOWN;
  }
}
