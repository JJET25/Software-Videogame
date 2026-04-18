// Librerias
import { Vector } from "../Core/Vector";

export class Player{
    constructor(position, speed, width, height){
        this.position = position;

        this.velocity = new Vector(0, 0);
        this.speed = speed; // Speed base = 1

        this.width = width;
        this.height = height;
    }
}