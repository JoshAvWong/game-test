// ui.js - HUD: health bars, timer, round indicators, messages

export class UI {
  constructor(ctx, width, height) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.message = null;
    this.messageColor = '#ffffff';
    this.messageTimer = 0;
  }

  showMessage(text, color = '#ffffff') {
    this.message = text;
    this.messageColor = color;
    this.messageTimer = 2.5;
  }

  draw(player, enemy, timer, round, playerWins, enemyWins, state) {
    const ctx = this.ctx;

    this._drawHealthBar(player, 20, 20, false);
    this._drawHealthBar(enemy, this.width - 20 - 300, 20, true);
    this._drawTimer(timer);
    this._drawRoundPips(playerWins, enemyWins);
    this._drawNames(player, enemy);

    if (this.message) {
      this._drawMessage();
    }

    if (state === 'win' || state === 'gameover') {
      this._drawEndScreen(state);
    }
  }

  _drawHealthBar(fighter, x, y, reversed) {
    const ctx = this.ctx;
    const barW = 300;
    const barH = 22;
    const pct = fighter.health / fighter.maxHealth;

    // Background
    ctx.fillStyle = '#1a0030';
    ctx.fillRect(x, y, barW, barH);

    // Health fill (right→left if reversed)
    const fillW = barW * pct;
    const color = pct > 0.5 ? '#00ff88' : pct > 0.25 ? '#ffaa00' : '#ff2222';
    ctx.fillStyle = color;
    if (reversed) {
      ctx.fillRect(x + barW - fillW, y, fillW, barH);
    } else {
      ctx.fillRect(x, y, fillW, barH);
    }

    // Border
    ctx.strokeStyle = '#cc00ff';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#cc00ff';
    ctx.shadowBlur = 8;
    ctx.strokeRect(x, y, barW, barH);
    ctx.shadowBlur = 0;

    // HP text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px "Courier New", monospace';
    ctx.textAlign = reversed ? 'right' : 'left';
    ctx.fillText(`${Math.ceil(fighter.health)}%`, reversed ? x + barW - 6 : x + 6, y + 15);
  }

  _drawNames(player, enemy) {
    const ctx = this.ctx;
    ctx.font = 'bold 13px "Courier New", monospace';
    ctx.shadowColor = player.color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = player.color;
    ctx.textAlign = 'left';
    ctx.fillText(player.name, 20, 58);

    ctx.shadowColor = enemy.color;
    ctx.fillStyle = enemy.color;
    ctx.textAlign = 'right';
    ctx.fillText(enemy.name, this.width - 20, 58);
    ctx.shadowBlur = 0;
  }

  _drawTimer(timer) {
    const ctx = this.ctx;
    const cx = this.width / 2;

    // Background circle
    ctx.save();
    ctx.fillStyle = '#1a0030';
    ctx.strokeStyle = '#cc00ff';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#cc00ff';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(cx, 32, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Number
    ctx.fillStyle = timer <= 10 ? '#ff2222' : '#ffffff';
    ctx.font = `bold 24px "Courier New", monospace`;
    ctx.textAlign = 'center';
    ctx.shadowColor = timer <= 10 ? '#ff0000' : '#ffffff';
    ctx.shadowBlur = 10;
    ctx.fillText(Math.ceil(timer), cx, 40);
    ctx.shadowBlur = 0;
  }

  _drawRoundPips(playerWins, enemyWins) {
    const ctx = this.ctx;
    // Player pips (left)
    for (let i = 0; i < 2; i++) {
      ctx.beginPath();
      ctx.arc(20 + i * 22, 75, 7, 0, Math.PI * 2);
      ctx.fillStyle = i < playerWins ? '#00ff88' : '#333333';
      ctx.fill();
      ctx.strokeStyle = '#cc00ff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    // Enemy pips (right)
    for (let i = 0; i < 2; i++) {
      ctx.beginPath();
      ctx.arc(this.width - 20 - i * 22, 75, 7, 0, Math.PI * 2);
      ctx.fillStyle = i < enemyWins ? '#ff2222' : '#333333';
      ctx.fill();
      ctx.strokeStyle = '#cc00ff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  _drawMessage() {
    const ctx = this.ctx;
    const cx = this.width / 2;
    const cy = this.height / 2 - 40;

    ctx.save();
    ctx.font = 'bold 72px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = this.messageColor;
    ctx.shadowBlur = 40;
    ctx.fillStyle = this.messageColor;
    ctx.fillText(this.message, cx, cy);
    ctx.restore();

    this.messageTimer -= 0.016;
    if (this.messageTimer <= 0) this.message = null;
  }

  _drawEndScreen(state) {
    const ctx = this.ctx;
    const cx = this.width / 2;
    const cy = this.height / 2 + 30;

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(cx - 200, cy - 20, 400, 60);

    ctx.font = '18px "Courier New", monospace';
    ctx.fillStyle = '#aaaaaa';
    ctx.textAlign = 'center';
    ctx.fillText('Press R to Play Again', cx, cy + 18);
  }
}
