// src/Root.jsx — 汽油机与柴油机原理科普动画
// 合成 id: ShortCircuitVideo（对应 render.yml）

import * as Remotion from "remotion";
import React from "react";

const {
  AbsoluteFill, Audio, Composition, Sequence,
  interpolate, spring: _spring, useCurrentFrame,
  registerRoot, delayRender, continueRender,
} = Remotion;

const spring = (o) => _spring({ fps: 30, ...o });
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };

if (typeof document !== "undefined" && !document.getElementById("ef")) {
  const st = document.createElement("style");
  st.id = "ef";
  st.textContent = "@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700;900&display=swap');";
  document.head.appendChild(st);
}

const F = '"Noto Sans SC","Noto Sans CJK SC",sans-serif';

const C = {
  bg: "#060a18", blue: "#4488ff", lblue: "#66bbff", orange: "#ff6622",
  red: "#ff4422", yellow: "#ffcc44", green: "#44dd88", text: "#e8f0ff",
  sub: "#8899bb", gold: "#ffd76a", white: "#fff",
};

const TOTAL = 2250;
const rnd = (i) => { const x = Math.sin(i * 127.1) * 43758.5453; return x - Math.floor(x); };

/* ========== 音效 ========== */
let AC = null;
const getCtx = () => { if (!AC) { const W = typeof window !== "undefined" ? window : globalThis; AC = W.AudioContext || W.webkitAudioContext; } return AC ? new AC() : null; };
const toWav = (buf) => {
  const nc = buf.numberOfChannels, len = buf.length * nc * 2, ab = new ArrayBuffer(44 + len), dv = new DataView(ab);
  const ws = (o, s) => { for (let k = 0; k < s.length; k++) dv.setUint8(o + k, s.charCodeAt(k)); };
  ws(0, "RIFF"); dv.setUint32(4, 36 + len, true); ws(8, "WAVE"); ws(12, "fmt ");
  dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, nc, true);
  dv.setUint32(24, buf.sampleRate, true); dv.setUint32(28, buf.sampleRate * nc * 2, true);
  dv.setUint16(32, nc * 2, true); dv.setUint16(34, 16, true); ws(36, "data"); dv.setUint32(40, len, true);
  let off = 44; const ch = []; for (let c = 0; c < nc; c++) ch.push(buf.getChannelData(c));
  for (let i = 0; i < buf.length; i++) for (let c = 0; c < nc; c++) { const s = Math.max(-1, Math.min(1, ch[c][i])); dv.setInt16(off, s < 0 ? s * 32768 : s * 32767, true); off += 2; }
  let bin = ""; const bytes = new Uint8Array(ab);
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return "data:audio/wav;base64," + btoa(bin);
};
const build = (sec, fn) => { const ctx = getCtx(); if (!ctx) return ""; const sr = ctx.sampleRate; const buf = ctx.createBuffer(1, Math.floor(sr * sec), sr); const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = fn(i / sr, i); const uri = toWav(buf); ctx.close(); return uri; };
const nz = (i) => ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1 * 2 - 1;

const sndEngine = build(2.0, (t) => { const freq = 35 + 15 * Math.sin(t * 6); return Math.sin(2 * Math.PI * freq * t) * 0.18 + Math.sin(2 * Math.PI * freq * 2 * t) * 0.1 + nz(Math.floor(t * 22050)) * 0.06; });
const sndSpark = build(0.2, (t) => nz(Math.floor(t * 44100)) * Math.exp(-t * 50) * 0.5 + Math.sin(2 * Math.PI * 2000 * t) * 0.25 * Math.exp(-t * 25));
const sndBoom = build(0.8, (t) => Math.sin(2 * Math.PI * 55 * t) * 0.35 * Math.exp(-t * 5) + nz(Math.floor(t * 11025)) * 0.2 * Math.exp(-t * 8));

