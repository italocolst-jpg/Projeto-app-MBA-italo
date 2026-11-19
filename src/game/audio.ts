class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private muted = false;
  private musicTimer: number | null = null;
  private musicPlaying = false;
  private stepIndex = 0;
  private bossMode = false;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : 0.7;
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.24;
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.45;
      this.sfxGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlock() {
    this.ensureContext();
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(
        this.muted ? 0 : 0.7,
        this.ctx.currentTime,
        0.02
      );
    }
    return this.muted;
  }

  public setBossMode(enabled: boolean) {
    this.bossMode = enabled;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType,
    gainNode: GainNode | null,
    volume = 0.3,
    delay = 0,
    slideTo?: number
  ) {
    const ctx = this.ensureContext();
    if (!ctx || !gainNode || this.muted) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(20, slideTo),
        now + duration
      );
    }

    env.gain.setValueAtTime(0.001, now);
    env.gain.linearRampToValueAtTime(volume, now + 0.012);
    env.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(env);
    env.connect(gainNode);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playJump() {
    this.playTone(260, 0.14, 'square', this.sfxGain, 0.22, 0, 560);
  }

  public playCoin() {
    this.playTone(987.77, 0.07, 'square', this.sfxGain, 0.22, 0);
    this.playTone(1318.51, 0.16, 'square', this.sfxGain, 0.24, 0.06);
  }

  public playBlockBump() {
    this.playTone(180, 0.08, 'triangle', this.sfxGain, 0.35, 0, 110);
  }

  public playBlockBreak() {
    this.playTone(240, 0.07, 'sawtooth', this.sfxGain, 0.25, 0, 80);
    this.playTone(150, 0.09, 'square', this.sfxGain, 0.2, 0.04, 60);
  }

  public playStomp() {
    this.playTone(320, 0.08, 'square', this.sfxGain, 0.28, 0, 120);
    this.playTone(520, 0.1, 'triangle', this.sfxGain, 0.24, 0.04, 720);
  }

  public playPowerUp() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => {
      this.playTone(n, 0.11, 'square', this.sfxGain, 0.22, i * 0.065);
    });
  }

  public playCheckpoint() {
    this.playTone(587.33, 0.1, 'triangle', this.sfxGain, 0.3, 0);
    this.playTone(739.99, 0.1, 'triangle', this.sfxGain, 0.3, 0.08);
    this.playTone(880.0, 0.22, 'triangle', this.sfxGain, 0.34, 0.16);
  }

  public playHurt() {
    this.playTone(220, 0.14, 'sawtooth', this.sfxGain, 0.3, 0, 95);
    this.playTone(155, 0.18, 'square', this.sfxGain, 0.22, 0.07, 70);
  }

  public playBossAttack() {
    this.playTone(440, 0.12, 'sawtooth', this.sfxGain, 0.2, 0, 210);
  }

  public playBossHit() {
    this.playTone(190, 0.12, 'sawtooth', this.sfxGain, 0.32, 0, 90);
    this.playTone(620, 0.14, 'square', this.sfxGain, 0.24, 0.05, 880);
  }

  public playBossDefeat() {
    const fanfare = [392, 493.88, 587.33, 783.99, 987.77, 1174.66];
    fanfare.forEach((n, i) => {
      this.playTone(n, 0.18, 'square', this.sfxGain, 0.26, i * 0.08);
    });
  }

  public playVictory() {
    this.stopMusic();
    const melody = [
      { f: 523.25, d: 0.14, t: 0 },
      { f: 659.25, d: 0.14, t: 0.14 },
      { f: 783.99, d: 0.14, t: 0.28 },
      { f: 1046.5, d: 0.28, t: 0.42 },
      { f: 783.99, d: 0.14, t: 0.72 },
      { f: 1046.5, d: 0.45, t: 0.88 },
    ];
    melody.forEach((m) => {
      this.playTone(m.f, m.d, 'square', this.sfxGain, 0.26, m.t);
      this.playTone(m.f * 0.5, m.d, 'triangle', this.sfxGain, 0.24, m.t);
    });
  }

  public playGameOver() {
    this.stopMusic();
    const notes = [392.0, 369.99, 349.23, 329.63, 261.63];
    notes.forEach((n, i) => {
      this.playTone(n, 0.22, 'triangle', this.sfxGain, 0.32, i * 0.18);
    });
  }

  public startMusic() {
    if (this.musicPlaying) return;
    this.ensureContext();
    this.musicPlaying = true;
    this.stepIndex = 0;

    // Warm enchanted-forest 16-step melody loop (C major / A minor pastoral adventure)
    const forestLead = [
      523.25, 0, 659.25, 587.33, 523.25, 0, 392.0, 440.0,
      523.25, 659.25, 783.99, 0, 659.25, 587.33, 523.25, 0,
      440.0, 0, 523.25, 587.33, 659.25, 0, 587.33, 523.25,
      440.0, 392.0, 329.63, 0, 392.0, 440.0, 493.88, 0,
    ];
    const forestBass = [
      130.81, 0, 196.0, 0, 130.81, 0, 196.0, 0,
      174.61, 0, 261.63, 0, 130.81, 0, 196.0, 0,
      220.0, 0, 164.81, 0, 174.61, 0, 130.81, 0,
      146.83, 0, 196.0, 0, 196.0, 0, 246.94, 0,
    ];

    // Boss motif (energetic minor pulse)
    const bossLead = [
      329.63, 392.0, 493.88, 392.0, 329.63, 0, 440.0, 392.0,
      349.23, 440.0, 523.25, 440.0, 392.0, 329.63, 293.66, 0,
    ];
    const bossBass = [
      110.0, 110.0, 164.81, 110.0, 110.0, 110.0, 164.81, 146.83,
      116.54, 116.54, 174.61, 116.54, 98.0, 98.0, 146.83, 123.47,
    ];

    const tick = () => {
      if (!this.musicPlaying) return;
      if (!this.muted && this.ctx && this.ctx.state === 'running') {
        if (this.bossMode) {
          const i = this.stepIndex % bossLead.length;
          if (bossLead[i] > 0) {
            this.playTone(bossLead[i], 0.13, 'square', this.musicGain, 0.15);
          }
          if (bossBass[i] > 0) {
            this.playTone(bossBass[i], 0.14, 'triangle', this.musicGain, 0.25);
          }
        } else {
          const i = this.stepIndex % forestLead.length;
          if (forestLead[i] > 0) {
            this.playTone(forestLead[i], 0.16, 'triangle', this.musicGain, 0.2);
          }
          if (forestBass[i] > 0) {
            this.playTone(forestBass[i], 0.17, 'sine', this.musicGain, 0.24);
          }
        }
      }
      this.stepIndex++;
      const interval = this.bossMode ? 165 : 195;
      this.musicTimer = window.setTimeout(tick, interval);
    };

    tick();
  }

  public stopMusic() {
    this.musicPlaying = false;
    if (this.musicTimer !== null) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }
}

export const soundEngine = new SoundEngine();
