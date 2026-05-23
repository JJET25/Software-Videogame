import GameObject from "./GameObject.js";

export default class Wall extends GameObject {
    constructor(position) {
        super(position, 32, 32, "blue", "wall");
    }

    update() { }
}