/* ========== 字幕 ========== */
const SUBS = [
  { t: "汽车的心脏——发动机", s: 15, e: 145 },
  { t: "汽油机与柴油机，原理大不同", s: 145, e: 285 },
  { t: "四冲程发动机：吸气→压缩→做功→排气", s: 295, e: 385 },
  { t: "吸气冲程：活塞下行，进气门打开", s: 385, e: 475 },
  { t: "新鲜可燃混合气被吸入气缸", s: 475, e: 535 },
  { t: "压缩冲程：活塞上行，混合气被压缩升温", s: 535, e: 625 },
  { t: "做功冲程：燃料燃烧爆发，推动活塞下行！", s: 625, e: 710 },
  { t: "排气冲程：活塞上行，废气排出气缸", s: 710, e: 780 },
  { t: "汽油机：使用火花塞点火", s: 790, e: 885 },
  { t: "汽油与空气混合后进入气缸", s: 885, e: 975 },
  { t: "压缩到上止点时，火花塞放电点燃混合气", s: 975, e: 1070 },
  { t: "压缩比较低：8～12，转速高，噪音小", s: 1070, e: 1140 },
  { t: "柴油机：压燃式，不需要火花塞", s: 1150, e: 1245 },
  { t: "空气先被吸入并高度压缩，温度急剧升高", s: 1245, e: 1340 },
  { t: "压缩比很高：16～22，温度超过柴油燃点", s: 1340, e: 1430 },
  { t: "柴油在高压下喷入气缸，瞬间自燃！", s: 1430, e: 1530 },
  { t: "汽油机 vs 柴油机，核心区别", s: 1540, e: 1630 },
  { t: "点火方式：火花塞点火 vs 压缩自燃", s: 1630, e: 1715 },
  { t: "压缩比：8~12 vs 16~22", s: 1715, e: 1790 },
  { t: "汽油机转速高噪音小，柴油机扭矩大效率高", s: 1790, e: 1890 },
  { t: "四冲程循环，一个都不能少", s: 1900, e: 1995 },
  { t: "汽油机靠火花点火，柴油机靠压缩自燃", s: 1995, e: 2110 },
  { t: "科学就在你身边，感谢观看！", s: 2110, e: 2250 },
];

const SubBar = () => {
  const f = useCurrentFrame();
  const c = SUBS.find((s) => f >= s.s && f < s.e);
  if (!c) return null;
  const fi = interpolate(f, [c.s, c.s + 10], [0, 1], clamp);
  const fo = interpolate(f, [c.e - 10, c.e], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", bottom: 52, left: 80, right: 80, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ background: "rgba(0,0,0,0.8)", borderRadius: 18, padding: "20px 48px", opacity: Math.min(fi, fo), transform: `translateY(${(1 - fi) * 10}px)`, border: "1px solid rgba(100,160,255,0.15)", maxWidth: "88%" }}>
        <div style={{ fontFamily: F, fontWeight: 700, fontSize: 42, color: "#fff", textAlign: "center", lineHeight: 1.5, letterSpacing: 2 }}>{c.t}</div>
      </div>
    </div>
  );
};

/* ========== 粒子 ========== */
const ParticleField = ({ count = 16, c1 = C.blue, c2 = C.lblue }) => {
  const f = useCurrentFrame();
  return <>{Array.from({ length: count }).map((_, i) => {
    const x = ((Math.sin(f * 0.012 + i * 13.7) * 0.5 + 0.5) * 1920);
    const y = ((f * (0.5 + (i % 3) * 0.3) + i * 210) % 1250) - 80;
    const r = 1.5 + (i % 3) * 2;
    return <div key={i} style={{ position: "absolute", left: x, top: y, width: r * 2, height: r * 2, borderRadius: "50%", background: i % 2 ? c1 : c2, opacity: 0.12 + 0.18 * Math.abs(Math.sin(f * 0.07 + i * 1.9)) }} />;
  })}</>;
};

