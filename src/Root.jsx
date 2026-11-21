import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  registerRoot,
} from "remotion";
import {
  sndAlarm,
  sndClick,
  sndBoom,
  sndHum,
  sndPop,
  sndRiser,
  sndSpark,
} from "./sounds";

/* ============================================================
   全局配置 / 主题
   ============================================================ */
export const VIDEO_CONFIG = {
  width: 1920,
  height: 1080,
  fps: 30,
  durationInFrames: 1015,
};
const THEME = {
  bg: "#070b17",
  bg2: "#0c1326",
  panel: "#111c36",
  panel2: "#16243f",
  line: "#22335c",
  text: "#eaf2ff",
  sub: "#93a4c4",
  cyan: "#3fe3ff",
  amber: "#ffc247",
  danger: "#ff4d5e",
  danger2: "#ff9a3c",
  good: "#3fe3a1",
};
// 匹配系统安装的 Noto Sans CJK SC，解决中文方框
const FONT = `"Noto Sans CJK SC","PingFang SC","Hiragino Sans GB","Microsoft YaHei",system-ui,sans-serif`;
const MONO = `"JetBrains Mono","SFMono-Regular",Consolas,monospace`;
const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
};

const mixHex = (a, b, t) => {
  const p = (h) => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  const [r1, g1, b1] = p(a);
  const [r2, g2, b2] = p(b);
  const k = Math.max(0, Math.min(1, t));
  const r = Math.round(r1 + (r2 - r1) * k);
  const g = Math.round(g1 + (g2 - g1) * k);
  const bl = Math.round(b1 + (b2 - b1) * k);
  return `rgb(${r},${g},${bl})`;
};

/* ============================================================
   通用小组件
   ============================================================ */
/** 场景淡入淡出 */
const SceneFade = ({ children }) => {
  const f = useCurrentFrame();
  const opacity = interpolate(f, [0, 10], [0, 1], clamp);
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

/** 底部字幕条 */
const Caption = ({ text, delay = 0 }) => {
  const f = useCurrentFrame();
  const y = interpolate(f - delay, [0, 12], [26, 0], clamp);
  const o = interpolate(f - delay, [0, 12], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: 110,
        right: 110,
        bottom: 52,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          transform: `translateY(${y}px)`,
          opacity: o,
          background: "rgba(8,13,26,0.82)",
          border: `1px solid ${THEME.line}`,
          borderRadius: 16,
          padding: "18px 40px",
          color: THEME.text,
          fontSize: 34,
          fontWeight: 500,
          letterSpacing: 1.5,
          backdropFilter: "blur(10px)",
          boxShadow: "0 18px 44px rgba(0,0,0,0.45)",
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** 左上角章节标签 */
const ActLabel = ({ num, title, color = THEME.cyan }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 12], [0, 1], clamp);
  const x = interpolate(f, [0, 14], [-24, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top: 56,
        left: 76,
        display: "flex",
        alignItems: "center",
        gap: 18,
        opacity: o,
        transform: `translateX(${x}px)`,
      }}
    >
      <div
        style={{
          width: 10,
          height: 42,
          borderRadius: 6,
          background: color,
          boxShadow: `0 0 22px ${color}`,
        }}
      />
      <div style={{ color: THEME.sub, fontSize: 22, letterSpacing: 6 }}>{num}</div>
      <div
        style={{
          color: THEME.text,
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: 4,
        }}
      >
        {title}
      </div>
    </div>
  );
};

