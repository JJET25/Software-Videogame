import Entity from "./Entity.js";

export default class Credit extends Entity {

    constructor(position) {

        super(position, 14, 14, "gold");

        this.value = 10;
    }
}