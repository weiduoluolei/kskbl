// srcjsx
// src/Root.jsx — 压电陶瓷点火原理科普动画（已修复 Sequence 导入）
// 合成 id: ShortCircuitVideo（对应 render.yml）

import * as Remotion from "remotion";
import React from "react";

const {
  AbsoluteFill,
  Audio,
  Composition,
  Sequence,
  interpolate,
  spring: _spring,
  useCurrentFrame,
  registerRoot,
  delayRender,
  continueRender,
} = Remotion;

const spring = (o) => _spring({ fps: 30, ...o });

if (typeof document !== "undefined" && !document.getElementById("pf")) {
  const st = document.createElement("style");
  st.id = "pf";
  st.textContent =
    "@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700;900&display=swap');";
  document.head.appendChild(st);
}

const F = '"Noto Sans SC","Noto Sans CJK SC",sans-serif';
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };

const C = {
  bg: "#070b1a",
  cyan: "#00d4ff",
  electric: "#4488ff",
  fire: "#ff6622",
  flame: "#ffaa22",
  red: "#ff4444",
  chem: "#44dd88",
  atom: "#aa66ff",
  text: "#e8f0ff",
  sub: "#8899bb",
  gold: "#ffd76a",
};

const TOTAL = 2250;
const rnd = (i) => {
  const x = Math.sin(i * 127.1) * 43758.5453;
  return x - Math.floor(x);
};

/* ========== 音效合成 ========== */
let AC = null;
const getCtx = () => {
  if (!AC) {
    const W = typeof window !== "undefined" ? window : globalThis;
    AC = W.AudioContext || W.webkitAudioContext;
  }
  return AC ? new AC() : null;
};
const toWav = (buf) => {
  const nc = buf.numberOfChannels;
  const len = buf.length * nc * 2;
  const ab = new ArrayBuffer(44 + len);
  const dv = new DataView(ab);
  const ws = (o, s) => {
    for (let k = 0; k < s.length; k++) dv.setUint8(o + k, s.charCodeAt(k));
  };
  ws(0, "RIFF"); dv.setUint32(4, 36 + len, true); ws(8, "WAVE");
  ws(12, "fmt "); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true);
  dv.setUint16(22, nc, true); dv.setUint32(24, buf.sampleRate, true);
  dv.setUint32(28, buf.sampleRate * nc * 2, true); dv.setUint16(32, nc * 2, true);
  dv.setUint16(34, 16, true); ws(36, "data"); dv.setUint32(40, len, true);
  let off = 44;
  const ch = [];
  for (let c = 0; c < nc; c++) ch.push(buf.getChannelData(c));
  for (let i = 0; i < buf.length; i++) {
    for (let c = 0; c < nc; c++) {
      const s = Math.max(-1, Math.min(1, ch[c][i]));
      dv.setInt16(off, s < 0 ? s * 32768 : s * 32767, true);
      off += 2;
    }
  }
  let bin = "";
  const bytes = new Uint8Array(ab);
  for (let i = 0; i < bytes.length; i += 0x8000)
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return "data:audio/wav;base64," + btoa(bin);
};
const build = (sec, fn) => {
  const ctx = getCtx();
  if (!ctx) return "";
  const sr = ctx.sampleRate;
  const buf = ctx.createBuffer(1, Math.floor(sr * sec), sr);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = fn(i / sr, i);
  const uri = toWav(buf);
  ctx.close();
  return uri;
};
const nz = (i) => ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1 * 2 - 1;
const sndClick = build(0.12, (t) => nz(Math.floor(t * 44100)) * Math.exp(-t * 80) * 0.8);
const sndZap = build(0.45, (t, i) =>
  nz(i * 1.7) * Math.exp(-t * 14) * 0.65 + Math.sin(2 * Math.PI * 1800 * t) * 0.3 * Math.exp(-t * 10)
);
const sndWhoosh = build(0.7, (t) => nz(Math.floor(t * 22050)) * Math.exp(-t * 5) * 0.25 * (1 + Math.sin(t * 25)));
const sndBoom = build(1.2, (t) => Math.sin(2 * Math.PI * 60 * t) * 0.5 * Math.exp(-t * 3) + nz(Math.floor(t * 11025)) * 0.3 * Math.exp(-t * 6));

/* ========== 字幕 ========== */
const SUBS = [
  { t: "打火机，为什么按一下就能点火？", s: 15, e: 115 },
  { t: "秘密藏在一块特殊的陶瓷里——压电陶瓷", s: 115, e: 220 },
  { t: "让我们从微观世界来揭开这个谜题", s: 220, e: 285 },
  { t: "压电打火机的核心结构", s: 295, e: 385 },
  { t: "按压按钮，弹簧推动撞锤撞击压电陶瓷", s: 385, e: 480 },
  { t: "压电陶瓷瞬间产生数千伏高压", s: 480, e: 565 },
  { t: "高压通过导线传到电极尖端", s: 565, e: 615 },
  { t: "压电效应：将机械能转化为电能", s: 625, e: 730 },
  { t: "晶体内部正负电荷中心原本重合", s: 730, e: 825 },
  { t: "受压变形后，正负电荷中心分离", s: 825, e: 920 },
  { t: "晶体表面产生数千伏高压——压电效应", s: 920, e: 1030 },
  { t: "高压在电极尖端之间形成强电场", s: 1045, e: 1140 },
  { t: "自由电子被电场加速，撞击气体分子", s: 1140, e: 1235 },
  { t: "气体分子被电离，释放出更多自由电子", s: 1235, e: 1330 },
  { t: "电子雪崩 → 击穿空气 → 产生电火花！", s: 1330, e: 1455 },
  { t: "电火花点燃丁烷与空气的混合气体", s: 1465, e: 1560 },
  { t: "高温打断丁烷分子中的化学键", s: 1560, e: 1655 },
  { t: "产生高活性自由基，引发链式反应", s: 1655, e: 1755 },
  { t: "C₄H₁₀ + 6.5O₂ → 4CO₂ + 5H₂O + 能量", s: 1755, e: 1855 },
  { t: "化学能转化为热能和光能，火焰持续燃烧", s: 1855, e: 1935 },
  { t: "物理的压电效应 × 化学的燃烧反应", s: 1950, e: 2060 },
  { t: "一次按压，两次能量转换", s: 2060, e: 2155 },
  { t: "谢谢观看", s: 2155, e: 2250 },
];

