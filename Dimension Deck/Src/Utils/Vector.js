// Immutable 2D vector — all operations return a new Vector instance
export default class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  plus(other)       { return new Vector(this.x + other.x, this.y + other.y); }
  minus(other)      { return new Vector(this.x - other.x, this.y - other.y); }
  times(scalar)     { return new Vector(this.x * scalar,  this.y * scalar);  }
  magnitude()       { return Math.sqrt(this.x ** 2 + this.y ** 2); }

  // Returns the squared length — preferred over magnitude() when only comparing distances
  squareLength()    { return this.x ** 2 + this.y ** 2; }

  // Returns a unit vector; returns zero vector if magnitude is zero to avoid division by zero
  normalize() {
    const mag = this.magnitude();
    if (mag === 0) return new Vector(0, 0);
    return new Vector(this.x / mag, this.y / mag);
  }
}
