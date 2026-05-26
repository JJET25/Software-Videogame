import GameObject from "./GameObject.js";

export default class Wall extends GameObject {
    constructor(position) {
        super(position, 16, 16, "blue", "wall");
    }

    update() { }
}