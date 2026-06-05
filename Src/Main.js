// Entry point — creates the Game instance bound to the canvas element
import Game from "./Core/Game.js";

const canvas = document.getElementById("gameCanvas");
const gameDimensionDeck = new Game(canvas);
