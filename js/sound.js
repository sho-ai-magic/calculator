// 効果音を鳴らすための道具（SoundManager）をまとめたファイル。ボタン音・正解音・ガチャ音などを担当。

// --- 効果音 ---
const SoundManager = {
    ctx: null,
    init() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); },
    play(freq, type, duration, vol = 0.1) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(); osc.stop(this.ctx.currentTime + duration);
    },
    click() { this.play(800, 'sine', 0.1); },
    correct() { this.play(523.25, 'sine', 0.3); setTimeout(() => this.play(659.25, 'sine', 0.3), 100); },
    incorrect() { this.play(200, 'square', 0.3, 0.05); setTimeout(() => this.play(150, 'square', 0.3, 0.05), 150); },
    levelUp() { [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => setTimeout(() => this.play(f, 'sine', 0.5), i * 100)); },
    gachaShake() { this.play(Math.random() * 100 + 400, 'sawtooth', 0.05, 0.02); },
    gachaResult() { [880, 1046, 1318].forEach((f, i) => setTimeout(() => this.play(f, 'sine', 0.4), i * 80)); },
    complete() { [523, 659, 783, 1046, 783, 1046, 1318, 1567].forEach((f, i) => setTimeout(() => this.play(f, 'sine', 0.7), i * 120)); },
    bingo() { [783.99, 880, 987.77, 1046.50].forEach((f, i) => setTimeout(() => this.play(f, 'sine', 0.6), i * 100)); }
};
