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

  // Recalculates the integer scale factor and resizes the canvas to fill the window
  resize() {
    const scaleX = window.innerWidth / this.GAME_WIDTH;
    const scaleY = window.innerHeight / this.GAME_HEIGHT;
    this.scale = Math.max(1, Math.floor(Math.min(scaleX, scaleY)));

    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = this.scale * this.GAME_WIDTH * dpr;
    this.canvas.height = this.scale * this.GAME_HEIGHT * dpr;

    this.canvas.style.width = `${this.scale * this.GAME_WIDTH}px`;
    this.canvas.style.height = `${this.scale * this.GAME_HEIGHT}px`;

    // DPR transform — must set imageSmoothingEnabled again after resize
    this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.context.imageSmoothingEnabled = false;
  }

  // Registers the resize listener once — safe to call multiple times
  setupResizeListener() {
    if (this._resizeListenerAttached) return;
    this._resizeListenerAttached = true;
    window.addEventListener("resize", () => this.resize());
  }

  // Clears the canvas with black to start a new frame
  clear() {
    this.context.fillStyle = "#000000";
    this.context.fillRect(0, 0, this.#sw(), this.#sh());
  }

  // Fills the entire canvas with a color overlay (damage flash, fade, etc.)
  drawFlash(color) {
    this.context.fillStyle = color;
    this.context.fillRect(0, 0, this.#sw(), this.#sh());
  }

  drawRect(x, y, width, height, color) {
    this.context.fillStyle = color;
    this.context.fillRect(
      this.#sx(x),
      this.#sy(y),
      this.scale * width,
      this.scale * height,
    );
  }

  drawLine(x1, y1, x2, y2, color, width = 1) {
    this.context.beginPath();
    this.context.moveTo(this.#sx(x1), this.#sy(y1));
    this.context.lineTo(this.#sx(x2), this.#sy(y2));
    this.context.lineWidth = width;
    this.context.strokeStyle = color;
    this.context.stroke();
  }

  // Draws text scaled to match the canvas scale
  // font param is a number (e.g. 10), not a string — the renderer builds the font string
  drawText(text, x, y, size = 10, color = "#ffffff", options = {}) {
    const config = {
      font: "arial",
      align: "center",
      baseline: "middle",
      ...options,
    };

    // imageSmoothingEnabled = true gives cleaner text rendering at high scales
    this.context.imageSmoothingEnabled = true;
    this.context.font = `${Math.round(size * this.scale)}px ${config.font}`;
    this.context.fillStyle = color;
    this.context.textAlign = config.align;
    this.context.textBaseline = config.baseline;
    this.context.fillText(text, this.#sx(x), this.#sy(y));

    // Restore pixel art setting for everything else
    this.context.imageSmoothingEnabled = false;
  }

  // Draws a full image scaled to destination size
  drawImage(image, x, y, width, height) {
    this.context.imageSmoothingEnabled = false;
    this.context.drawImage(
      image,
      this.#sx(x),
      this.#sy(y),
      this.scale * width,
      this.scale * height,
    );
  }

  // Draws a cropped region of a sprite sheet to a destination rect
  drawSprite(image, srcX, srcY, srcW, srcH, destX, destY, destW, destH) {
    if (!image.complete || image.naturalWidth === 0) return;
    this.context.imageSmoothingEnabled = false;
    this.context.drawImage(
      image,
      srcX,
      srcY,
      srcW,
      srcH,
      this.#sx(destX),
      this.#sy(destY),
      this.scale * destW,
      this.scale * destH,
    );
  }

  // Draws the current frame of an Animation object
  drawAnimation(animation, x, y, width, height) {
    const { sheet, frame } = animation;
    if (!sheet.isLoaded) return;
    const sx = sheet.srcX !== null
      ? sheet.srcX + frame * sheet.frameWidth
      : (sheet.startCol + frame) * sheet.frameWidth;
    const sy = sheet.srcY !== null
      ? sheet.srcY
      : sheet.row * sheet.frameHeight;
    this.drawSprite(sheet.image, sx, sy, sheet.frameWidth, sheet.frameHeight, x, y, width, height);
  }

  setOffset(x, y) {
    this.offsetX = x;
    this.offsetY = y;
  }

  // --------------------- PRIVATE ---------------------
  // Scaled X: converts game-space X to canvas pixels including current offset
  #sx(x) {
    return this.scale * (x + this.offsetX);
  }

  // Scaled Y: converts game-space Y to canvas pixels including current offset
  #sy(y) {
    return this.scale * (y + this.offsetY);
  }

  // Full canvas width in pixels
  #sw() {
    return this.scale * this.GAME_WIDTH;
  }

  // Full canvas height in pixels
  #sh() {
    return this.scale * this.GAME_HEIGHT;
  }
}
