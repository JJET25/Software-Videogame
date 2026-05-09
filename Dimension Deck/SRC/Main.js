import Renderer from "./Core/Renderer.js";
import InputManager from "./Core/Input.js";

import Player from "./Entities/Player.js";

import Vector from "./Utils/Vector.js";

// Canvas
const canvas = document.getElementById("gameCanvas");

// Systems
const renderer = new Renderer(canvas);
const input = new InputManager();

// --- AQUÍ EL CAMBIO ---
// Forzar el tamaño inicial
renderer.resize();

// Escuchar cambios de tamaño de ventana
window.addEventListener("resize", () => {
    renderer.resize();
});
// ----------------------

// Player
const player = new Player(
    new Vector(100, 100),
    50,
    50,
    input
);

// Delta time
let lastTime = 0;

// Game loop
function gameLoop(timestamp) {

    // Delta time in seconds
    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    // Clear screen
    renderer.clear();

    // Update
    player.update(deltaTime);

    // Draw
    player.draw(renderer);

    // Next frame
    requestAnimationFrame(gameLoop);
}

// Start game
requestAnimationFrame(gameLoop);