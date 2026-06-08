const INTERACTION_RANGE_SQ = 24 ** 2; // squared to avoid sqrt each frame

// Detects a single-frame E press and triggers the nearest in-range interactable
export default class InteractionManager {
  constructor(input) {
    this.input = input;
    this._ePrev = false;
  }

  // Call once per frame; fires interact() on the closest object within range
  update(player, interactables, context = {}) {
    this.#updateProximity(player, interactables);

    const eDown = this.input.isKeyDown("E");
    const pressed = eDown && !this._ePrev;
    this._ePrev = eDown;

    if (!pressed) return;

    const closest = this.#findClosest(player.position, interactables);
    if (closest) closest.interact(player, context);
  }

  // --------------------- PRIVATE HELPERS ---------------------
  // Returns the nearest interactable within range, or null if none found
  #findClosest(origin, interactables) {
    let closest = null;
    let closestDist = Infinity;

    for (const obj of interactables) {
      const rangeSq = obj.interactionRange ? obj.interactionRange ** 2 : INTERACTION_RANGE_SQ;
      const dist = this.#distanceSq(origin, obj.position);
      if (dist <= rangeSq && dist < closestDist) {
        closest = obj;
        closestDist = dist;
      }
    }

    return closest;
  }

  #distanceSq(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  }

  #updateProximity(player, interactables) {
    for (const obj of interactables) {
      const rangeSq = obj.interactionRange ? obj.interactionRange ** 2 : INTERACTION_RANGE_SQ;
      obj.isPlayerNear =
        this.#distanceSq(player.position, obj.position) <= rangeSq;
    }
  }
}