const SubBar = () => {
  const f = useCurrentFrame();
  const c = SUBS.find((s) => f >= s.s && f < s.e);
  if (!c) return null;
  const fi = interpolate(f, [c.s, c.s + 10], [0, 1], clamp);
  const fo = interpolate(f, [c.e - 10, c.e], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", bottom: 52, left: 80, right: 80, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{
        background: "rgba(0,0,0,0.8)", borderRadius: 18, padding: "20px 48px",
        opacity: Math.min(fi, fo), transform: `translateY(${(1 - fi) * 10}px)`,
        border: "1px solid rgba(100,160,255,0.15)", maxWidth: "88%",
      }}>
        <div style={{ fontFamily: F, fontWeight: 700, fontSize: 42, color: "#fff", textAlign: "center", lineHeight: 1.5, letterSpacing: 2 }}>{c.t}</div>
      </div>
    </div>
  );
};

/* ========== 通用粒子 ========== */
const ParticleField = ({ count = 18, color1 = C.cyan, color2 = C.electric, speed = 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const x = ((Math.sin(f * 0.012 * speed + i * 13.7) * 0.5 + 0.5) * 1920);
        const y = ((f * (0.5 + (i % 3) * 0.3) * speed + i * 210) % 1250) - 80;
        const r = 1.5 + (i % 3) * 2;
        return (
          <div key={i} style={{
            position: "absolute", left: x, top: y, width: r * 2, height: r * 2,
            borderRadius: "50%", background: i % 2 ? color1 : color2,
            opacity: 0.15 + 0.2 * Math.abs(Math.sin(f * 0.07 + i * 1.9)),
          }} />
        );
      })}
    </>
  );
};

/* ========== 火焰效果 ========== */
const FlameEffect = ({ x = 960, y = 400, scale = 1, intensity = 1 }) => {
  const f = useCurrentFrame();
  const flicker = Math.sin(f * 0.4) * 0.15 + Math.sin(f * 0.23) * 0.1;
  return (
    <g transform={`translate(${x},${y}) scale(${scale * (1 + flicker * 0.1)})`}>
      {[0, 1, 2, 3].map((i) => {
        const s = 1 - i * 0.18;
        const oy = -i * 22 * s;
        const w = (80 - i * 12) * s * intensity;
        const h = (140 - i * 25) * s * intensity;
        const colors = ["rgba(255,60,10,0.25)", "rgba(255,120,20,0.4)", "rgba(255,180,50,0.55)", "rgba(255,240,180,0.7)"];
        return (
          <ellipse key={i} cx={Math.sin(f * 0.3 + i * 2) * 8} cy={oy - h * 0.3}
            rx={w * 0.5} ry={h * 0.5} fill={colors[i]} />
        );
      })}
    </g>
  );
};

/* ========== 打火机实物 SVG ========== */
const LighterSVG = ({ transparent = false, buttonY = 0, showSpark = false, showFlame = false, sparkF = 0 }) => {
  const f = useCurrentFrame();
  const bodyOpacity = transparent ? 0.35 : 1;
  return (
    <svg width={400} height={700} viewBox="0 0 400 700">
      <rect x={175} y={20} width={50} height={45} rx={8} fill="#888" stroke="#aaa" strokeWidth={2} opacity={bodyOpacity} />
      <rect x={192} y={10} width={16} height={15} rx={3} fill="#666" opacity={bodyOpacity} />
      <g transform={`translate(0,${buttonY})`}>
        <rect x={155} y={55} width={90} height={55} rx={14} fill="#445" stroke="#667" strokeWidth={2} opacity={bodyOpacity} />
        <rect x={163} y={62} width={74} height={20} rx={6} fill="rgba(255,255,255,0.12)" opacity={bodyOpacity} />
      </g>
      <rect x={120} y={105} width={160} height={530} rx={22}
        fill={transparent ? "rgba(40,55,90,0.3)" : "url(#bodyGrad)"} stroke="rgba(100,140,200,0.3)" strokeWidth={2} />
      <defs>
        <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2a3a5c" />
          <stop offset="50%" stopColor="#3a4a6c" />
          <stop offset="100%" stopColor="#2a3a5c" />
        </linearGradient>
      </defs>
      <rect x={135} y={115} width={16} height={510} rx={8} fill="rgba(255,255,255,0.06)" opacity={bodyOpacity} />
      {transparent && (
        <>
          <rect x={195} y={85} width={10} height={170} fill="rgba(150,180,220,0.7)" />
          {Array.from({ length: 7 }).map((_, i) => (
            <path key={i} d={`M ${185 + (i % 2) * 30} ${270 + i * 22} L ${215 - (i % 2) * 30} ${281 + i * 22}`}
              stroke="rgba(180,200,230,0.7)" strokeWidth={4} fill="none" />
          ))}
          <rect x={178} y={245} width={44} height={30} rx={5} fill="rgba(200,180,100,0.8)" stroke="rgba(220,200,120,0.5)" strokeWidth={1.5} />
          <rect x={175} y={310} width={50} height={100} rx={6} fill="rgba(0,180,255,0.25)" stroke={C.cyan} strokeWidth={2.5} />
          <text x={200} y={368} textAnchor="middle" fill={C.cyan} fontSize={14} fontWeight={700} fontFamily={F}>压电陶瓷</text>
          <rect x={175} y={310} width={50} height={100} rx={6} fill={C.cyan} opacity={0.08 + 0.06 * Math.sin(f * 0.15)} />
          <path d="M 200 310 C 200 280, 200 260, 200 230 C 200 210, 195 180, 192 75" fill="none" stroke="rgba(255,100,50,0.7)" strokeWidth={3} />
          <path d="M 200 310 C 210 280, 215 260, 210 230 C 205 210, 208 180, 208 75" fill="none" stroke="rgba(100,150,255,0.7)" strokeWidth={3} />
          <path d="M 192 75 L 192 58 L 196 52" fill="none" stroke="#ff8844" strokeWidth={3} strokeLinecap="round" />
          <path d="M 208 75 L 208 58 L 204 52" fill="none" stroke="#4488ff" strokeWidth={3} strokeLinecap="round" />
          <rect x={195} y={430} width={10} height={180} rx={4} fill="rgba(100,200,150,0.4)" />
          <text x={235} y={520} fill={C.chem} fontSize={13} fontFamily={F}>丁烷气体</text>
        </>
      )}
      {showSpark && (
        <g opacity={Math.max(0, 1 - sparkF * 3)}>
          <path d="M 196 52 L 192 40 L 204 38 L 196 28 L 208 25 L 200 12" fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" />
          <path d="M 196 52 L 192 40 L 204 38 L 196 28 L 208 25 L 200 12" fill="none" stroke={C.cyan} strokeWidth={8} strokeLinecap="round" opacity={0.4} />
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * Math.PI * 2;
            const r = sparkF * 60;
            return <circle key={i} cx={200 + Math.cos(a) * r} cy={32 + Math.sin(a) * r} r={3 * (1 - sparkF * 2)} fill="#fff" />;
          })}
        </g>
      )}
      {showFlame && <FlameEffect x={200} y={20} scale={0.7} />}
    </svg>
  );
};

