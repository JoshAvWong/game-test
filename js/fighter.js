// fighter.js - Base Fighter class shared by Player and Enemy

export class Fighter {
  constructor(x, y, side) {
    this.x = x;
    this.y = y;
    this.side = side; // 'player' | 'enemy'

    // Dimensions
    this.w = 60;
    this.h = 120;
    this.groundY = 420 - this.h; // matches renderer floor

    // Physics
    this.vx = 0;
    this.vy = 0;
    this.speed = 220;
    this.jumpForce = -580;
    this.gravity = 1400;
    this.grounded = true;

    // Stats
    this.health = 100;
    this.maxHealth = 100;

    // State
    this.facingRight = side === 'player';
    this.blocking = false;
    this.isAttacking = false;
    this.hitRegistered = false;
    this.attackType = null;
    this.attackTimer = 0;
    this.attackDuration = { light: 0.22, heavy: 0.38, special: 0.45 };
    this.attackActive = { light: [0.06, 0.16], heavy: [0.10, 0.26], special: [0.08, 0.30] };
    this.staggerTimer = 0;
    this.isStaggered = false;

    // Visual
    this.color = '#ffffff';
    this.accentColor = '#aaaaaa';
    this.name = 'FIGHTER';

    // Hit flash
    this.hitFlash = 0;
  }

  getAttackDamage() {
    const dmg = { light: 8, heavy: 18, special: 25 };
    return dmg[this.attackType] || 8;
  }

  takeDamage(amount) {
    if (this.blocking) {
      amount = Math.floor(amount * 0.2);
    }
    this.health = Math.max(0, this.health - amount);
    this.hitFlash = 0.15;
    if (!this.blocking) {
      this.staggerTimer = 0.18;
      this.isStaggered = true;
    }
  }

  _startAttack(type) {
    this.isAttacking = true;
    this.hitRegistered = false;
    this.attackType = type;
    this.attackTimer = 0;
  }

  _tickAttack(dt) {
    if (!this.isAttacking) return;
    this.attackTimer += dt;
    const duration = this.attackDuration[this.attackType];
    if (this.attackTimer >= duration) {
      this.isAttacking = false;
      this.attackType = null;
      this.attackTimer = 0;
    }
  }

  _tickStagger(dt) {
    if (this.isStaggered) {
      this.staggerTimer -= dt;
      if (this.staggerTimer <= 0) {
        this.isStaggered = false;
      }
    }
    if (this.hitFlash > 0) this.hitFlash -= dt;
  }

  getAttackBox() {
    if (!this.isAttacking) return null;
    const [start, end] = this.attackActive[this.attackType];
    if (this.attackTimer < start || this.attackTimer > end) return null;

    const reach = { light: 70, heavy: 90, special: 110 };
    const r = reach[this.attackType];
    const h = { light: 40, heavy: 55, special: 65 };

    return {
      x: this.facingRight ? this.x + this.w : this.x - r,
      y: this.y + this.h * 0.3,
      w: r,
      h: h[this.attackType]
    };
  }

  getHurtBox() {
    return { x: this.x + 6, y: this.y + 4, w: this.w - 12, h: this.h - 8 };
  }

  _applyPhysics(dt) {
    if (this.isStaggered) {
      // knockback
      this.x += (this.facingRight ? -90 : 90) * dt;
    }

    if (!this.grounded) {
      this.vy += this.gravity * dt;
    }

    if (!this.isStaggered) this.x += this.vx * dt;
    this.y += this.vy * dt;

    if (this.y >= this.groundY) {
      this.y = this.groundY;
      this.vy = 0;
      this.grounded = true;
    }
  }

  _clampToStage(stageWidth) {
    if (this.x < 0) this.x = 0;
    if (this.x + this.w > stageWidth) this.x = stageWidth - this.w;
  }

  _faceOpponent(opponent) {
    this.facingRight = opponent.x > this.x;
  }
}
