import { ROOM_HEIGHT, ROOM_WIDTH } from "../Utils/Constants.js";

export default class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");

    // Set the internal game resolution
    this.GAME_WIDTH = ROOM_WIDTH;
    this.GAME_HEIGHT = ROOM_HEIGHT;

    this.scaleX = window.innerWidth / this.GAME_WIDTH;
    this.scaleY = window.innerHeight / this.GAME_HEIGHT;
    this.scale = Math.max(1, Math.min(this.scaleX, this.scaleY));

    this.canvas.width = this.scale * this.GAME_WIDTH;
    this.canvas.height = this.scale * this.GAME_HEIGHT;
  }

  // Adjusts the canvas size to fit the window
  resize() {
    // Choose the best scale to fit the screen
    //const scale = Math.max(1, Math.min(this.scaleX, this.scaleY));

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

  // Fills the screen with black to start a new frame
  clear() {
    this.context.fillStyle = "#000000";
    this.context.fillRect(
      0,
      0,
      this.scale * this.GAME_WIDTH,
      this.scale * this.GAME_HEIGHT,
    );
  }

  // Draws a colored rectangle on the screen
  drawRect(x, y, width, height, color) {
    this.context.fillStyle = color;
    this.context.fillRect(
      this.scale * x,
      this.scale * y,
      this.scale * width,
      this.scale * height,
    );
  }

  // Draws text at (x, y) — y is the baseline
  drawText(text, x, y, font = "10px monospace", color = "#ffffff") {
    this.context.font = font;
    this.context.fillStyle = color;
    this.context.fillText(text, this.scale * x, this.scale * y);
  }

  drawLine(x1, y1, x2, y2, color, width = 1) {
    this.context.beginPath();
    this.context.moveTo(this.scale * x1, this.scale * y1);
    this.context.lineTo(this.scale * x2, this.scale * y2);
    this.context.lineWidth = width;
    this.context.strokeStyle = color;
    this.context.stroke();
  }

  // Fills the entire canvas with a semi-transparent color (used for damage flash)
  drawFlash(color) {
    this.context.fillStyle = color;
    this.context.fillRect(0, 0, this.GAME_WIDTH, this.GAME_HEIGHT);
  }

  // Draws a frame of a spritesheet in the screen
  // sx, sy, sw, sh = coordinates of frame in the spritesheet
  // dx, dy, dw, dh = where and size in the screen
  drawSprite(image, sx, sy, sw, sh, dx, dy, dw, dh) {
    if (!image?.complete) return; // If the image doesn't load, skip
    this.context.drawImage(
      image,
      sx,
      sy,
      sw,
      sh,
      Math.floor(this.scale * dx),
      Math.floor(this.scale * dy),
      Math.floor(this.scale * dw),
      Math.floor(this.scale * dh),
    );
  }
}
