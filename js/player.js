// player.js - Player fighter

import { Fighter } from './fighter.js';

export class Player extends Fighter {
  constructor(x, y, input) {
    super(x, y, 'player');
    this.input = input;
    this.color = '#00ccff';
    this.accentColor = '#0055ff';
    this.name = 'RYU';
  }

  update(dt, opponent, stageWidth) {
    this.grounded = this.y >= this.groundY;

    // Horizontal movement
    if (this.input.isDown('ArrowLeft') || this.input.isDown('a')) {
      this.vx = -this.speed;
    } else if (this.input.isDown('ArrowRight') || this.input.isDown('d')) {
      this.vx = this.speed;
    } else {
      this.vx = 0;
    }

    // Block
    this.blocking = !!(this.input.isDown('ArrowDown') || this.input.isDown('s'));

    // Jump
    if ((this.input.justPressed('ArrowUp') || this.input.justPressed('w')) && this.grounded) {
      this.vy = this.jumpForce;
      this.grounded = false;
    }

    // Attacks
    if (!this.isAttacking) {
      if (this.input.justPressed('j') || this.input.justPressed('z')) {
        this._startAttack('light');
      } else if (this.input.justPressed('k') || this.input.justPressed('x')) {
        this._startAttack('heavy');
      } else if (this.input.justPressed('l') || this.input.justPressed('c')) {
        this._startAttack('special');
      }
    }

    this._applyPhysics(dt);
    this._clampToStage(stageWidth);
    this._faceOpponent(opponent);
    this._tickAttack(dt);
    this._tickStagger(dt);

    this.input.tick();
  }
}
