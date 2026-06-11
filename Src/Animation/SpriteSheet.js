// SpriteSheet.js — Holds source metadata for a single strip of frames within a sprite sheet image.
export default class SpriteSheet {
  // Accepts either a pre-loaded image object or a src path to load automatically.
  constructor({
    src,
    image,
    frameWidth,
    frameHeight,
    frameCount,
    row = 0,
    startCol = 0,
    srcX = null,
    srcY = null,
  }) {
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.frameCount = frameCount;
    this.row = row;
    this.startCol = startCol;
    // Absolute pixel coordinates override row/startCol when provided.
    this.srcX = srcX;
    this.srcY = srcY;

    if (image) {
      this.image = image;
    } else {
      this.image = new Image();
      this.image.src = src;
    }
  }

  // Returns true once the underlying image is fully decoded and has valid dimensions.
  get isLoaded() {
    return this.image.complete && this.image.naturalWidth > 0;
  }
}
