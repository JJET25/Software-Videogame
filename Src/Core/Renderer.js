// Renderer.js — Wraps the 2D canvas context and scales all draw calls from game-space to screen-space.
import { ROOM_HEIGHT, ROOM_WIDTH } from "../Utils/Constants.js";

// Manages the canvas transform and exposes drawing primitives scaled to the current resolution.
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

  // Recalculates the integer scale factor and resizes the canvas to fill the window.
  resize() {
    const scaleX = window.innerWidth / this.GAME_WIDTH;
    const scaleY = window.innerHeight / this.GAME_HEIGHT;
    this.scale = Math.max(1, Math.floor(Math.min(scaleX, scaleY)));

    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = this.scale * this.GAME_WIDTH * dpr;
    this.canvas.height = this.scale * this.GAME_HEIGHT * dpr;

    this.canvas.style.width = `${this.scale * this.GAME_WIDTH}px`;
    this.canvas.style.height = `${this.scale * this.GAME_HEIGHT}px`;

    // Apply the DPR transform; imageSmoothingEnabled must be reset after each resize.
    this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.context.imageSmoothingEnabled = false;
  }

  // Attaches the window resize listener once; safe to call multiple times.
  setupResizeListener() {
    if (this._resizeListenerAttached) return;
    this._resizeListenerAttached = true;
    window.addEventListener("resize", () => this.resize());
  }

  // Clears the canvas with black to begin a new frame.
  clear() {
    this.context.fillStyle = "#000000";
    this.context.fillRect(0, 0, this.#sw(), this.#sh());
  }

  // Fills the entire canvas with a solid color overlay (used for damage flashes or fades).
  drawFlash(color) {
    this.context.fillStyle = color;
    this.context.fillRect(0, 0, this.#sw(), this.#sh());
  }

  // Draws a filled rectangle at game-space coordinates scaled to screen pixels.
  drawRect(x, y, width, height, color) {
    this.context.fillStyle = color;
    this.context.fillRect(
      this.#sx(x),
      this.#sy(y),
      this.scale * width,
      this.scale * height,
    );
  }

  // Draws a line between two game-space points.
  drawLine(x1, y1, x2, y2, color, width = 1) {
    this.context.beginPath();
    this.context.moveTo(this.#sx(x1), this.#sy(y1));
    this.context.lineTo(this.#sx(x2), this.#sy(y2));
    this.context.lineWidth = width;
    this.context.strokeStyle = color;
    this.context.stroke();
  }

  // Draws text at game-space coordinates; size is a numeric pixel value in game-space.
  // Temporarily enables image smoothing for cleaner text rendering at high scale.
  drawText(text, x, y, size = 10, color = "#ffffff", options = {}) {
    const config = {
      font: "arial",
      align: "center",
      baseline: "middle",
      ...options,
    };

    this.context.imageSmoothingEnabled = true;
    this.context.font = `${Math.round(size * this.scale)}px ${config.font}`;
    this.context.fillStyle = color;
    this.context.textAlign = config.align;
    this.context.textBaseline = config.baseline;
    this.context.fillText(text, this.#sx(x), this.#sy(y));

    // Restore pixel-art rendering for all subsequent draw calls.
    this.context.imageSmoothingEnabled = false;
  }

  // Draws a full image scaled to the destination size in game-space.
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

  // Draws a cropped region of a sprite sheet to a destination rectangle in game-space.
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

  // Draws the current frame of an Animation object at the given game-space position.
  drawAnimation(animation, x, y, width, height) {
    const { sheet, frame } = animation;
    if (!sheet.isLoaded) return;
    // Compute source X: use absolute srcX when set, otherwise derive from column index.
    const sx = sheet.srcX !== null
      ? sheet.srcX + frame * sheet.frameWidth
      : (sheet.startCol + frame) * sheet.frameWidth;
    // Compute source Y: use absolute srcY when set, otherwise derive from row index.
    const sy = sheet.srcY !== null
      ? sheet.srcY
      : sheet.row * sheet.frameHeight;
    this.drawSprite(sheet.image, sx, sy, sheet.frameWidth, sheet.frameHeight, x, y, width, height);
  }

  // Sets the draw offset applied to every game-space coordinate (used for camera scrolling).
  setOffset(x, y) {
    this.offsetX = x;
    this.offsetY = y;
  }

  // Converts game-space X to canvas pixels including the current draw offset.
  #sx(x) {
    return this.scale * (x + this.offsetX);
  }

  // Converts game-space Y to canvas pixels including the current draw offset.
  #sy(y) {
    return this.scale * (y + this.offsetY);
  }

  // Returns the full canvas width in scaled pixels.
  #sw() {
    return this.scale * this.GAME_WIDTH;
  }

  // Returns the full canvas height in scaled pixels.
  #sh() {
    return this.scale * this.GAME_HEIGHT;
  }
}
