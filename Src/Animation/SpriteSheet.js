// Holds metadata for a single row of frames in a sprite sheet image
export default class SpriteSheet {
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
    this.srcX = srcX;
    this.srcY = srcY;

    if (image) {
      this.image = image;
    } else {
      this.image = new Image();
      this.image.src = src;
    }
  }

  // True once the image is fully loaded and has valid dimensions
  get isLoaded() {
    return this.image.complete && this.image.naturalWidth > 0;
  }
}
