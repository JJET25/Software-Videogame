// MouseManager.js — Tracks mouse position in game-space coordinates and left-click state.
import Vector from "../Utils/Vector.js";
import { ROOM_WIDTH, ROOM_HEIGHT } from "../Utils/Constants.js";

// Converts raw browser mouse events into game-space position and click signals.
export default class MouseManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.position = new Vector(0, 0);
    this.leftDown = false;
    this._clickPending = false;
    this._setupListeners();
  }

  // Attaches mousemove, mousedown, and mouseup listeners to the canvas element.
  _setupListeners() {
    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      // Converts from CSS pixels to game-space so position is comparable to entity positions.
      const gameScaleX = this.canvas.clientWidth / ROOM_WIDTH;
      const gameScaleY = this.canvas.clientHeight / ROOM_HEIGHT;
      this.position = new Vector(
        (e.clientX - rect.left) / gameScaleX,
        (e.clientY - rect.top) / gameScaleY,
      );
    });

    this.canvas.addEventListener("mousedown", (e) => {
      if (e.button === 0) {
        this.leftDown = true;
        this._clickPending = true;
      }
    });

    this.canvas.addEventListener("mouseup", (e) => {
      if (e.button === 0) this.leftDown = false;
    });
  }

  // Returns true once per click; clears the flag so it fires only on the frame it is read.
  consumeClick() {
    if (!this._clickPending) return false;
    this._clickPending = false;
    return true;
  }
}
