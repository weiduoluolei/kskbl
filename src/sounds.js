/**
 * 程序化音效：全部用 WebAudio 合成并导出为 WAV data-uri，
 * 无需任何外部音频素材。返回兼容的 data URI，
 * 可直接喂给 <Audio src={...} />。
 */
let AC = null;
const getCtx = () => {
  if (!AC) {
    const W = typeof window !== "undefined" ? window : globalThis;
    AC = W.AudioContext || W.webkitAudioContext;
  }
  return AC ? new AC() : null;
};

const toWav = (buffer) => {
  const numCh = buffer.numberOfChannels;
  const len = buffer.length * numCh * 2;
  const ab = new ArrayBuffer(44 + len);
  const view = new DataView(ab);
  const wStr = (o, s) => {
    for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i));
  };
  wStr(0, "RIFF");
  view.setUint32(4, 36 + len, true);
  wStr(8, "WAVE");
  wStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numCh, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * numCh * 2, true);
  view.setUint16(32, numCh * 2, true);
  view.setUint16(34, 16, true);
  wStr(36, "data");
  view.setUint32(40, len, true);

  let off = 44;
  const chans = [];
  for (let c = 0; c < numCh; c++) chans.push(buffer.getChannelData(c));
  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < numCh; c++) {
      let s = Math.max(-1, Math.min(1, chans[c][i]));
      view.setInt16(off, s < 0 ? s * 32768 : s * 32767, true);
      off += 2;
    }
  }

  let bin = "";
  const bytes = new Uint8Array(ab);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return "data:audio/wav;base64," + btoa(bin);
};

const build = (seconds, fn) => {
  const ctx = getCtx();
  if (!ctx) return "";
  const sr = ctx.sampleRate;
  const buf = ctx.createBuffer(1, Math.floor(sr * seconds), sr);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = fn(i / sr, i, sr);
  const uri = toWav(buf);
  ctx.close();
  return uri;
};

const rnd = (i) => {
  const x = Math.sin(i * 127.1) * 43758.5453;
  return x - Math.floor(x);
};

/** 清脆的“叮/啵”提示音 */
export const sndPop = build(0.22, (t) => {
  const f = 620 + 520 * Math.exp(-t * 16);
  return (
    Math.sin(2 * Math.PI * f * t) * 0.5 * Math.exp(-t * 15) +
    Math.sin(2 * Math.PI * 2 * f * t) * 0.18 * Math.exp(-t * 22)
  );
});

/** 开关“咔哒”声 */
export const sndClick = build(0.1, (t) => {
  return (rnd(Math.floor(t * 44100)) * 2 - 1) * Math.exp(-t * 90);
});

/** 电火花“噼啪” */
export const sndSpark = build(0.35, (t, i) => {
  const n = rnd(i * 1.7) * 2 - 1;
  return (
    n * Math.exp(-t * 13) * 0.85 +
    Math.sin(2 * Math.PI * 1250 * t) * 0.22 * Math.exp(-t * 20)
  );
});

/** 警报“滴滴”声 */
export const sndAlarm = build(0.95, (t) => {
  const env = Math.exp(-t * 3.2);
  const beep = t < 0.16 || (t > 0.3 && t < 0.46) || (t > 0.6 && t < 0.76) ? 1 : 0;
  return (
    (Math.sin(2 * Math.PI * 920 * t) + 0.45 * Math.sin(2 * Math.PI * 1380 * t)) *
    env *
    beep *
    0.4
  );
});

/** 电流“嗡嗡”声（可循环） */
export const sndHum = build(1.2, (t) => {
  return (
    Math.sin(2 * Math.PI * 100 * t) * 0.22 +
    Math.sin(2 * Math.PI * 150 * t) * 0.1 +
    Math.sin(2 * Math.PI * 50 * t) * 0.12
  );
});

/** 能量积聚的上升音（用于危险爆发） */
export const sndRiser = build(1.25, (t, i) => {
  const f = 110 * Math.pow(2, t * 1.7);
  return (
    (Math.sin(2 * Math.PI * f * t) * 0.35 + (rnd(i) * 2 - 1) * 0.14 * (t / 1.25)) *
    (0.2 + 0.8 * (t / 1.25))
  );
});

/** 低频轰鸣（烘托危险氛围） */
export const sndBoom = build(1.6, (t) => {
  return (
    Math.sin(2 * Math.PI * 58 * t) * 0.5 * Math.exp(-t * 1.1) +
    Math.sin(2 * Math.PI * 41 * t) * 0.32 * Math.exp(-t * 0.8)
  );
});