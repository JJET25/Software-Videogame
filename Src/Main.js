// Main.js — Entry point that bootstraps the game by attaching it to the canvas element.
import Game from "./Core/Game.js";

const canvas = document.getElementById("gameCanvas");
const gameDimensionDeck = new Game(canvas);
