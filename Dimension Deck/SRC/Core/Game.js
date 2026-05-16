import Player from "../Entities/Player.js";
import Enemy from "../Entities/Enemy.js";

import Vector from "../Utils/Vector.js";

import Room from "../World/Rooms/Room.js";

import InputManager from "./Input.js";
import Mouse from "./Mouse.js";
import Renderer from "./Renderer.js";

import HUD from "../UI/HUD.js";
import SeededRandom from "../Utils/SeededRandom.js";
import GraphBuilder from "../Generation/GraphBuilder.js";
import RoomTypeAssigner from "../Generation/RoomTypeAssigner.js";
import RoomManager from "../Systems/RoomManager.js";
import { ROOM_WEIGHTS } from "../Utils/Constants.js";

//import InteractionManager from "../Systems/InteractionManager.js";

export default class Game {

    constructor(canvas) {

        this.renderer = new Renderer(canvas);

        this.input = new InputManager();

        this.mouse = new Mouse(canvas);

        this.player = new Player(
            new Vector(240, 176),
            this.input,
            this.mouse
        );


        // Generar un grafo pequeño para testear
        const rng = new SeededRandom();
        const builder = new GraphBuilder(rng);
        const assigner = new RoomTypeAssigner(rng);

        const graph = builder.build(30);  // pequeño para navegar fácil
        assigner.assign(graph, ROOM_WEIGHTS);

        // Crear RoomManager
        this.roomManager = new RoomManager(graph, this.player, {
            onMiniBossDefeated: () => console.log("Mini boss defeated!"),
            onFinalBossDefeated: () => console.log("Final boss defeated!")
        });

        this.roomManager.enterStartRoom();


        this.hud = new HUD();

        //this.interaction = new InteractionManager(this.input);

        // Enemy list
        this.enemies = [
            new Enemy(new Vector(500, 300), this.player),
            new Enemy(new Vector(700, 200), this.player)
        ];

        this.lastTime = 0;

        this.renderer.resize();

        this.renderer.setupResizeListener();

        this.start();
    }

    start() {

        requestAnimationFrame((ts) => this.gameLoop(ts));
    }

    gameLoop(timestamp) {

        // Prevent huge delta spikes
        const deltaTime = Math.min(
            (timestamp - this.lastTime) / 1000,
            0.05
        );

        this.lastTime = timestamp;

        const prevHealth = this.player.health;

        // Update
        this.player.update(deltaTime);

        this.roomManager.update(deltaTime);

        //this.interaction.update(
        //    this.player,
        //    this.room.interactables
        //);

        if (this.player.health < prevHealth) {
            this.hud.triggerDamageFlash();
        }

        this.hud.update(deltaTime);

        // Update enemies
        for (let enemy of this.enemies) {
            enemy.update(deltaTime);
        }

        // Remove dead enemies
        this.enemies = this.enemies.filter(
            enemy => !enemy.isDead
        );

        // Clear
        this.renderer.clear();

        // Draw
        this.roomManager.draw(this.renderer);

        this.player.draw(this.renderer);

        // Draw enemies
        for (let enemy of this.enemies) {
            enemy.draw(this.renderer);
        }

        // HUD should render last
        this.hud.draw(this.renderer, this.player);

        requestAnimationFrame((ts) => this.gameLoop(ts));
    }
}
