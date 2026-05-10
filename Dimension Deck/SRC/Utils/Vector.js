export default class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    plus(other) {
        return new Vector(this.x + other.x, this.y + other.y);
    }

    minus(other) {
        return new Vector(this.x - other.x, this.y - other.y);
    }

    times(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    magnitude() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    squareLength() {
        return this.x ** 2 + this.y ** 2;
    }

    normalize() {
        const mag = this.magnitude();
        if (mag == 0) { return new Vector(0, 0); }
        return new Vector(this.x / mag, this.y / mag);
    }
}