// Librerias
//import Game from "./Core/Game.js";
//import GameLoop from "./Core/GameLoop.js";

// Variables Globales
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

//const game = new Game(ctx);
//const loop = new GameLoop(game);

// Configuración
canvas.width = 800;
canvas.height = 600;

function draw(){
    ctx.fillStyle = "SkyBlue";
    ctx.fillRect(50, 50, 50, 50);

    requestAnimationFrame(draw);
}

draw();