/* ========== 原子模型 ========== */
const si_e = (s) => (s <= 1 ? 0 : 4);
const AtomModel = ({ cx, cy, r = 30, shells = 2, ionized = false, ionizedF = 0, label = "" }) => {
  const f = useCurrentFrame();
  return (
    <g>
      <circle cx={cx} cy={cy} r={r * 0.3} fill="#ff6644" />
      <text x={cx} y={cy + 5} textAnchor="middle" fill="#fff" fontSize={r * 0.3} fontWeight={700}>{label}</text>
      {Array.from({ length: shells }).map((_, si) => {
        const sr = r * (0.55 + si * 0.45);
        return <circle key={si} cx={cx} cy={cy} r={sr} fill="none" stroke="rgba(100,160,255,0.25)" strokeDasharray="4 4" />;
      })}
      {Array.from({ length: shells === 1 ? 2 : 2 + si_e(shells) }).map((_, ei) => {
        const si = ei < 2 ? 0 : 1;
        const sr = r * (0.55 + si * 0.45);
        const count = ei < 2 ? 2 : 4;
        const idx = ei < 2 ? ei : ei - 2;
        const ang = f * 0.04 + (idx / count) * Math.PI * 2 + si * 1.2;
        const ex = cx + Math.cos(ang) * sr;
        const ey = cy + Math.sin(ang) * sr;
        const isOuter = ei >= 2;
        if (ionized && isOuter && ei === 4 && ionizedF > 0) {
          return <circle key={ei} cx={ex + ionizedF * 80} cy={ey - ionizedF * 60} r={r * 0.12} fill="#4488ff" opacity={1 - ionizedF} />;
        }
        return <circle key={ei} cx={ex} cy={ey} r={r * 0.12} fill="#4488ff" />;
      })}
      {ionized && ionizedF > 0.3 && (
        <text x={cx + r * 0.5} y={cy - r * 0.6} fill={C.cyan} fontSize={r * 0.35} fontWeight={700}>+</text>
      )}
    </g>
  );
};

