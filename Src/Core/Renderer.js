import { ROOM_HEIGHT, ROOM_WIDTH } from "../Utils/Constants.js";

// Wraps the 2D canvas context and scales all draw calls from game-space to screen-space
export default class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.GAME_WIDTH = ROOM_WIDTH;
    this.GAME_HEIGHT = ROOM_HEIGHT;
    this.canvas.style.imageRendering = "pixelated";

    this.offsetX = 0;
    this.offsetY = 0;

    this.resize();
  }

  // Adjusts canvas CSS size to fill the window at the current scale
  resize() {
    const scaleX = window.innerWidth / this.GAME_WIDTH;
    const scaleY = window.innerHeight / this.GAME_HEIGHT;

    this.scale = Math.max(1, Math.floor(Math.min(scaleX, scaleY)));
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = this.scale * this.GAME_WIDTH * dpr;
    this.canvas.height = this.scale * this.GAME_HEIGHT * dpr;

    this.canvas.style.width = `${this.scale * this.GAME_WIDTH}px`;
    this.canvas.style.height = `${this.scale * this.GAME_HEIGHT}px`;

    this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
    // imageSmoothing resets when canvas.width changes
    this.context.imageSmoothingEnabled = false;
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
      this.scale * (x + this.offsetX),
      this.scale * (y + this.offsetY),
      this.scale * width,
      this.scale * height,
    );
  }

  // Draws text at (x, y), the size is scale with the game size
  drawText(text, x, y, size = 10, color = "#ffffff", options = {}) {
    const defaultOptions = {
      font: "arial",
      align: "center",
      baseline: "middle",
    };

    const config = { ...defaultOptions, ...options };
    this.context.imageSmoothingEnabled = true;
    this.context.font = `${Math.round(size * this.scale)}px ${config.font}`;
    this.context.fillStyle = color;
    this.context.textAlign = config.align;
    this.context.textBaseline = config.baseline;

    this.context.fillText(
      text,
      this.scale * (x + this.offsetX),
      this.scale * (y + this.offsetY),
    );
  }

  drawLine(x1, y1, x2, y2, color, width = 1) {
    this.context.beginPath();
    this.context.moveTo(
      this.scale * (x1 + this.offsetX),
      this.scale * (y1 + this.offsetY),
    );
    this.context.lineTo(
      this.scale * (x2 + this.offsetX),
      this.scale * (y2 + this.offsetY),
    );
    this.context.lineWidth = width;
    this.context.strokeStyle = color;
    this.context.stroke();
  }

  drawImage(image, x, y, width, height) {
    this.context.imageSmoothingEnabled = false;
    this.context.drawImage(
      image,
      this.scale * (x + this.offsetX),
      this.scale * (y + this.offsetY),
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
      this.scale * this.GAME_WIDTH,
      this.scale * this.GAME_HEIGHT,
    );
  }

  drawSprite(image, srcX, srcY, srcW, srcH, destX, destY, destW, destH) {
    if (!image.complete || image.naturalWidth === 0) return;
    this.context.imageSmoothingEnabled = false;
    this.context.drawImage(
      image,
      srcX,
      srcY,
      srcW,
      srcH,
      this.scale * (destX + this.offsetX),
      this.scale * (destY + this.offsetY),
      this.scale * destW,
      this.scale * destH,
    );
  }

  drawAnimation(animation, x, y, width, height) {
    const { sheet, frame } = animation;
    if (!sheet.isLoaded) return;
    this.drawSprite(
      sheet.image,
      frame * sheet.frameWidth,
      0,
      sheet.frameWidth,
      sheet.frameHeight,
      x,
      y,
      width,
      height,
    );
  }

  setOffset(x, y) {
    this.offsetX = x;
    this.offsetY = y;
  }
}
