import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  registerRoot,
} from "remotion";

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
const SceneFade = ({ children }) => {
  const f = useCurrentFrame();
  const opacity = interpolate(f, [0, 10], [0, 1], clamp);
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

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
    </AbsoluteFill>
  );
};

/* ============================================================
   电路几何
   ============================================================ */
const GEO = {
  x1: 270, x2: 1030, y1: 230, y2: 560,
  bulbX: 650, swX: 860, bx1: 690, bx2: 990, by: 400,
  ex1: 350, ex2: 500,
};

const PATH_LOOP = [
  { x: GEO.x1, y: GEO.y2 },
  { x: GEO.x2, y: GEO.y2 },
  { x: GEO.x2, y: GEO.y1 },
  { x: GEO.swX, y: GEO.y1 },
  { x: GEO.bx2, y: GEO.y1 },
  { x: GEO.bulbX, y: GEO.y1 },
  { x: GEO.bx1, y: GEO.y1 },
  { x: GEO.x1, y: GEO.y1 },
  { x: GEO.x1, y: GEO.y2 },
];

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
    />
  </>
);

const BatterySymbol = ({ color }) => (
  <g>
    <rect x={GEO.ex1 - 60} y={GEO.y2 - 26} width={GEO.ex2 - GEO.ex1 + 120} height={52} rx={12} fill="rgba(63,227,255,0.06)" stroke="rgba(63,227,255,0.22)" strokeWidth={2} />
    <line x1={GEO.ex1} y1={GEO.y2 - 30} x2={GEO.ex1} y2={GEO.y2 + 30} stroke={color} strokeWidth={7} strokeLinecap="round" />
    <line x1={GEO.ex1 + 26} y1={GEO.y2 - 17} x2={GEO.ex1 + 26} y2={GEO.y2 + 17} stroke={color} strokeWidth={5} strokeLinecap="round" />
    <line x1={GEO.ex2 - 26} y1={GEO.y2 - 30} x2={GEO.ex2 - 26} y2={GEO.y2 + 30} stroke={color} strokeWidth={7} strokeLinecap="round" />
    <line x1={GEO.ex2} y1={GEO.y2 - 17} x2={GEO.ex2} y2={GEO.y2 + 17} stroke={color} strokeWidth={5} strokeLinecap="round" />
    <text x={GEO.ex2 + 30} y={GEO.y2 + 12} fill={THEME.sub} fontSize={30} fontFamily={MONO} fontWeight={700}>电源</text>
    <text x={GEO.ex2 + 30} y={GEO.y2 + 50} fill={color} fontSize={24} fontFamily={MONO} opacity={0.85}>U = 220 V</text>
  </g>
);

const CircuitDemo = ({ shorted }) => {
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
      ? { x: Math.min(GEO.bx2, Math.max(GEO.bx1, p.x)), y: GEO.by + Math.sin(frame / 4 + i) * 6 }
      : p;
    electrons.push(<Electron key={i} x={pos.x} y={pos.y} r={onBypass ? 7.5 : 6} color={onBypass ? THEME.danger2 : THEME.cyan} />);
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
      <path d={`M ${GEO.x1} ${GEO.y2} L ${GEO.x2} ${GEO.y2} L ${GEO.x2} ${GEO.y1} L ${GEO.x1} ${GEO.y1} Z`} fill="none" stroke={wireColor} strokeWidth={8} strokeLinejoin="round" opacity={0.9} />
      <BatterySymbol color={THEME.cyan} />
      <BulbGlass color={mixHex(THEME.amber, "#42506e", 1 - glowBulb)} glow={glowBulb} />
      <text x={GEO.bulbX} y={GEO.y1 + 108} textAnchor="middle" fill={THEME.sub} fontSize={26}>小灯泡（用电器）</text>
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
      {electrons}
      {sparks}
    </svg>
  );
};

/* ============================================================
   全部场景
   ============================================================ */
const SceneHook = () => {
  const f = useCurrentFrame();
  const ignite = interpolate(f, [40, 52], [0, 1], clamp);
  const shake = f >= 46 && f <= 76 ? Math.sin(f * 2.1) * (10 - (f - 46) * 0.3) : 0;
  const flash = interpolate(f, [46, 52, 62], [0, 0.55, 0], clamp);
  const dash = 340 * (1 - ignite);
  return (
    <SceneFade>
      <AbsoluteFill style={{ transform: `translateX(${shake}px)`, fontFamily: FONT }}>
        <ActLabel num="00" title="开场" color={THEME.danger} />
        <div style={{ position: "absolute", left: 120, top: 190, width: 880, height: 620 }}>
          <svg viewBox="0 0 880 620" width="100%" height="100%">
            <rect x={30} y={260} width={190} height={70} rx={16} fill="rgba(63,227,255,0.08)" stroke="rgba(63,227,255,0.3)" strokeWidth={2} />
            <text x={125} y={305} textAnchor="middle" fill={THEME.cyan} fontSize={30} fontWeight={700}>电源</text>
            <path d="M 220 295 L 420 295 L 420 170 L 640 170 L 640 420 L 220 420" fill="none" stroke="#4d83b8" strokeWidth={8} strokeLinecap="round" />
            <circle cx={640} cy={285} r={86} fill="rgba(255,194,71,0.08)" stroke={mixHex("#42506e", THEME.amber, ignite)} strokeWidth={5} />
            <path d="M 618 312 L 632 268 L 646 300 L 660 268 L 674 312" fill="none" stroke={mixHex("#42506e", THEME.amber, ignite)} strokeWidth={6} strokeLinecap="round" />
            <path d="M 640 170 C 760 210, 760 360, 640 420" fill="none" stroke={THEME.danger} strokeWidth={10} strokeLinecap="round" strokeDasharray={`${dash} 400`} />
          </svg>
        </div>
        <div style={{ position: "absolute", right: 110, top: 250, width: 720, textAlign: "right" }}>
          <div style={{ color: THEME.sub, fontSize: 26, letterSpacing: 10, marginBottom: 20 }}>初中物理 · 安全用电</div>
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
        </div>
        <div style={{ position: "absolute", right: 130, top: 330, width: 760 }}>
          <Panel style={{ padding: "42px 46px" }}>
            <div style={{ color: THEME.cyan, fontSize: 28, letterSpacing: 6, marginBottom: 16 }}>定义</div>
            <div style={{ color: THEME.text, fontSize: 40, fontWeight: 800, lineHeight: 1.55 }}>
              电流不经过用电器，<br />直接由导线构成回路
            </div>
            <div style={{ height: 26 }} />
            <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
              <div style={{ color: THEME.sub, fontSize: 28 }}>结果：</div>
              <div style={{ color: THEME.danger, fontSize: 38, fontWeight: 900, transform: `scale(${1 + grow * 0.12})` }}>
                电阻极小 → 电流极大
              </div>
            </div>
          </Panel>
        </div>
        <Caption text="短路：电流不经过用电器，直接由导线构成回路。" delay={6} />
        <Caption text="此时电阻极小，电流会瞬间变得非常大。" delay={120} />
      </AbsoluteFill>
    </SceneFade>
  );
};

