import Player from "../Entities/Player.js";
import Vector from "../Utils/Vector.js";
import Room from "../World/Room.js";
import InputManager from "./Input.js";
import Renderer from "./Renderer.js";

export default class Game {
    constructor(canvas) { 
        this.renderer = new Renderer(canvas);
        this.input = new InputManager();
        this.room = new Room();
        this.player = new Player(new Vector(100, 100), this.input);
        this.lastTime = 0;

        this.renderer.resize();
        this.renderer.setupResizeListener();

        // Game starts
        this.start();
    }

    start(){
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }

    gameLoop(timestamp){
        const deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        // Update
        this.renderer.setupResizeListener();
        this.player.update(deltaTime);
        this.room.update(deltaTime, this.player);

        // Clear
        this.renderer.clear();

        // Draw
        this.room.draw(this.renderer);
        this.player.draw(this.renderer);

        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
}