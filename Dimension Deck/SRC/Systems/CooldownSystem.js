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

    isReady(name) {
        return !this._cooldowns.has(name);
    }

    getProgress(name) {
        const cd = this._cooldowns.get(name);
        if (!cd) return 1;
        return 1 - cd.timer / cd.duration;
    }

    getRemaining(name) {
        return this._cooldowns.get(name)?.timer ?? 0;
    }
}