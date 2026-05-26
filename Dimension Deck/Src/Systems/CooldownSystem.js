// Tracks named cooldown timers and reports readiness for any system that needs cooldown gating
export default class CooldownSystem {
    constructor() {
        this._cooldowns = new Map();
    }

    startCooldown(name, duration) {
        if (duration <= 0) return;
        this._cooldowns.set(name, { timer: duration, duration });
    }

    update(deltaTime) {
        for (const [name, cd] of this._cooldowns) {
            cd.timer -= deltaTime;
            if (cd.timer <= 0) this._cooldowns.delete(name);
        }
    }

    // Returns true when no active cooldown exists for the given name
    isReady(name) {
        return !this._cooldowns.has(name);
    }

    // Returns a 0-to-1 progress value where 1 means the cooldown has expired
    getProgress(name) {
        const cd = this._cooldowns.get(name);
        if (!cd) return 1;
        return 1 - cd.timer / cd.duration;
    }

    getRemaining(name) {
        return this._cooldowns.get(name)?.timer ?? 0;
    }
}
