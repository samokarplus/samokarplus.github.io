// Tiny synthesized sound kit (no audio files): shuffle riffles, card slaps, whooshes, chips, fanfare.
let ctx = null;
let master = null;
let noiseBuffer = null;
let muted = false;
try {
  muted = localStorage.getItem("crazy8s:muted") === "1";
} catch {
  muted = false;
}

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.55;
    master.connect(ctx.destination);
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

export function unlockAudio() {
  audio();
}
export function isMuted() {
  return muted;
}
export function setMuted(value) {
  muted = value;
  try {
    localStorage.setItem("crazy8s:muted", value ? "1" : "0");
  } catch {}
  if (master) master.gain.value = muted ? 0 : 0.55;
}

function burst({ at = 0, dur = 0.06, freq = 3000, q = 0.8, gain = 0.5, type = "bandpass", sweep = 0 }) {
  const c = audio();
  if (!c || muted) return;
  const t = c.currentTime + at;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer;
  src.loop = true;
  const filter = c.createBiquadFilter();
  filter.type = type;
  filter.frequency.setValueAtTime(freq, t);
  if (sweep) filter.frequency.exponentialRampToValueAtTime(Math.max(80, freq + sweep), t + dur);
  filter.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(g).connect(master);
  src.start(t, Math.random() * 0.5);
  src.stop(t + dur + 0.02);
}

function tone({ at = 0, freq = 440, dur = 0.2, gain = 0.2, type = "sine", slide = 0 }) {
  const c = audio();
  if (!c || muted) return;
  const t = c.currentTime + at;
  const osc = c.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

// delays below are in milliseconds so they line up with animation timings
export function riffle(delayMs = 0, pairs = 12, gapMs = 70) {
  for (let i = 0; i < pairs * 2; i++) {
    burst({
      at: delayMs / 1000 + (i * gapMs) / 2000,
      dur: 0.045,
      freq: 2600 + Math.random() * 1800,
      q: 1.4,
      gain: 0.22 + (i % 2) * 0.06,
    });
  }
  burst({ at: delayMs / 1000 + (pairs * gapMs) / 1000 + 0.1, dur: 0.12, freq: 900, q: 0.6, gain: 0.3 }); // bridge squeeze
}
export function tick(delayMs = 0) {
  burst({ at: delayMs / 1000, dur: 0.05, freq: 3400, q: 1.2, gain: 0.3 });
}
export function whoosh(delayMs = 0) {
  burst({ at: delayMs / 1000, dur: 0.28, freq: 700, q: 0.7, gain: 0.28, sweep: 2600 });
}
export function slap(delayMs = 0) {
  burst({ at: delayMs / 1000, dur: 0.07, freq: 1800, q: 0.7, gain: 0.7 });
  tone({ at: delayMs / 1000, freq: 150, dur: 0.1, gain: 0.35, slide: -60 });
}
export function draw(delayMs = 0) {
  burst({ at: delayMs / 1000, dur: 0.16, freq: 1400, q: 0.9, gain: 0.3, sweep: 1200 });
}
export function nope() {
  tone({ freq: 210, dur: 0.12, gain: 0.14, type: "triangle", slide: -50 });
}
export function clink(delayMs = 0) {
  const f = 2400 + Math.random() * 900;
  tone({ at: delayMs / 1000, freq: f, dur: 0.14, gain: 0.1, type: "triangle" });
  tone({ at: delayMs / 1000 + 0.012, freq: f * 1.5, dur: 0.1, gain: 0.07, type: "sine" });
}
export function fanfare() {
  const notes = [523, 659, 784, 1047, 784, 1047, 1319];
  notes.forEach((f, i) => {
    tone({ at: i * 0.11, freq: f, dur: 0.22, gain: 0.16, type: "square" });
    tone({ at: i * 0.11, freq: f / 2, dur: 0.22, gain: 0.1, type: "triangle" });
  });
  for (let i = 0; i < 9; i++) clink(700 + i * 130);
  // a thumping beat under the dancing
  for (let i = 0; i < 8; i++) {
    tone({ at: 0.9 + i * 0.4, freq: 120, dur: 0.18, gain: 0.3, slide: -70 });
    burst({ at: 1.1 + i * 0.4, dur: 0.05, freq: 7000, q: 2, gain: 0.12, type: "highpass" });
  }
}
