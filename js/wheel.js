/**
 * Classroom Wheel of Names - Canvas Wheel Engine
 * High-DPI responsive wheel with physics-based deceleration and dynamic typography.
 */

const PALETTES = {
  sky_vibrant: [
    '#0284c7', // Sky Blue 600
    '#38bdf8', // Light Sky Blue 400
    '#059669', // Emerald 600
    '#f59e0b', // Amber 500
    '#ec4899', // Pink 500
    '#8b5cf6', // Violet 500
    '#06b6d4', // Cyan 500
    '#f97316', // Orange 500
    '#10b981', // Teal 500
    '#6366f1'  // Indigo 500
  ],
  pastel: [
    '#7dd3fc', '#a7f3d0', '#fde68a', '#fbcfe8',
    '#c4b5fd', '#bae6fd', '#fed7aa', '#99f6e4'
  ],
  rainbow: [
    '#ef4444', '#f97316', '#f59e0b', '#10b981',
    '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
  ],
  neon: [
    '#00f5d4', '#7b2cbf', '#fee440', '#f72585',
    '#4cc9f0', '#7209b7', '#3a0ca3', '#4361ee'
  ],
  warm: [
    '#dc2626', '#ea580c', '#d97706', '#ca8a04',
    '#b45309', '#e11d48', '#be123c', '#9f1239'
  ]
};

class WheelEngine {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.names = [];
    this.palette = PALETTES.sky_vibrant;
    this.rotation = 0; // in radians
    this.isSpinning = false;
    this.spinStartTime = 0;
    this.spinDuration = 6000; // ms
    this.startAngle = 0;
    this.targetRotation = 0;
    this.lastTickAngle = 0;
    this.tickerBounce = 0; // in radians offset for ticker animation
    this.winningIndex = -1;
    this.onSpinStart = options.onSpinStart || (() => {});
    this.onSpinEnd = options.onSpinEnd || (() => {});
    this.onTick = options.onTick || (() => {});

    // Center Logo
    this.logoImg = new Image();
    this.logoImg.src = 'logo.jpg';
    this.logoImg.onload = () => {
      this.draw();
    };

