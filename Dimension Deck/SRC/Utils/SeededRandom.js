export default class SeededRandom {
    constructor(seed = Date.now()) {
        this.seed = seed;
        this.state = seed;
    }

    next() {
        // Generador Congruencial Lineal
        this.state = (this.state * 1664525 + 1013904223) % 2 ** 32;
        return this.state;
    }

    // Random number between 0 to 1
    float() { return this.next() / 2 ** 32; }

    // Random number between min to max
    int(min, max) { return Math.floor(this.float() * (max - min + 1)) + min; }

    pick(array) { return array[this.int(0, array.length - 1)]; }
}