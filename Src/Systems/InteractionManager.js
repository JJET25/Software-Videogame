// InteractionManager.js — Detects a single-frame E press and triggers the nearest in-range interactable
// Updates proximity flags on all interactables every frame so objects can show prompt indicators.

// Squared interaction range used when an object does not define its own range
const INTERACTION_RANGE_SQ = 24 ** 2;

export default class InteractionManager {
  // Stores the input handler and previous E-key state for edge detection
  constructor(input) {
    this.input = input;
    this._ePrev = false;
  }

  // Call once per frame; updates proximity flags and fires interact() on the closest in-range object when E is pressed
  update(player, interactables, context = {}) {
    this.#updateProximity(player, interactables);

    const eDown = this.input.isKeyDown("E");
    const pressed = eDown && !this._ePrev;
    this._ePrev = eDown;

    if (!pressed) return;

    const closest = this.#findClosest(player.position, interactables);
    if (closest) closest.interact(player, context);
  }

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

  // Returns the squared distance between two points to avoid sqrt per frame
  #distanceSq(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  }

  // Sets isPlayerNear on each interactable based on current player position
  #updateProximity(player, interactables) {
    for (const obj of interactables) {
      const rangeSq = obj.interactionRange ? obj.interactionRange ** 2 : INTERACTION_RANGE_SQ;
      obj.isPlayerNear =
        this.#distanceSq(player.position, obj.position) <= rangeSq;
    }
  }
}
