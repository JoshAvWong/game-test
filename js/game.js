// game.js - Main game loop and state management

import { Player } from './player.js';
import { Enemy } from './enemy.js';
import { InputHandler } from './input.js';
import { Renderer } from './renderer.js';
import { UI } from './ui.js';
import { SoundManager } from './sound.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;

    this.state = 'menu'; // menu | fighting | ko | win | gameover
    this.round = 1;
    this.maxRounds = 3;
    this.playerWins = 0;
    this.enemyWins = 0;
    this.roundTimer = 60;
    this.timerInterval = null;
    this.animFrameId = null;
    this.lastTime = 0;

    this.sound = new SoundManager();
    this.input = new InputHandler();
    this.renderer = new Renderer(this.ctx, this.width, this.height);
    this.ui = new UI(this.ctx, this.width, this.height);

    this._initFighters();
  }

  _initFighters() {
    this.player = new Player(160, this.height - 180, this.input);
    this.enemy = new Enemy(this.width - 220, this.height - 180, this.player);
  }

  start() {
    this.state = 'fighting';
    this._startRoundTimer();
    this._loop(0);
  }

  _startRoundTimer() {
    this.roundTimer = 60;
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.state !== 'fighting') return;
      this.roundTimer--;
      if (this.roundTimer <= 0) {
        this._timeUp();
      }
    }, 1000);
  }

  _timeUp() {
    clearInterval(this.timerInterval);
    if (this.player.health > this.enemy.health) {
      this._roundOver('player');
    } else if (this.enemy.health > this.player.health) {
      this._roundOver('enemy');
    } else {
      this._roundOver('draw');
    }
  }

  _roundOver(winner) {
    this.state = 'ko';
    clearInterval(this.timerInterval);

    if (winner === 'player') {
      this.playerWins++;
      this.ui.showMessage('KO!', '#ff3333');
    } else if (winner === 'enemy') {
      this.enemyWins++;
      this.ui.showMessage('KO!', '#ff3333');
    } else {
      this.ui.showMessage('DRAW', '#ffaa00');
    }

    setTimeout(() => {
      if (this.playerWins >= 2) {
        this.state = 'win';
        this.ui.showMessage('YOU WIN!', '#00ff88');
      } else if (this.enemyWins >= 2) {
        this.state = 'gameover';
        this.ui.showMessage('YOU LOSE!', '#ff3333');
      } else {
        this.round++;
        this._newRound();
      }
    }, 2500);
  }

  _newRound() {
    this._initFighters();
    this.state = 'fighting';
    this._startRoundTimer();
  }

  _loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    this._update(dt);
    this._draw();

    this.animFrameId = requestAnimationFrame(t => this._loop(t));
  }

  _update(dt) {
    if (this.state !== 'fighting') return;

    this.player.update(dt, this.enemy, this.width);
    this.enemy.update(dt, this.player, this.width);

    // Check hit player→enemy
    if (this.player.isAttacking && !this.player.hitRegistered) {
      const hit = this._checkHit(this.player, this.enemy);
      if (hit) {
        const dmg = this.player.getAttackDamage();
        this.enemy.takeDamage(dmg);
        this.player.hitRegistered = true;
        this.sound.playHit();
        if (this.enemy.health <= 0) {
          this._roundOver('player');
        }
      }
    }

    // Check hit enemy→player
    if (this.enemy.isAttacking && !this.enemy.hitRegistered) {
      const hit = this._checkHit(this.enemy, this.player);
      if (hit) {
        const dmg = this.enemy.getAttackDamage();
        this.player.takeDamage(dmg);
        this.enemy.hitRegistered = true;
        this.sound.playHit();
        if (this.player.health <= 0) {
          this._roundOver('enemy');
        }
      }
    }
  }

  _checkHit(attacker, defender) {
    const aBox = attacker.getAttackBox();
    const dBox = defender.getHurtBox();
    if (!aBox) return false;
    return (
      aBox.x < dBox.x + dBox.w &&
      aBox.x + aBox.w > dBox.x &&
      aBox.y < dBox.y + dBox.h &&
      aBox.y + aBox.h > dBox.y
    );
  }

  _draw() {
    this.renderer.drawBackground();
    this.renderer.drawShadow(this.player);
    this.renderer.drawShadow(this.enemy);
    this.renderer.drawFighter(this.player, false);
    this.renderer.drawFighter(this.enemy, true);
    this.ui.draw(
      this.player, this.enemy,
      this.roundTimer, this.round,
      this.playerWins, this.enemyWins,
      this.state
    );
  }

  destroy() {
    cancelAnimationFrame(this.animFrameId);
    clearInterval(this.timerInterval);
    this.input.destroy();
  }
}
