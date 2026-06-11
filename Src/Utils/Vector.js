// Vector.js — Immutable 2D vector with arithmetic and normalization helpers.
// All operations return a new Vector instance, leaving the original unchanged.
export default class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  // Returns a new Vector that is the sum of this and another vector.
  plus(other)       { return new Vector(this.x + other.x, this.y + other.y); }

  // Returns a new Vector that is the difference of this and another vector.
  minus(other)      { return new Vector(this.x - other.x, this.y - other.y); }

  // Returns a new Vector scaled by the given scalar.
  times(scalar)     { return new Vector(this.x * scalar,  this.y * scalar);  }

  // Returns the Euclidean length of the vector.
  magnitude()       { return Math.sqrt(this.x ** 2 + this.y ** 2); }

  // Returns the squared length; preferred over magnitude() when only comparing distances.
  squareLength()    { return this.x ** 2 + this.y ** 2; }

  // Returns a unit vector in the same direction; returns the zero vector if magnitude is zero.
  normalize() {
    const mag = this.magnitude();
    if (mag === 0) return new Vector(0, 0);
    return new Vector(this.x / mag, this.y / mag);
  }
}
