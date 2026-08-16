/**
 * Classroom Wheel of Names - Confetti & Celebration Engine
 * High-performance lightweight particle system on dedicated canvas overlay
 */

class ConfettiEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.animationId = null;
    this.isActive = false;
  }

  init() {
    if (this.canvas) return;
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'confetti-canvas';
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100vw';
    this.canvas.style.height = '100vh';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '99999';
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth * window.devicePixelRatio;
    this.canvas.height = window.innerHeight * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  createParticle(x, y, isSideCannon = false) {
    const colors = [
      '#0284c7', '#38bdf8', '#f59e0b', '#10b981', '#ec4899',
      '#8b5cf6', '#ef4444', '#facc15', '#06b6d4', '#14b8a6'
    ];

    const angle = isSideCannon
      ? (x < window.innerWidth / 2 ? Math.random() * 0.8 - 0.2 : Math.PI - (Math.random() * 0.8 - 0.2))
      : Math.random() * Math.PI * 2;

    const speed = isSideCannon ? Math.random() * 18 + 12 : Math.random() * 14 + 6;

    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: -Math.abs(Math.sin(angle) * speed) - (isSideCannon ? 8 : 4),
      size: Math.random() * 10 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 12,
      gravity: 0.35,
      friction: 0.98,
      wobble: Math.random() * 10,
      wobbleSpeed: Math.random() * 0.1 + 0.05,
      opacity: 1,
      shape: Math.random() > 0.3 ? 'rect' : (Math.random() > 0.5 ? 'circle' : 'star')
    };
  }

  burst(durationMs = 3500) {
    this.init();
    this.particles = [];
    this.isActive = true;

    // Center burst
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    for (let i = 0; i < 120; i++) {
      this.particles.push(this.createParticle(centerX, centerY));
    }

    // Left cannon
    for (let i = 0; i < 70; i++) {
      this.particles.push(this.createParticle(50, window.innerHeight - 50, true));
    }

    // Right cannon
    for (let i = 0; i < 70; i++) {
      this.particles.push(this.createParticle(window.innerWidth - 50, window.innerHeight - 50, true));
    }

    // Secondary wave for extended celebration
    setTimeout(() => {
      if (!this.isActive) return;
      for (let i = 0; i < 80; i++) {
        this.particles.push(this.createParticle(centerX + (Math.random() - 0.5) * 300, centerY - 100));
      }
    }, 400);

    if (!this.animationId) {
      this.render();
    }

    setTimeout(() => {
      this.stop();
    }, durationMs);
  }

  render() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.vx *= p.friction;
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotSpeed;
      p.wobble += p.wobbleSpeed;
      p.opacity -= 0.006;

      if (p.opacity <= 0 || p.y > window.innerHeight + 50) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.scale(Math.cos(p.wobble), 1);
      this.ctx.globalAlpha = Math.max(0, p.opacity);
      this.ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (p.shape === 'star') {
        this.drawStar(this.ctx, 0, 0, 5, p.size / 2, p.size / 4);
      } else {
        this.ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.7);
      }

      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.render());
    } else {
      this.animationId = null;
      this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }

  stop() {
    this.isActive = false;
  }
}

window.confettiEngine = new ConfettiEngine();
