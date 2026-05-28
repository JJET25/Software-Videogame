import { ROOM_HEIGHT, ROOM_WIDTH } from "../Utils/Constants.js";

// Wraps the 2D canvas context and scales all draw calls from game-space to screen-space
export default class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");

    this.GAME_WIDTH = ROOM_WIDTH;
    this.GAME_HEIGHT = ROOM_HEIGHT;

    this.scaleX = window.innerWidth / this.GAME_WIDTH;
    this.scaleY = window.innerHeight / this.GAME_HEIGHT;
    this.scale = Math.max(1, Math.min(this.scaleX, this.scaleY));

    this.canvas.width = this.scale * this.GAME_WIDTH;
    this.canvas.height = this.scale * this.GAME_HEIGHT;

    this.context.imageSmoothingEnabled = false;
    this.canvas.style.imageRendering = "pixelated";
  }

  // Adjusts canvas CSS size to fill the window at the current scale
  resize() {
    this.canvas.style.width = this.GAME_WIDTH * this.scale + "px";
    this.canvas.style.height = this.GAME_HEIGHT * this.scale + "px";
  }

  // Registers the resize listener once; safe to call multiple times
  setupResizeListener() {
    if (this._resizeListenerAttached) return;
    this._resizeListenerAttached = true;

    window.addEventListener("resize", () => {
      this.resize();
    });
  }

  // Clears the canvas with black to begin a new frame
  clear() {
    this.context.fillStyle = "#000000";

    this.context.fillRect(
      0,
      0,
      this.scale * this.GAME_WIDTH,
      this.scale * this.GAME_HEIGHT,
    );
  }

  drawRect(x, y, width, height, color) {
    this.context.fillStyle = color;

    this.context.fillRect(
      this.scale * x,
      this.scale * y,
      this.scale * width,
      this.scale * height,
    );
  }

  // Draws text at (x, y)
  drawText(text, x, y, font = "10px monospace", color = "#ffffff") {

    // Sharper text rendering
    this.context.textBaseline = "top";
    this.context.imageSmoothingEnabled = false;

    this.context.font = font;
    this.context.fillStyle = color;

    // Small shadow for readability
    this.context.shadowColor = "rgba(0,0,0,0.45)";
    this.context.shadowBlur = 0;
    this.context.shadowOffsetX = 1;
    this.context.shadowOffsetY = 1;

    this.context.fillText(
      text,
      this.scale * x,
      this.scale * y,
    );

    // Reset shadow
    this.context.shadowColor = "transparent";
  }

  drawLine(x1, y1, x2, y2, color, width = 1) {
    this.context.beginPath();

    this.context.moveTo(
      this.scale * x1,
      this.scale * y1,
    );

    this.context.lineTo(
      this.scale * x2,
      this.scale * y2,
    );

    this.context.lineWidth = width;
    this.context.strokeStyle = color;
    this.context.stroke();
  }

  drawImage(image, x, y, width, height) {
    this.context.imageSmoothingEnabled = false;

    this.context.drawImage(
      image,
      this.scale * x,
      this.scale * y,
      this.scale * width,
      this.scale * height,
    );
  }

  // Fills the entire canvas with a semi-transparent color overlay
  drawFlash(color) {
    this.context.fillStyle = color;

    this.context.fillRect(
      0,
      0,
      this.GAME_WIDTH,
      this.GAME_HEIGHT,
    );
  }
}