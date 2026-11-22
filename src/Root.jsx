// src/Root.jsx — 打火机压电陶瓷点火原理动画
// 合成 id: ShortCircuitVideo（对应 render.yml）

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
  bg: "#070b16",
  bg2: "#0c1428",
  cyan: "#3fe3ff",
  gold: "#ffc247",
  orange: "#ff7a2e",
  red: "#ff4040",
  pink: "#ff5e9c",
  green: "#3fe3a1",
  blue: "#4a8eff",
  white: "#eef4ff",
  sub: "#8fa4c8",
  violet: "#b47aff",
};

/* ============================================================
   时间轴（30fps）
   0-150    开场：打火机点火钩子
   150-450  幕1：压电效应原理（晶体受压 → 电荷分离）
   450-780  幕2：高压放电（电荷积累 → 击穿空气 → 火花）
   780-1080 幕3：微观化学（分子活化 → 链式燃烧）
   1080-1350 幕4：总结 + 谢谢观看
   总计 1350 帧 = 45 秒
   ============================================================ */
const TOTAL = 1350;

/* ============================================================
   基础组件
   ============================================================ */
const Backdrop = () => {
  const f = useCurrentFrame();
  const drift = Math.sin(f / 80) * 24;
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 1300, height: 1300, left: -300 + drift, top: -480, background: "radial-gradient(circle, rgba(63,227,255,0.10) 0%, transparent 62%)" }} />
      <div style={{ position: "absolute", width: 1200, height: 1200, right: -380 - drift, bottom: -520, background: "radial-gradient(circle, rgba(255,122,46,0.10) 0%, transparent 62%)" }} />
      <AbsoluteFill style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px)",
        backgroundSize: "72px 72px",
      }} />
    </AbsoluteFill>
  );
};

const ActLabel = ({ num, title, color = C.cyan }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 12], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", top: 50, left: 70, display: "flex", alignItems: "center", gap: 16, opacity: o }}>
      <div style={{ width: 9, height: 38, borderRadius: 5, background: color, boxShadow: `0 0 18px ${color}` }} />
      <div style={{ color: C.sub, fontSize: 21, letterSpacing: 5 }}>{num}</div>
      <div style={{ color: C.white, fontSize: 28, fontWeight: 700, letterSpacing: 4 }}>{title}</div>
    </div>
  );
};

const Caption = ({ text, delay = 0 }) => {
  const f = useCurrentFrame();
  const y = interpolate(f - delay, [0, 12], [22, 0], clamp);
  const o = interpolate(f - delay, [0, 12], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: 100, right: 100, bottom: 50, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{
        transform: `translateY(${y}px)`, opacity: o,
        background: "rgba(8,13,26,0.82)", border: `1px solid rgba(100,160,255,0.18)`,
        borderRadius: 16, padding: "18px 42px", color: C.white, fontSize: 33,
        fontWeight: 500, letterSpacing: 1.5, textAlign: "center", lineHeight: 1.5,
      }}>
        {text}
      </div>
    </div>
  );
};

const BigTitle = ({ text, size = 78, color = C.white, delay = 0 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
      {text.split("").map((ch, i) => {
        const t = spring({ frame: f - delay - i * 2.5, config: { damping: 12, stiffness: 130 } });
        return (
          <span key={i} style={{
            fontSize: size, fontWeight: 900, color, letterSpacing: size * 0.04,
            lineHeight: 1.2, opacity: t, display: "inline-block", whiteSpace: "pre",
            transform: `translateY(${(1 - t) * 36}px) scale(${0.87 + 0.13 * t})`,
            textShadow: `0 0 ${24 * t}px ${color}55`,
          }}>{ch}</span>
        );
      })}
    </div>
  );
};