/** 主标题（逐字入场） */
const Title = ({ text, size = 86, color = THEME.text, delay = 0 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
      {text.split("").map((ch, i) => {
        const t = spring({
          frame: f - delay - i * 3,
          config: { damping: 12, stiffness: 130 },
        });
        return (
          <span
            key={i}
            style={{
              fontSize: size,
              fontWeight: 900,
              color,
              letterSpacing: size * 0.05,
              lineHeight: 1.18,
              opacity: t,
              transform: `translateY(${(1 - t) * 42}px) scale(${0.86 + 0.14 * t})`,
              display: "inline-block",
              whiteSpace: "pre",
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

/** 玻璃拟态面板 */
const Panel = ({ children, style, glow }) => (
  <div
    style={{
      background: `linear-gradient(155deg, ${THEME.panel} 0%, ${THEME.panel2} 100%)`,
      border: `1px solid ${THEME.line}`,
      borderRadius: 24,
      boxShadow: glow
        ? `0 26px 70px rgba(0,0,0,0.5), 0 0 50px ${glow}`
        : "0 26px 70px rgba(0,0,0,0.5)",
      ...style,
    }}
  >
    {children}
  </div>
);

/** 危险警示徽章 */
const AlertBadge = ({ label = "危险！" }) => {
  const f = useCurrentFrame();
  const s = spring({ frame: f, config: { damping: 8, stiffness: 170 } });
  const pulse = 0.55 + 0.45 * Math.abs(Math.sin(f / 7));
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 22px",
        borderRadius: 999,
        background: `rgba(255,77,94,${0.12 + 0.12 * pulse})`,
        border: `2px solid rgba(255,77,94,${0.5 + 0.5 * pulse})`,
        color: THEME.danger,
        fontSize: 26,
        fontWeight: 800,
        letterSpacing: 3,
        transform: `scale(${s})`,
        boxShadow: `0 0 ${26 * pulse}px rgba(255,77,94,0.55)`,
      }}
    >
      <span style={{ fontSize: 28 }}>⚠</span>
      {label}
    </div>
  );
};

/** 数值跳动 */
const Counter = ({ value, unit, color, digits = 1 }) => {
  const f = useCurrentFrame();
  const v = value * interpolate(f, [0, 18], [0, 1], clamp);
  return (
    <span style={{ fontFamily: MONO, fontWeight: 700 }}>
      <span style={{ color, fontSize: 52 }}>{v.toFixed(digits)}</span>
      <span style={{ color: THEME.sub, fontSize: 26, marginLeft: 8 }}>{unit}</span>
    </span>
  );
};

/** 背景氛围：渐变光晕 + 网格 + 颗粒 */
const Backdrop = () => {
  const f = useCurrentFrame();
  const drift = Math.sin(f / 90) * 30;
  return (
    <AbsoluteFill style={{ background: THEME.bg, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: 1400,
          height: 1400,
          left: -320 + drift,
          top: -520,
          background: `radial-gradient(circle, rgba(63,227,255,0.15) 0%, transparent 62%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1300,
          height: 1300,
          right: -420 - drift,
          bottom: -560,
          background: `radial-gradient(circle, rgba(255,77,94,0.14) 0%, transparent 62%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)`,
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,0.9), transparent 78%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, rgba(0,0,0,0.9), transparent 78%)",
        }}
      />
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.5 }}>
        <filter id="grainF">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grainF)" opacity="0.045" />
      </svg>
    </AbsoluteFill>
  );
};

/* ============================================================
   电路几何（矩形回路 + 短路旁路）
   ============================================================ */
const GEO = {
  x1: 270,
  x2: 1030,
  y1: 230,
  y2: 560,
  bulbX: 650,
  swX: 860,
  bx1: 690,
  bx2: 990,
  by: 400,
  ex1: 350,
  ex2: 500,
};

const PATH_PTS = [
  { x: GEO.x1, y: GEO.y2 },
  { x: GEO.x2, y: GEO.y2 },
  { x: GEO.x2, y: GEO.y1 },
  { x: GEO.swX, y: GEO.y1 },
  { x: GEO.bx2, y: GEO.y1 },
  { x: GEO.bulbX, y: GEO.y1 },
  { x: GEO.bx1, y: GEO.y1 },
  { x: GEO.x1, y: GEO.y1 },
];
const PATH_LOOP = [...PATH_PTS, { x: GEO.x1, y: GEO.y2 }];

const ptAt = (p) => {
  const segLens = [];
  let total = 0;
  for (let i = 0; i < PATH_LOOP.length - 1; i++) {
    const a = PATH_LOOP[i];
    const b = PATH_LOOP[i + 1];
    const l = Math.hypot(b.x - a.x, b.y - a.y);
    segLens.push(l);
    total += l;
  }
  let d = ((p % 1) + 1) % 1;
  d *= total;
  for (let i = 0; i < segLens.length; i++) {
    if (d <= segLens[i]) {
      const a = PATH_LOOP[i];
      const b = PATH_LOOP[i + 1];
      const k = segLens[i] === 0 ? 0 : d / segLens[i];
      return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
    }
    d -= segLens[i];
  }
  return PATH_LOOP[PATH_LOOP.length - 1];
};

/* ============================================================
   电路动画
   ============================================================ */
const Electron = ({ x, y, color, r }) => (
  <circle cx={x} cy={y} r={r} fill={color} style={{ filter: `drop-shadow(0 0 ${r * 3}px ${color})` }} />
);

const BulbGlass = ({ color, glow }) => (
  <>
    <circle cx={GEO.bulbX} cy={GEO.y1} r={54} fill="rgba(255,255,255,0.045)" stroke={color} strokeWidth={4} />
    {glow > 0.01 && (
      <circle
        cx={GEO.bulbX}
        cy={GEO.y1}
        r={54 + 34 * glow}
        fill="none"
        stroke={color}
        strokeWidth={3 + 4 * glow}
        opacity={0.28 * glow}
        style={{ filter: `blur(${6 + 10 * glow}px)` }}
      />
    )}
    <path
      d={`M ${GEO.bulbX - 17} ${GEO.y1 + 18} L ${GEO.bulbX - 8} ${GEO.y1 - 4} L ${GEO.bulbX} ${GEO.y1 + 12} L ${GEO.bulbX + 8} ${GEO.y1 - 4} L ${GEO.bulbX + 17} ${GEO.y1 + 18}`}
      fill="none"
      stroke={color}
      strokeWidth={4.5}
      strokeLinecap="round"
      opacity={0.35 + 0.65 * glow}
      style={{ filter: glow > 0.01 ? `drop-shadow(0 0 ${10 * glow}px ${color})` : undefined }}
    />
  </>
);

const SwitchSymbol = ({ closed, color }) => {
  const angle = closed ? 0 : -30;
  return (
    <>
      <line x1={GEO.swX - 46} y1={GEO.y1} x2={GEO.swX - 14} y2={GEO.y1} stroke={color} strokeWidth={5} strokeLinecap="round" />
      <circle cx={GEO.swX - 14} cy={GEO.y1} r={7} fill={color} />
      <circle cx={GEO.swX + 14} cy={GEO.y1} r={7} fill={color} />
      <line
        x1={GEO.swX - 14}
        y1={GEO.y1}
        x2={GEO.swX + 30}
        y2={GEO.y1}
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        style={{
          transformOrigin: `${GEO.swX - 14}px ${GEO.y1}px`,
          transform: `rotate(${angle}deg)`,
        }}
      />
    </>
  );
};

const BatterySymbol = ({ color }) => (
  <g>
    <rect x={GEO.ex1 - 60} y={GEO.y2 - 26} width={GEO.ex2 - GEO.ex1 + 120} height={52} rx={12} fill="rgba(63,227,255,0.06)" stroke="rgba(63,227,255,0.22)" strokeWidth={2} />
    <line x1={GEO.ex1} y1={GEO.y2 - 30} x2={GEO.ex1} y2={GEO.y2 + 30} stroke={color} strokeWidth={7} strokeLinecap="round" />
    <line x1={GEO.ex1 + 26} y1={GEO.y2 - 17} x2={GEO.ex1 + 26} y2={GEO.y2 + 17} stroke={color} strokeWidth={5} strokeLinecap="round" />
    <line x1={GEO.ex2 - 26} y1={GEO.y2 - 30} x2={GEO.ex2 - 26} y2={GEO.y2 + 30} stroke={color} strokeWidth={7} strokeLinecap="round" />
    <line x1={GEO.ex2} y1={GEO.y2 - 17} x2={GEO.ex2} y2={GEO.y2 + 17} stroke={color} strokeWidth={5} strokeLinecap="round" />
    <text x={GEO.ex2 + 30} y={GEO.y2 + 12} fill={THEME.sub} fontSize={30} fontFamily={MONO} fontWeight={700}>
      电源
    </text>
    <text x={GEO.ex2 + 30} y={GEO.y2 + 50} fill={color} fontSize={24} fontFamily={MONO} opacity={0.85}>
      U = 220 V
    </text>
  </g>
);

const CircuitDemo = ({ shorted, showSwitch = true }) => {
  const frame = useCurrentFrame();
  const toShort = shorted
    ? spring({ frame, config: { damping: 13, stiffness: 110 }, durationInFrames: 34 })
    : 0;
  const heat = shorted ? interpolate(frame, [22, 72], [0, 1], clamp) : 0;
  const wireColor = mixHex("#4d83b8", "#ff5a2e", heat);
  const glowBulb = shorted ? interpolate(frame, [0, 26], [1, 0], clamp) : 1;
  const bypassDash = 360 * (1 - toShort);

  const speed = shorted ? 0.026 : 0.0075;
  const eCount = shorted ? 26 : 18;
  const electrons = [];
  for (let i = 0; i < eCount; i++) {
    const p = ptAt(i / eCount + frame * speed);
    const onBypass =
      shorted &&
      toShort > 0.55 &&
      ((p.x >= GEO.bx1 - 8 && p.x <= GEO.bx2 + 8 && Math.abs(p.y - GEO.y1) < 8) ||
        Math.abs(p.x - GEO.bx1) < 8 ||
        Math.abs(p.x - GEO.bx2) < 8);
    const pos = shorted && toShort > 0.55 && Math.abs(p.y - GEO.y1) < 10
      ? {
          x: Math.min(GEO.bx2, Math.max(GEO.bx1, p.x)),
          y: GEO.by + Math.sin(frame / 4 + i) * 6,
        }
      : p;
    electrons.push(
      <Electron
        key={i}
        x={pos.x}
        y={pos.y}
        r={onBypass ? 7.5 : 6}
        color={onBypass ? THEME.danger2 : THEME.cyan}
      />
    );
  }

  const sparks = [];
  if (shorted && frame > 18 && frame < 130) {
    for (let i = 0; i < 16; i++) {
      const birth = 18 + i * 6;
      const t = (frame - birth) / 26;
      if (t > 0 && t < 1) {
        const ang = (i / 16) * Math.PI * 2 + i;
        const r = t * (110 + (i % 5) * 30);
        sparks.push(
          <circle
            key={i}
            cx={GEO.bx2 + Math.cos(ang) * r}
            cy={GEO.y1 + Math.sin(ang) * r * 0.8}
            r={5 * (1 - t)}
            fill={i % 2 ? THEME.danger2 : THEME.cyan}
            opacity={1 - t}
            style={{ filter: "drop-shadow(0 0 8px rgba(255,154,60,0.9))" }}
          />
        );
      }
    }
  }

  return (
    <svg viewBox="0 0 1300 760" width="100%" height="100%">
      <rect x={40} y={40} width={1220} height={680} rx={30} fill="rgba(255,255,255,0.018)" stroke="rgba(255,255,255,0.05)" />
      <path
        d={`M ${GEO.x1} ${GEO.y2} L ${GEO.x2} ${GEO.y2} L ${GEO.x2} ${GEO.y1} L ${GEO.x1} ${GEO.y1} Z`}
        fill="none"
        stroke={wireColor}
        strokeWidth={8}
        strokeLinejoin="round"
        opacity={0.9}
      />
      <BatterySymbol color={THEME.cyan} />
      {showSwitch && <SwitchSymbol closed color={wireColor} />}
      <BulbGlass color={mixHex(THEME.amber, "#42506e", 1 - glowBulb)} glow={glowBulb} />
      <text x={GEO.bulbX} y={GEO.y1 + 108} textAnchor="middle" fill={THEME.sub} fontSize={26}>
        小灯泡（用电器）
      </text>
      <text x={GEO.swX + 40} y={GEO.y1 - 34} textAnchor="middle" fill={THEME.sub} fontSize={22}>
        开关
      </text>
      <path
        d={`M ${GEO.bx1} ${GEO.y1} C ${GEO.bx1} ${GEO.by}, ${GEO.bx2} ${GEO.by}, ${GEO.bx2} ${GEO.y1}`}
        fill="none"
        stroke={mixHex(THEME.danger, THEME.danger2, heat)}
        strokeWidth={9}
        strokeLinecap="round"
        strokeDasharray={bypassDash > 0 ? `${bypassDash} 400` : undefined}
        style={{
          filter: `drop-shadow(0 0 ${6 + 22 * heat}px rgba(255,90,46,${0.35 + 0.5 * heat}))`,
          opacity: 0.35 + 0.65 * toShort,
        }}
      />
      {toShort > 0.9 && (
        <text x={(GEO.bx1 + GEO.bx2) / 2} y={GEO.by + 62} textAnchor="middle" fill={THEME.danger} fontSize={28} fontWeight={700}>
          电阻≈0 的“捷径”
        </text>
      )}
      {electrons}
      {sparks}
      {shorted && (
        <text x={GEO.bulbX} y={GEO.y1 - 76} textAnchor="middle" fill={THEME.sub} fontSize={24}>
          电流几乎不走这里 → 熄灭
        </text>
      )}
    </svg>
  );
};

/* ============================================================
   场景 01 — 开场钩子
   ============================================================ */
const SceneHook = () => {
  const f = useCurrentFrame();
  const ignite = interpolate(f, [40, 52], [0, 1], clamp);
  const shake = f >= 46 && f <= 76 ? Math.sin(f * 2.1) * (10 - (f - 46) * 0.3) : 0;
  const flash = interpolate(f, [46, 52, 62], [0, 0.55, 0], clamp);
  const wireLen = 340;
  const dash = wireLen * (1 - ignite);
  return (
    <SceneFade>
      <AbsoluteFill style={{ transform: `translateX(${shake}px)`, fontFamily: FONT }}>
        <ActLabel num="00" title="开场" color={THEME.danger} />
        <div style={{ position: "absolute", left: 120, top: 190, width: 880, height: 620 }}>
          <svg viewBox="0 0 880 620" width="100%" height="100%">
            <g>
              <rect x={30} y={260} width={190} height={70} rx={16} fill="rgba(63,227,255,0.08)" stroke="rgba(63,227,255,0.3)" strokeWidth={2} />
              <text x={125} y={305} textAnchor="middle" fill={THEME.cyan} fontSize={30} fontWeight={700}>
                电源
              </text>
            </g>
            <path
              d="M 220 295 L 420 295 L 420 170 L 640 170"
              fill="none"
              stroke="#4d83b8"
              strokeWidth={8}
              strokeLinecap="round"
            />
            <path d="M 640 170 L 640 420" fill="none" stroke="#4d83b8" strokeWidth={8} strokeLinecap="round" />
            <path d="M 640 420 L 220 420 Z" fill="none" stroke="#4d83b8" strokeWidth={8} strokeLinecap="round" />
            <circle cx={640} cy={285} r={86} fill="rgba(255,194,71,0.08)" stroke={mixHex("#42506e", THEME.amber, ignite)} strokeWidth={5} />
            <path
              d="M 618 312 L 632 268 L 646 300 L 660 268 L 674 312"
              fill="none"
              stroke={mixHex("#42506e", THEME.amber, ignite)}
              strokeWidth={6}
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 ${14 * ignite}px ${THEME.amber})` }}
            />
            {ignite > 0.05 && (
              <circle cx={640} cy={285} r={86 + 46 * ignite} fill="none" stroke={THEME.amber} strokeWidth={4} opacity={0.25 * ignite} style={{ filter: "blur(10px)" }} />
            )}
            <path
              d="M 640 170 C 760 210, 760 360, 640 420"
              fill="none"
              stroke={THEME.danger}
              strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray={`${dash} 400`}
              style={{ filter: `drop-shadow(0 0 ${8 + 20 * ignite}px rgba(255,77,94,0.85))` }}
            />
            {f >= 46 &&
              Array.from({ length: 18 }).map((_, i) => {
                const t = (f - 46 - i * 2) / 24;
                if (t <= 0 || t >= 1) return null;
                const a = (i / 18) * Math.PI * 2 + i * 0.7;
                const r = t * (140 + (i % 4) * 50);
                return (
                  <circle
                    key={i}
                    cx={700 + Math.cos(a) * r}
                    cy={295 + Math.sin(a) * r * 0.85}
                    r={7 * (1 - t)}
                    fill={i % 2 ? THEME.danger2 : THEME.cyan}
                    opacity={1 - t}
                    style={{ filter: "drop-shadow(0 0 10px rgba(255,154,60,1))" }}
                  />
                );
              })}
            {f > 60 &&
              [0, 1, 2].map((i) => {
                const t = (f - 60 - i * 10) / 70;
                if (t <= 0 || t >= 1) return null;
                return (
                  <circle
                    key={i}
                    cx={700 + i * 26}
                    cy={295 - t * 150}
                    r={30 + t * 70}
                    fill="rgba(180,190,210,0.12)"
                    opacity={0.5 * (1 - t)}
                  />
                );
              })}
          </svg>
        </div>
        <div style={{ position: "absolute", right: 110, top: 250, width: 720, textAlign: "right" }}>
          <div style={{ color: THEME.sub, fontSize: 26, letterSpacing: 10, marginBottom: 20 }}>
            初中物理 · 安全用电
          </div>
          <Title text="一根导线" size={92} color={THEME.text} />
          <div style={{ height: 18 }} />
          <Title text="就能引发火灾" size={92} color={THEME.danger} delay={14} />
          <div style={{ marginTop: 46, display: "flex", justifyContent: "flex-end" }}>
            <AlertBadge label="短路 = 失控的大电流" />
          </div>
        </div>
        <AbsoluteFill style={{ background: "#fff", opacity: flash, mixBlendMode: "overlay" }} />
        <Caption text="一根小小的导线，为什么能引发一场火灾？" delay={4} />
        <Caption text="答案，就藏在「短路」这两个字里。" delay={78} />
      </AbsoluteFill>
    </SceneFade>
  );
};

/* ============================================================
   场景 02 — 什么是短路
   ============================================================ */
const SceneWhat = () => {
  const f = useCurrentFrame();
  const reveal = spring({ frame: f - 22, config: { damping: 14, stiffness: 120 } });
  const grow = interpolate(f, [70, 120], [0, 1], clamp);
  return (
    <SceneFade>
      <AbsoluteFill style={{ fontFamily: FONT }}>
        <ActLabel num="01" title="什么是短路" />
        <div style={{ position: "absolute", top: 150, width: "100%", textAlign: "center" }}>
          <Title text="电流，找到了一条“捷径”" size={78} />
          <div style={{ color: THEME.sub, fontSize: 28, marginTop: 18, letterSpacing: 4 }}>
            SHORT CIRCUIT · 短路
          </div>
        </div>
        <div style={{ position: "absolute", left: 130, top: 340, width: 820, height: 430 }}>
          <svg viewBox="0 0 820 430" width="100%" height="100%">
            <rect x={60} y={120} width={230} height={150} rx={20} fill="rgba(255,194,71,0.08)" stroke={THEME.amber} strokeWidth={3} />
            <text x={175} y={195} textAnchor="middle" fill={THEME.amber} fontSize={32} fontWeight={700}>
              用电器
            </text>
            <text x={175} y={235} textAnchor="middle" fill={THEME.sub} fontSize={24}>
              有电阻
            </text>
            <path d="M 290 150 L 520 150 L 520 320 L 60 320 L 60 150" fill="none" stroke="#4d83b8" strokeWidth={8} strokeLinejoin="round" />
            <path
              d="M 290 150 C 380 90, 440 90, 520 150"
              fill="none"
              stroke={THEME.danger}
              strokeWidth={12}
              strokeLinecap="round"
              strokeDasharray={700}
              strokeDashoffset={700 * (1 - reveal)}
              style={{ filter: `drop-shadow(0 0 14px rgba(255,77,94,0.7))` }}
            />
            <text x={405} y={70} textAnchor="middle" fill={THEME.danger} fontSize={30} fontWeight={800} opacity={reveal}>
              捷径 · 电阻 ≈ 0
            </text>
            {Array.from({ length: 10 }).map((_, i) => {
              const t = ((i / 10 + f * 0.012) % 1) * 1.3;
              const onShort = t > 0.45 && t < 0.75;
              const p = onShort
                ? { x: 290 + (t - 0.45) * 766, y: 150 - Math.sin((t - 0.45) * 10.4) * 52 }
                : { x: 290 - Math.min(t, 0.45) * 511 + (t > 0.75 ? (t - 0.75) * 511 : 0), y: t > 0.75 ? 320 : 150 };
              return (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={8}
                  fill={onShort ? THEME.danger2 : THEME.cyan}
                  style={{ filter: `drop-shadow(0 0 10px ${onShort ? THEME.danger2 : THEME.cyan})` }}
                />
              );
            })}
          </svg>
        </div>
        <div style={{ position: "absolute", right: 130, top: 330, width: 760 }}>
          <Panel style={{ padding: "42px 46px" }}>
            <div style={{ color: THEME.cyan, fontSize: 28, letterSpacing: 6, marginBottom: 16 }}>定义</div>
            <div style={{ color: THEME.text, fontSize: 40, fontWeight: 800, lineHeight: 1.55 }}>
              电流不经过用电器，
              <br />
              直接由导线构成回路
            </div>
            <div style={{ height: 26 }} />
            <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
              <div style={{ color: THEME.sub, fontSize: 28 }}>结果：</div>
              <div
                style={{
                  color: THEME.danger,
                  fontSize: 38,
                  fontWeight: 900,
                  transform: `scale(${1 + grow * 0.12})`,
                  transformOrigin: "left center",
                  textShadow: `0 0 ${18 * grow}px rgba(255,77,94,0.8)`,
                }}
              >
                电阻极小 → 电流极大
              </div>
            </div>
          </Panel>
          <div style={{ marginTop: 30, display: "flex", gap: 20 }}>
            {["短路", "过载", "漏电"].map((t, i) => (
              <div
                key={t}
                style={{
                  padding: "16px 30px",
                  borderRadius: 14,
                  border: `2px solid ${i === 0 ? THEME.danger : THEME.line}`,
                  color: i === 0 ? THEME.danger : THEME.sub,
                  fontSize: 28,
                  fontWeight: 700,
                  background: i === 0 ? "rgba(255,77,94,0.12)" : "transparent",
                  opacity: interpolate(f, [130 + i * 12, 150 + i * 12], [0, 1], clamp),
                }}
              >
                {t}
              </div>
            ))}
            <div
              style={{
                alignSelf: "center",
                color: THEME.sub,
                fontSize: 24,
                opacity: interpolate(f, [180, 205], [0, 1], clamp),
              }}
            >
              ← 其中，短路最危险
            </div>
          </div>
        </div>
        <Caption text="短路：电流不经过用电器，直接由导线构成回路。" delay={6} />
        <Caption text="此时电阻极小，电流会瞬间变得非常大。" delay={120} />
      </AbsoluteFill>
    </SceneFade>
  );
};

/* ============================================================
   场景 03 — 正常电路对比
   ============================================================ */
const SceneNormal = () => {
  const f = useCurrentFrame();
  const isShort = f >= 150;
  const heat = isShort ? interpolate(f, [150, 210], [0, 1], clamp) : 0;
  return (
    <SceneFade>
      <AbsoluteFill style={{ fontFamily: FONT }}>
        <ActLabel num="02" title={isShort ? "对比：发生短路" : "对比：正常电路"} color={isShort ? THEME.danger : THEME.cyan} />
        <div style={{ position: "absolute", top: 132, width: "100%", textAlign: "center" }}>
          <Title text={isShort ? "同一条电路，突然失控" : "电流乖乖走完整条回路"} size={62} />
        </div>
        <div style={{ position: "absolute", left: 90, top: 240, width: 1120, height: 560 }}>
          <CircuitDemo shorted={isShort} />
        </div>
        <div style={{ position: "absolute", right: 90, top: 250, width: 610 }}>
          <Panel style={{ padding: "34px 38px" }} glow={isShort ? "rgba(255,77,94,0.25)" : "rgba(63,227,255,0.12)"}>
            <div style={{ color: THEME.sub, fontSize: 24, letterSpacing: 6, marginBottom: 18 }}>
              {isShort ? "状态：短路" : "状态：正常"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 26 }}>
              <div
                style={{
                  width: 96,
                  height: 52,
                  borderRadius: 999,
                  background: isShort ? "rgba(255,77,94,0.25)" : "rgba(63,227,255,0.2)",
                  border: `2px solid ${isShort ? THEME.danger : THEME.cyan}`,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 5,
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: isShort ? THEME.danger : THEME.cyan,
                    left: isShort ? 51 : 5,
                    transition: "all .35s",
                  }}
                />
              </div>
              <div style={{ color: THEME.text, fontSize: 28, fontWeight: 700 }}>开关：闭合</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ color: THEME.sub, fontSize: 26 }}>电流 I</span>
                <Counter value={isShort ? 220 : 0.55} unit={isShort ? "A ↑↑" : "A"} color={isShort ? THEME.danger : THEME.good} digits={isShort ? 0 : 2} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ color: THEME.sub, fontSize: 26 }}>总电阻 R</span>
                <Counter value={isShort ? 0.15 : 400} unit="Ω" color={isShort ? THEME.danger : THEME.good} digits={isShort ? 2 : 0} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ color: THEME.sub, fontSize: 26 }}>导线温度</span>
                <Counter value={isShort ? 320 : 26} unit="℃" color={isShort ? THEME.danger2 : THEME.good} digits={0} />
              </div>
            </div>
            <div style={{ marginTop: 30 }}>
              <div style={{ color: THEME.sub, fontSize: 22, marginBottom: 12 }}>电流大小</div>
              <div style={{ height: 20, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${isShort ? 96 : 12}%`,
                    background: isShort ? `linear-gradient(90deg,${THEME.danger2},${THEME.danger})` : `linear-gradient(90deg,${THEME.good},${THEME.cyan})`,
                    boxShadow: `0 0 18px ${isShort ? THEME.danger : THEME.cyan}`,
                    transition: "width .5s",
                  }}
                />
              </div>
            </div>
            <div style={{ marginTop: 30, height: 60, display: "flex", alignItems: "center" }}>
              {isShort ? (
                <AlertBadge label="电流过载 · 立即断电！" />
              ) : (
                <div style={{ color: THEME.good, fontSize: 26, fontWeight: 700, letterSpacing: 3 }}>
                  ✓ 电流稳定，用电器正常工作
                </div>
              )}
            </div>
          </Panel>
        </div>
        <Caption text="正常电路中，电流沿着导线流过小灯泡，灯泡正常发光。" delay={6} />
        <Caption text="但只要接上一条“捷径”，一切就完全变了样……" delay={150} />
      </AbsoluteFill>
    </SceneFade>
  );
};

/* ============================================================
   场景 04 — 原理公式
   ============================================================ */
const SceneFormula = () => {
  const f = useCurrentFrame();
  const enter = (d) => spring({ frame: f - d, config: { damping: 13, stiffness: 120 } });
  const blow = interpolate(f, [120, 165], [0, 1], clamp);
  return (
    <SceneFade>
      <AbsoluteFill style={{ fontFamily: FONT }}>
        <ActLabel num="03" title="原理：欧姆定律" color={THEME.amber} />
        <div style={{ position: "absolute", top: 150, width: "100%", textAlign: "center" }}>
          <Title text="为什么会这样？看看这个公式" size={72} />
        </div>
        <div style={{ position: "absolute", top: 320, width: "100%", display: "flex", justifyContent: "center", gap: 70 }}>
          <Panel style={{ padding: "50px 66px", textAlign: "center", opacity: enter(6), transform: `translateY(${(1 - enter(6)) * 40}px)` }}>
            <div style={{ color: THEME.sub, fontSize: 26, letterSpacing: 8, marginBottom: 26 }}>欧姆定律</div>
            <div style={{ fontSize: 110, fontWeight: 900, color: THEME.text, fontFamily: MONO }}>
              I = <span style={{ color: THEME.cyan }}>U</span> / <span style={{ color: THEME.amber }}>R</span>
            </div>
            <div style={{ marginTop: 26, color: THEME.sub, fontSize: 28, lineHeight: 1.9 }}>
              <span style={{ color: THEME.cyan }}>电压 U</span> 一定（220 V）
              <br />
              <span style={{ color: THEME.amber }}>电阻 R</span> 越小 → <span style={{ color: THEME.danger }}>电流 I</span> 越大
            </div>
          </Panel>
          <div style={{ display: "flex", flexDirection: "column", gap: 24, width: 620 }}>
            <Panel style={{ padding: "28px 36px", opacity: enter(24) }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ color: THEME.good, fontSize: 30, fontWeight: 800 }}>正常电路</div>
                  <div style={{ color: THEME.sub, fontSize: 24, marginTop: 6 }}>R = 400 Ω</div>
                </div>
                <div style={{ fontFamily: MONO, fontSize: 44, fontWeight: 800, color: THEME.good }}>I ≈ 0.55 A</div>
              </div>
              <div style={{ marginTop: 18, height: 18, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${8 * enter(30)}%`, background: THEME.good, boxShadow: `0 0 16px ${THEME.good}` }} />
              </div>
            </Panel>
            <Panel
              style={{
                padding: "28px 36px",
                opacity: enter(40),
                border: `1px solid rgba(255,77,94,0.5)`,
                transform: `scale(${1 + blow * 0.06})`,
                boxShadow: `0 0 ${40 * blow}px rgba(255,77,94,0.45)`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ color: THEME.danger, fontSize: 30, fontWeight: 800 }}>短路时</div>
                  <div style={{ color: THEME.sub, fontSize: 24, marginTop: 6 }}>R ≈ 0.15 Ω</div>
                </div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 58,
                    fontWeight: 900,
                    color: THEME.danger,
                    transform: `scale(${1 + blow * 0.35})`,
                    transformOrigin: "right center",
                    textShadow: `0 0 ${22 * blow}px rgba(255,77,94,0.9)`,
                  }}
                >
                  I ≈ 220 A ↑↑↑
                </div>
              </div>
              <div style={{ marginTop: 18, height: 18, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${97 * enter(48)}%`,
                    background: `linear-gradient(90deg,${THEME.danger2},${THEME.danger})`,
                    boxShadow: `0 0 22px ${THEME.danger}`,
                  }}
                />
              </div>
            </Panel>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            top: 855,
            width: "100%",
            textAlign: "center",
            color: THEME.danger,
            fontSize: 34,
            fontWeight: 800,
            letterSpacing: 4,
            opacity: interpolate(f, [170, 195], [0, 1], clamp),
          }}
        >
          电流瞬间增大几十、上百倍 —— 这就是短路可怕的原因
        </div>
        <Caption text="电压一定时，电阻越小，电流越大。" delay={6} />
        <Caption text="短路让电阻几乎为零，电流瞬间暴增！" delay={128} />
      </AbsoluteFill>
    </SceneFade>
  );
};

/* ============================================================
   场景 05 — 危害
   ============================================================ */
const SceneDanger = () => {
  const f = useCurrentFrame();
  const glow = 0.55 + 0.45 * Math.abs(Math.sin(f / 9));
  const temp = interpolate(f, [30, 110], [26, 480], clamp);
  const flame = interpolate(f, [70, 110], [0, 1], clamp);
  const cards = [
    { icon: "🔥", title: "烧毁绝缘层", desc: "高温让导线外皮熔化、起火" },
    { icon: "⚡", title: "烧坏电源", desc: "大电流瞬间损坏电池 / 变压器" },
    { icon: "💥", title: "引发火灾", desc: "电气火灾往往只在几秒之间" },
    { icon: "⚠", title: "触电危险", desc: "绝缘失效，人可能直接触电" },
  ];
  return (
    <SceneFade>
      <AbsoluteFill style={{ fontFamily: FONT }}>
        <ActLabel num="04" title="短路有多危险" color={THEME.danger} />
        <div style={{ position: "absolute", top: 140, width: "100%", textAlign: "center" }}>
          <Title text="大电流 = 高温 + 火灾" size={76} color={mixHex(THEME.text, THEME.danger, 0.55)} />
        </div>
        <div style={{ position: "absolute", left: 120, top: 300, width: 780, height: 480 }}>
          <svg viewBox="0 0 780 480" width="100%" height="100%">
            <ellipse cx={390} cy={250} rx={330} ry={150} fill="rgba(255,90,46,0.10)" style={{ filter: "blur(30px)" }} opacity={glow} />
            <path
              d="M 60 250 C 240 170, 540 330, 720 250"
              fill="none"
              stroke={mixHex("#c2452c", "#ff7a2e", glow)}
              strokeWidth={22}
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 ${16 + 22 * glow}px rgba(255,90,46,0.95))` }}
            />
            <path
              d="M 60 250 C 240 170, 540 330, 720 250"
              fill="none"
              stroke="#ffd08a"
              strokeWidth={6}
              strokeLinecap="round"
              opacity={0.35 + 0.4 * glow}
              strokeDasharray="26 22"
            />
            {flame > 0 &&
              [0, 1, 2, 3, 4, 5].map((i) => {
                const x = 140 + i * 100;
                const y = 250 - Math.abs(Math.sin(i * 1.3)) * 60;
                const h = (70 + (i % 3) * 30) * flame * (0.8 + 0.2 * Math.sin(f / 4 + i));
                return (
                  <g key={i} opacity={flame}>
                    <ellipse cx={x} cy={y - h * 0.5} rx={22} ry={h * 0.5} fill="rgba(255,120,40,0.55)" style={{ filter: "blur(6px)" }} />
                    <ellipse cx={x} cy={y - h * 0.32} rx={12} ry={h * 0.32} fill="rgba(255,210,90,0.85)" style={{ filter: "blur(3px)" }} />
                  </g>
                );
              })}
            <rect x={690} y={90} width={22} height={230} rx={11} fill="rgba(255,255,255,0.1)" />
            <rect
              x={690}
              y={320 - (temp / 520) * 230}
              width={22}
              height={(temp / 520) * 230}
              rx={11}
              fill={mixHex(THEME.good, THEME.danger, temp / 480)}
            />
            <text x={640} y={80} fill={THEME.danger} fontSize={34} fontFamily={MONO} fontWeight={800}>
              {Math.round(temp)} ℃
            </text>
          </svg>
        </div>
        <div style={{ position: "absolute", right: 110, top: 290, width: 800, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26 }}>
          {cards.map((c, i) => {
            const t = spring({ frame: f - 24 - i * 12, config: { damping: 13, stiffness: 120 } });
            return (
              <Panel
                key={c.title}
                style={{
                  padding: "30px 32px",
                  opacity: t,
                  transform: `translateY(${(1 - t) * 46}px)`,
                  border: `1px solid rgba(255,77,94,0.35)`,
                }}
              >
                <div style={{ fontSize: 52 }}>{c.icon}</div>
                <div style={{ color: THEME.text, fontSize: 32, fontWeight: 800, marginTop: 12 }}>{c.title}</div>
                <div style={{ color: THEME.sub, fontSize: 24, marginTop: 10, lineHeight: 1.6 }}>{c.desc}</div>
              </Panel>
            );
          })}
        </div>
        <Caption text="大电流产生大量热量，烧毁绝缘层，甚至引发火灾。" delay={6} />
        <Caption text="短路，是家庭电路起火最常见的原因之一。" delay={140} />
      </AbsoluteFill>
    </SceneFade>
  );
};