/* ========== 发动机 SVG ========== */
const EngineSVG = ({ isGasoline = true, cycleFrame = 0, w = 500, h = 700, label = "" }) => {
  const f = useCurrentFrame();
  const CYCLE = 120;
  const cf = ((cycleFrame % CYCLE) + CYCLE) % CYCLE;
  const angle = (cf / CYCLE) * 4 * Math.PI;
  const pp = (1 - Math.cos(angle)) / 2;
  const TDC = 175, BDC = 415, pistonH = 55;
  const pistonY = TDC + (BDC - TDC) * pp;
  const stroke = Math.floor(cf / 30);
  const sp = (cf % 30) / 30;
  const intakeOpen = stroke === 0 ? Math.sin(sp * Math.PI) * 16 : 0;
  const exhaustOpen = stroke === 3 ? Math.sin(sp * Math.PI) * 16 : 0;
  let gasColor, gasOp;
  if (stroke === 0) { gasColor = "#4488ff"; gasOp = sp * 0.35; }
  else if (stroke === 1) { gasColor = "#66bbff"; gasOp = 0.35; }
  else if (stroke === 2) { gasColor = sp < 0.12 ? "#ff4422" : "#ff6622"; gasOp = sp < 0.12 ? 0.35 + sp * 2.5 : 0.65 * Math.exp(-(sp - 0.12) * 2.5) + 0.12; }
  else { gasColor = "#667788"; gasOp = 0.3 * (1 - sp * 0.5); }
  const sparkF = isGasoline && stroke === 2 && sp < 0.12 ? 1 - sp / 0.12 : 0;
  const injectF = !isGasoline && stroke === 2 && sp < 0.08 ? 1 - sp / 0.08 : 0;
  const crankR = 65, crankCx = 250, crankCy = 565;
  const crankX = crankCx + Math.sin(angle) * crankR;
  const crankY = crankCy - Math.cos(angle) * crankR;
  const wallL = 130, wallR = 370, headY = 130, cx = 250;
  const strokeNames = ["吸气", "压缩", isGasoline ? "做功·点火" : "做功·压燃", "排气"];
  const strokeColors = ["#4488ff", "#66bbff", "#ff4422", "#667788"];

  return (
    <svg width={w} height={h} viewBox="0 0 500 700">
      <defs>
        <radialGradient id="cg1"><stop offset="0%" stopColor="#ff8844" stopOpacity="0.7" /><stop offset="100%" stopColor="#ff4422" stopOpacity="0" /></radialGradient>
      </defs>
      {/* 气缸壁 */}
      <rect x={wallL - 12} y={headY} width={12} height={440} fill="#2a3a5c" rx={2} />
      <rect x={wallR} y={headY} width={12} height={440} fill="#2a3a5c" rx={2} />
      <rect x={wallL - 12} y={headY - 22} width={wallR - wallL + 24} height={22} fill="#2a3a5c" rx={4} />
      {/* 气体 */}
      <rect x={wallL} y={headY} width={wallR - wallL} height={Math.max(0, pistonY - headY)} fill={gasColor} opacity={gasOp} />
      {/* 燃烧辉光 */}
      {stroke === 2 && sp < 0.4 && <circle cx={cx} cy={headY + (pistonY - headY) / 2} r={100 * Math.max(0, 1 - sp * 2.5)} fill="url(#cg1)" opacity={0.5} />}
      {/* 气体粒子 */}
      {Array.from({ length: 16 }).map((_, i) => {
        const px = wallL + 12 + rnd(i * 7.3) * (wallR - wallL - 24);
        const py = headY + 8 + rnd(i * 3.7) * Math.max(1, pistonY - headY - 16);
        return <circle key={i} cx={px + Math.sin(f * 0.12 + i * 2.1) * 3} cy={py + Math.cos(f * 0.1 + i * 1.7) * 3} r={2.5 + rnd(i) * 1.5} fill={gasColor} opacity={Math.min(0.6, gasOp * 1.2)} />;
      })}
      {/* 活塞 */}
      <rect x={wallL + 2} y={pistonY} width={wallR - wallL - 4} height={pistonH} fill="#7788aa" rx={3} />
      <rect x={wallL + 2} y={pistonY + 6} width={wallR - wallL - 4} height={3} fill="#556677" />
      <rect x={wallL + 2} y={pistonY + 15} width={wallR - wallL - 4} height={3} fill="#556677" />
      <circle cx={cx} cy={pistonY + pistonH - 10} r={7} fill="#556677" />
      {/* 连杆 + 曲轴 */}
      <line x1={cx} y1={pistonY + pistonH - 10} x2={crankX} y2={crankY} stroke="#667788" strokeWidth={8} strokeLinecap="round" />
      <circle cx={crankCx} cy={crankCy} r={crankR} fill="none" stroke="rgba(100,120,150,0.12)" strokeWidth={1.5} />
      <line x1={crankCx} y1={crankCy} x2={crankX} y2={crankY} stroke="#556677" strokeWidth={10} strokeLinecap="round" />
      <circle cx={crankCx} cy={crankCy} r={8} fill="#556677" />
      <circle cx={crankX} cy={crankY} r={6} fill="#667788" />
      {/* 进气门 */}
      <g transform={`translate(0,${-intakeOpen})`}>
        <rect x={wallL + 25} y={headY - 16} width={22} height={24} fill="#88aacc" rx={2} />
        <rect x={wallL + 33} y={headY - 48} width={6} height={36} fill="#88aacc" />
      </g>
      <rect x={wallL - 35} y={headY - 30} width={38} height={28} fill="rgba(68,136,255,0.15)" rx={4} />
      <text x={wallL - 16} y={headY - 36} textAnchor="middle" fill="#88aacc" fontSize={12} fontFamily={F}>进气门</text>
      {/* 排气门 */}
      <g transform={`translate(0,${-exhaustOpen})`}>
        <rect x={wallR - 47} y={headY - 16} width={22} height={24} fill="#cc8888" rx={2} />
        <rect x={wallR - 39} y={headY - 48} width={6} height={36} fill="#cc8888" />
      </g>
      <rect x={wallR - 3} y={headY - 30} width={38} height={28} fill="rgba(150,100,100,0.15)" rx={4} />
      <text x={wallR + 16} y={headY - 36} textAnchor="middle" fill="#cc8888" fontSize={12} fontFamily={F}>排气门</text>
      {/* 火花塞 / 喷油嘴 */}
      {isGasoline ? (
        <g>
          <rect x={cx - 7} y={headY - 48} width={14} height={40} fill="#aabbcc" rx={2} />
          <rect x={cx - 4} y={headY - 8} width={8} height={12} fill="#8899aa" />
          {sparkF > 0 && <g opacity={sparkF}>
            <circle cx={cx} cy={headY + 5} r={12 * sparkF} fill="rgba(255,255,255,0.7)" />
            <circle cx={cx} cy={headY + 5} r={22 * sparkF} fill="rgba(100,200,255,0.3)" />
            <line x1={cx - 6} y1={headY + 2} x2={cx + 6} y2={headY + 8} stroke="#fff" strokeWidth={2.5} />
            <line x1={cx - 6} y1={headY + 8} x2={cx + 6} y2={headY + 2} stroke="#fff" strokeWidth={2.5} />
          </g>}
          <text x={cx} y={headY - 55} textAnchor="middle" fill="#aabbcc" fontSize={12} fontWeight={700} fontFamily={F}>火花塞</text>
        </g>
      ) : (
        <g>
          <rect x={cx - 9} y={headY - 48} width={18} height={40} fill="#aacc88" rx={2} />
          <rect x={cx - 5} y={headY - 8} width={10} height={12} fill="#88aa66" />
          {injectF > 0 && <g opacity={injectF}>
            {Array.from({ length: 7 }).map((_, i) => (
              <line key={i} x1={cx} y1={headY + 4} x2={cx + (i - 3) * 22} y2={headY + 30 + i * 4} stroke="#ffcc44" strokeWidth={1.5} opacity={0.7} />
            ))}
          </g>}
          <text x={cx} y={headY - 55} textAnchor="middle" fill="#aacc88" fontSize={12} fontWeight={700} fontFamily={F}>喷油嘴</text>
        </g>
      )}
      {/* 冲程标签 */}
      <text x={cx} y={660} textAnchor="middle" fill={strokeColors[stroke]} fontSize={26} fontWeight={700} fontFamily={F}>{strokeNames[stroke]}冲程</text>
      {label && <text x={cx} y={690} textAnchor="middle" fill={C.sub} fontSize={18} fontFamily={F}>{label}</text>}
    </svg>
  );
};

