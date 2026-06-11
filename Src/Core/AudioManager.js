// AudioManager.js — Dual-bus audio system for background music and sound effects.
// BGM uses an HTML Audio element for streaming; SFX uses the Web Audio API for low latency.
export default class AudioManager {
  constructor() {
    // BGM bus state.
    this._currentBGM = null;
    this._currentBGMName = null;
    this._bgmTracks = {};
    this._bgmVolume = 1.0;

    // SFX bus state.
    this._audioCtx = null;
    this._sfxBuffers = new Map();
    this._sfxGain = null;
    this._sfxVolume = 1.0;
  }

  // Registers a BGM track by name; call once during asset loading.
  loadBGM(name, path) {
    const audio = new Audio(path);
    audio.loop = true;
    audio.volume = 0.9;
    this._bgmTracks[name] = audio;
  }

  // Fetches, decodes, and caches an SFX buffer; call once during asset loading.
  async loadSFX(name, path) {
    const response = await fetch(path);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.#getAudioCtx().decodeAudioData(arrayBuffer);
    this._sfxBuffers.set(name, audioBuffer);
  }

  // Starts a BGM track by name; retries if autoplay was previously blocked.
  async playBGM(name) {
    if (name === this._currentBGMName) {
      // Retry playback if the track is paused due to browser autoplay policy.
      if (this._currentBGM && this._currentBGM.paused) {
        try { await this._currentBGM.play(); } catch { /* still blocked */ }
      }
      return;
    }
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
      // Blocked by browser autoplay policy; will retry next time playBGM is called.
    }
  }

  // Stops and rewinds the current BGM track.
  stopBGM() {
    if (!this._currentBGM) return;
    this._currentBGM.pause();
    this._currentBGM.currentTime = 0;
    this._currentBGM = null;
    this._currentBGMName = null;
  }

  // Sets the BGM volume (0 to 1) and applies it immediately to all loaded tracks.
  setBGMVolume(v) {
    this._bgmVolume = v;
    for (const track of Object.values(this._bgmTracks)) track.volume = v;
  }

  // Sets the SFX volume (0 to 1) via the shared GainNode.
  setSFXVolume(v) {
    this._sfxVolume = v;
    if (this._sfxGain) this._sfxGain.gain.value = v;
  }

  // Plays a one-shot SFX from the preloaded buffer; safe to call repeatedly.
  // The volume parameter is a per-clip multiplier applied on top of the global SFX gain.
  playSFX(name, loop = false, volume = 1.0) {
    const buffer = this._sfxBuffers.get(name);
    if (!buffer) return null;

    const ctx = this.#getAudioCtx();
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = loop;

    // Route through a per-clip gain node only when a non-default volume is requested.
    if (volume !== 1.0) {
      const clipGain = ctx.createGain();
      clipGain.gain.value = volume;
      src.connect(clipGain);
      clipGain.connect(this.#getSFXGain());
    } else {
      src.connect(this.#getSFXGain());
    }

    if (ctx.state === "suspended") ctx.resume().then(() => src.start(0));
    else src.start(0);

    return src;
  }

  // Stops BGM and tears down the SFX bus; use on scene transitions.
  stopAll() {
    this.stopBGM();
    this._audioCtx = null;
    this._sfxGain = null;
    this._sfxBuffers.clear();
  }

  // Returns the shared AudioContext, creating it on first access.
  #getAudioCtx() {
    if (!this._audioCtx) this._audioCtx = new AudioContext();
    return this._audioCtx;
  }

  // Returns the shared SFX GainNode, creating and connecting it on first access.
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