/* ========== 分子结构 ========== */
const Molecule = ({ atoms, bonds, x = 0, y = 0, scale = 1, opacity = 1, breakingBonds = [], brokenF = 0 }) => {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`} opacity={opacity}>
      {bonds.map(([a, b], i) => {
        const isBreaking = breakingBonds.includes(i);
        const dx = isBreaking ? (atoms[a].x - atoms[b].x) * brokenF * 0.5 : 0;
        const dy = isBreaking ? (atoms[a].y - atoms[b].y) * brokenF * 0.5 : 0;
        return (
          <line key={i} x1={atoms[a].x + dx} y1={atoms[a].y + dy} x2={atoms[b].x - dx} y2={atoms[b].y - dy}
            stroke={isBreaking ? `rgba(255,100,50,${1 - brokenF})` : "rgba(180,200,230,0.5)"}
            strokeWidth={3} strokeDasharray={isBreaking && brokenF > 0 ? `${20 * (1 - brokenF)} 8` : undefined} />
        );
      })}
      {atoms.map((a, i) => (
        <g key={i}>
          <circle cx={a.x} cy={a.y} r={a.r} fill={a.color} opacity={0.85} />
          <text x={a.x} y={a.y + a.r * 0.35} textAnchor="middle" fill="#fff" fontSize={a.r * 0.8} fontWeight={700}>{a.label}</text>
        </g>
      ))}
    </g>
  );
};

/* ========== 场景 1：开场钩子 ========== */
const SceneOpening = () => {
  const f = useCurrentFrame();
  const rise = spring({ frame: f, config: { damping: 14, stiffness: 60 }, durationInFrames: 50 });
  const btnPress = interpolate(f, [55, 70], [0, 14], clamp);
  const sparkF = interpolate(f, [72, 95], [0, 1], clamp);
  const showSpark = f >= 72 && f < 100;
  const showFlame = f >= 95;
  const flameIntensity = interpolate(f, [95, 130], [0, 1], clamp);
  const titleO = interpolate(f, [120, 160], [0, 1], clamp);
  const titleY = interpolate(f, [120, 160], [30, 0], clamp);

  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 60%, #0c1530 0%, ${C.bg} 70%)` }}>
      <ParticleField />
      <div style={{ position: "absolute", left: "50%", top: 120, transform: `translateX(-50%) translateY(${(1 - rise) * 300}px) scale(${0.8 + rise * 0.2})` }}>
        <LighterSVG buttonY={btnPress} showSpark={showSpark} showFlame={showFlame} sparkF={sparkF} />
      </div>
      {showFlame && (
        <div style={{
          position: "absolute", left: "50%", top: 80, transform: "translateX(-50%)",
          width: 300 * flameIntensity, height: 300 * flameIntensity, borderRadius: "50%",
          background: `radial-gradient(circle, rgba(255,160,40,${0.12 * flameIntensity}), transparent 70%)`,
        }} />
      )}
      <div style={{ position: "absolute", top: 180, width: 1920, textAlign: "center", opacity: titleO, transform: `translateY(${titleY}px)` }}>
        <div style={{ fontFamily: F, fontWeight: 900, fontSize: 92, color: C.gold, letterSpacing: 8, textShadow: "0 0 40px rgba(255,200,80,0.4)" }}>
          打火机的秘密
        </div>
        <div style={{ fontFamily: F, fontSize: 36, color: C.sub, letterSpacing: 12, marginTop: 16 }}>压电陶瓷点火原理</div>
      </div>
    </AbsoluteFill>
  );
};

