export default class SpriteSheet {
  constructor({ src, frameWidth, frameHeight, frameCount }) {
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.frameCount = frameCount;

    this.image = new Image();
    this.image.src = src;
  }

  get isLoaded() {
    return this.image.complete && this.image.naturalWidth > 0;
  }
}