    this.initCanvas();
    window.addEventListener('resize', () => this.handleResize());
  }

  initCanvas() {
    this.handleResize();
  }

  handleResize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height) || 500;
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;
    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;

    this.width = size;
    this.height = size;
    this.centerX = size / 2;
    this.centerY = size / 2;
    this.radius = size / 2 - 20;

    this.draw();
  }

  setNames(names) {
    this.names = names.filter(n => n && n.trim() !== '');
    if (this.names.length === 0) {
      this.names = ['กรุณาใส่ชื่อ'];
    }
    this.draw();
  }

  setPalette(paletteName) {
    if (PALETTES[paletteName]) {
      this.palette = PALETTES[paletteName];
      this.draw();
    }
  }

  setSpinDuration(seconds) {
    this.spinDuration = Math.max(2, Math.min(25, seconds)) * 1000;
  }

  getSliceAngle() {
    return (Math.PI * 2) / Math.max(1, this.names.length);
  }

  getCurrentWinningIndex(angle = this.rotation) {
    if (this.names.length === 0) return 0;
    const numSlices = this.names.length;
    const sliceAngle = (Math.PI * 2) / numSlices;
    // Pointer is at 0 radians (3 o'clock, right edge)
    const normalizedAngle = (2 * Math.PI - (angle % (2 * Math.PI))) % (2 * Math.PI);
    return Math.floor(normalizedAngle / sliceAngle) % numSlices;
  }

  spin() {
    if (this.isSpinning || this.names.length === 0) return false;

    this.isSpinning = true;
    this.winningIndex = -1;
    this.spinStartTime = performance.now();
    this.startAngle = this.rotation % (Math.PI * 2);

    // Random rotations: between 5 to 10 full circles + random slice offset
    const minRounds = 5 + Math.floor(this.spinDuration / 1500);
    const randomOffset = Math.random() * Math.PI * 2;
    this.targetRotation = this.startAngle + (minRounds * Math.PI * 2) + randomOffset;

    this.lastTickAngle = this.startAngle;
    this.onSpinStart();

    this.animateSpin();
    return true;
  }

  // Quintic Out Easing for ultra-smooth realistic friction
  easeOut(t) {
    return 1 - Math.pow(1 - t, 4.5);
  }

  animateSpin() {
    const now = performance.now();
    const elapsed = now - this.spinStartTime;
    const progress = Math.min(1, elapsed / this.spinDuration);

    const easedProgress = this.easeOut(progress);
    this.rotation = this.startAngle + (this.targetRotation - this.startAngle) * easedProgress;

    // Calculate speed for ticker sound frequency
    const deltaAngle = this.rotation - this.lastTickAngle;
    const sliceAngle = this.getSliceAngle();

    if (deltaAngle >= sliceAngle) {
      const speedFactor = 1 - progress;
      this.tickerBounce = 0.25 * Math.min(1, speedFactor * 2);
      this.onTick(speedFactor);
      this.lastTickAngle = this.rotation;
    } else {
      this.tickerBounce *= 0.85;
    }

    this.draw();

    if (progress < 1) {
      requestAnimationFrame(() => this.animateSpin());
    } else {
      this.isSpinning = false;
      this.tickerBounce = 0;
      this.winningIndex = this.getCurrentWinningIndex();
      this.draw();
      const winnerName = this.names[this.winningIndex];
      this.onSpinEnd(winnerName, this.winningIndex);
    }
  }

  draw() {
    if (!this.ctx) return;
    const dpr = window.devicePixelRatio || 1;
    this.ctx.save();
    this.ctx.scale(dpr, dpr);
    this.ctx.clearRect(0, 0, this.width, this.height);

    const cx = this.centerX;
    const cy = this.centerY;
    const radius = this.radius;
    const numSlices = this.names.length;
    const sliceAngle = this.getSliceAngle();

    // Outer wheel soft drop shadow
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius + 10, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(2, 132, 199, 0.08)';
    this.ctx.fill();
    this.ctx.restore();

    // Outer metallic ring border
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius + 8, 0, Math.PI * 2);
    const ringGrad = this.ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
    ringGrad.addColorStop(0, '#bae6fd');
    ringGrad.addColorStop(0.5, '#0284c7');
    ringGrad.addColorStop(1, '#0369a1');
    this.ctx.fillStyle = ringGrad;
    this.ctx.fill();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = '#e0f2fe';
    this.ctx.stroke();
    this.ctx.restore();

    // Draw Slices
    for (let i = 0; i < numSlices; i++) {
      const angleStart = this.rotation + i * sliceAngle;
      const angleEnd = angleStart + sliceAngle;
      const isWinner = (this.winningIndex === i);

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.moveTo(cx, cy);
      this.ctx.arc(cx, cy, radius, angleStart, angleEnd);
      this.ctx.closePath();

      // Slice background color
      const baseColor = this.palette[i % this.palette.length];
      this.ctx.fillStyle = baseColor;
      this.ctx.fill();

      // Winning slice golden pulse/highlight
      if (isWinner) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        this.ctx.fill();
      }

      // Slice inner divider line
      this.ctx.lineWidth = Math.max(1.5, 4 / Math.sqrt(numSlices));
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.stroke();

      // Render Text along slice radius
      this.drawSliceText(this.names[i], angleStart, angleEnd, radius, numSlices);

      this.ctx.restore();
    }

    // Outer Edge Pegs / Pins (for realistic game show tactile look)
    this.drawPegs(cx, cy, radius, numSlices);

    // Center Hub / Button
    this.drawCenterHub(cx, cy);

    // Physical Pointer / Ticker at 3 o'clock (0 rad, right side)
    this.drawTicker(cx, cy, radius);

    this.ctx.restore();
  }

  drawSliceText(text, angleStart, angleEnd, radius, count) {
    const angle = angleStart + (angleEnd - angleStart) / 2;
    this.ctx.save();
    this.ctx.translate(this.centerX, this.centerY);
    this.ctx.rotate(angle);

    // Responsive font calculation based on slice count and radius
    const maxChars = 24;
    let displayText = text;
    if (displayText.length > maxChars) {
      displayText = displayText.substring(0, maxChars - 2) + '...';
    }

    let fontSize = Math.floor(radius / 12);
    if (count > 8) fontSize = Math.floor(radius / 14);
    if (count > 16) fontSize = Math.floor(radius / 18);
    if (count > 30) fontSize = Math.floor(radius / 24);
    if (count > 50) fontSize = Math.floor(radius / 30);
    fontSize = Math.max(11, Math.min(22, fontSize));

    this.ctx.font = `600 ${fontSize}px 'Kanit', sans-serif`;
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'middle';

    // Text Shadow for clear contrast on all colors
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    this.ctx.shadowBlur = 4;
    this.ctx.shadowOffsetX = 1;
    this.ctx.shadowOffsetY = 1;

    this.ctx.fillStyle = '#ffffff';
    // Position text towards the outer rim of the slice
    this.ctx.fillText(displayText, radius - 24, 0);

    this.ctx.restore();
  }

  drawPegs(cx, cy, radius, count) {
    const numPegs = Math.min(Math.max(count, 12), 36);
    const pegAngleStep = (Math.PI * 2) / numPegs;

    for (let i = 0; i < numPegs; i++) {
      const angle = this.rotation + i * pegAngleStep;
      const px = cx + Math.cos(angle) * (radius + 4);
      const py = cy + Math.sin(angle) * (radius + 4);

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.shadowColor = 'rgba(0,0,0,0.3)';
      this.ctx.shadowBlur = 2;
      this.ctx.fill();
      this.ctx.strokeStyle = '#0284c7';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
      this.ctx.restore();
    }
  }

  drawCenterHub(cx, cy) {
    const hubRadius = Math.max(34, this.radius * 0.17);

    // Hub shadow
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, hubRadius + 4, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    this.ctx.fill();

    // Hub gradient ring
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, hubRadius, 0, Math.PI * 2);
    const grad = this.ctx.createRadialGradient(cx - 5, cy - 5, 2, cx, cy, hubRadius);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.7, '#e0f2fe');
    grad.addColorStop(1, '#0284c7');
    this.ctx.fillStyle = grad;
    this.ctx.fill();
    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.stroke();

    // Center Hub Content (Logo or Fallback Icon)
    if (this.logoImg && this.logoImg.complete && this.logoImg.naturalWidth > 0) {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, hubRadius - 3, 0, Math.PI * 2);
      this.ctx.closePath();
      this.ctx.clip();

      this.ctx.fillStyle = '#ffffff';
      this.ctx.fill();

      const imgSize = (hubRadius - 3) * 2;
      this.ctx.drawImage(this.logoImg, cx - imgSize / 2, cy - imgSize / 2, imgSize, imgSize);
      this.ctx.restore();
    } else {
      // Fallback Icon
      this.ctx.fillStyle = '#0284c7';
      this.ctx.font = `bold ${Math.floor(hubRadius * 0.75)}px 'Kanit', sans-serif`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('🎯', cx, cy + 1);
    }

    this.ctx.restore();
  }

  drawTicker(cx, cy, radius) {
    // Ticker positioned at 3 o'clock (right edge)
    const tipX = cx + radius + 2;
    const tipY = cy;
    const baseLength = 28;
    const baseWidth = 14;

    this.ctx.save();
    this.ctx.translate(tipX, tipY);
    // Dynamic bounce physics
    this.ctx.rotate(this.tickerBounce);

    // Ticker shadow
    this.ctx.beginPath();
    this.ctx.moveTo(-baseLength, -baseWidth);
    this.ctx.lineTo(8, 0); // Pointing into the wheel
    this.ctx.lineTo(-baseLength, baseWidth);
    this.ctx.closePath();
    this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
    this.ctx.fill();

    // Ticker pointer body
    this.ctx.beginPath();
    this.ctx.moveTo(14, -baseWidth);
    this.ctx.lineTo(-14, 0); // Pointing inward to wheel
    this.ctx.lineTo(14, baseWidth);
    this.ctx.closePath();

    const pointerGrad = this.ctx.createLinearGradient(-14, 0, 14, 0);
    pointerGrad.addColorStop(0, '#ef4444');
    pointerGrad.addColorStop(1, '#dc2626');
    this.ctx.fillStyle = pointerGrad;
    this.ctx.fill();
    this.ctx.lineWidth = 2.5;
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.stroke();

    // Ticker pivot pin
    this.ctx.beginPath();
    this.ctx.arc(10, 0, 5, 0, Math.PI * 2);
    this.ctx.fillStyle = '#fde047';
    this.ctx.fill();
    this.ctx.strokeStyle = '#b45309';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();

    this.ctx.restore();
  }
}

window.WheelEngine = WheelEngine;
