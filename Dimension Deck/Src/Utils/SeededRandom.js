// Deterministic pseudo-random number generator — same seed always produces the same sequence
export default class SeededRandom {
    constructor(seed = Date.now()) {
        this.seed  = seed;
        this.state = seed;
    }

    // Linear congruential generator step
    next() {
        this.state = (this.state * 1664525 + 1013904223) % 2 ** 32;
        return this.state;
    }

    float()         { return this.next() / 2 ** 32; }
    int(min, max)   { return Math.floor(this.float() * (max - min + 1)) + min; }
    pick(array)     { return array[this.int(0, array.length - 1)]; }
}