/* ============================================================
   场景 06 — 如何避免 + 结尾
   ============================================================ */
const ScenePrevent = () => {
  const f = useCurrentFrame();
  const tips = [
    { n: "01", t: "别让导线直接相连", d: "火线与零线、正负极绝不能直接碰在一起" },
    { n: "02", t: "安装保险装置", d: "保险丝 / 空气开关，电流过大时自动断电" },
    { n: "03", t: "避免一个插座接太多电器", d: "防止过载发热，诱发短路" },
    { n: "04", t: "定期检查电线与电器", d: "破损、老化的导线要及时更换" },
  ];
  return (
    <SceneFade>
      <AbsoluteFill style={{ fontFamily: FONT }}>
        <ActLabel num="05" title="如何避免短路" color={THEME.good} />
        <div style={{ position: "absolute", top: 148, width: "100%", textAlign: "center" }}>
          <Title text="记住这 4 招，远离短路" size={74} color={THEME.text} />
          <div style={{ color: THEME.sub, fontSize: 28, marginTop: 16, letterSpacing: 5 }}>
            安全用电 · 从细节做起
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            top: 340,
            left: 130,
            right: 130,
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: 28,
          }}
        >
          {tips.map((tip, i) => {
            const t = spring({ frame: f - 20 - i * 13, config: { damping: 13, stiffness: 115 } });
            return (
              <Panel
                key={tip.n}
                style={{
                  padding: "38px 32px",
                  opacity: t,
                  transform: `translateY(${(1 - t) * 56}px)`,
                  textAlign: "center",
                  borderTop: `4px solid ${THEME.good}`,
                }}
              >
                <div
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: "50%",
                    margin: "0 auto",
                    background: "rgba(63,227,161,0.14)",
                    border: `2px solid ${THEME.good}`,
                    color: THEME.good,
                    fontSize: 32,
                    fontWeight: 900,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: MONO,
                  }}
                >
                  {tip.n}
                </div>
                <div style={{ color: THEME.text, fontSize: 31, fontWeight: 800, marginTop: 22, lineHeight: 1.45 }}>
                  {tip.t}
                </div>
                <div style={{ color: THEME.sub, fontSize: 23, marginTop: 14, lineHeight: 1.7 }}>{tip.d}</div>
              </Panel>
            );
          })}
        </div>
        <div
          style={{
            position: "absolute",
            top: 800,
            left: 130,
            right: 130,
            height: 150,
            borderRadius: 22,
            background: `linear-gradient(90deg, rgba(63,227,255,0.12), rgba(255,77,94,0.12))`,
            border: `1px solid ${THEME.line}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 46px",
            opacity: interpolate(f, [150, 180], [0, 1], clamp),
          }}
        >
          <div style={{ color: THEME.text, fontSize: 34, fontWeight: 700, letterSpacing: 2 }}>
            短路并不可怕，<span style={{ color: THEME.danger }}>不懂它</span>才可怕。
          </div>
          <div style={{ color: THEME.sub, fontSize: 26 }}>
            看懂原理 · 规范用电 · 及时断电
          </div>
        </div>
        <Caption text="不乱接导线、装好保险丝、不超负荷用电。" delay={6} />
        <Caption text="看懂原理，规范用电，短路就能被我们挡在门外。" delay={150} />
      </AbsoluteFill>
    </SceneFade>
  );
};

/* ============================================================
   主合成：时间轴 + 音效
   ============================================================ */
const ShortCircuitVideo = () => {
  const frame = useCurrentFrame();
  const S = (s) => Math.round(s * 30);
  const tSpark = S(1.55);
  const tAlarm = S(2.1);
  const tRiser = S(5.2);
  const tPop2 = S(6.2);
  const tClick = S(11.15);
  const tShort = S(16.15);
  const tSpark2 = S(16.4);
  const tAlarm2 = S(16.9);
  const tPop4 = S(21.4);
  const tBoom = S(26.05);
  return (
    <AbsoluteFill style={{ background: THEME.bg, fontFamily: FONT }}>
      <Backdrop />
      <Sequence from={0} durationInFrames={S(6)} premountFor={30}>
        <SceneHook />
        <Audio src={sndHum} volume={0.14} />
        <Audio src={sndSpark} startFrom={tSpark} volume={0.9} />
        <Audio src={sndAlarm} startFrom={tAlarm} volume={0.75} />
        <Audio src={sndRiser} startFrom={tRiser} volume={0.55} />
      </Sequence>
      <Sequence from={S(6)} durationInFrames={S(5)} premountFor={30}>
        <SceneWhat />
        <Audio src={sndPop} startFrom={tPop2} volume={0.7} />
      </Sequence>
      <Sequence from={S(11)} durationInFrames={S(5)} premountFor={30}>
        <SceneNormal />
        <Audio src={sndClick} startFrom={tClick} volume={0.85} />
        <Audio src={sndSpark} startFrom={tShort} volume={0.9} />
        <Audio src={sndSpark} startFrom={tSpark2} volume={0.7} />
        <Audio src={sndAlarm} startFrom={tAlarm2} volume={0.6} />
      </Sequence>
      <Sequence from={S(16)} durationInFrames={S(5)} premountFor={30}>
        <SceneFormula />
        <Audio src={sndPop} startFrom={tPop4} volume={0.7} />
      </Sequence>
      <Sequence from={S(21)} durationInFrames={S(5)} premountFor={30}>
        <SceneDanger />
        <Audio src={sndBoom} startFrom={tBoom} volume={0.85} />
      </Sequence>
      <Sequence from={S(26)} durationInFrames={S(7.8)} premountFor={30}>
        <ScenePrevent />
      </Sequence>
      <AbsoluteFill
        style={{
          background: "#000",
          opacity: interpolate(frame, [VIDEO_CONFIG.durationInFrames - 26, VIDEO_CONFIG.durationInFrames - 2], [0, 1], clamp),
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

registerRoot(ShortCircuitVideo);