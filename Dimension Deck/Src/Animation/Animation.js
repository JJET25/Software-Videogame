export default class Animation {
  constructor({ sheet, fps, loop = true }) {
    this.sheet = sheet;
    this.fps = fps;
    this.loop = loop;

    this._elapsed = 0;
    this.frame = 0;
    this.isDone = false;
  }

  update(deltaTime) {
    if (this.isDone) return;

    this._elapsed += deltaTime;
    const frameDuration = 1 / this.fps;

    while (this._elapsed >= frameDuration) {
      this._elapsed -= frameDuration;
      this.frame++;

      if (this.frame >= this.sheet.frameCount) {
        if (this.loop) this.frame = 0;
        else {
          this.frame = this.sheet.frameCount - 1;
          this.isDone = true;
          break;
        }
      }
    }
  }

  reset() {
    this._elapsed = 0;
    this.frame = 0;
    this.isDone = false;
  }
}
