import SpriteSheet from "../../../Animation/SpriteSheet.js";
import Animation from "../../../Animation/Animation.js";
import { randInt, randFloat } from "../../../Utils/Random.js";
import Vector from "../../../Utils/Vector.js";
import Enemy from "../../Enemy.js";

const ORBIT_DISTANCE_MAX = 120;
const ORBIT_DISTANCE_MIN = 80;
const DIVE_RANGE = 100;
const DIVE_SPEED_MULT = 1.6;
const DIVE_DURATION = 0.55;
const DIVE_END_OFFSET = -0.2;

export default class SwarmEnemy extends Enemy {
  constructor(position, deps, animations = null) {
    super(position, deps);

    this.speed = 82;
    this.health = 16;
    this.maxHealth = 16;
    this.contactDamage = 6;
    this.activationDelay = 0.5;

    this.width = 20;
    this.height = 20;
    this.hitboxWidth = this.width;
    this.hitboxHeight = this.height;

    this.color = "red";
    this.originalColor = "red";

    // Orbit and dive state
    this.orbitDirection = randInt(0, 1) === 0 ? 1 : -1;
    this.attackTimer = randFloat(0, 1.5);
    this._orbitFlipTimer = randInt(3, 5);
    this.isDiving = false;

    // Sprite sheets configs
    this._facingDir = "left";
    this._animations = null;

    this._animations = animations ?? null;

    this._animation = animations
      ? new Animation({ sheet: animations.left.idle, fps: 8, loop: true })
      : null;
  }

  get spriteSheetSrc() {
    return null;
  }

  onUpdate(deltaTime) {
    const dir = new Vector(
      this.player.position.x - this.position.x,
      this.player.position.y - this.position.y,
    );
    const distance = dir.magnitude();
    const normDir = dir.normalize();

    this.attackTimer -= deltaTime;

    // Start dive when close enough and cooldown ready
    if (this.attackTimer <= 0 && !this.isDiving && distance < DIVE_RANGE) {
      this.isDiving = true;
      this.attackTimer = DIVE_DURATION;
    }

    // End dive
    if (this.isDiving && this.attackTimer <= DIVE_END_OFFSET) {
      this.isDiving = false;
      this.attackTimer = randFloat(1.2, 3.0);
    }

    if (this.isDiving) this.#stateDiving(normDir);
    else this.#stateOrbiting(deltaTime, normDir, distance);

    this.#updateAnimation();
  }

  // --------------------- PRIVATE ---------------------
  // Walk straight at the player
  #stateDiving(normDir) {
    this.velocity = normDir.times(this.speed * DIVE_SPEED_MULT);
  }

  // Circle around the player, occasionally flipping orbit direction
  #stateOrbiting(deltaTime, normDir, distance) {
    this._orbitFlipTimer -= deltaTime;
    if (this._orbitFlipTimer <= 0) {
      this.orbitDirection *= -1;
      this._orbitFlipTimer = randInt(3, 5);
    }

    const perpendicular = new Vector(
      -normDir.y * this.orbitDirection,
      normDir.x * this.orbitDirection,
    );

    // Nudge toward or away from player to maintain orbit distance
    let radialForce = 0;
    if (distance > ORBIT_DISTANCE_MAX) radialForce = 0.35;
    else if (distance < ORBIT_DISTANCE_MIN) radialForce = -0.35;

    this.velocity = perpendicular
      .plus(normDir.times(radialForce))
      .normalize()
      .times(this.speed);
  }

  #updateAnimation() {
    if (!this._animations) return;

    if (this.velocity.x < 0) this._facingDir = "left";
    else if (this.velocity.x > 0) this._facingDir = "right";

    const action = this.velocity.squareLength() > 0.1 ? "walk" : "idle";
    const sheet = this._animations[this._facingDir][action];

    if (this._animation.sheet !== sheet) {
      this._animation = new Animation({ sheet, fps: 8, loop: true });
    }
  }
}
