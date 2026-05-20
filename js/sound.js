// sound.js - Web Audio API sound effects

export class SoundManager {
  constructor() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      this.ctx = null;
    }
  }

  _resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  _playTone(freq, type, duration, gainVal = 0.3, freqEnd = null) {
    if (!this.ctx) return;
    this._resume();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    if (freqEnd) osc.frequency.linearRampToValueAtTime(freqEnd, this.ctx.currentTime + duration);
    gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playHit() {
    this._playTone(220, 'square', 0.12, 0.4, 80);
    setTimeout(() => this._playTone(180, 'sawtooth', 0.08, 0.25), 30);
  }

  playKO() {
    this._playTone(400, 'square', 0.5, 0.5, 50);
  }

  playBlock() {
    this._playTone(800, 'square', 0.07, 0.15, 600);
  }

  playJump() {
    this._playTone(300, 'sine', 0.2, 0.2, 500);
  }
}
