export default class SpriteSheet {
  constructor({ src, frameWidth, frameHeight, frameCount, row = 0 }) {
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.frameCount = frameCount;
    this.row = row;

    this.image = new Image();
    this.image.src = src;
  }

  get isLoaded() {
    return this.image.complete && this.image.naturalWidth > 0;
  }
}
