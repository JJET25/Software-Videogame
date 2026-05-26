const INTERACTION_RANGE = 48; // pixels from player center to object center

// Detects a single-frame E press and triggers the nearest in-range interactable
export default class InteractionManager {
    constructor(input) {
        this.input  = input;
        this._ePrev = false;
    }

    // Must be called once per frame; fires interact() on the closest object within range
    update(player, interactables) {
        const eDown   = this.input.isKeyDown("E");
        const pressed = eDown && !this._ePrev;
        this._ePrev   = eDown;

        if (!pressed) return;

        let closest     = null;
        let closestDist = Infinity;

        for (const obj of interactables) {
            const dist = this._distanceSq(player.position, obj.position);
            if (dist <= INTERACTION_RANGE ** 2 && dist < closestDist) {
                closest     = obj;
                closestDist = dist;
            }
        }

        if (closest) closest.interact(player);
    }

    _distanceSq(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return dx * dx + dy * dy;
    }
}
