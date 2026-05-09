import GameObject from "./GameObject.js";
//import Vector from "../Utils/Vector.js";

export default class Wall extends GameObject {
    constructor(position, width, height) {
        super(position, width, height, "blue", "wall");
    }

    update() { }
}