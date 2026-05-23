export default class SpriteSheet {
  constructor(src) {
    this.image = new Image();
    this.image.src = src;

    this.ready = false;
    this.image.onload = () => (this.ready = true);
    this.image.onerror = () => console.error(`SpriteSheet no cargó: ${src}`);
  }

  // Draw a static frame
  draw(renderer, sx, sy, sw, sh, dx, dy, dw, dh) {
    if (!this.ready) return;
    renderer.drawSprite(this.image, sx, sy, sw, sh, dx, dy, dw, dh);
  }
}