const KPI = ({ label, value, unit, color, top, left, delay = 0 }) => {
  const f = useCurrentFrame();
  const s = spring({ frame: f - delay, config: { damping: 12, stiffness: 120 }, durationInFrames: 22 });
  return (
    <div style={{
      position: "absolute", top, left,
      opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * 24}px)`,
      background: "rgba(14,22,44,0.85)", border: "1px solid rgba(100,160,255,0.22)",
      borderRadius: 18, padding: "22px 30px", minWidth: 240,
    }}>
      <div style={{ color: C.sub, fontSize: 21, letterSpacing: 4 }}>{label}</div>
      <div style={{ marginTop: 8, display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ color, fontSize: 52, fontWeight: 900, fontFamily: "monospace" }}>{value}</span>
        <span style={{ color: C.sub, fontSize: 24 }}>{unit}</span>
      </div>
    </div>
  );
};

/* ============================================================
   开场：打火机点火
   ============================================================ */
const SceneHook = () => {
  const f = useCurrentFrame();
  const press = interpolate(f, [30, 50], [0, 1], clamp); // 按下
  const sparkT = f - 55;
  const glow = f > 55 ? Math.max(0, 1 - sparkT / 25) : 0;
  const flameH = interpolate(f, [72, 95], [0, 1], clamp);
  const flicker = 0.85 + 0.15 * Math.sin(f * 1.7);

  return (
    <AbsoluteFill>
      <ActLabel num="00" title="一根打火机里的物理与化学" color={C.orange} />
      <div style={{ position: "absolute", top: 145, width: "100%", textAlign: "center" }}>
        <BigTitle text="轻轻一按，火花从哪来？" size={82} />
      </div>

      {/* 打火机实物动画 */}
      <svg viewBox="0 0 900 780" width="900" height="780" style={{ position: "absolute", left: 120, top: 300 }}>
        {/* 火焰 */}
        {flameH > 0 && (
          <g opacity={flameH * flicker}>
            <ellipse cx={450} cy={210} rx={44} ry={130 * flameH} fill="rgba(255,160,50,0.30)" />
            <ellipse cx={450} cy={230} rx={28} ry={95 * flameH} fill="rgba(255,200,80,0.5)" />
            <ellipse cx={450} cy={255} rx={15} ry={55 * flameH} fill="rgba(255,240,180,0.8)" />
          </g>
        )}
        {/* 火花 */}
        {sparkT > 0 && sparkT < 18 && Array.from({ length: 14 }).map((_, i) => {
          const t = sparkT / 18;
          const a = (i / 14) * Math.PI * 2 + i * 0.8;
          const r = t * (120 + (i % 4) * 60);
          return (
            <g key={i}>
              <circle cx={450 + Math.cos(a) * r} cy={300 + Math.sin(a) * r * 0.8} r={(4 - t * 3) * 1.2}
                fill={i % 2 ? "#ffe070" : "#7ad8ff"} opacity={1 - t} />
            </g>
          );
        })}
        {/* 机身 */}
        <rect x={355} y={310} width={190} height={330} rx={26} fill="#22304e" stroke="#3a5070" strokeWidth={3} />
        <rect x={355} y={310} width={190} height={80} rx={26} fill="#2c4060" />
        {/* 金属罩 */}
        <rect x={410} y={255} width={80} height={62} rx={10} fill="#8598b4" stroke="#a8bad2" strokeWidth={2} />
        {/* 出气孔 */}
        <rect x={438} y={242} width={24} height={18} rx={5} fill="#556680" />
        {/* 按钮（按压动画） */}
        <rect x={545} y={330} width={58} height={110} rx={16} fill={press > 0.5 ? "#ff7040" : "#e0522a"}
          transform={`translate(${press * 14},0)`} stroke="#ff9060" strokeWidth={2} />
        {/* 高亮线条 */}
        <rect x={375} y={410} width={150} height={6} rx={3} fill="rgba(255,255,255,0.12)" />
        <rect x={375} y={430} width={150} height={6} rx={3} fill="rgba(255,255,255,0.08)" />
        {/* 说明 */}
        <text x={450} y={700} textAnchor="middle" fill={C.sub} fontSize={26} fontFamily={F}>压电陶瓷点火器</text>
      </svg>

      {/* 右侧文字 */}
      <div style={{ position: "absolute", right: 130, top: 340, width: 660 }}>
        {[
          { t: "手指按下压电按钮", s: 60, c: C.cyan },
          { t: "压电陶瓷瞬间产生上万伏高压", s: 95, c: C.gold },
          { t: "电极间隙击穿，迸发火花", s: 130, c: C.orange },
          { t: "火花点燃可燃气体 → 火焰", s: 165, c: C.red },
        ].map((item, i) => {
          const s = spring({ frame: f - item.s, config: { damping: 13, stiffness: 115 }, durationInFrames: 22 });
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 18, marginBottom: 30,
              opacity: Math.min(1, s * 1.5), transform: `translateX(${(1 - s) * 40}px)`,
            }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: item.c, boxShadow: `0 0 14px ${item.c}`, flexShrink: 0 }} />
              <div style={{ color: C.white, fontSize: 34, fontWeight: 700, letterSpacing: 2 }}>{item.t}</div>
            </div>
          );
        })}
      </div>

      <Caption text="打火机轻轻一按就冒出火花——这背后是压电效应与气体放电" delay={10} />
      <Caption text="今天，我们从原子层面揭开它的秘密" delay={105} />
    </AbsoluteFill>
  );
};

/* ============================================================
   幕1：压电效应（晶体受压 → 电荷分离）
   ============================================================ */
const ScenePiezo = () => {
  const f = useCurrentFrame();
  const press = interpolate(f, [40, 80, 160, 200], [0, 1, 1, 0], clamp);
  const charge = interpolate(f, [70, 170], [0, 1], clamp);

  /* 晶格原子位移 */
  const shift = press * 14;

  return (
    <AbsoluteFill>
      <ActLabel num="01" title="压电效应 · 原子层面" color={C.cyan} />
      <div style={{ position: "absolute", top: 130, width: "100%", textAlign: "center" }}>
        <BigTitle text="压力让晶格中的正负电荷分离" size={66} />
        <div style={{ color: C.sub, fontSize: 26, marginTop: 14, letterSpacing: 5 }}>Piezoelectric Effect</div>
      </div>

      {/* 左：晶格动画 */}
      <svg viewBox="0 0 800 560" width="800" height="560" style={{ position: "absolute", left: 100, top: 310 }}>
        {/* 外力箭头 */}
        <g opacity={press > 0.02 ? 1 : 0}>
          <path d={`M 400 30 L 400 ${110 - press * 18}`} stroke={C.gold} strokeWidth={7} markerEnd="" />
          <polygon points={`${400 - 18},${110 - press * 18 - 26} ${400 + 18},${110 - press * 18 - 26} ${400},${110 - press * 18 - 2}`} fill={C.gold} />
          <text x={400} y={22} textAnchor="middle" fill={C.gold} fontSize={26} fontWeight={700} fontFamily={F}>压力 F</text>
        </g>

        {/* 晶体框 */}
        <rect x={180} y={115} width={440} height={330} rx={18} fill="rgba(63,227,255,0.05)" stroke="rgba(63,227,255,0.3)" strokeWidth={3} />
        <text x={400} y={505} textAnchor="middle" fill={C.sub} fontSize={23} fontFamily={F}>压电陶瓷晶格（示意）</text>

        {/* 原子阵列 5x3：正负交替 */}
        {Array.from({ length: 15 }).map((_, i) => {
          const row = Math.floor(i / 5);
          const col = i % 5;
          const pos = i % 2 === 0; // 正电荷
          const x = 240 + col * 80;
          const y = 190 + row * 100 - shift * (pos ? -1 : 1) * (1 - Math.abs(col - 2) * 0.12);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={26} fill={pos ? "rgba(74,142,255,0.85)" : "rgba(255,94,120,0.85)"} />
              <text x={x} y={y + 9} textAnchor="middle" fill="#fff" fontSize={24} fontWeight={900}>{pos ? "+" : "−"}</text>
              {/* 位移虚线 */}
              {press > 0.05 && (
                <line x1={x} y1={y + (pos ? 22 : -22) + (pos ? -1 : 1) * 40 * press} x2={x} y2={y}
                  stroke={pos ? "rgba(74,142,255,0.35)" : "rgba(255,94,120,0.35)"} strokeWidth={2} strokeDasharray="5 5" />
              )}
            </g>
          );
        })}

        {/* 表面电荷积累 */}
        {charge > 0.05 && (
          <g opacity={charge}>
            <rect x={180} y={106} width={440} height={12} rx={6} fill={C.blue} opacity={0.5 + 0.4 * charge} />
            <rect x={180} y={432} width={440} height={12} rx={6} fill={C.red} opacity={0.5 + 0.4 * charge} />
            <text x={655} y={118} fill={C.blue} fontSize={26} fontWeight={700} fontFamily={F}>+ Q</text>
            <text x={655} y={450} fill={C.red} fontSize={26} fontWeight={700} fontFamily={F}>− Q</text>
          </g>
        )}
      </svg>

      {/* 右：解释 + 数据 */}
      <div style={{ position: "absolute", right: 110, top: 320, width: 680 }}>
        {[
          { t: "压电陶瓷（锆钛酸铅 PZT）晶格中，正负电荷中心重合", d: 20, c: C.white },
          { t: "外力压缩 → 晶格变形 → 正负电荷中心错开", d: 65, c: C.cyan },
          { t: "上下表面积累等量异号电荷（极化）", d: 115, c: C.gold },
          { t: "机械能 → 电能：这就是压电效应", d: 170, c: C.green },
        ].map((item, i) => {
          const s = spring({ frame: f - item.d, config: { damping: 13, stiffness: 115 }, durationInFrames: 22 });
          return (
            <div key={i} style={{
              opacity: Math.min(1, s * 1.5), transform: `translateX(${(1 - s) * 34}px)`,
              marginBottom: 26, display: "flex", gap: 16, alignItems: "flex-start",
            }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: item.c, marginTop: 12, flexShrink: 0, boxShadow: `0 0 10px ${item.c}` }} />
              <div style={{ color: item.c, fontSize: 31, fontWeight: 700, lineHeight: 1.55, letterSpacing: 1 }}>{item.t}</div>
            </div>
          );
        })}

        <KPI label="典型输出电压" value="10-20" unit="kV" color={C.gold} top={395} left={0} delay={200} />
        <KPI label="按压一次能量" value="≈1" unit="mJ" color={C.green} top={395} left={310} delay={225} />
      </div>

      <Caption text="压电陶瓷受压时，晶格变形使正负电荷中心分离" delay={15} />
      <Caption text="上下表面积累电荷，产生上万伏的高压" delay={165} />
    </AbsoluteFill>
  );
};

/* ============================================================
   幕2：高压放电（电荷积累 → 空气击穿 → 火花）
   ============================================================ */
const SceneSpark = () => {
  const f = useCurrentFrame();
  const charge = interpolate(f, [0, 90], [0, 1], clamp);
  const breakout = f > 95;
  const sparkT = f - 95;

  /* 电子雪崩 */
  const avalanche = f > 105 && f < 175;

  return (
    <AbsoluteFill>
      <ActLabel num="02" title="气体放电 · 电子雪崩" color={C.gold} />
      <div style={{ position: "absolute", top: 130, width: "100%", textAlign: "center" }}>
        <BigTitle text="高压击穿空气，电流引爆气体" size={68} />
      </div>

      {/* 放电间隙图 */}
      <svg viewBox="0 0 1100 560" width="1100" height="560" style={{ position: "absolute", left: 80, top: 300 }}>
        {/* 电极 */}
        <rect x={180} y={220} width={280} height={120} rx={14} fill="#38506e" stroke="#5a7496" strokeWidth={3} />
        <text x={320} y={295} textAnchor="middle" fill={C.white} fontSize={28} fontWeight={700} fontFamily={F}>放电电极</text>
        <rect x={640} y={220} width={280} height={120} rx={14} fill="#38506e" stroke="#5a7496" strokeWidth={3} />
        <text x={780} y={295} textAnchor="middle" fill={C.white} fontSize={28} fontWeight={700} fontFamily={F}>放电电极</text>

        {/* 电极尖端 */}
        <path d="M 460 250 L 500 275 L 460 300 Z" fill="#5a7496" />
        <path d="M 640 250 L 600 275 L 640 300 Z" fill="#5a7496" />

        {/* 电荷符号 */}
        {charge > 0.1 && (
          <g opacity={charge}>
            {Array.from({ length: 5 }).map((_, i) => (
              <text key={`n${i}`} x={250 + i * 40} y={195} fill={C.blue} fontSize={28} fontWeight={900}>−</text>
            ))}
            {Array.from({ length: 5 }).map((_, i) => (
              <text key={`p${i}`} x={660 + i * 40} y={195} fill={C.red} fontSize={28} fontWeight={900}>+</text>
            ))}
          </g>
        )}

        {/* 电场线 */}
        {charge > 0.3 && !breakout && Array.from({ length: 6 }).map((_, i) => {
          const y = 210 + i * 34;
          return (
            <line key={`ef${i}`} x1={505} y1={y} x2={595} y2={y} stroke="rgba(255,194,71,0.4)" strokeWidth={2}
              strokeDasharray="8 8" strokeDashoffset={-f * 1.5} />
          );
        })}

        {/* 击穿火花通道 */}
        {breakout && sparkT < 120 && (
          <g>
            {/* 主通道 */}
            <path d={`M 500 275 L 530 ${252 + Math.sin(f * 2.1) * 12} L 555 ${298 + Math.cos(f * 1.8) * 10} L 585 ${258 + Math.sin(f * 2.4) * 11} L 600 275`}
              fill="none" stroke="#ffe070" strokeWidth={5} opacity={0.6 + 0.4 * Math.sin(f * 3)} />
            <path d={`M 500 275 L 530 ${252 + Math.sin(f * 2.1) * 12} L 555 ${298 + Math.cos(f * 1.8) * 10} L 585 ${258 + Math.sin(f * 2.4) * 11} L 600 275`}
              fill="none" stroke="#fff" strokeWidth={2} opacity={0.7} />
            {/* 火花飞溅 */}
            {Array.from({ length: 10 }).map((_, i) => {
              const t = ((f - 95) / 30 + i * 0.1) % 1;
              const a = (i / 10) * Math.PI * 2 + i;
              return (
                <circle key={`sp${i}`} cx={550 + Math.cos(a) * t * 130} cy={275 + Math.sin(a) * t * 100}
                  r={4 * (1 - t)} fill={i % 2 ? "#ffe070" : "#7ad8ff"} opacity={1 - t} />
              );
            })}
          </g>
        )}

        {/* 电子雪崩动画 */}
        {avalanche && Array.from({ length: 12 }).map((_, i) => {
          const phase = ((f - 105) * 0.025 + i * 0.083) % 1;
          const x = 505 + phase * 90;
          const y = 240 + (i % 4) * 24 + Math.sin(f * 0.3 + i * 1.7) * 14;
          return (
            <g key={`el${i}`}>
              <circle cx={x} cy={y} r={7} fill={C.cyan} opacity={0.85} />
              <text x={x} y={y + 5} textAnchor="middle" fill="#04121e" fontSize={13} fontWeight={900}>e⁻</text>
            </g>
          );
        })}

        {/* 温度标注 */}
        {breakout && (
          <g>
            <text x={550} y={430} textAnchor="middle" fill={C.orange} fontSize={32} fontWeight={800} fontFamily={F}>
              局部温度 ≈ 1000 ℃ 以上
            </text>
            <text x={550} y={478} textAnchor="middle" fill={C.sub} fontSize={24} fontFamily={F}>
              高能电子碰撞气体分子 → 电离 → 导电通道
            </text>
          </g>
        )}
      </svg>

      {/* 右侧数据 */}
      <KPI label="击穿场强（空气）" value="3×10⁶" unit="V/m" color={C.gold} top={330} left={1250} delay={30} />
      <KPI label="火花通道温度" value="1000+" unit="℃" color={C.orange} top={475} left={1250} delay={60} />
      <KPI label="放电持续时间" value="≈1" unit="μs" color={C.cyan} top={620} left={1250} delay={90} />

      <Caption text="电荷越积越多，两极间电压迅速攀升" delay={10} />
      <Caption text="场强超过空气击穿值，电子雪崩式电离形成导电通道" delay={95} />
      <Caption text="一次微小的火花，局部温度可达上千度" delay={185} />
    </AbsoluteFill>
  );
};

/* ============================================================
   幕3：化学 · 气体燃烧的链式反应
   ============================================================ */
const SceneChem = () => {
  const f = useCurrentFrame();
  const ignite = f > 35;
  const flameGrow = interpolate(f, [40, 80], [0, 1], clamp);
  const flicker = 0.88 + 0.12 * Math.sin(f * 1.9);

  return (
    <AbsoluteFill>
      <ActLabel num="03" title="燃烧化学 · 链式反应" color={C.red} />
      <div style={{ position: "absolute", top: 130, width: "100%", textAlign: "center" }}>
        <BigTitle text="从分子活化到持续燃烧" size={70} color={mix(C.white, C.orange, 0.3)} />
      </div>

      {/* 左：分子反应动画 */}
      <svg viewBox="0 0 820 600" width="820" height="600" style={{ position: "absolute", left: 80, top: 290 }}>
        {/* 反应物分子（丁烷 C4H10 简化 + O2） */}
        {Array.from({ length: 5 }).map((_, i) => {
          const t = f / 30;
          const x = 100 + (i % 3) * 130 + Math.sin(t * 0.8 + i * 2) * 22;
          const y = 100 + Math.floor(i / 3) * 110 + Math.cos(t * 0.6 + i) * 16;
          const reacted = ignite && f > 50 + i * 10;
          if (reacted) return null;
          return (
            <g key={`m${i}`}>
              <circle cx={x} cy={y} r={30} fill="rgba(74,142,255,0.7)" />
              <text x={x} y={y + 8} textAnchor="middle" fill="#fff" fontSize={17} fontWeight={800}>C₄H₁₀</text>
              <circle cx={x + 62} cy={y - 14} r={22} fill="rgba(255,94,120,0.7)" />
              <text x={x + 62} y={y - 6} textAnchor="middle" fill="#fff" fontSize={16} fontWeight={800}>O₂</text>
            </g>
          );
        })}

        {/* 活化中间体（自由基） */}
        {ignite && f > 45 && f < 130 && Array.from({ length: 4 }).map((_, i) => {
          const t = (f - 45) / 85;
          const x = 220 + i * 110 + Math.sin(f * 0.15 + i * 2) * 30;
          const y = 260 + Math.cos(f * 0.12 + i * 1.7) * 24;
          return (
            <g key={`r${i}`} opacity={Math.sin(t * Math.PI)}>
              <circle cx={x} cy={y} r={17} fill="rgba(255,194,71,0.8)" />
              <text x={x} y={y + 6} textAnchor="middle" fill="#402000" fontSize={14} fontWeight={900}>·OH</text>
            </g>
          );
        })}

        {/* 生成物 CO2 + H2O */}
        {ignite && f > 120 && Array.from({ length: 5 }).map((_, i) => {
          const t = Math.min(1, (f - 120 - i * 8) / 40);
          if (t <= 0) return null;
          const x = 100 + (i % 3) * 130 + t * 60;
          const y = 100 + Math.floor(i / 3) * 110 - t * 30;
          return (
            <g key={`p${i}`} opacity={t}>
              <circle cx={x} cy={y} r={26} fill="rgba(63,227,161,0.7)" />
              <text x={x} y={y + 7} textAnchor="middle" fill="#fff" fontSize={15} fontWeight={800}>CO₂</text>
              <circle cx={x + 56} cy={y + 22} r={20} fill="rgba(120,190,255,0.7)" />
              <text x={x + 56} y={y + 29} textAnchor="middle" fill="#fff" fontSize={14} fontWeight={800}>H₂O</text>
            </g>
          );
        })}

        {/* 火焰 */}
        {ignite && (
          <g opacity={flameGrow * flicker} transform={`translate(410,480) scale(${0.6 + flameGrow * 0.4})`}>
            <ellipse cx={0} cy={-40} rx={70} ry={115} fill="rgba(255,140,40,0.25)" />
            <ellipse cx={0} cy={-30} rx={48} ry={88} fill="rgba(255,190,70,0.42)" />
            <ellipse cx={0} cy={-14} rx={27} ry={55} fill="rgba(255,240,190,0.7)" />
          </g>
        )}

        {/* 箭头 */}
        <g opacity={ignite ? 1 : 0}>
          <path d="M 330 300 L 330 410" stroke={C.orange} strokeWidth={5} />
          <polygon points="318,392 342,392 330,415" fill={C.orange} />
          <text x={345} y={365} fill={C.orange} fontSize={22} fontWeight={700} fontFamily={F}>点燃</text>
        </g>
      </svg>

      {/* 右：反应方程式 + 说明 */}
      <div style={{ position: "absolute", right: 100, top: 310, width: 700 }}>
        {/* 方程式卡片 */}
        <div style={{
          background: "rgba(16,26,50,0.9)", border: "1px solid rgba(255,122,46,0.35)",
          borderRadius: 20, padding: "30px 36px",
          opacity: interpolate(f, [15, 35], [0, 1], clamp),
        }}>
          <div style={{ color: C.sub, fontSize: 22, letterSpacing: 5, marginBottom: 14 }}>燃烧反应（以丁烷为例）</div>
          <div style={{ color: C.gold, fontSize: 38, fontWeight: 900, fontFamily: "monospace", lineHeight: 1.7 }}>
            2C₄H₁₀ + 13O₂ → 8CO₂ + 10H₂O
          </div>
          <div style={{ color: C.green, fontSize: 26, marginTop: 14, fontWeight: 700 }}>
            放出大量热量（ΔH &lt; 0）
          </div>
        </div>

        {[
          { t: "火花提供活化能，打断 C–H 与 O=O 化学键", d: 55, c: C.orange },
          { t: "产生高活性自由基（·OH、·H、·O）", d: 95, c: C.gold },
          { t: "自由基不断再生 → 链式反应持续进行", d: 140, c: C.red },
          { t: "化学能 → 热能 + 光能：稳定的火焰", d: 185, c: C.green },
        ].map((item, i) => {
          const s = spring({ frame: f - item.d, config: { damping: 13, stiffness: 115 }, durationInFrames: 22 });
          return (
            <div key={i} style={{
              opacity: Math.min(1, s * 1.5), transform: `translateX(${(1 - s) * 32}px)`,
              marginTop: 24, display: "flex", gap: 15, alignItems: "flex-start",
            }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: item.c, marginTop: 12, flexShrink: 0, boxShadow: `0 0 10px ${item.c}` }} />
              <div style={{ color: item.c, fontSize: 30, fontWeight: 700, lineHeight: 1.55 }}>{item.t}</div>
            </div>
          );
        })}
      </div>

      <Caption text="火花的高温打断了丁烷与氧气的化学键" delay={15} />
      <Caption text="自由基引发链式反应，持续放出热量和光" delay={130} />
    </AbsoluteFill>
  );
};

/* ============================================================
   幕4：总结 + 谢谢观看
   ============================================================ */
const SceneEnd = () => {
  const f = useCurrentFrame();
  const o1 = interpolate(f, [10, 35], [0, 1], clamp);
  const o2 = interpolate(f, [55, 85], [0, 1], clamp);
  const o3 = interpolate(f, [120, 150], [0, 1], clamp);

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 130, width: "100%", textAlign: "center" }}>
        <BigTitle text="一根打火机 = 物理 + 化学" size={76} />
      </div>

      {/* 流程总结 */}
      <div style={{ position: "absolute", top: 330, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 30, opacity: o1, transform: `translateY(${interpolate(f, [10, 35], [30, 0], clamp)}px)` }}>
        {[
          { icon: "⚙", t: "机械能", s: "手指按压", c: C.cyan },
          { icon: "⚡", t: "电能", s: "压电效应", c: C.gold },
          { icon: "✦", t: "热能", s: "气体放电", c: C.orange },
          { icon: "🔥", t: "光能+热能", s: "链式燃烧", c: C.red },
        ].map((item, i) => (
          <React.Fragment key={i}>
            {i > 0 && <div style={{ alignSelf: "center", color: C.sub, fontSize: 40 }}>→</div>}
            <div style={{
              background: "rgba(16,26,50,0.9)", border: `2px solid ${item.c}55`,
              borderRadius: 22, padding: "28px 34px", textAlign: "center", width: 260,
            }}>
              <div style={{ fontSize: 52 }}>{item.icon}</div>
              <div style={{ color: item.c, fontSize: 32, fontWeight: 900, marginTop: 10 }}>{item.t}</div>
              <div style={{ color: C.sub, fontSize: 22, marginTop: 8 }}>{item.s}</div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* 升华 */}
      <div style={{
        position: "absolute", top: 720, width: "100%", textAlign: "center",
        opacity: o2,
      }}>
        <div style={{ color: C.white, fontSize: 42, fontWeight: 700, letterSpacing: 4, lineHeight: 1.8 }}>
          微观世界的一次电荷分离，<span style={{ color: C.gold }}>点亮了宏观世界的火焰</span>
        </div>
        <div style={{ color: C.sub, fontSize: 28, marginTop: 20, letterSpacing: 6 }}>
          物理赋予能量 · 化学释放光芒
        </div>
      </div>

      {/* 谢谢观看 */}
      <div style={{
        position: "absolute", top: 890, width: "100%", textAlign: "center",
        opacity: o3, transform: `scale(${interpolate(f, [120, 150], [0.88, 1], clamp)})`,
      }}>
        <div style={{ color: "rgba(255,255,255,0.9)", fontSize: 62, fontWeight: 900, letterSpacing: 22, textShadow: "0 0 30px rgba(255,200,100,0.3)" }}>
          谢 谢 观 看
        </div>
      </div>

      <Caption text="下一次按动打火机时，想想这束火花背后的科学" delay={20} />
    </AbsoluteFill>
  );
};

/* ============================================================
   辅助函数
   ============================================================ */
function mix(a, b, t) {
  const p = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const [r1, g1, b1] = p(a);
  const [r2, g2, b2] = p(b);
  return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`;
}

/* ============================================================
   主合成
   ============================================================ */
const PiezoLighter = () => {
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
      <Backdrop />
      <Composition>
        <Sequence from={0} durationInFrames={150}><SceneHook /></Sequence>
        <Sequence from={150} durationInFrames={300}><ScenePiezo /></Sequence>
        <Sequence from={450} durationInFrames={330}><SceneSpark /></Sequence>
        <Sequence from={780} durationInFrames={300}><SceneChem /></Sequence>
        <Sequence from={1080} durationInFrames={270}><SceneEnd /></Sequence>
      </Composition>
      <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse at center, transparent 52%, rgba(2,4,12,0.5) 100%)" }} />
    </AbsoluteFill>
  );
};

/* ============================================================
   注册
   ============================================================ */
export const RemotionRoot = () => (
  <Composition id="ShortCircuitVideo" component={PiezoLighter} durationInFrames={TOTAL} fps={30} width={1920} height={1080} />
);

registerRoot(RemotionRoot);