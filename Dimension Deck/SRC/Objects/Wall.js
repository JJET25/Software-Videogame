import GameObject from "./GameObject.js";
//import Vector from "../Utils/Vector.js";

export default class Wall extends GameObject {
    constructor(position) {
        super(position, 32, 32, "blue", "wall");
    }

    update() { }
}