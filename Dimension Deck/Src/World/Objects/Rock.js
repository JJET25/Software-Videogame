import GameObject from "./GameObject.js";

export default class Rock extends GameObject {
  constructor(position) {
    super(position, 16, 16, "#806262", "rock");
    this.isSolid = true;
  }

  update() {}
}
