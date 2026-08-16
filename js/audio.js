/**
 * Classroom Wheel of Names - Audio Engine
 * Uses pure Web Audio API for 100% offline, zero-latency, realistic sound synthesis.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.8;
    this.lastTickTime = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.enabled = !muted;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  // Realistic Wheel Ticker Sound
  playTick(speedFactor = 1) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Debounce extremely rapid ticks to avoid sound clipping
    if (now - this.lastTickTime < 0.025) return;
    this.lastTickTime = now;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Pitch dynamically scales with spin velocity for realistic sensation
      const baseFreq = 700 + Math.min(speedFactor * 300, 600);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.035);

      gain.gain.setValueAtTime(0.35 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {
      console.warn('Audio tick error:', e);
    }
  }

  // UI Button Click Sound
  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

      gain.gain.setValueAtTime(0.2 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {}
  }

  // Name Shuffle / Flutter Sound
  playShuffle() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        if (!this.enabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400 + i * 80 + Math.random() * 50, now);
        gain.gain.setValueAtTime(0.12 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.045);
      }, i * 40);
    }
  }

  // Name Removed Whoosh Sound
  playRemove() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);

      gain.gain.setValueAtTime(0.25 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch (e) {}
  }

  // Triumphant Fanfare and Celebration Chord for Classroom Winner
  playWinner() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Arpeggio notes: C4, E4, G4, C5, E5, G5, C6
      const notes = [
        { freq: 261.63, time: 0, dur: 0.12 },
        { freq: 329.63, time: 0.1, dur: 0.12 },
        { freq: 392.00, time: 0.2, dur: 0.12 },
        { freq: 523.25, time: 0.3, dur: 0.15 },
        { freq: 659.25, time: 0.45, dur: 0.18 },
        { freq: 783.99, time: 0.62, dur: 0.22 },
        { freq: 1046.50, time: 0.82, dur: 0.9 }
      ];

      notes.forEach(({ freq, time, dur }) => {
        const start = now + time;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.3 * this.volume, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + dur + 0.05);
      });

      // Harmonized Major Chord at the end
      const finalChord = [523.25, 659.25, 783.99, 1046.50];
      finalChord.forEach(freq => {
        const start = now + 0.82;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.2 * this.volume, start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 1.3);
      });
    } catch (e) {
      console.warn('Audio fanfare error:', e);
    }
  }
}

window.soundEngine = new SoundEngine();
