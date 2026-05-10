import Renderer from "./Core/Renderer.js";
import InputManager from "./Core/Input.js";
import Player from "./Entities/Player.js";
import Wall from "./Objects/Wall.js";
import Collision from "./Physics/Collision.js";
import Vector from "./Utils/Vector.js";
import Room from "./World/Room.js";

// Canvas
const canvas = document.getElementById("gameCanvas");

// Systems
const renderer = new Renderer(canvas);
const input = new InputManager();

renderer.resize();
renderer.setupResizeListener();

// Entities
const room = new Room(new Vector(0, 0));
const player = new Player(new Vector(100, 100), input);

// Delta time
let lastTime = 0;

// Game loop
function gameLoop(timestamp) {
    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    // Update
    renderer.setupResizeListener();
    player.update(deltaTime);
    room.update(deltaTime, player);

    // Clear
    renderer.clear();

    // Draw
    room.draw(renderer);
    player.draw(renderer);

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);