import Game from "./Core/Game.js";
import GameLoop from "./Core/GameLoop.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2D");

canvas.width = 800;
canvas.height = 600;

const game = new Game(ctx);
const loop = new GameLoop(game);

game.start();