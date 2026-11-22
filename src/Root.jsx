// src/Root.jsx — 人生函数图像（短视频创作之路）
// 合成 id: ShortCircuitVideo

import React from "react";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  useCurrentFrame,
  registerRoot,
  delayRender,
  continueRender,
} from "remotion";

if (typeof document !== "undefined" && !document.getElementById("lf")) {
  const s = document.createElement("style");
  s.id = "lf";
  s.textContent =
    "@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700;900&display=swap');";
  document.head.appendChild(s);
}

const F = '"Noto Sans SC","Noto Sans CJK SC",sans-serif';
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };

/* ============ 曲线关键点（月份, 粉丝数） ============ */
const DATA = [
  [0, 20], [3, 22], [6, 35], [9, 50], [10, 60], [11, 8000], [12, 16000],
  [14, 13000], [18, 11000], [30, 10000], [44, 9500], [55, 9800], [63, 10500],
  [68, 13000], [71, 15500], [74, 18000], [77, 19500], [80, 25000], [82, 38000], [84, 38500],
];

const Y_MAX = 42000;
const MONTHS = 84;

// Catmull-Rom 样条
const splinePath = (pts, x0, y0, w, h) => {
  const p = pts.map(([m, v]) => [
    x0 + (m / MONTHS) * w,
    y0 + h - (v / Y_MAX) * h,
  ]);
  if (p.length < 2) return "";
  let d = `M${p[0][0]},${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[Math.max(0, i - 1)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(p.length - 1, i + 2)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
};

/* ============ 字幕段落（帧范围 + 文字 + 高潮标记） ============ */
const CAPS = [
  { from: 0, to: 130, text: "2019年10月，我注册了这个抖音账号" },
  { from: 130, to: 250, text: "那时才几岁，只会对着沙雕视频的音频对嘴型" },
  { from: 250, to: 370, text: "没几个人看，粉丝只有20多" },
  { from: 370, to: 500, text: "2020年，后来学会了录屏，但不会剪辑" },
  { from: 500, to: 590, text: "然后随手发了一个特效视频——火了！", spike: "up" },
  { from: 590, to: 710, text: "2.2万点赞，粉丝从20多暴涨到1.6万" },
  { from: 710, to: 830, text: "但之后，又一直不温不火", spike: "down" },
  { from: 830, to: 1050, text: "2020到2025年，我根本没想过在自媒体涉足" },
  { from: 1050, to: 1170, text: "2025年，想要影石AcePro相机，暑假开始做特效" },
  { from: 1170, to: 1280, text: "宣传特效的视频是火了，但没几个人用" },
  { from: 1280, to: 1380, text: "依旧赚不了多少钱，但粉丝涨到了1.8万" },
  { from: 1380, to: 1540, text: "2026年6月，我开始在星图上面接小游戏广告" },
  { from: 1540, to: 1720, text: "没想到我的风格和搞笑节奏引起共鸣，视频爆火！", spike: "up" },
  { from: 1720, to: 1870, text: "截止现在，我的粉丝已经3.8万" },
  { from: 1870, to: 2020, text: "同时我也挣到了钱，买到了梦寐以求的相机" },
  { from: 2020, to: 2220, text: "从一个对嘴型的少年，到3.8万粉丝的创作者" },
  { from: 2220, to: 2450, text: "人生就是一条函数曲线，有起有落，但一直在走", end: true },
];

const TOTAL = 2500;

/* ============ 相机抖动 ============ */
const SHAKE_FRAMES = [510, 520, 530, 720, 730, 740, 1560, 1570, 1580, 1590];
const getShake = (f) => {
  for (const sf of SHAKE_FRAMES) {
    const dist = f - sf;
    if (dist >= -5 && dist <= 20) {
      const intensity = dist < 0 ? 1 : 1 - dist / 20;
      return {
        x: Math.sin(f * 2.7) * 14 * intensity,
        y: Math.cos(f * 3.1) * 10 * intensity,
      };
    }
  }
  return { x: 0, y: 0 };
};

/* ============ 图表区域 ============ */
const GRAPH = { x: 120, y: 100, w: 1680, h: 720 };

const GraphStage = () => {
  const f = useCurrentFrame();
  const path = splinePath(DATA, GRAPH.x, GRAPH.y, GRAPH.w, GRAPH.h);
  const drawProg = interpolate(f, [0, 2100], [0, 1], clamp);
  const curMonth = drawProg * MONTHS;
  const curVal = interpolate(
    curMonth,
    DATA.map(([m]) => m),
    DATA.map(([, v]) => v)
  );

  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      {/* 背景网格 */}
      {Array.from({ length: 9 }).map((_, i) => (
        <line key={`h${i}`} x1={GRAPH.x} y1={GRAPH.y + (i * GRAPH.h) / 8} x2={GRAPH.x + GRAPH.w} y2={GRAPH.y + (i * GRAPH.h) / 8}
          stroke="rgba(80,140,220,0.12)" strokeWidth={1} />
      ))}
      {Array.from({ length: 16 }).map((_, i) => (
        <line key={`v${i}`} x1={GRAPH.x + (i * GRAPH.w) / 15} y1={GRAPH.y} x2={GRAPH.x + (i * GRAPH.w) / 15} y2={GRAPH.y + GRAPH.h}
          stroke="rgba(80,140,220,0.08)" strokeWidth={1} />
      ))}

      {/* Y轴标签 */}
      {[0, 10000, 20000, 30000, 40000].map((v, i) => (
        <text key={i} x={GRAPH.x - 16} y={GRAPH.y + GRAPH.h - (v / Y_MAX) * GRAPH.h + 6}
          fill="rgba(140,180,230,0.6)" fontSize={22} fontFamily={F} textAnchor="end">
          {v / 10000}万
        </text>
      ))}
      {/* X轴标签 */}
      {[2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026].map((yr, i) => (
        <text key={i} x={GRAPH.x + (i * GRAPH.w) / 7} y={GRAPH.y + GRAPH.h + 36}
          fill="rgba(140,180,230,0.55)" fontSize={22} fontFamily={F} textAnchor="middle">
          {yr}
        </text>
      ))}

      {/* 面积填充 */}
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4fd1ff" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#4fd1ff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4fd1ff" />
          <stop offset="30%" stopColor="#ffd76a" />
          <stop offset="55%" stopColor="#4fd1ff" />
          <stop offset="80%" stopColor="#ff6b6b" />
          <stop offset="100%" stopColor="#5ff0c0" />
        </linearGradient>
      </defs>
      <path d={path + ` L${GRAPH.x + GRAPH.w},${GRAPH.y + GRAPH.h} L${GRAPH.x},${GRAPH.y + GRAPH.h} Z`}
        fill="url(#areaGrad)" opacity={drawProg * 0.7}
        clipPath="url(#clipReveal)" />
      <clipPath id="clipReveal">
        <rect x={GRAPH.x} y={GRAPH.y - 20} width={GRAPH.w * drawProg} height={GRAPH.h + 40} />
      </clipPath>

      {/* 主曲线（辉光层） */}
      <path d={path} fill="none" stroke="url(#lineGrad)" strokeWidth={18} strokeLinecap="round"
        opacity={0.18 * drawProg} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - drawProg} />
      {/* 主曲线 */}
      <path d={path} fill="none" stroke="url(#lineGrad)" strokeWidth={5} strokeLinecap="round"
        pathLength={1} strokeDasharray={1} strokeDashoffset={1 - drawProg} />

      {/* 关键点 */}
      {[11, 12, 18, 19].map((idx) => {
        const [m, v] = DATA[idx];
        const px = GRAPH.x + (m / MONTHS) * GRAPH.w;
        const py = GRAPH.y + GRAPH.h - (v / Y_MAX) * GRAPH.h;
        const visible = curMonth >= m;
        const pop = interpolate(f, [0, 20], [0, 1], clamp);
        return visible ? (
          <g key={idx}>
            <circle cx={px} cy={py} r={18} fill={idx === 19 ? "#5ff0c0" : idx === 18 ? "#ff6b6b" : "#ffd76a"} opacity={0.18} />
            <circle cx={px} cy={py} r={8} fill={idx === 19 ? "#5ff0c0" : idx === 18 ? "#ff6b6b" : "#ffd76a"} />
          </g>
        ) : null;
      })}

      {/* 当前位置光点 */}
      <circle cx={GRAPH.x + (curMonth / MONTHS) * GRAPH.w}
        cy={GRAPH.y + GRAPH.h - (curVal / Y_MAX) * GRAPH.h}
        r={10} fill="#fff" opacity={0.9} />
      <circle cx={GRAPH.x + (curMonth / MONTHS) * GRAPH.w}
        cy={GRAPH.y + GRAPH.h - (curVal / Y_MAX) * GRAPH.h}
        r={22} fill="none" stroke="#fff" strokeWidth={2} opacity={0.25} />
    </svg>
  );
};

/* ============ 字幕条（手机端适配） ============ */
const SubtitleBar = () => {
  const f = useCurrentFrame();
  const cap = CAPS.find((c) => f >= c.from && f < c.to);
  if (!cap) return null;
  const lf = f - cap.from;
  const inO = interpolate(lf, [0, 14], [0, 1], clamp);
  const outO = interpolate(lf, [cap.to - cap.from - 12, cap.to - cap.from], [1, 0], clamp);
  const y = interpolate(lf, [0, 14], [18, 0], clamp);
  const isEnd = cap.end;

  return (
    <div style={{
      position: "absolute", left: 0, right: 0, bottom: 0,
      display: "flex", justifyContent: "center", paddingBottom: 48,
      opacity: Math.min(inO, outO), transform: `translateY(${y}px)`,
      pointerEvents: "none",
    }}>
      <div style={{
        background: isEnd
          ? "linear-gradient(135deg, rgba(255,180,60,0.92), rgba(255,100,60,0.92))"
          : "rgba(6,12,28,0.88)",
        border: isEnd ? "2px solid rgba(255,220,120,0.6)" : "1px solid rgba(100,160,255,0.22)",
        borderRadius: 18, padding: "18px 36px", maxWidth: 1320,
        backdropFilter: "blur(6px)",
      }}>
        <div style={{
          fontFamily: F, fontWeight: 700,
          fontSize: isEnd ? 38 : 36,
          color: isEnd ? "#fff" : "#e4f0ff",
          letterSpacing: 2, lineHeight: 1.55,
          textAlign: "center",
          textShadow: isEnd ? "0 2px 12px rgba(200,80,20,0.6)" : "0 2px 10px rgba(0,0,0,0.7)",
        }}>
          {cap.text}
        </div>
      </div>
    </div>
  );
};

/* ============ 顶部标题 ============ */
const Header = () => {
  const f = useCurrentFrame();
  return (
    <div style={{
      position: "absolute", top: 30, left: 0, right: 0,
      display: "flex", justifyContent: "center", gap: 30,
      opacity: interpolate(f, [0, 30], [0, 1], clamp),
      pointerEvents: "none",
    }}>
      <div style={{
        fontFamily: F, fontWeight: 900, fontSize: 48,
        color: "#fff", letterSpacing: 8,
        textShadow: "0 4px 30px rgba(60,140,255,0.5), 0 2px 12px rgba(0,0,0,0.7)",
      }}>
        我的人生函数图像
      </div>
      <div style={{
        fontFamily: F, fontSize: 26, color: "rgba(160,200,255,0.7)",
        letterSpacing: 6, alignSelf: "flex-end", paddingBottom: 6,
      }}>
        f(时间) = 粉丝 · 成长 · 坚持
      </div>
    </div>
  );
};

/* ============ 结尾升华层 ============ */
const EndingOverlay = () => {
  const f = useCurrentFrame();
  const start = 2200;
  if (f < start) return null;
  const t = interpolate(f, [start, start + 60], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: t }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 55%, rgba(255,180,60,${0.08 * t}) 0%, transparent 65%)` }} />
    </AbsoluteFill>
  );
};

/* ============ 主合成 ============ */
const LifeFunction = () => {
  const f = useCurrentFrame();
  const shake = getShake(f);

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
    <AbsoluteFill style={{ background: "#050c1a", fontFamily: F }}>
      {/* 背景 */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 30%, #0d1e3a 0%, #050c1a 70%)" }} />
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, transparent 0 4px, rgba(0,0,0,0.03) 4px 5px)" }} />

      {/* 抖动容器 */}
      <AbsoluteFill style={{ transform: `translate(${shake.x}px, ${shake.y}px)` }}>
        <GraphStage />
        <Header />
        <EndingOverlay />
      </AbsoluteFill>

      {/* 字幕（不抖动） */}
      <SubtitleBar />

      {/* 暗角 */}
      <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse at center, transparent 50%, rgba(2,5,12,0.55) 100%)" }} />

      {/* 结尾淡出 */}
      <AbsoluteFill style={{ background: "#000", opacity: interpolate(f, [TOTAL - 20, TOTAL - 2], [0, 1], clamp), pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export const RemotionRoot = () => (
  <Composition id="ShortCircuitVideo" component={LifeFunction} durationInFrames={TOTAL} fps={30} width={1920} height={1080} />
);

registerRoot(RemotionRoot);