/* ========== 四冲程进度条 ========== */
const StrokeBar = ({ stroke }) => {
  const names = ["吸气", "压缩", "做功", "排气"];
  const colors = [C.blue, C.lblue, C.red, "#667788"];
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 16, alignItems: "center" }}>
      {names.map((n, i) => (
        <React.Fragment key={i}>
          <div style={{
            padding: "12px 28px", borderRadius: 12, fontFamily: F, fontWeight: 700, fontSize: 26,
            background: i === stroke ? `${colors[i]}22` : "rgba(255,255,255,0.04)",
            border: `2px solid ${i === stroke ? colors[i] : "rgba(255,255,255,0.1)"}`,
            color: i === stroke ? colors[i] : C.sub, transition: "all 0.3s",
          }}>{i + 1}. {n}</div>
          {i < 3 && <div style={{ color: C.sub, fontSize: 22 }}>→</div>}
        </React.Fragment>
      ))}
    </div>
  );
};

/* ========== 场景 1：开场 ========== */
const SceneOpen = () => {
  const f = useCurrentFrame();
  const rise = spring({ frame: f, config: { damping: 14, stiffness: 60 }, durationInFrames: 50 });
  const titleO = interpolate(f, [30, 70], [0, 1], clamp);
  const subO = interpolate(f, [70, 110], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 55%, #0c1530 0%, ${C.bg} 70%)` }}>
      <ParticleField />
      <div style={{ position: "absolute", left: "50%", top: 160, transform: `translateX(-50%) translateY(${(1 - rise) * 250}px) scale(${0.85 + rise * 0.15})` }}>
        <EngineSVG isGasoline={true} cycleFrame={f * 0.8} w={380} h={532} />
      </div>
      <div style={{ position: "absolute", top: 120, width: 1920, textAlign: "center", opacity: titleO }}>
        <div style={{ fontFamily: F, fontWeight: 900, fontSize: 88, color: C.gold, letterSpacing: 8, textShadow: "0 0 40px rgba(255,200,80,0.4)" }}>汽油机 vs 柴油机</div>
      </div>
      <div style={{ position: "absolute", top: 240, width: 1920, textAlign: "center", opacity: subO }}>
        <div style={{ fontFamily: F, fontSize: 34, color: C.sub, letterSpacing: 12 }}>原理与区别 · 物理科普</div>
      </div>
    </AbsoluteFill>
  );
};

