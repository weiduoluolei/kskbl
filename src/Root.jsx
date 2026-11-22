// src/Root.jsx — 我的人生函数图像 v3
// 修改：镜头拉远缩小 / 巅峰光粒子爆发 / 整体更有机更有活力

import React from "react";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring as _spring,
  useCurrentFrame,
  registerRoot,
  delayRender,
  continueRender,
} from "remotion";

const spring = (o) => _spring({ fps: 30, ...o });

if (typeof document !== "undefined" && !document.getElementById("lf")) {
  const st = document.createElement("style");
  st.id = "lf";
  st.textContent =
    "@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700;900&display=swap');";
  document.head.appendChild(st);
}

const F = '"Noto Sans SC","Noto Sans CJK SC",sans-serif';
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const TOTAL = 2250;
const SW = 12000;
const SH = 5000;
const YB = 4600;
const YT = 400;

const FD = [
  [0,20],[.015,22],[.03,26],[.045,31],[.06,36],[.075,40],[.09,43],[.105,46],
  [.12,48],[.135,50],[.15,52],
  [.16,200],[.165,2000],[.17,6000],[.175,11000],[.18,14500],[.185,15800],[.19,16000],
  [.21,15900],[.24,15700],[.27,15500],[.3,15350],[.35,15150],[.4,15000],
  [.45,14850],[.5,14650],[.55,14450],[.6,14300],[.65,14200],[.68,14150],[.71,14080],
  [.725,15500],[.74,16800],[.755,17600],[.77,17950],[.79,18100],
  [.82,18250],[.85,18400],[.875,18550],[.885,18800],
  [.895,21000],[.905,26000],[.915,32000],[.925,35500],[.935,37200],[.945,37900],
  [.955,38100],[.97,38150],[1,38200],
];
const pts = FD.map(([p, fan]) => [p * SW, YB - (fan / 40000) * (YB - YT)]);