/* ========== 场景 2：结构拆解 ========== */
const SceneStructure = () => {
  const f = useCurrentFrame();
  const transparent = f > 40;
  const label = (idx) => {
    const start = 80 + idx * 35;
    return { o: interpolate(f, [start, start + 15], [0, 1], clamp), y: interpolate(f, [start, start + 15], [15, 0], clamp) };
  };
  const labels = [
    { text: "按钮", x: 1200, y: 220, lx: 1100, ly: 215 },
    { text: "弹簧", x: 1200, y: 360, lx: 1100, ly: 355 },
    { text: "撞锤", x: 1200, y: 310, lx: 1100, ly: 305 },
    { text: "压电陶瓷", x: 1200, y: 430, lx: 1090, ly: 425 },
    { text: "电极", x: 1200, y: 165, lx: 1100, ly: 160 },
    { text: "丁烷气体", x: 1200, y: 570, lx: 1085, ly: 565 },
  ];
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, #0c1530 0%, ${C.bg} 70%)` }}>
      <ParticleField count={12} />
      <div style={{ position: "absolute", left: "50%", top: 100, transform: "translateX(-50%)" }}>
        <LighterSVG transparent={transparent} />
      </div>
      {labels.map((l, i) => {
        const { o, y } = label(i);
        return (
          <div key={i} style={{ position: "absolute", left: l.x, top: l.y, opacity: o, transform: `translateY(${y}px)` }}>
            <svg width={200} height={10}>
              <line x1={0} y1={5} x2={l.x - l.lx} y2={5} stroke="rgba(150,180,220,0.5)" strokeWidth={2} strokeDasharray="6 4" />
            </svg>
            <div style={{ fontFamily: F, fontSize: 28, color: i === 3 ? C.cyan : C.text, fontWeight: 700, letterSpacing: 3, textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}>{l.text}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", top: 50, width: 1920, textAlign: "center" }}>
        <div style={{ fontFamily: F, fontWeight: 900, fontSize: 54, color: C.text, letterSpacing: 6, opacity: interpolate(f, [0, 20], [0, 1], clamp) }}>
          压电打火机 · 核心结构
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ========== 场景 3：压电效应 ========== */
const ScenePiezo = () => {
  const f = useCurrentFrame();
  const compress = interpolate(f, [80, 180], [0, 1], clamp);
  const chargeSep = interpolate(f, [180, 280], [0, 1], clamp);
  const voltage = interpolate(f, [200, 350], [0, 1], clamp);
  const formulaO = interpolate(f, [330, 380], [0, 1], clamp);

  const latW = 7, latH = 5, spacing = 90;
  const cx0 = 960 - ((latW - 1) * spacing) / 2;
  const cy0 = 420 - ((latH - 1) * spacing) / 2;

  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, #0a1228 0%, ${C.bg} 70%)` }}>
      <ParticleField count={12} color1={C.atom} color2={C.cyan} />
      <div style={{ position: "absolute", top: 50, width: 1920, textAlign: "center" }}>
        <div style={{ fontFamily: F, fontWeight: 900, fontSize: 54, color: C.cyan, letterSpacing: 6 }}>压电效应</div>
        <div style={{ fontFamily: F, fontSize: 28, color: C.sub, letterSpacing: 6, marginTop: 8 }}>机械能 → 电能</div>
      </div>

      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX={5} refY={5} markerWidth={5} markerHeight={5} orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 Z" fill={C.fire} />
          </marker>
        </defs>
        {compress > 0 && compress < 0.9 && (
          <>
            <path d={`M ${cx0 + 200} ${cy0 - 120 - compress * 40} L ${cx0 + 200} ${cy0 - 60 - compress * 20}`}
              stroke={C.fire} strokeWidth={5} markerEnd="url(#arrow)" opacity={0.8} />
            <path d={`M ${cx0 + 450} ${cy0 - 120 - compress * 40} L ${cx0 + 450} ${cy0 - 60 - compress * 20}`}
              stroke={C.fire} strokeWidth={5} opacity={0.8} />
            <text x={cx0 + 325} y={cy0 - 140 - compress * 40} textAnchor="middle" fill={C.fire} fontSize={24} fontWeight={700}>压力 F</text>
          </>
        )}
        {Array.from({ length: latH }).map((_, row) =>
          Array.from({ length: latW }).map((_, col) => {
            const x = cx0 + col * spacing;
            const baseY = cy0 + row * spacing;
            const y = baseY + compress * (row < latH / 2 ? -12 : 12);
            const isTi = (row + col) % 2 === 0;
            return (
              <g key={`${row}_${col}`}>
                {col < latW - 1 && (
                  <line x1={x} y1={y} x2={x + spacing} y2={baseY + compress * (row < latH / 2 ? -12 : 12)}
                    stroke="rgba(150,180,230,0.3)" strokeWidth={2} />
                )}
                {row < latH - 1 && (
                  <line x1={x} y1={y} x2={x} y2={baseY + spacing + compress * (row + 1 < latH / 2 ? -12 : 12)}
                    stroke="rgba(150,180,230,0.3)" strokeWidth={2} />
                )}
                <circle cx={x} cy={y} r={isTi ? 22 : 16} fill={isTi ? "rgba(170,100,255,0.6)" : "rgba(100,180,255,0.5)"} />
                <text x={x} y={y + 5} textAnchor="middle" fill="#fff" fontSize={12} fontWeight={700}>{isTi ? "Ti" : "O"}</text>
              </g>
            );
          })
        )}
        {chargeSep > 0 && (
          <>
            {Array.from({ length: latW }).map((_, col) => {
              const x = cx0 + col * spacing;
              return (
                <text key={`p${col}`} x={x} y={cy0 - 45 - chargeSep * 25} textAnchor="middle"
                  fill={C.red} fontSize={30} fontWeight={900} opacity={chargeSep}>+</text>
              );
            })}
            {Array.from({ length: latW }).map((_, col) => {
              const x = cx0 + col * spacing;
              return (
                <text key={`n${col}`} x={x} y={cy0 + (latH - 1) * spacing + 55 + chargeSep * 25} textAnchor="middle"
                  fill={C.electric} fontSize={30} fontWeight={900} opacity={chargeSep}>−</text>
              );
            })}
            {Array.from({ length: 5 }).map((_, i) => {
              const x = cx0 + spacing * (i + 1);
              return (
                <line key={`ef${i}`} x1={x} y1={cy0 - 30 - chargeSep * 15} x2={x} y2={cy0 + (latH - 1) * spacing + 40 + chargeSep * 15}
                  stroke="rgba(255,200,50,0.25)" strokeWidth={1.5} strokeDasharray="8 6" opacity={chargeSep * 0.7} />
              );
            })}
          </>
        )}
      </svg>

      {voltage > 0 && (
        <div style={{ position: "absolute", right: 160, top: 300, width: 280, textAlign: "center" }}>
          <div style={{ fontFamily: F, fontSize: 24, color: C.sub, marginBottom: 12 }}>输出电压</div>
          <svg width={280} height={180}>
            <path d="M 30 160 A 110 110 0 0 1 250 160" fill="none" stroke="rgba(100,150,255,0.15)" strokeWidth={16} />
            <path d="M 30 160 A 110 110 0 0 1 250 160" fill="none" stroke={C.cyan} strokeWidth={16}
              strokeDasharray={`${voltage * 345} 345`} strokeLinecap="round" opacity={0.8} />
            <text x={140} y={145} textAnchor="middle" fill={C.cyan} fontSize={44} fontWeight={900} fontFamily={F}>
              {Math.round(voltage * 5000)}V
            </text>
          </svg>
        </div>
      )}

      <div style={{
        position: "absolute", bottom: 140, width: 1920, textAlign: "center",
        opacity: formulaO, fontFamily: F, fontSize: 36, color: C.gold, fontWeight: 700, letterSpacing: 4,
      }}>
        V = g × t × σ （压电常数 × 厚度 × 应力）
      </div>
    </AbsoluteFill>
  );
};

/* ========== 场景 4：放电与电离 ========== */
const SceneSpark = () => {
  const f = useCurrentFrame();
  const fieldO = interpolate(f, [30, 100], [0, 1], clamp);
  const electronF = interpolate(f, [100, 230], [0, 1], clamp);
  const ionizeF = interpolate(f, [220, 310], [0, 1], clamp);
  const avalancheF = interpolate(f, [300, 380], [0, 1], clamp);
  const sparkF = interpolate(f, [370, 410], [0, 1], clamp);
  const flashO = interpolate(f, [375, 385, 410], [0, 0.6, 0], clamp);

  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, #0c1530 0%, ${C.bg} 70%)` }}>
      <ParticleField count={14} color1={C.electric} color2={C.cyan} />
      <div style={{ position: "absolute", top: 50, width: 1920, textAlign: "center" }}>
        <div style={{ fontFamily: F, fontWeight: 900, fontSize: 52, color: C.electric, letterSpacing: 6 }}>高压放电与气体电离</div>
      </div>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <path d="M 860 280 L 930 340 L 945 365" fill="none" stroke="#ff8844" strokeWidth={6} strokeLinecap="round" />
        <path d="M 1060 280 L 990 340 L 975 365" fill="none" stroke="#4488ff" strokeWidth={6} strokeLinecap="round" />
        <text x={830} y={270} fill="#ff8844" fontSize={22} fontWeight={700} fontFamily={F}>+高压</text>
        <text x={1060} y={270} fill="#4488ff" fontSize={22} fontWeight={700} fontFamily={F}>−</text>
        {fieldO > 0 && Array.from({ length: 8 }).map((_, i) => {
          const t = (i + 1) / 9;
          const x1 = 945 + t * 30 - 15;
          const x2 = 975 - t * 30 + 15;
          const bow = Math.sin(t * Math.PI) * 40 * fieldO;
          return (
            <path key={i} d={`M ${x1} 365 Q ${(x1 + x2) / 2} ${365 + bow + 60} ${x2} 365`}
              fill="none" stroke="rgba(100,180,255,0.25)" strokeWidth={1.5} strokeDasharray="5 5" opacity={fieldO} />
          );
        })}
        {electronF > 0 && electronF < 0.98 && Array.from({ length: 4 }).map((_, i) => {
          const t = (electronF * 2 + i * 0.25) % 1;
          const ex = 945 + t * 30;
          const ey = 365 + Math.sin(t * Math.PI) * 20 + (i - 1.5) * 20;
          return <circle key={i} cx={ex} cy={ey} r={5} fill="#4488ff" opacity={0.7} />;
        })}
        {ionizeF > 0 && (
          <g opacity={Math.min(1, ionizeF * 2)}>
            <AtomModel cx={960} cy={520} r={50} shells={2} ionized ionizedF={ionizeF} label="O" />
            <text x={1060} y={510} fill={C.cyan} fontSize={20} fontFamily={F}>电子被撞出</text>
            <text x={1060} y={540} fill={C.atom} fontSize={20} fontFamily={F}>气体分子电离</text>
          </g>
        )}
        {avalancheF > 0 && Array.from({ length: 20 }).map((_, i) => {
          const born = (i / 20) * avalancheF;
          if (born > avalancheF) return null;
          const spread = born * 200;
          const ang = (i / 20) * Math.PI * 2;
          return (
            <circle key={`av${i}`} cx={960 + Math.cos(ang) * spread} cy={380 + Math.sin(ang) * spread * 0.5}
              r={4 + rnd(i) * 2} fill={C.electric} opacity={0.6 * (1 - born * 0.5)} />
          );
        })}
        {sparkF > 0 && (
          <g opacity={Math.min(1, sparkF * 3)}>
            <path d="M 945 365 L 955 330 L 940 310 L 965 285 L 950 260 L 970 235 L 955 210 L 975 185"
              fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" />
            <path d="M 945 365 L 955 330 L 940 310 L 965 285 L 950 260 L 970 235 L 955 210 L 975 185"
              fill="none" stroke={C.cyan} strokeWidth={12} strokeLinecap="round" opacity={0.35} />
            <path d="M 955 330 L 920 300 L 910 275" fill="none" stroke="#fff" strokeWidth={3} opacity={0.6} />
            <path d="M 950 260 L 990 240 L 1005 215" fill="none" stroke="#fff" strokeWidth={3} opacity={0.6} />
            <circle cx={960} cy={340} r={80 * sparkF} fill="rgba(100,200,255,0.15)" />
            <circle cx={960} cy={340} r={40 * sparkF} fill="rgba(200,230,255,0.2)" />
          </g>
        )}
      </svg>
      {ionizeF > 0.2 && (
        <div style={{ position: "absolute", left: 200, top: 650, fontFamily: F, fontSize: 30, color: C.text, lineHeight: 2, opacity: Math.min(1, ionizeF * 2) }}>
          <div>自由电子被电场加速</div>
          <div>撞击气体分子 → 电离</div>
          <div>电子雪崩 → 击穿空气</div>
        </div>
      )}
      <AbsoluteFill style={{ background: "#fff", opacity: flashO, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

/* ========== 场景 5：燃烧化学反应 ========== */
const SceneCombustion = () => {
  const f = useCurrentFrame();
  const sparkEnergy = interpolate(f, [30, 80], [0, 1], clamp);
  const breakBonds = interpolate(f, [80, 170], [0, 1], clamp);
  const chainF = interpolate(f, [160, 300], [0, 1], clamp);
  const productF = interpolate(f, [280, 380], [0, 1], clamp);
  const energyF = interpolate(f, [370, 440], [0, 1], clamp);
  const equationO = interpolate(f, [310, 370], [0, 1], clamp);

  const butane = {
    atoms: [
      { x: -75, y: 10, r: 24, label: "C", color: "#555" },
      { x: -25, y: -15, r: 24, label: "C", color: "#555" },
      { x: 25, y: 10, r: 24, label: "C", color: "#555" },
      { x: 75, y: -15, r: 24, label: "C", color: "#555" },
      { x: -110, y: -15, r: 14, label: "H", color: "#888" },
      { x: -110, y: 40, r: 14, label: "H", color: "#888" },
      { x: -25, y: -55, r: 14, label: "H", color: "#888" },
      { x: 25, y: 50, r: 14, label: "H", color: "#888" },
      { x: 110, y: -45, r: 14, label: "H", color: "#888" },
      { x: 110, y: 15, r: 14, label: "H", color: "#888" },
    ],
    bonds: [[0, 1], [1, 2], [2, 3], [0, 4], [0, 5], [1, 6], [2, 7], [3, 8], [3, 9]],
  };
  const o2 = {
    atoms: [
      { x: -20, y: 0, r: 22, label: "O", color: "#cc4444" },
      { x: 20, y: 0, r: 22, label: "O", color: "#cc4444" },
    ],
    bonds: [[0, 1]],
  };
  const co2 = {
    atoms: [
      { x: -40, y: 0, r: 22, label: "O", color: "#cc4444" },
      { x: 0, y: 0, r: 24, label: "C", color: "#555" },
      { x: 40, y: 0, r: 22, label: "O", color: "#cc4444" },
    ],
    bonds: [[0, 1], [1, 2]],
  };
  const h2o = {
    atoms: [
      { x: -25, y: -18, r: 14, label: "H", color: "#888" },
      { x: 0, y: 10, r: 22, label: "O", color: "#cc4444" },
      { x: 25, y: -18, r: 14, label: "H", color: "#888" },
    ],
    bonds: [[0, 1], [1, 2]],
  };

  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 55%, #1a0a18 0%, ${C.bg} 70%)` }}>
      <ParticleField count={14} color1={C.fire} color2={C.flame} />
      <div style={{ position: "absolute", top: 50, width: 1920, textAlign: "center" }}>
        <div style={{ fontFamily: F, fontWeight: 900, fontSize: 52, color: C.fire, letterSpacing: 6 }}>燃烧反应 · 化学世界</div>
        <div style={{ fontFamily: F, fontSize: 26, color: C.sub, letterSpacing: 4, marginTop: 6 }}>化学键断裂与链式反应</div>
      </div>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <Molecule atoms={butane.atoms} bonds={butane.bonds} x={480} y={400} scale={1.1}
          opacity={1 - productF * 0.7} breakingBonds={breakBonds > 0 ? [0, 1, 2] : []} brokenF={breakBonds} />
        <text x={480} y={310} textAnchor="middle" fill={C.text} fontSize={28} fontWeight={700} fontFamily={F} opacity={1 - productF * 0.7}>丁烷 C4H10</text>
        <Molecule atoms={o2.atoms} bonds={o2.bonds} x={750} y={340} scale={1.2} opacity={1 - productF * 0.7} />
        <Molecule atoms={o2.atoms} bonds={o2.bonds} x={820} y={480} scale={1.2} opacity={1 - productF * 0.7} />
        <Molecule atoms={o2.atoms} bonds={o2.bonds} x={680} y={530} scale={1.1} opacity={1 - productF * 0.7} />
        <text x={760} y={280} textAnchor="middle" fill={C.red} fontSize={26} fontWeight={700} fontFamily={F} opacity={1 - productF * 0.7}>O2 氧气</text>
        {sparkEnergy > 0 && breakBonds < 1 && (
          <g opacity={sparkEnergy}>
            <path d="M 380 200 Q 580 250, 620 350" fill="none" stroke={C.gold} strokeWidth={4} strokeDasharray="12 8" />
            <text x={350} y={195} fill={C.gold} fontSize={22} fontWeight={700} fontFamily={F}>激活能</text>
            <polygon points="620,350 605,335 630,335" fill={C.gold} />
          </g>
        )}
        {breakBonds > 0.5 && chainF < 1 && Array.from({ length: 6 }).map((_, i) => {
          const t = Math.min(1, (breakBonds - 0.5) * 2 + chainF);
          const ang = (i / 6) * Math.PI * 2;
          const dist = 60 + t * 120;
          return (
            <g key={i} opacity={Math.max(0, 1 - productF * 1.5)}>
              <circle cx={480 + Math.cos(ang) * dist} cy={400 + Math.sin(ang) * dist * 0.6} r={14}
                fill={i % 2 ? "rgba(255,150,50,0.6)" : "rgba(150,200,255,0.6)"} />
              <text x={480 + Math.cos(ang) * dist} y={400 + Math.sin(ang) * dist * 0.6 + 5} textAnchor="middle"
                fill="#fff" fontSize={11} fontWeight={700}>{i % 2 ? "H." : "OH."}</text>
            </g>
          );
        })}
        {chainF > 0.2 && chainF < 1 && (
          <text x={960} y={620} textAnchor="middle" fill={C.flame} fontSize={26} fontWeight={700} fontFamily={F}
            opacity={Math.min(1, chainF * 2)}>
            H. + O2 → OH. + O. → 链式反应持续……
          </text>
        )}
        {productF > 0 && (
          <g opacity={productF}>
            <Molecule atoms={co2.atoms} bonds={co2.bonds} x={1320} y={340} scale={1.3} />
            <Molecule atoms={co2.atoms} bonds={co2.bonds} x={1420} y={470} scale={1.2} />
            <Molecule atoms={co2.atoms} bonds={co2.bonds} x={1220} y={490} scale={1.1} />
            <Molecule atoms={h2o.atoms} bonds={h2o.bonds} x={1520} y={360} scale={1.3} />
            <Molecule atoms={h2o.atoms} bonds={h2o.bonds} x={1480} y={520} scale={1.2} />
            <text x={1380} y={280} textAnchor="middle" fill={C.chem} fontSize={26} fontWeight={700} fontFamily={F}>CO2 + H2O</text>
          </g>
        )}
        {energyF > 0 && (
          <g opacity={energyF}>
            {[0, 1, 2].map((i) => {
              const r = (50 + i * 60) * energyF * 1.5;
              return (
                <circle key={i} cx={1250} cy={420} r={r} fill="none"
                  stroke={`rgba(255,160,40,${0.4 * (1 - i * 0.3)})`} strokeWidth={3} />
              );
            })}
            <text x={1250} y={620} textAnchor="middle" fill={C.fire} fontSize={28} fontWeight={900} fontFamily={F}>
              能量释放！
            </text>
          </g>
        )}
        {energyF > 0.3 && <FlameEffect x={960} y={750} scale={1.2} intensity={energyF} />}
      </svg>
      <div style={{
        position: "absolute", bottom: 130, width: 1920, textAlign: "center",
        opacity: equationO, fontFamily: F, fontSize: 34, fontWeight: 700, color: C.gold, letterSpacing: 3,
      }}>
        C4H10 + 6.5 O2 → 4 CO2 + 5 H2O + 能量
      </div>
    </AbsoluteFill>
  );
};

/* ========== 场景 6：总结 ========== */
const SceneSummary = () => {
  const f = useCurrentFrame();
  const steps = [
    { t: "按压按钮", sub: "机械力", color: C.text, icon: "1" },
    { t: "撞锤撞击", sub: "机械能", color: C.flame, icon: "2" },
    { t: "压电效应", sub: "机械能→电能", color: C.cyan, icon: "3" },
    { t: "高压放电", sub: "电离·雪崩", color: C.electric, icon: "4" },
    { t: "电火花", sub: "点燃混合气", color: C.fire, icon: "5" },
    { t: "燃烧反应", sub: "化学能→热光", color: C.red, icon: "6" },
  ];
  const titleO = interpolate(f, [0, 25], [0, 1], clamp);
  const endO = interpolate(f, [230, 275], [0, 1], clamp);
  const endScale = interpolate(f, [230, 275], [0.88, 1], clamp);
  const thanksO = interpolate(f, [275, 310], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, #0c1530 0%, ${C.bg} 70%)` }}>
      <ParticleField count={16} />
      <div style={{ position: "absolute", top: 60, width: 1920, textAlign: "center", opacity: titleO }}>
        <div style={{ fontFamily: F, fontWeight: 900, fontSize: 58, color: C.gold, letterSpacing: 8 }}>总结</div>
        <div style={{ fontFamily: F, fontSize: 28, color: C.sub, letterSpacing: 5, marginTop: 8 }}>一次按压，两次能量转换</div>
      </div>
      <div style={{ position: "absolute", top: 240, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
        {steps.map((s, i) => {
          const t = spring({ frame: f - 30 - i * 22, config: { damping: 12, stiffness: 110 }, durationInFrames: 22 });
          return (
            <React.Fragment key={i}>
              <div style={{
                width: 230, padding: "28px 18px", borderRadius: 20, textAlign: "center",
                background: "rgba(255,255,255,0.04)", border: `2px solid ${s.color}44`,
                opacity: t, transform: `translateY(${(1 - t) * 30}px) scale(${0.85 + t * 0.15})`,
              }}>
                <div style={{ fontSize: 42, fontWeight: 900, color: s.color }}>{s.icon}</div>
                <div style={{ fontFamily: F, fontWeight: 900, fontSize: 28, color: s.color, marginTop: 10 }}>{s.t}</div>
                <div style={{ fontFamily: F, fontSize: 20, color: C.sub, marginTop: 6 }}>{s.sub}</div>
              </div>
              {i < steps.length - 1 && (
                <div style={{
                  alignSelf: "center", fontSize: 36, color: C.sub,
                  opacity: spring({ frame: f - 45 - i * 22, config: { damping: 12, stiffness: 110 }, durationInFrames: 22 }),
                }}>→</div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div style={{
        position: "absolute", top: 580, width: 1920, textAlign: "center",
        opacity: endO, transform: `scale(${endScale})`,
      }}>
        <div style={{ fontFamily: F, fontWeight: 900, fontSize: 52, color: C.text, letterSpacing: 5 }}>
          物理的<span style={{ color: C.cyan }}>压电效应</span>
          <span style={{ color: C.sub, margin: "0 16px" }}>×</span>
          化学的<span style={{ color: C.fire }}>燃烧反应</span>
        </div>
        <div style={{ fontFamily: F, fontSize: 32, color: C.gold, marginTop: 24, letterSpacing: 6 }}>
          科学，就在你指尖的一按之间
        </div>
      </div>
      <div style={{
        position: "absolute", bottom: 120, width: 1920, textAlign: "center",
        opacity: thanksO,
      }}>
        <div style={{ fontFamily: F, fontWeight: 900, fontSize: 56, color: "rgba(255,255,255,0.85)", letterSpacing: 20 }}>
          谢 谢 观 看
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ========== 主合成 ========== */
const PiezoIgnition = () => {
  const f = useCurrentFrame();

  const [handle] = React.useState(() => delayRender("fonts"));
  React.useEffect(() => {
    let done = false;
    const fin = () => { if (!done) { done = true; continueRender(handle); } };
    if (typeof document !== "undefined" && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(fin).catch(fin);
    } else fin();
    const t = setTimeout(fin, 5000);
    return () => clearTimeout(t);
  }, [handle]);

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: F }}>
      {sndClick && <Audio src={sndClick} startFrom={55} volume={0.8} />}
      {sndZap && <Audio src={sndZap} startFrom={72} volume={0.9} />}
      {sndWhoosh && <Audio src={sndWhoosh} startFrom={95} volume={0.6} />}
      {sndZap && <Audio src={sndZap} startFrom={1390} volume={0.85} />}
      {sndBoom && <Audio src={sndBoom} startFrom={1810} volume={0.8} />}

      <Sequence from={0} durationInFrames={285}>
        <SceneOpening />
      </Sequence>
      <Sequence from={285} durationInFrames={340}>
        <SceneStructure />
      </Sequence>
      <Sequence from={625} durationInFrames={410}>
        <ScenePiezo />
      </Sequence>
      <Sequence from={1035} durationInFrames={425}>
        <SceneSpark />
      </Sequence>
      <Sequence from={1460} durationInFrames={485}>
        <SceneCombustion />
      </Sequence>
      <Sequence from={1945} durationInFrames={305}>
        <SceneSummary />
      </Sequence>

      <SubBar />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: "rgba(255,255,255,0.08)" }}>
        <div style={{ height: "100%", width: `${(f / TOTAL) * 100}%`, background: "linear-gradient(90deg,#00d4ff,#ff6622)" }} />
      </div>
      <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse at center, transparent 55%, rgba(2,4,12,0.5) 100%)" }} />
      <AbsoluteFill style={{ background: "#000", opacity: interpolate(f, [TOTAL - 25, TOTAL - 3], [0, 1], clamp), pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export const RemotionRoot = () => (
  <Composition id="ShortCircuitVideo" component={PiezoIgnition} durationInFrames={TOTAL} fps={30} width={1920} height={1080} />
);

registerRoot(RemotionRoot);
