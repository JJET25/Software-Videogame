// Dual-bus audio system
// BGM: <audio> element for streaming background music
// SFX: Web Audio API for low-latency one-shot sound effects
export default class AudioManager {
  constructor() {
    // BGM bus
    this._currentBGM = null;
    this._currentBGMName = null;
    this._bgmTracks = {};
    this._bgmVolume = 1.0;

    // SFX bus
    this._audioCtx = null;
    this._sfxBuffers = new Map();
    this._sfxGain = null;
    this._sfxVolume = 1.0;
  }

  // Registers a BGM track: call once during asset loading
  loadBGM(name, path) {
    const audio = new Audio(path);
    audio.loop = true;
    audio.volume = 0.8;
    this._bgmTracks[name] = audio;
  }

  // Fetches, decodes and stores an SFX buffer, call once during asset loading
  async loadSFX(name, path) {
    const response = await fetch(path);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.#getAudioCtx().decodeAudioData(arrayBuffer);
    this._sfxBuffers.set(name, audioBuffer);
  }

  // Starts a BGM track; does nothing if that track is already playing
  async playBGM(name) {
    if (name === this._currentBGMName) return;
    this.stopBGM();

    const track = this._bgmTracks[name];
    if (!track) return;

    track.volume = this._bgmVolume;
    track.currentTime = 0;
    this._currentBGM = track;
    this._currentBGMName = name;

    try {
      await this._currentBGM.play();
    } catch {
      // Blocked by browser autoplay policy
    }
  }

  // Stops and rewinds the current BGM track
  stopBGM() {
    if (!this._currentBGM) return;
    this._currentBGM.pause();
    this._currentBGM.currentTime = 0;
    this._currentBGM = null;
    this._currentBGMName = null;
  }

  // Sets BGM volume (0–1); applies immediately to all loaded tracks
  setBGMVolume(v) {
    this._bgmVolume = v;
    for (const track of Object.values(this._bgmTracks)) track.volume = v;
  }

  // Sets SFX volume (0–1) via the shared GainNode
  setSFXVolume(v) {
    this._sfxVolume = v;
    if (this._sfxGain) this._sfxGain.gain.value = v;
  }

  // Plays a one-shot SFX from the preloaded buffer — safe to call repeatedly
  playSFX(name, loop = false) {
    const buffer = this._sfxBuffers.get(name);
    if (!buffer) return null;

    const ctx = this.#getAudioCtx();
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = loop;
    src.connect(this.#getSFXGain());

    if (ctx.state === "suspended") ctx.resume().then(() => src.start(0));
    else src.start(0);

    return src;
  }

  // Stops BGM and resets the SFX bus — use on scene changes
  stopAll() {
    this.stopBGM();
    this._audioCtx = null;
    this._sfxGain = null;
    this._sfxBuffers.clear();
  }

  // --------------------- PRIVATE ---------------------
  #getAudioCtx() {
    if (!this._audioCtx) this._audioCtx = new AudioContext();
    return this._audioCtx;
  }

  #getSFXGain() {
    if (!this._sfxGain) {
      const ctx = this.#getAudioCtx();
      this._sfxGain = ctx.createGain();
      this._sfxGain.gain.value = this._sfxVolume;
      this._sfxGain.connect(ctx.destination);
    }
    return this._sfxGain;
  }
}