/* ========== 场景 2：四冲程循环 ========== */
const SceneFourStroke = () => {
  const f = useCurrentFrame();
  const cycleFrame = f * (1 / 3);
  const stroke = Math.floor((cycleFrame % 120) / 30);
  const info = [
    { name: "吸气冲程", desc: "活塞下行，进气门打开\n新鲜混合气进入气缸", color: C.blue },
    { name: "压缩冲程", desc: "活塞上行，气门全闭\n混合气被压缩升温", color: C.lblue },
    { name: "做功冲程", desc: "燃料燃烧爆发\n推动活塞下行做功", color: C.red },
    { name: "排气冲程", desc: "活塞上行，排气门打开\n废气被排出气缸", color: "#667788" },
  ];
  const cur = info[stroke];
  const infoO = interpolate(f, [10, 30], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, #0c1530 0%, ${C.bg} 70%)` }}>
      <ParticleField count={10} />
      <div style={{ position: "absolute", top: 30, width: 1920, textAlign: "center" }}>
        <div style={{ fontFamily: F, fontWeight: 900, fontSize: 50, color: C.text, letterSpacing: 6, opacity: interpolate(f, [0, 20], [0, 1], clamp) }}>四冲程发动机工作循环</div>
        <div style={{ marginTop: 18 }}><StrokeBar stroke={stroke} /></div>
      </div>
      {/* 发动机 */}
      <div style={{ position: "absolute", left: 200, top: 180 }}>
        <EngineSVG isGasoline={true} cycleFrame={cycleFrame} w={520} h={728} />
      </div>
      {/* 信息面板 */}
      <div style={{ position: "absolute", right: 160, top: 280, width: 680, opacity: infoO }}>
        <div style={{ background: "rgba(255,255,255,0.04)", border: `2px solid ${cur.color}44`, borderRadius: 20, padding: "36px 40px" }}>
          <div style={{ fontFamily: F, fontWeight: 900, fontSize: 52, color: cur.color, marginBottom: 16 }}>{cur.name}</div>
          <div style={{ fontFamily: F, fontSize: 30, color: C.text, lineHeight: 2, whiteSpace: "pre-line" }}>{cur.desc}</div>
        </div>
        {/* 状态指示 */}
        <div style={{ marginTop: 24, display: "flex", gap: 16 }}>
          {[{ l: "进气门", o: stroke === 0, c: C.blue }, { l: "排气门", o: stroke === 3, c: "#cc8888" }].map((v, i) => (
            <div key={i} style={{ padding: "10px 22px", borderRadius: 10, border: `2px solid ${v.o ? v.c : "rgba(255,255,255,0.1)"}`, color: v.o ? v.c : C.sub, fontFamily: F, fontSize: 22, fontWeight: 700 }}>
              {v.l}：{v.o ? "开启" : "关闭"}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ========== 场景 3/4：汽油机/柴油机详情 ========== */
const EngineDetail = ({ isGasoline }) => {
  const f = useCurrentFrame();
  const cycleFrame = f * 1.2;
  const points = isGasoline
    ? [{ t: "汽油与空气形成混合气", c: C.blue }, { t: "混合气进入气缸", c: C.blue }, { t: "压缩比 8～12", c: C.lblue }, { t: "火花塞放电点火", c: C.yellow }, { t: "转速高 · 噪音小", c: C.green }]
    : [{ t: "空气单独进入气缸", c: C.blue }, { t: "高压压缩空气升温", c: C.orange }, { t: "压缩比 16～22", c: C.red }, { t: "柴油喷入后瞬间自燃", c: C.yellow }, { t: "扭矩大 · 效率高", c: C.green }];

  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, ${isGasoline ? "#0c1530" : "#1a0c18"} 0%, ${C.bg} 70%)` }}>
      <ParticleField count={12} c1={isGasoline ? C.blue : C.orange} c2={isGasoline ? C.lblue : C.yellow} />
      <div style={{ position: "absolute", top: 50, width: 1920, textAlign: "center" }}>
        <div style={{ fontFamily: F, fontWeight: 900, fontSize: 56, color: isGasoline ? C.blue : C.orange, letterSpacing: 6 }}>
          {isGasoline ? "汽油机 · 火花塞点火" : "柴油机 · 压缩自燃"}
        </div>
        <div style={{ fontFamily: F, fontSize: 26, color: C.sub, letterSpacing: 4, marginTop: 8 }}>
          {isGasoline ? "Otto 循环" : "Diesel 循环"}
        </div>
      </div>
      <div style={{ position: "absolute", left: isGasoline ? 180 : 200, top: 180 }}>
        <EngineSVG isGasoline={isGasoline} cycleFrame={cycleFrame} w={500} h={700} />
      </div>
      <div style={{ position: "absolute", right: 140, top: 220, width: 700 }}>
        {points.map((p, i) => {
          const t = spring({ frame: f - 20 - i * 28, config: { damping: 12, stiffness: 110 }, durationInFrames: 22 });
          return (
            <div key={i} style={{
              marginBottom: 22, padding: "22px 32px", borderRadius: 16,
              background: "rgba(255,255,255,0.04)", border: `2px solid ${p.c}33`,
              opacity: t, transform: `translateX(${(1 - t) * 40}px)`,
            }}>
              <div style={{ fontFamily: F, fontSize: 30, color: p.c, fontWeight: 700, letterSpacing: 3 }}>{p.t}</div>
            </div>
          );
        })}
        {/* 关键参数 */}
        <div style={{ marginTop: 30, display: "flex", gap: 20, opacity: interpolate(f, [180, 210], [0, 1], clamp) }}>
          <div style={{ flex: 1, padding: "20px 24px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", textAlign: "center" }}>
            <div style={{ fontFamily: F, fontSize: 20, color: C.sub }}>压缩比</div>
            <div style={{ fontFamily: F, fontSize: 38, fontWeight: 900, color: isGasoline ? C.lblue : C.red }}>{isGasoline ? "8~12" : "16~22"}</div>
          </div>
          <div style={{ flex: 1, padding: "20px 24px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", textAlign: "center" }}>
            <div style={{ fontFamily: F, fontSize: 20, color: C.sub }}>热效率</div>
            <div style={{ fontFamily: F, fontSize: 38, fontWeight: 900, color: C.green }}>{isGasoline ? "~35%" : "~45%"}</div>
          </div>
          <div style={{ flex: 1, padding: "20px 24px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", textAlign: "center" }}>
            <div style={{ fontFamily: F, fontSize: 20, color: C.sub }}>燃料</div>
            <div style={{ fontFamily: F, fontSize: 38, fontWeight: 900, color: isGasoline ? C.gold : C.orange }}>{isGasoline ? "汽油" : "柴油"}</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ========== 场景 5：对比 ========== */
const SceneCompare = () => {
  const f = useCurrentFrame();
  const rows = [
    { k: "点火方式", g: "火花塞点火", d: "压缩自燃", gc: C.yellow, dc: C.orange },
    { k: "压缩比", g: "8 ~ 12", d: "16 ~ 22", gc: C.lblue, dc: C.red },
    { k: "热效率", g: "~35%", d: "~45%", gc: C.green, dc: C.green },
    { k: "特点", g: "转速高·噪音小", d: "扭矩大·油耗低", gc: C.text, dc: C.text },
    { k: "应用", g: "家用轿车", d: "卡车·船舶", gc: C.blue, dc: C.orange },
  ];
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, #0c1530 0%, ${C.bg} 70%)` }}>
      <ParticleField count={10} />
      <div style={{ position: "absolute", top: 40, width: 1920, textAlign: "center" }}>
        <div style={{ fontFamily: F, fontWeight: 900, fontSize: 56, color: C.gold, letterSpacing: 8 }}>汽油机 vs 柴油机</div>
      </div>
      {/* 两台发动机 */}
      <div style={{ position: "absolute", left: 60, top: 170 }}>
        <EngineSVG isGasoline={true} cycleFrame={f * 1.2} w={340} h={476} label="汽油机" />
      </div>
      <div style={{ position: "absolute", right: 60, top: 170 }}>
        <EngineSVG isGasoline={false} cycleFrame={f * 1.2} w={340} h={476} label="柴油机" />
      </div>
      {/* 对比表 */}
      <div style={{ position: "absolute", left: 440, right: 440, top: 160 }}>
        {rows.map((r, i) => {
          const t = spring({ frame: f - 15 - i * 30, config: { damping: 12, stiffness: 110 }, durationInFrames: 22 });
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "20px 28px", marginBottom: 14, borderRadius: 14,
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
              opacity: t, transform: `translateY(${(1 - t) * 20}px)`,
            }}>
              <div style={{ fontFamily: F, fontSize: 26, color: C.sub, fontWeight: 700, width: 140 }}>{r.k}</div>
              <div style={{ fontFamily: F, fontSize: 28, color: r.gc, fontWeight: 700, width: 320, textAlign: "center" }}>{r.g}</div>
              <div style={{ fontFamily: F, fontSize: 28, color: C.sub }}>vs</div>
              <div style={{ fontFamily: F, fontSize: 28, color: r.dc, fontWeight: 700, width: 320, textAlign: "center" }}>{r.d}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ========== 场景 6：总结 ========== */
const SceneSummary = () => {
  const f = useCurrentFrame();
  const titleO = interpolate(f, [0, 25], [0, 1], clamp);
  const steps = [
    { t: "吸气", icon: "↓", c: C.blue }, { t: "压缩", icon: "↑", c: C.lblue },
    { t: "做功", icon: "⚡", c: C.red }, { t: "排气", icon: "↑", c: "#667788" },
  ];
  const endO = interpolate(f, [180, 220], [0, 1], clamp);
  const thanksO = interpolate(f, [220, 260], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, #0c1530 0%, ${C.bg} 70%)` }}>
      <ParticleField count={14} />
      <div style={{ position: "absolute", top: 60, width: 1920, textAlign: "center", opacity: titleO }}>
        <div style={{ fontFamily: F, fontWeight: 900, fontSize: 58, color: C.gold, letterSpacing: 8 }}>总结</div>
      </div>
      {/* 四冲程图标 */}
      <div style={{ position: "absolute", top: 200, width: 1920, display: "flex", justifyContent: "center", gap: 24 }}>
        {steps.map((s, i) => {
          const t = spring({ frame: f - 25 - i * 20, config: { damping: 12, stiffness: 110 }, durationInFrames: 22 });
          return (
            <React.Fragment key={i}>
              <div style={{
                width: 180, padding: "28px 18px", borderRadius: 20, textAlign: "center",
                background: "rgba(255,255,255,0.04)", border: `2px solid ${s.c}44`,
                opacity: t, transform: `translateY(${(1 - t) * 30}px) scale(${0.85 + t * 0.15})`,
              }}>
                <div style={{ fontSize: 44, color: s.c }}>{s.icon}</div>
                <div style={{ fontFamily: F, fontWeight: 900, fontSize: 28, color: s.c, marginTop: 8 }}>{s.t}</div>
              </div>
              {i < 3 && <div style={{ alignSelf: "center", fontSize: 36, color: C.sub, opacity: t }}>→</div>}
            </React.Fragment>
          );
        })}
      </div>
      {/* 核心对比 */}
      <div style={{ position: "absolute", top: 450, width: 1920, display: "flex", justifyContent: "center", gap: 60, opacity: endO }}>
        <div style={{ padding: "30px 44px", borderRadius: 18, background: "rgba(68,136,255,0.08)", border: "2px solid rgba(68,136,255,0.3)", textAlign: "center" }}>
          <div style={{ fontFamily: F, fontWeight: 900, fontSize: 36, color: C.blue }}>汽油机</div>
          <div style={{ fontFamily: F, fontSize: 24, color: C.text, marginTop: 12, lineHeight: 1.8 }}>火花塞点火<br />低压缩比 · 转速高</div>
        </div>
        <div style={{ padding: "30px 44px", borderRadius: 18, background: "rgba(255,102,34,0.08)", border: "2px solid rgba(255,102,34,0.3)", textAlign: "center" }}>
          <div style={{ fontFamily: F, fontWeight: 900, fontSize: 36, color: C.orange }}>柴油机</div>
          <div style={{ fontFamily: F, fontSize: 24, color: C.text, marginTop: 12, lineHeight: 1.8 }}>压缩自燃<br />高压缩比 · 效率高</div>
        </div>
      </div>
      {/* 结尾 */}
      <div style={{ position: "absolute", top: 720, width: 1920, textAlign: "center", opacity: endO }}>
        <div style={{ fontFamily: F, fontSize: 34, color: C.gold, letterSpacing: 6 }}>科学就在你身边</div>
      </div>
      <div style={{ position: "absolute", bottom: 140, width: 1920, textAlign: "center", opacity: thanksO }}>
        <div style={{ fontFamily: F, fontWeight: 900, fontSize: 56, color: "rgba(255,255,255,0.85)", letterSpacing: 20 }}>谢 谢 观 看</div>
      </div>
    </AbsoluteFill>
  );
};

/* ========== 主合成 ========== */
const EngineScience = () => {
  const f = useCurrentFrame();
  const [handle] = React.useState(() => delayRender("fonts"));
  React.useEffect(() => {
    let done = false;
    const fin = () => { if (!done) { done = true; continueRender(handle); } };
    if (typeof document !== "undefined" && document.fonts && document.fonts.ready) document.fonts.ready.then(fin).catch(fin); else fin();
    const t = setTimeout(fin, 5000);
    return () => clearTimeout(t);
  }, [handle]);

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: F }}>
      {sndEngine && <Audio src={sndEngine} volume={0.12} />}
      {sndSpark && <Audio src={sndSpark} startFrom={830} volume={0.7} />}
      {sndBoom && <Audio src={sndBoom} startFrom={860} volume={0.6} />}
      {sndSpark && <Audio src={sndSpark} startFrom={1390} volume={0.6} />}
      {sndBoom && <Audio src={sndBoom} startFrom={1420} volume={0.5} />}

      <Sequence from={0} durationInFrames={285}><SceneOpen /></Sequence>
      <Sequence from={285} durationInFrames={495}><SceneFourStroke /></Sequence>
      <Sequence from={780} durationInFrames={360}><EngineDetail isGasoline={true} /></Sequence>
      <Sequence from={1140} durationInFrames={390}><EngineDetail isGasoline={false} /></Sequence>
      <Sequence from={1530} durationInFrames={360}><SceneCompare /></Sequence>
      <Sequence from={1890} durationInFrames={360}><SceneSummary /></Sequence>

      <SubBar />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: "rgba(255,255,255,0.08)" }}>
        <div style={{ height: "100%", width: `${(f / TOTAL) * 100}%`, background: "linear-gradient(90deg,#4488ff,#ff6622)" }} />
      </div>
      <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse at center, transparent 55%, rgba(2,4,12,0.5) 100%)" }} />
      <AbsoluteFill style={{ background: "#000", opacity: interpolate(f, [TOTAL - 25, TOTAL - 3], [0, 1], clamp), pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export const RemotionRoot = () => (
  <Composition id="ShortCircuitVideo" component={EngineScience} durationInFrames={TOTAL} fps={30} width={1920} height={1080} />
);

registerRoot(RemotionRoot);