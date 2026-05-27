import Entity from "../Entity.js";

export default class Credit extends Entity {

    constructor(position) {

        // Smaller coins
        super(position, 8, 8, "gold");

        this.value = 10;
    }
}