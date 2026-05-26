import GameObject from "./GameObject.js";

export default class Chest extends GameObject {
    constructor(position) {
        super(position, 16, 16, "#f1c536", "chest");
    }
}