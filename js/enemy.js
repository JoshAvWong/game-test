// enemy.js - AI-controlled enemy fighter

import { Fighter } from './fighter.js';

export class Enemy extends Fighter {
  constructor(x, y, player) {
    super(x, y, 'enemy');
    this.color = '#ff4422';
    this.accentColor = '#aa1100';
    this.name = 'KEN';
    this.facingRight = false;

    // AI state
    this.aiTimer = 0;
    this.aiAction = 'idle';
    this.aiActionTime = 0;
    this.difficulty = 0.75; // 0=easy, 1=hard
  }

  update(dt, player, stageWidth) {
    this.grounded = this.y >= this.groundY;
    this._faceOpponent(player);

    this.aiTimer += dt;
    this.aiActionTime -= dt;

    // Reconsider action every 0.4-0.9s
    if (this.aiActionTime <= 0) {
      this._decideAction(player);
    }

    this._executeAction(dt, player);
    this._applyPhysics(dt);
    this._clampToStage(stageWidth);
    this._tickAttack(dt);
    this._tickStagger(dt);
  }

  _decideAction(player) {
    const dist = Math.abs(player.x - this.x);
    const rand = Math.random();

    this.aiActionTime = 0.3 + Math.random() * 0.5;

    if (this.isAttacking || this.isStaggered) {
      this.aiAction = 'idle';
      return;
    }

    // React to player attack
    if (player.isAttacking && rand < this.difficulty * 0.6) {
      if (dist < 130) {
        this.aiAction = rand < 0.5 ? 'block' : 'retreat';
        return;
      }
    }

    if (dist > 250) {
      this.aiAction = 'approach';
    } else if (dist < 80) {
      if (rand < this.difficulty * 0.7) {
        this.aiAction = rand < 0.5 ? 'attack_light' : 'attack_heavy';
      } else {
        this.aiAction = 'retreat';
      }
    } else {
      // Mid range tactics
      const tactics = ['approach', 'attack_light', 'attack_heavy', 'idle', 'jump_in'];
      const weights = [0.25, 0.25, 0.15, 0.2, 0.15];
      this.aiAction = this._weightedChoice(tactics, weights);
    }

    if (rand < 0.08) this.aiAction = 'attack_special';
  }

  _weightedChoice(choices, weights) {
    let r = Math.random();
    for (let i = 0; i < choices.length; i++) {
      r -= weights[i];
      if (r <= 0) return choices[i];
    }
    return choices[choices.length - 1];
  }

  _executeAction(dt, player) {
    this.vx = 0;
    this.blocking = false;

    const dir = this.facingRight ? 1 : -1;

    switch (this.aiAction) {
      case 'approach':
        this.vx = this.speed * dir;
        break;
      case 'retreat':
        this.vx = -this.speed * dir;
        break;
      case 'block':
        this.blocking = true;
        break;
      case 'attack_light':
        if (!this.isAttacking) this._startAttack('light');
        break;
      case 'attack_heavy':
        if (!this.isAttacking) this._startAttack('heavy');
        break;
      case 'attack_special':
        if (!this.isAttacking) this._startAttack('special');
        break;
      case 'jump_in':
        if (this.grounded) {
          this.vy = this.jumpForce;
          this.vx = this.speed * dir;
        }
        break;
      case 'idle':
      default:
        break;
    }
  }
}
