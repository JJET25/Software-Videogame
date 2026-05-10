import Renderer from "./Core/Renderer.js";
import InputManager from "./Core/Input.js";
import Player from "./Entities/Player.js";
import Wall from "./Objects/Wall.js";
import Collision from "./Physics/Collision.js";
import Vector from "./Utils/Vector.js";

// Canvas
const canvas = document.getElementById("gameCanvas");

// Systems
const renderer = new Renderer(canvas);
const input = new InputManager();

renderer.resize();
renderer.setupResizeListener();

// Entities
const player = new Player(new Vector(50, 50), 32, 64, input);

const wall = new Wall(
    new Vector(250, 250),
    32,
    32
);

// Delta time
let lastTime = 0;

// Game loop
function gameLoop(timestamp) {
    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    // Clear
    renderer.clear();

    // Update
    player.update(deltaTime);

    // Colisiones — entre update y draw
    Collision.resolve(player, wall);

    // Draw
    player.draw(renderer);
    wall.draw(renderer);

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);