const SceneNormal = () => {
  const f = useCurrentFrame();
  const isShort = f >= 150;
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
        <Caption text="正常电路中，电流沿着导线流过小灯泡，灯泡正常发光。" delay={6} />
        <Caption text="但只要接上一条“捷径”，一切就完全变了样……" delay={150} />
      </AbsoluteFill>
    </SceneFade>
  );
};

const SceneFormula = () => {
  const f = useCurrentFrame();
  const enter = (d) => spring({ frame: f - d, config: { damping: 13, stiffness: 120 } });
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
            <div style={{ marginTop: 26, color: THEME.sub, fontSize: 28 }}>
              <span style={{ color: THEME.cyan }}>电压 U</span> 一定（220 V）<br />
              <span style={{ color: THEME.amber }}>电阻 R</span> 越小 → <span style={{ color: THEME.danger }}>电流 I</span> 越大
            </div>
          </Panel>
        </div>
        <Caption text="电压一定时，电阻越小，电流越大。" delay={6} />
        <Caption text="短路让电阻几乎为零，电流瞬间暴增！" delay={128} />
      </AbsoluteFill>
    </SceneFade>
  );
};

const SceneDanger = () => {
  const f = useCurrentFrame();
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
          <Title text="大电流 = 高温 + 火灾" size={76} />
        </div>
        <div style={{ position: "absolute", right: 110, top: 290, width: 800, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26 }}>
          {cards.map((c, i) => {
            const t = spring({ frame: f - 24 - i * 12, config: { damping: 13, stiffness: 120 } });
            return (
              <Panel key={c.title} style={{ padding: "30px 32px", opacity: t, transform: `translateY(${(1 - t) * 46}px)` }}>
                <div style={{ fontSize: 52 }}>{c.icon}</div>
                <div style={{ color: THEME.text, fontSize: 32, fontWeight: 800, marginTop: 12 }}>{c.title}</div>
                <div style={{ color: THEME.sub, fontSize: 24, marginTop: 10 }}>{c.desc}</div>
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
          <Title text="记住这 4 招，远离短路" size={74} />
        </div>
        <div style={{ position: "absolute", top: 340, left: 130, right: 130, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 28 }}>
          {tips.map((tip, i) => {
            const t = spring({ frame: f - 20 - i * 13, config: { damping: 13, stiffness: 115 } });
            return (
              <Panel key={tip.n} style={{ padding: "38px 32px", opacity: t, transform: `translateY(${(1 - t) * 56}px)`, textAlign: "center" }}>
                <div style={{ width: 76, height: 76, borderRadius: "50%", margin: "0 auto", background: "rgba(63,227,161,0.14)", border: `2px solid ${THEME.good}`, color: THEME.good, fontSize: 32, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO }}>
                  {tip.n}
                </div>
                <div style={{ color: THEME.text, fontSize: 31, fontWeight: 800, marginTop: 22 }}>{tip.t}</div>
                <div style={{ color: THEME.sub, fontSize: 23, marginTop: 14 }}>{tip.d}</div>
              </Panel>
            );
          })}
        </div>
        <Caption text="不乱接导线、装好保险丝、不超负荷用电。" delay={6} />
        <Caption text="看懂原理，规范用电，短路就能被我们挡在门外。" delay={150} />
      </AbsoluteFill>
    </SceneFade>
  );
};

/* ============================================================
   主入口，完整闭合
   ============================================================ */
const ShortCircuitVideo = () => {
  const frame = useCurrentFrame();
  const S = (s) => Math.round(s * 30);
  return (
    <AbsoluteFill style={{ background: THEME.bg, fontFamily: FONT }}>
      <Backdrop />
      <Sequence from={0} durationInFrames={S(6)} premountFor={30}><SceneHook /></Sequence>
      <Sequence from={S(6)} durationInFrames={S(5)} premountFor={30}><SceneWhat /></Sequence>
      <Sequence from={S(11)} durationInFrames={S(5)} premountFor={30}><SceneNormal /></Sequence>
      <Sequence from={S(16)} durationInFrames={S(5)} premountFor={30}><SceneFormula /></Sequence>
      <Sequence from={S(21)} durationInFrames={S(5)} premountFor={30}><SceneDanger /></Sequence>
      <Sequence from={S(26)} durationInFrames={S(7.8)} premountFor={30}><ScenePrevent /></Sequence>
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