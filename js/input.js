// input.js - Keyboard input manager

export class InputHandler {
  constructor() {
    this._held = new Set();
    this._justPressed = new Set();
    this._justPressedBuffer = new Set();

    this._onKeyDown = (e) => {
      const k = e.key.toLowerCase();
      if (!this._held.has(k)) {
        this._justPressedBuffer.add(k);
      }
      this._held.add(k);
      // Prevent page scroll on arrow keys / space
      if (['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k)) {
        e.preventDefault();
      }
    };

    this._onKeyUp = (e) => {
      this._held.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  isDown(key) {
    return this._held.has(key.toLowerCase());
  }

  justPressed(key) {
    return this._justPressed.has(key.toLowerCase());
  }

  // Called once per frame after all reads
  tick() {
    this._justPressed = new Set(this._justPressedBuffer);
    this._justPressedBuffer.clear();
  }

  destroy() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
  }
}