function smoothPath(pp) {
  if (pp.length < 2) return "";
  let d = `M${pp[0][0].toFixed(1)},${pp[0][1].toFixed(1)}`;
  for (let i = 0; i < pp.length - 1; i++) {
    const p0 = pp[Math.max(0, i - 1)], p1 = pp[i], p2 = pp[i + 1], p3 = pp[Math.min(pp.length - 1, i + 2)];
    d += ` C${(p1[0]+(p2[0]-p0[0])/6).toFixed(1)},${(p1[1]+(p2[1]-p0[1])/6).toFixed(1)} ${(p2[0]-(p3[0]-p1[0])/6).toFixed(1)},${(p2[1]-(p3[1]-p1[1])/6).toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}
const curveD = smoothPath(pts);
const fillD = curveD + ` L${SW},${YB} L0,${YB} Z`;

/* ========== 相机（拉远，缩小缩放比） ========== */
const CAM = [
  { f: 0, cx: 400, cy: 4300, s: 1.6 },
  { f: 60, cx: 500, cy: 4320, s: 1.5 },
  { f: 130, cx: 500, cy: 4320, s: 1.5 },
  { f: 330, cx: 1200, cy: 4200, s: 1.3 },
  { f: 475, cx: 1400, cy: 4180, s: 1.2 },
  { f: 560, cx: 1800, cy: 3800, s: 1.0 },
  { f: 650, cx: 2400, cy: 2600, s: 0.75 },
  { f: 800, cx: 2500, cy: 2500, s: 0.72 },
  { f: 985, cx: 3800, cy: 3100, s: 0.7 },
  { f: 1125, cx: 4800, cy: 3050, s: 0.68 },
  { f: 1330, cx: 8000, cy: 2800, s: 0.8 },
  { f: 1415, cx: 8400, cy: 2700, s: 0.75 },
  { f: 1495, cx: 8700, cy: 2600, s: 0.72 },
  { f: 1570, cx: 9500, cy: 1800, s: 0.55 },
  { f: 1650, cx: 10600, cy: 800, s: 0.38 },
  { f: 1820, cx: 10800, cy: 700, s: 0.35 },
  { f: 2000, cx: 7500, cy: 2200, s: 0.26 },
  { f: 2120, cx: 6500, cy: 2400, s: 0.23 },
  { f: 2250, cx: 6200, cy: 2500, s: 0.22 },
];

function camAt(f) {
  if (f <= CAM[0].f) return { ...CAM[0] };
  for (let i = 0; i < CAM.length - 1; i++) {
    const a = CAM[i], b = CAM[i + 1];
    if (f >= a.f && f <= b.f) {
      const t = ease((f - a.f) / (b.f - a.f));
      return { cx: a.cx + (b.cx - a.cx) * t, cy: a.cy + (b.cy - a.cy) * t, s: a.s + (b.s - a.s) * t };
    }
  }
  return { ...CAM[CAM.length - 1] };
}

/* ========== 大幅震动 ========== */
function shakeAt(f) {
  const events = [
    { f: 560, p: 35, d: 30 },
    { f: 650, p: 70, d: 50 },
    { f: 1380, p: 30, d: 25 },
    { f: 1570, p: 50, d: 35 },
    { f: 1650, p: 90, d: 60 },
  ];
  let sx = 0, sy = 0;
  for (const s of events) {
    const dt = f - s.f;
    if (dt >= 0 && dt < s.d) {
      const decay = Math.pow(1 - dt / s.d, 1.5) * s.p;
      sx += Math.sin(f * 2.7 + s.f * 0.31) * decay;
      sy += Math.cos(f * 3.3 + s.f * 0.47) * decay * 0.65;
    }
  }
  return { sx, sy };
}

function drawP(f) {
  return interpolate(
    f,
    [0, 130, 330, 475, 560, 650, 800, 985, 1125, 1330, 1415, 1495, 1570, 1650, 1820, 2000, 2120],
    [0, 0.05, 0.11, 0.15, 0.17, 0.19, 0.25, 0.38, 0.52, 0.68, 0.76, 0.83, 0.88, 0.94, 0.97, 0.99, 1],
    clamp
  );
}

function goldIntensity(f) {
  return interpolate(f, [1550, 1650, 1950, 2150], [0, 1, 1, 0], clamp);
}

/* ========== 字幕 ========== */
const SUBS = [
  { t: "2019年10月，我注册了抖音账号", s: 15, e: 135 },
  { t: "那时才几岁，只会对嘴型演沙雕视频", s: 135, e: 265 },
  { t: "没几个人看，粉丝只有20多个", s: 265, e: 370 },
  { t: "2020年，学会了录屏，但不会剪辑", s: 370, e: 480 },
  { t: "一直处于不温不火的状态……", s: 480, e: 565 },
  { t: "随手发了一个特效视频", s: 565, e: 650 },
  { t: "火了！2.2万点赞！", s: 650, e: 760 },
  { t: "粉丝从20多暴涨到1.6万！", s: 760, e: 870 },
  { t: "但之后又回到了不温不火……", s: 870, e: 990 },
  { t: "2020到2025年，没想在自媒体上发展", s: 990, e: 1130 },
  { t: "2025年，我想要影石AcePro相机", s: 1130, e: 1240 },
  { t: "暑假开始学做抖音特效赚钱", s: 1240, e: 1330 },
  { t: "特效视频火了，但没几个人用……", s: 1330, e: 1420 },
  { t: "不过粉丝涨到了1.8万", s: 1420, e: 1500 },
  { t: "2026年6月，开始在星图接小游戏广告", s: 1500, e: 1610 },
  { t: "没想到视频爆火了！", s: 1610, e: 1720 },
  { t: "截止现在，粉丝3.8万！", s: 1720, e: 1830 },
  { t: "我也挣到了钱，买到了相机", s: 1830, e: 1930 },
  { t: "从对嘴型少年，到真正的创作者", s: 1930, e: 2040 },
  { t: "每一次跌落，都是为了下一次跃升", s: 2040, e: 2140 },
];

const ANNOS = [
  { f: 680, x: 2350, y: 2580, t: "2.2万点赞！", c: "#ff4466", sz: 130, d: 200 },
  { f: 790, x: 2700, y: 2340, t: "粉丝暴涨 1.6万", c: "#ffaa22", sz: 105, d: 200 },
  { f: 1050, x: 5500, y: 3350, t: "2020-2025 不温不火", c: "#5580aa", sz: 95, d: 360 },
  { f: 1400, x: 8800, y: 2480, t: "粉丝 1.8万", c: "#44ccff", sz: 110, d: 200 },
  { f: 1680, x: 11100, y: 700, t: "粉丝 3.8万！", c: "#ff44aa", sz: 260, d: 420 },
];

const XL = [
  { x: 150, t: "2019.10" }, { x: 1500, t: "2020" }, { x: 5000, t: "2022" },
  { x: 8500, t: "2025" }, { x: 10800, t: "2026" },
];
const YL = [
  { y: 4580, t: "0" }, { y: 3550, t: "1万" }, { y: 2500, t: "2万" },
  { y: 1450, t: "3万" }, { y: 420, t: "4万" },
];

/* ============================================================ */

const SubBar = () => {
  const f = useCurrentFrame();
  const c = SUBS.find((s) => f >= s.s && f < s.e);
  if (!c) return null;
  const fi = interpolate(f, [c.s, c.s + 12], [0, 1], clamp);
  const fo = interpolate(f, [c.e - 12, c.e], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", bottom: 56, left: 80, right: 80, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{
        background: "rgba(0,0,0,0.78)", borderRadius: 20, padding: "24px 56px",
        opacity: Math.min(fi, fo), transform: `translateY(${(1 - fi) * 12}px)`,
        border: "1px solid rgba(100,160,255,0.15)", maxWidth: "85%",
      }}>
        <div style={{ fontFamily: F, fontWeight: 700, fontSize: 44, color: "#fff", textAlign: "center", lineHeight: 1.5, letterSpacing: 3 }}>
          {c.t}
        </div>
      </div>
    </div>
  );
};

const TitleCard = () => {
  const f = useCurrentFrame();
  if (f > 140) return null;
  const o = Math.min(interpolate(f, [5, 30], [0, 1], clamp), interpolate(f, [110, 140], [1, 0], clamp));
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none", opacity: o }}>
      <div style={{ fontFamily: F, fontWeight: 900, fontSize: 100, color: "#fff", letterSpacing: 10, textShadow: "0 0 50px rgba(0,180,255,0.5),0 12px 40px rgba(0,0,0,0.8)" }}>
        我的人生函数图像
      </div>
      <div style={{ marginTop: 22, fontFamily: F, fontSize: 38, color: "rgba(180,210,255,0.85)", letterSpacing: 14 }}>
        一个短视频创作者的成长曲线
      </div>
    </AbsoluteFill>
  );
};

const EndCard = () => {
  const f = useCurrentFrame();
  const o1 = interpolate(f, [1930, 1965], [0, 1], clamp);
  const o2 = interpolate(f, [1995, 2035], [0, 1], clamp);
  const o3 = interpolate(f, [2130, 2170], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{
        opacity: o1, fontFamily: F, fontWeight: 900, fontSize: 76, color: "#dceaff", letterSpacing: 6,
        textShadow: "0 0 40px rgba(0,180,255,0.4)",
        transform: `translateY(${interpolate(f, [1930, 1965], [30, 0], clamp)}px)`,
      }}>
        从对嘴型少年，到真正的创作者
      </div>
      <div style={{
        marginTop: 36, opacity: o2, fontFamily: F, fontWeight: 900, fontSize: 92,
        color: "#ffd76a", letterSpacing: 8,
        textShadow: "0 0 60px rgba(255,200,80,0.5),0 12px 40px rgba(0,0,0,0.8)",
        transform: `scale(${interpolate(f, [1995, 2035], [0.88, 1], clamp)})`,
      }}>
        每一次跌落，都是为了下一次跃升
      </div>
      <div style={{
        marginTop: 70, opacity: o3,
        fontFamily: F, fontWeight: 900, fontSize: 68,
        color: "rgba(255,255,255,0.9)", letterSpacing: 24,
        textShadow: "0 0 30px rgba(255,200,100,0.3)",
      }}>
        谢 谢 观 看
      </div>
    </AbsoluteFill>
  );
};

/* ========== 巅峰金色流光 + 光粒子爆发 ========== */
const GoldOverlay = () => {
  const f = useCurrentFrame();
  const g = goldIntensity(f);
  if (g <= 0.01) return null;

  /* 光粒子爆发：1650帧前后从屏幕中心四散 */
  const burstFrame = 1650;
  const burstT = (f - burstFrame) / 120;
  const showBurst = burstT > -0.15 && burstT < 1.2;

  return (
    <>
      {/* 金色光晕 */}
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse at 55% 35%, rgba(255,200,50,${0.18 * g}) 0%, rgba(255,160,30,${0.08 * g}) 40%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* 流光条纹 */}
      {Array.from({ length: 9 }).map((_, i) => {
        const y = ((f * 3.5 + i * 170) % 1400) - 200;
        const w = 350 + Math.sin(f * 0.1 + i * 1.5) * 250;
        return (
          <div key={i} style={{
            position: "absolute",
            left: -200 + Math.sin(f * 0.05 + i * 2) * 500,
            top: y,
            width: w * 2.2,
            height: 3 + Math.sin(f * 0.14 + i) * 2.5,
            background: `linear-gradient(90deg, transparent, rgba(255,210,80,${0.22 * g}), rgba(255,255,220,${0.32 * g}), rgba(255,210,80,${0.22 * g}), transparent)`,
            transform: `rotate(${-22 + i * 5.5}deg)`,
            filter: `blur(${2 + Math.sin(i * 2) * 1.5}px)`,
            pointerEvents: "none",
          }} />
        );
      })}

      {/* 常驻金色粒子 */}
      {Array.from({ length: 28 }).map((_, i) => {
        const seed = i * 7.31;
        const x = ((Math.sin(f * 0.018 + seed) * 0.5 + 0.5) * 1920);
        const y = ((f * (1.0 + (i % 5) * 0.5) + i * 210) % 1350) - 120;
        const r = 2 + (i % 4) * 2.5;
        const alpha = g * (0.3 + 0.7 * Math.abs(Math.sin(f * 0.09 + seed * 2.1)));
        return (
          <div key={`gp${i}`} style={{
            position: "absolute", left: x, top: y,
            width: r * 2, height: r * 2, borderRadius: "50%",
            background: i % 3 === 0 ? "rgba(255,230,120,0.9)" : i % 3 === 1 ? "rgba(255,255,255,0.8)" : "rgba(255,180,60,0.85)",
            boxShadow: `0 0 ${r * 8}px rgba(255,200,80,${0.5 * g})`,
            opacity: alpha, pointerEvents: "none",
          }} />
        );
      })}

      {/* 巅峰爆发粒子（1650帧四散） */}
      {showBurst && Array.from({ length: 36 }).map((_, i) => {
        const angle = (i / 36) * Math.PI * 2 + i * 0.3;
        const speed = 300 + (i % 5) * 180;
        const dist = Math.max(0, burstT) * speed;
        const x = 960 + Math.cos(angle) * dist * 1.8;
        const y = 540 + Math.sin(angle) * dist;
        const life = Math.max(0, 1 - burstT * 0.9);
        const r = (3 + (i % 4) * 3) * life;
        return (
          <div key={`bp${i}`} style={{
            position: "absolute", left: x, top: y,
            width: r * 2, height: r * 2, borderRadius: "50%",
            background: i % 3 === 0 ? "#ffe080" : i % 3 === 1 ? "#fff" : "#ffaa30",
            boxShadow: `0 0 ${r * 12}px rgba(255,200,80,${0.7 * life})`,
            opacity: life * 0.85, pointerEvents: "none",
          }} />
        );
      })}

      {/* 巅峰光环（从中心扩散的圆环） */}
      {showBurst && [0, 1, 2].map((ring) => {
        const rt = burstT - ring * 0.18;
        if (rt < 0) return null;
        const radius = rt * 900;
        const ringOpacity = Math.max(0, (1 - rt * 1.2) * 0.5);
        return (
          <div key={`ring${ring}`} style={{
            position: "absolute", left: 960 - radius, top: 540 - radius,
            width: radius * 2, height: radius * 2,
            borderRadius: "50%",
            border: `3px solid rgba(255,210,100,${ringOpacity})`,
            boxShadow: `0 0 ${20 * ringOpacity}px rgba(255,200,80,${ringOpacity * 0.5})`,
            pointerEvents: "none",
          }} />
        );
      })}
    </>
  );
};

/* ========== 活力粒子（全程） ========== */
const AliveParticles = () => {
  const f = useCurrentFrame();
  return (
    <>
      {Array.from({ length: 20 }).map((_, i) => {
        const seed = i * 13.7;
        const x = ((Math.sin(f * 0.012 + seed) * 0.5 + 0.5) * 1920);
        const y = ((f * (0.4 + (i % 3) * 0.35) + i * 340) % 1250) - 80;
        const r = 1.5 + (i % 3) * 1.8;
        const alpha = 0.12 + 0.18 * Math.abs(Math.sin(f * 0.06 + seed));
        return (
          <div key={`ap${i}`} style={{
            position: "absolute", left: x, top: y,
            width: r * 2, height: r * 2, borderRadius: "50%",
            background: i % 2 ? "rgba(100,180,255,0.7)" : "rgba(255,255,255,0.6)",
            opacity: alpha, pointerEvents: "none",
          }} />
        );
      })}
    </>
  );
};

const ProgressBar = () => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 5, background: "rgba(255,255,255,0.08)" }}>
      <div style={{ height: "100%", width: `${(f / TOTAL) * 100}%`, background: "linear-gradient(90deg,#00d4ff,#ff44aa)" }} />
    </div>
  );
};

const GraphView = () => {
  const f = useCurrentFrame();
  const cam = camAt(f);
  const shake = shakeAt(f);
  const prog = drawP(f);
  const tx = 960 - cam.cx * cam.s + shake.sx;
  const ty = 540 - cam.cy * cam.s + shake.sy;

  const penX = prog * SW;
  let penY = pts[0][1];
  for (let i = 0; i < pts.length - 1; i++) {
    if (penX >= pts[i][0] && penX <= pts[i + 1][0]) {
      const t = (penX - pts[i][0]) / (pts[i + 1][0] - pts[i][0]);
      penY = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t;
      break;
    }
  }

  /* 曲线呼吸脉动 */
  const breathe = 1 + Math.sin(f * 0.04) * 0.08;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div style={{
        position: "absolute", left: 0, top: 0, width: SW, height: SH,
        transform: `translate(${tx}px,${ty}px) scale(${cam.s})`, transformOrigin: "0 0",
      }}>
        <svg width={SW} height={SH} style={{ position: "absolute", left: 0, top: 0 }}>
          <defs>
            <linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00d4ff" />
              <stop offset="50%" stopColor="#66aaff" />
              <stop offset="100%" stopColor="#ff44aa" />
            </linearGradient>
            <linearGradient id="cf" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0088ff" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#0088ff" stopOpacity="0.01" />
            </linearGradient>
            <clipPath id="dc"><rect x={0} y={0} width={Math.max(1, prog * SW)} height={SH} /></clipPath>
          </defs>

          {/* 网格 */}
          {YL.map(({ y }, i) => <line key={`gy${i}`} x1={0} y1={y} x2={SW} y2={y} stroke="rgba(100,150,255,0.07)" strokeWidth={1.5} />)}
          {XL.map(({ x }, i) => <line key={`gx${i}`} x1={x} y1={0} x2={x} y2={YB} stroke="rgba(100,150,255,0.07)" strokeWidth={1.5} />)}

          <path d={fillD} fill="url(#cf)" clipPath="url(#dc)" />

          {/* 外层辉光（呼吸脉动） */}
          <path d={curveD} fill="none" stroke="url(#cg)" strokeWidth={35 * breathe} strokeLinecap="round"
            opacity={0.1 * prog} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog} />
          {/* 中层辉光 */}
          <path d={curveD} fill="none" stroke="url(#cg)" strokeWidth={18 * breathe} strokeLinecap="round"
            opacity={0.18 * prog} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog} />
          {/* 主曲线 */}
          <path d={curveD} fill="none" stroke="url(#cg)" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round"
            pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog} />

          {/* 曲线上的流动光点 */}
          {prog > 0.02 && Array.from({ length: 8 }).map((_, i) => {
            const dotProg = ((f * 0.004 + i * 0.13) % 1) * prog;
            const dx = dotProg * SW;
            let dy = pts[0][1];
            for (let j = 0; j < pts.length - 1; j++) {
              if (dx >= pts[j][0] && dx <= pts[j + 1][0]) {
                const t = (dx - pts[j][0]) / (pts[j + 1][0] - pts[j][0]);
                dy = pts[j][1] + (pts[j + 1][1] - pts[j][1]) * t;
                break;
              }
            }
            return (
              <circle key={`fd${i}`} cx={dx} cy={dy} r={6 + Math.sin(f * 0.15 + i * 2) * 3}
                fill={i % 2 ? "rgba(100,220,255,0.6)" : "rgba(255,150,200,0.5)"} />
            );
          })}

          {/* 笔尖光点 */}
          {prog > 0.01 && prog < 0.99 && (
            <g>
              <circle cx={penX} cy={penY} r={30 + Math.sin(f * 0.35) * 15} fill="rgba(100,200,255,0.1)" />
              <circle cx={penX} cy={penY} r={18 + Math.sin(f * 0.5) * 5} fill="rgba(150,220,255,0.15)" />
              <circle cx={penX} cy={penY} r={14} fill="#fff" opacity={0.85} />
              <circle cx={penX} cy={penY} r={7} fill="#00d4ff" />
            </g>
          )}

          {/* 坐标轴标签 */}
          {YL.map(({ y, t }, i) => <text key={`yl${i}`} x={80} y={y + 18} fill="rgba(150,180,230,0.55)" fontFamily={F} fontSize={85} fontWeight={700}>{t}</text>)}
          {XL.map(({ x, t }, i) => <text key={`xl${i}`} x={x} y={YB + 130} fill="rgba(150,180,230,0.55)" fontFamily={F} fontSize={85} fontWeight={700} textAnchor="middle">{t}</text>)}

          {/* 标注 */}
          {ANNOS.map((a, i) => {
            if (f < a.f || f >= a.f + a.d) return null;
            const pop = spring({ frame: f - a.f, config: { damping: 11, stiffness: 120 }, durationInFrames: 20 });
            const fade = interpolate(f, [a.f + a.d - 15, a.f + a.d], [1, 0], clamp);
            const o = fade * Math.min(1, pop * 1.5);
            const sc = 0.3 + pop * 0.7;
            const tw = a.t.length * a.sz * 0.55 + 40;
            return (
              <g key={`an${i}`} opacity={o} transform={`translate(${a.x},${a.y}) scale(${sc})`}>
                <rect x={-tw} y={-a.sz * 0.72} width={tw * 2} height={a.sz * 1.44} rx={a.sz * 0.16} fill="rgba(8,12,28,0.82)" stroke={a.c + "44"} strokeWidth={4} />
                <text x={0} y={a.sz * 0.14} textAnchor="middle" fill={a.c} fontFamily={F} fontSize={a.sz} fontWeight={900}>{a.t}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </AbsoluteFill>
  );
};

const LifeGraph = () => {
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
    <AbsoluteFill style={{ background: "linear-gradient(135deg,#060a18 0%,#0c1228 50%,#0a0e1e 100%)", fontFamily: F }}>
      <GraphView />
      <AliveParticles />
      <GoldOverlay />
      <SubBar />
      <TitleCard />
      <EndCard />
      <ProgressBar />
      <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse at center,transparent 55%,rgba(2,4,12,0.5) 100%)" }} />
    </AbsoluteFill>
  );
};

export const RemotionRoot = () => (
  <Composition id="ShortCircuitVideo" component={LifeGraph} durationInFrames={TOTAL} fps={30} width={1920} height={1080} />
);

registerRoot(RemotionRoot);