import Vector from "../../Utils/Vector.js";
import Enemy from "../Enemy.js";

export default class SwarmEnemy extends Enemy {
  constructor(position, player, bullets, credits) {
    super(position, player);

    this.speed = 115;
    this.health = 25;
    this.maxHealth = 25;
    this.width = 20;
    this.height = 20;
    this.color = "purple";
    this.originalColor = "purple";
    this.contactDamage = 5;

    // Swarm AI
    this.orbitDirection = Math.random() > 0.5 ? 1 : -1;
    this.offsetDistance = 60 + Math.random() * 80;
    this.retargetTimer = 0;
    this.randomOffset = new Vector(
      (Math.random() - 0.5) * 120,
      (Math.random() - 0.5) * 120,
    );
  }

  update(deltaTime) {
    if (this.isDead) return;

    this.retargetTimer -= deltaTime;
    if (this._flashTimer > 0) this._flashTimer -= deltaTime;
    if (this.damageCooldown > 0) this.damageCooldown -= deltaTime;

    const direction = new Vector(
      this.player.position.x - this.position.x,
      this.player.position.y - this.position.y,
    );
    const normalizedDirection = direction.normalize();
    const distance = direction.magnitude();

    if (this.retargetTimer <= 0) {
      this.retargetTimer = 0.2 + Math.random() * 0.25;

      if (distance < this.offsetDistance) {
        // Orbit player
        const orbitDir = new Vector(
          -normalizedDirection.y * this.orbitDirection,
          normalizedDirection.x * this.orbitDirection,
        );
        this.velocity = orbitDir
          .plus(normalizedDirection.times(0.15))
          .normalize()
          .times(this.speed);
      } else {
        // Chase con offset
        const targetDir = this.player.position
          .plus(this.randomOffset)
          .minus(this.position)
          .normalize();
        this.velocity = targetDir.times(this.speed);
      }
    }

    // Damage contact
    const dx = Math.abs(this.player.position.x - this.position.x);
    const dy = Math.abs(this.player.position.y - this.position.y);
    if (dx < 32 && dy < 32 && this.damageCooldown <= 0) {
      this.player.takeDamage(this.contactDamage);
      this.damageCooldown = 0.4;
    }

    this.position = this.position.plus(this.velocity.times(deltaTime));
  }
}
