// renderer.js - Canvas drawing for background and fighters

export class Renderer {
  constructor(ctx, width, height) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.floorY = 420;
    this.t = 0; // for animations
  }

  drawBackground() {
    const ctx = this.ctx;
    this.t += 0.016;

    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, this.floorY);
    sky.addColorStop(0, '#0a0015');
    sky.addColorStop(0.6, '#1a0035');
    sky.addColorStop(1, '#2d0050');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, this.width, this.floorY);

    // Distant city silhouette
    ctx.fillStyle = '#110022';
    this._drawCityline(60, 320, 0.4);

    // Closer buildings
    ctx.fillStyle = '#1a0030';
    this._drawCityline(30, 360, 0.7);

    // Neon ground floor
    const floor = ctx.createLinearGradient(0, this.floorY, 0, this.height);
    floor.addColorStop(0, '#3d0060');
    floor.addColorStop(0.3, '#1a0035');
    floor.addColorStop(1, '#06000f');
    ctx.fillStyle = floor;
    ctx.fillRect(0, this.floorY, this.width, this.height - this.floorY);

    // Floor grid lines (perspective)
    ctx.save();
    const vanishX = this.width / 2;
    const vanishY = this.floorY + 10;
    const numLines = 10;
    for (let i = 0; i <= numLines; i++) {
      const t = i / numLines;
      const startX = vanishX + (t - 0.5) * this.width * 2;
      ctx.beginPath();
      ctx.moveTo(vanishX + (startX - vanishX) * 0.01, vanishY);
      ctx.lineTo(startX, this.height);
      ctx.strokeStyle = `rgba(160, 0, 255, ${0.15 * (1 - t * 0.5)})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    // Horizontal lines
    for (let i = 0; i < 6; i++) {
      const y = this.floorY + (i / 5) * (this.height - this.floorY);
      const alpha = 0.25 * (1 - i / 6);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.strokeStyle = `rgba(160, 0, 255, ${alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();

    // Neon floor line
    ctx.save();
    ctx.shadowColor = '#cc00ff';
    ctx.shadowBlur = 20;
    ctx.strokeStyle = '#cc00ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, this.floorY);
    ctx.lineTo(this.width, this.floorY);
    ctx.stroke();
    ctx.restore();

    // Animated stars
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    const stars = [[50,30],[120,80],[200,20],[350,60],[500,40],[650,25],[750,70],[830,15],[900,55],[960,35]];
    stars.forEach(([sx, sy], i) => {
      const blink = 0.4 + 0.6 * Math.abs(Math.sin(this.t * 1.5 + i));
      ctx.globalAlpha = blink;
      ctx.fillRect(sx, sy, 2, 2);
    });
    ctx.globalAlpha = 1;
  }

  _drawCityline(minH, baseY, density) {
    const ctx = this.ctx;
    const step = Math.floor(20 / density);
    for (let x = 0; x < this.width; x += step) {
      const h = minH + Math.sin(x * 0.05) * 30 + Math.cos(x * 0.13) * 20;
      ctx.fillRect(x, baseY - h, step - 2, h);
      // Windows
      ctx.fillStyle = 'rgba(255,200,100,0.3)';
      for (let wy = baseY - h + 8; wy < baseY - 10; wy += 14) {
        for (let wx = x + 3; wx < x + step - 6; wx += 8) {
          if (Math.random() > 0.4) ctx.fillRect(wx, wy, 4, 6);
        }
      }
      ctx.fillStyle = this.ctx.fillStyle; // restore
    }
  }

  drawShadow(fighter) {
    const ctx = this.ctx;
    const cx = fighter.x + fighter.w / 2;
    const cy = 425;
    const scaleY = Math.max(0.1, 1 - (fighter.groundY - fighter.y) / 300);
    ctx.save();
    ctx.globalAlpha = 0.35 * scaleY;
    ctx.scale(1, 0.3);
    const grad = ctx.createRadialGradient(cx, cy / 0.3, 0, cx, cy / 0.3, 40);
    grad.addColorStop(0, '#000000');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy / 0.3, 40, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawFighter(fighter, mirrorDefault) {
    const ctx = this.ctx;
    const { x, y, w, h, facingRight, isAttacking, attackType, attackTimer,
            attackActive, blocking, isStaggered, hitFlash, color, accentColor } = fighter;

    ctx.save();

    // Hit flash
    if (hitFlash > 0) {
      ctx.filter = 'brightness(3)';
    }

    // Glow
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;

    // Flip to face correct direction
    const flip = facingRight ? 1 : -1;
    const cx = x + w / 2;
    ctx.translate(cx, y + h);
    ctx.scale(flip, 1);
    ctx.translate(-w / 2, -h);

    const bx = 0, by = 0;

    // Body
    if (blocking) {
      ctx.fillStyle = '#888888';
    } else if (isStaggered) {
      ctx.fillStyle = '#ff8800';
    } else {
      ctx.fillStyle = color;
    }

    // Legs
    ctx.fillStyle = accentColor;
    ctx.fillRect(bx + 8, by + h * 0.65, 16, h * 0.35);  // left leg
    ctx.fillRect(bx + w - 24, by + h * 0.65, 16, h * 0.35); // right leg

    // Torso
    ctx.fillStyle = color;
    ctx.fillRect(bx + 4, by + h * 0.3, w - 8, h * 0.38);

    // Head
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(bx + w / 2, by + h * 0.15, 18, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#000033';
    ctx.fillRect(bx + w / 2 + 4, by + h * 0.1, 6, 5);

    // Belt
    ctx.fillStyle = accentColor;
    ctx.fillRect(bx + 4, by + h * 0.62, w - 8, 8);

    // Attack arm
    if (isAttacking) {
      const [start, end] = attackActive[attackType];
      const progress = (attackTimer - start) / (end - start);
      const clampedP = Math.max(0, Math.min(1, progress));

      const reachMap = { light: 55, heavy: 80, special: 100 };
      const reach = reachMap[attackType] * Math.sin(clampedP * Math.PI);

      ctx.fillStyle = attackType === 'special' ? '#ffff00' : color;
      ctx.shadowColor = attackType === 'special' ? '#ffaa00' : color;
      ctx.shadowBlur = attackType === 'special' ? 30 : 15;

      // Arm
      ctx.fillRect(bx + w - 6, by + h * 0.38, reach, attackType === 'heavy' ? 14 : 10);

      // Fist
      ctx.beginPath();
      ctx.arc(bx + w - 6 + reach, by + h * 0.38 + 6, attackType === 'heavy' ? 10 : 8, 0, Math.PI * 2);
      ctx.fill();

      // Special effect
      if (attackType === 'special') {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#ffdd00';
        ctx.beginPath();
        ctx.arc(bx + w - 6 + reach, by + h * 0.38 + 6, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    } else {
      // Resting arm
      ctx.fillStyle = color;
      ctx.fillRect(bx + w - 4, by + h * 0.35, 12, 8);

      // Block shield visual
      if (blocking) {
        ctx.fillStyle = '#aaaaff';
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(bx + w + 8, by + h * 0.38, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    ctx.restore();
  }
}
