// ============================================================
// 《大碗宽面》2D MV — 单文件版
// 位置：src/Root.jsx
// 合成 id：ShortCircuitVideo（与 .github/workflows/render.yml 对应）
// 音轨：程序化生成的原创 120BPM 节拍（自动内嵌）
// 如需换成真实歌曲：把 mp3 放进 public/song.mp3，
// 将下方 <Audio src={TRACK} /> 替换为 <Audio src={staticFile("song.mp3")} />
// ============================================================

import React from "react";
import {
  AbsoluteFill,
  Audio,
  Composition,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  registerRoot,
  delayRender,
  continueRender,
} from "remotion";

/* ---------- 字体（Google Fonts + 系统 Noto CJK 兜底） ---------- */
if (typeof document !== "undefined" && !document.getElementById("mv-font-style")) {
  const st = document.createElement("style");
  st.id = "mv-font-style";
  st.textContent =
    "@import url('https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&family=Noto+Sans+SC:wght@400;700;900&display=swap');";
  document.head.appendChild(st);
}

const FONT = '"ZCOOL KuaiLe","Noto Sans SC","Noto Sans CJK SC",sans-serif';
const FONT2 = '"Noto Sans SC","Noto Sans CJK SC",sans-serif';

/* ---------- 主题色：夜市霓虹（暗夜紫黑 + 霓虹红金 + 翡翠绿） ---------- */
const C = {
  night: "#0e0821",
  night2: "#241041",
  plum: "#3b1428",
  red: "#e23146",
  red2: "#ff5470",
  gold: "#ffcf4a",
  gold2: "#ffe9a8",
  jade: "#2ee6a8",
  magenta: "#ff4fd8",
  cream: "#fff3e2",
};

const clampObj = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };

/* ---------- 节拍工具（120 BPM，1 拍 = 15 帧） ---------- */
const BEAT = 15;
const beatHit = (f) => Math.pow(1 - ((f % BEAT) + BEAT) % BEAT / BEAT, 3);

/* ---------- 确定性随机 / 噪声 ---------- */
const nz = (i) => {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
};
const rnd = (i) => {
  const x = Math.sin(i * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/* ============================================================
   音轨：程序化合成（原创 120BPM 中国风 Trap 小样，100 秒）
   ============================================================ */
function buildTrack() {
  const sr = 22050;
  const totalSec = 100;
  const n = sr * totalSec;
  const buf = new Float32Array(n);

  const add = (start, dur, fn) => {
    const s0 = Math.max(0, Math.floor(start * sr));
    const s1 = Math.min(n, Math.floor((start + dur) * sr));
    for (let i = s0; i < s1; i++) buf[i] += fn((i - s0) / sr, i);
  };

  /* 乐器 */
  const kick = (t) => Math.sin(2 * Math.PI * 52 * t + 6.5 * Math.exp(-t * 17)) * Math.exp(-t * 7.5);
  const clap = (t, i) => nz(i) * (Math.exp(-t * 24) + 0.5 * Math.exp(-t * 8)) * 0.5;
  const hat = (t, i, v) =>
    (nz(i * 1.37) * 0.22 + Math.sin(2 * Math.PI * 8300 * t) * 0.05) * Math.exp(-t * 80) * v;
  const bass = (f0) => (t) =>
    (Math.sin(2 * Math.PI * f0 * t) * 0.8 + Math.sin(2 * Math.PI * 2 * f0 * t) * 0.22) * Math.exp(-t * 1.9);
  const pluck = (f0) => (t) =>
    (Math.sin(2 * Math.PI * f0 * t + 2.4 * Math.exp(-t * 8)) * Math.exp(-t * 4.8) +
      0.32 * Math.sin(2 * Math.PI * 2 * f0 * t) * Math.exp(-t * 8)) * 0.4;
  const pad = (f0, dur) => (t) =>
    ((Math.sin(2 * Math.PI * f0 * t) +
      Math.sin(2 * Math.PI * f0 * 1.005 * t) +
      Math.sin(2 * Math.PI * f0 * 0.995 * t)) /
      3) *
    Math.min(1, t / 0.8) *
    Math.min(1, (dur - t) / 1.2) *
    0.16;

  /* A 五声音阶旋律（A C D E G），4 小节循环 */
  const MEL = [
    [440, 0, 523.25, 587.33, 0, 659.25, 587.33, 523.25],
    [440, 0, 392, 440, 0, 523.25, 0, 440],
    [587.33, 0, 659.25, 783.99, 0, 659.25, 587.33, 440],
    [523.25, 0, 440, 392, 0, 440, 0, 0],
  ];
  const ROOTS = [110, 98, 130.81, 98];
  const BAR = 2; // 2 秒/小节

  for (let bar = 0; bar < 50; bar++) {
    const t0 = bar * BAR;
    const groove = (bar >= 4 && bar < 20) || (bar >= 24 && bar < 42);
    const intro = bar < 4;
    const brk = bar >= 20 && bar < 24;
    const outro = bar >= 42;

    if (groove) {
      add(t0, 0.45, kick);
      add(t0 + 1.25, 0.45, kick);
      if (bar % 2 === 1) add(t0 + 1.875, 0.25, kick);
      add(t0 + 1.0, 0.3, clap);
      for (let h = 0; h < 8; h++) {
        const v = [1, 0.45, 0.7, 0.45, 1, 0.5, 0.9, 0.55][h];
        add(t0 + h * 0.25, 0.12, (t, i) => hat(t, i + bar * 31 + h * 7, v));
      }
      if (bar % 4 === 3) {
        for (let r = 0; r < 4; r++) add(t0 + 1.5 + r * 0.0625, 0.08, (t, i) => hat(t, i + r * 13, 0.8));
      }
    } else if (intro || outro) {
      for (let h = 0; h < 4; h++) add(t0 + h * 0.5, 0.12, (t, i) => hat(t, i + bar * 17, 0.55));
    } else if (brk) {
      add(t0 + 1.0, 0.3, (t, i) => clap(t, i) * 0.5);
    }

    const root = ROOTS[bar % 4];
    if (groove || brk) {
      add(t0, 0.7, bass(root));
      if (groove) add(t0 + 1.25, 0.55, bass(root * 0.75));
    }

    const phrase = MEL[bar % 4];
    for (let s = 0; s < 8; s++) {
      const f0 = phrase[s];
      if (!f0) continue;
      const gain = intro || outro ? 0.75 : 1;
      const tt = t0 + s * 0.25;
      add(tt, 0.6, (t) => pluck(f0)(t) * gain);
      add(tt + 0.25, 0.5, (t) => pluck(f0)(t) * 0.3 * gain);
      add(tt + 0.5, 0.4, (t) => pluck(f0)(t) * 0.12 * gain);
    }

    if (bar % 2 === 0) add(t0, 4, pad(root * 2, 4));
  }

  /* 淡入淡出 + 归一化 */
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    if (t < 0.6) buf[i] *= t / 0.6;
    if (t > 96) buf[i] *= Math.max(0, (100 - t) / 4);
  }
  let peak = 0;
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(buf[i]));
  const g = peak > 0 ? 0.86 / peak : 1;

  /* WAV 编码（16bit 单声道） */
  const bytes = new Uint8Array(44 + n * 2);
  const dv = new DataView(bytes.buffer);
  const wStr = (o, s) => {
    for (let k = 0; k < s.length; k++) dv.setUint8(o + k, s.charCodeAt(k));
  };
  wStr(0, "RIFF");
  dv.setUint32(4, 36 + n * 2, true);
  wStr(8, "WAVE");
  wStr(12, "fmt ");
  dv.setUint32(16, 16, true);
  dv.setUint16(20, 1, true);
  dv.setUint16(22, 1, true);
  dv.setUint32(24, sr, true);
  dv.setUint32(28, sr * 2, true);
  dv.setUint16(32, 2, true);
  dv.setUint16(34, 16, true);
  wStr(36, "data");
  dv.setUint32(40, n * 2, true);
  let off = 44;
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, buf[i] * g));
    dv.setInt16(off, s < 0 ? s * 32768 : s * 32767, true);
    off += 2;
  }
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return "data:audio/wav;base64," + btoa(bin);
}

const TRACK = typeof window !== "undefined" ? buildTrack() : "";

/* ============================================================
   通用小组件
   ============================================================ */

const Stars = () => {
  const f = useCurrentFrame();
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 46 }).map((_, i) => {
        const x = rnd(i * 3.1) * 1920;
        const y = rnd(i * 7.7) * 640;
        const r = 1 + rnd(i * 5.3) * 2.4;
        const o = 0.25 + 0.75 * Math.abs(Math.sin(f / 22 + i * 1.9));
        return <circle key={i} cx={x} cy={y} r={r} fill="#fff6d8" opacity={o} />;
      })}
    </svg>
  );
};

const NeonChar = ({ ch, delay, color }) => {
  const f = useCurrentFrame();
  const on = f >= delay;
  const unstable = on && f < delay + 22;
  const lit = !on
    ? 0
    : unstable
    ? Math.sin(f * 2.3) * Math.sin(f * 0.77) > -0.35
      ? 1
      : 0.25
    : 1;
  return (
    <div
      style={{
        fontFamily: FONT,
        fontSize: 168,
        color: color,
        opacity: lit,
        textShadow: `0 0 12px ${color}, 0 0 38px ${color}, 0 0 90px ${color}, 0 0 150px ${color}`,
        transform: `translateY(${(1 - lit) * 6}px)`,
      }}
    >
      {ch}
    </div>
  );
};

const NeonRow = ({ top }) => (
  <div
    style={{
      position: "absolute",
      top: top,
      width: 1920,
      display: "flex",
      justifyContent: "center",
      gap: 42,
    }}
  >
    {["大", "碗", "宽", "面"].map((ch, i) => (
      <NeonChar key={i} ch={ch} delay={10 + i * 12} color={i % 2 ? C.gold : C.red2} />
    ))}
  </div>
);

const Lantern = ({ x, y, s, phase, glow }) => {
  const f = useCurrentFrame();
  const sway = Math.sin(f / 24 + phase) * 6;
  const bright = (glow === undefined ? 1 : glow) * (0.8 + 0.2 * Math.sin(f / 9 + phase));
  return (
    <g transform={`translate(${x},${y}) rotate(${sway}) scale(${s})`}>
      <line x1="0" y1="-200" x2="0" y2="-84" stroke="#7c1e2b" strokeWidth="7" />
      <ellipse cx="0" cy="0" rx="82" ry="96" fill={`rgba(255,130,80,${0.18 * bright})`} />
      <ellipse cx="0" cy="0" rx="58" ry="70" fill="#d92f43" />
      <ellipse cx="0" cy="0" rx="58" ry="70" fill="none" stroke="#ff7a5c" strokeWidth="3" opacity="0.5" />
      <path d="M -58 -18 Q 0 8 58 -18" fill="none" stroke="#ff8b6b" strokeWidth="3" opacity="0.55" />
      <path d="M -58 18 Q 0 48 58 18" fill="none" stroke="#ff8b6b" strokeWidth="3" opacity="0.55" />
      <rect x="-26" y="-88" width="52" height="18" rx="6" fill="#e9b53c" />
      <rect x="-26" y="70" width="52" height="18" rx="6" fill="#e9b53c" />
      <path d="M 0 88 L 0 132" stroke="#e9b53c" strokeWidth="7" strokeLinecap="round" />
      <path d="M -10 132 L 10 132 L 4 178 L -4 178 Z" fill="#ffcf4a" />
    </g>
  );
};

const Chili = ({ x, y, s, rot }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <path
      d="M 0 0 C 26 12, 32 52, 8 76 C -12 92, -36 84, -30 64 C -24 44, -8 40, 0 22 Z"
      fill="#e0233a"
    />
    <path
      d="M -6 -8 C 6 -22, 24 -16, 22 -2"
      fill="none"
      stroke="#2f9e5c"
      strokeWidth="9"
      strokeLinecap="round"
    />
  </g>
);

const Scallion = ({ x, y, s, rot }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <rect x="-14" y="-48" width="28" height="96" rx="14" fill="#dff2c2" />
    <rect x="-14" y="-48" width="28" height="36" rx="14" fill="#3fae5c" />
  </g>
);

const Sunburst = () => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: -340,
        top: -460,
        width: 2600,
        height: 2600,
        borderRadius: "50%",
        background: `repeating-conic-gradient(from ${f * 0.12}deg, rgba(255,207,74,0.13) 0deg 10deg, transparent 10deg 20deg)`,
      }}
    />
  );
};

const CheckerFloor = () => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#1b0f33,#2c1247)" }} />
      <div
        style={{
          position: "absolute",
          left: -300,
          right: -300,
          bottom: -100,
          height: 720,
          transform: "perspective(650px) rotateX(64deg)",
          transformOrigin: "center bottom",
          backgroundImage: "repeating-conic-gradient(#2b1546 0% 25%, #46217a 0% 50%)",
          backgroundSize: "170px 170px",
          backgroundPosition: `0px ${f * 5}px`,
        }}
      />
    </>
  );
};

const StripeBG = () => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `repeating-linear-gradient(${115 + Math.sin(f / 40) * 8}deg, #2a0f22 0 70px, #45142f 70px 140px)`,
      }}
    />
  );
};

const WaveBG = () => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#101b3a,#2b1140)" }} />
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <path
            key={i}
            d={`M -50 ${260 + i * 120} Q 480 ${180 + i * 120 + Math.sin(f / 16 + i) * 70} 960 ${260 + i * 120} T 1970 ${260 + i * 120}`}
            fill="none"
            stroke={i % 2 ? "rgba(255,79,216,0.30)" : "rgba(46,230,168,0.26)"}
            strokeWidth="10"
          />
        ))}
      </svg>
    </>
  );
};

const Marquee = ({ text, y, speed, color, size }) => {
  const f = useCurrentFrame();
  const unit = text.length * (size * 0.95 + 26);
  const x = -((((f * speed) % unit) + unit) % unit);
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: 0,
        width: 1920,
        overflow: "hidden",
        whiteSpace: "nowrap",
      }}
    >
      <div
        style={{
          transform: `translateX(${x}px)`,
          fontFamily: FONT,
          fontSize: size,
          color: color,
          letterSpacing: 12,
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i}>{text}　·　</span>
        ))}
      </div>
    </div>
  );
};

const BowlGroup = ({ x, y, s, lift }) => {
  const f = useCurrentFrame();
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {/* 碗身 */}
      <path d="M -250 -30 C -240 140, -130 215, 0 215 C 130 215, 240 140, 250 -30 Z" fill="#c9302f" />
      <path
        d="M -250 -30 C -240 140, -130 215, 0 215 C 130 215, 240 140, 250 -30 Z"
        fill="none"
        stroke="#ff6a5c"
        strokeWidth="5"
        opacity="0.5"
      />
      <path
        d="M -210 62 C -120 122, 120 122, 210 62"
        fill="none"
        stroke="#e9b53c"
        strokeWidth="12"
        opacity="0.85"
        strokeDasharray="34 22"
      />
      <ellipse cx="0" cy="-30" rx="250" ry="52" fill="#8e1f28" />
      <ellipse cx="0" cy="-36" rx="222" ry="42" fill="#a3441c" />
      {/* 面条堆 */}
      {Array.from({ length: 8 }).map((_, i) => {
        const yy = -72 + i * 13;
        const amp = 14 + (i % 3) * 9;
        return (
          <path
            key={i}
            d={`M -170 ${yy} C -90 ${yy - amp + Math.sin(f / 11 + i) * 7}, -30 ${yy + amp}, 40 ${yy - amp * 0.5 + Math.sin(f / 13 + i * 2) * 9} S 150 ${yy + amp * 0.5}, 178 ${yy + 2}`}
            fill="none"
            stroke={i % 2 ? "#f7e0a4" : "#eed08c"}
            strokeWidth="10"
            strokeLinecap="round"
          />
        );
      })}
      {/* 筷子 */}
      <g transform="translate(150,-252) rotate(18)">
        <rect x="-8" y="-10" width="16" height="232" rx="8" fill="#caa06a" />
        <rect x="18" y="-10" width="16" height="232" rx="8" fill="#b98d54" />
      </g>
      {/* 提起的面条 */}
      <path
        d={`M 122 -232 C 62 ${-172 + Math.sin(f / 8) * 16 + lift}, 22 -122, -28 -86`}
        fill="none"
        stroke="#f7e0a4"
        strokeWidth="11"
        strokeLinecap="round"
      />
      <path
        d={`M 134 -234 C 76 ${-164 + Math.sin(f / 8 + 1) * 16 + lift}, 32 -112, -10 -78`}
        fill="none"
        stroke="#eed08c"
        strokeWidth="9"
        strokeLinecap="round"
      />
    </g>
  );
};

/* ============================================================
   场景 1：霓虹开场（钩子）
   ============================================================ */
const SceneIntro = () => {
  const f = useCurrentFrame();
  const zoom = interpolate(f, [0, 380], [1.05, 1], clampObj);
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${C.night} 0%, ${C.night2} 52%, ${C.plum} 100%)`,
        transform: `scale(${zoom})`,
        opacity: interpolate(f, [0, 12, 368, 380], [0, 1, 1, 0], clampObj),
        overflow: "hidden",
      }}
    >
      <Stars />
      {/* 月亮 */}
      <div
        style={{
          position: "absolute",
          right: 200,
          top: 120,
          width: 170,
          height: 170,
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 32%, #fff6d8, #f2c25e)",
          boxShadow: "0 0 110px rgba(242,194,94,0.5)",
        }}
      />

      {/* 店面 */}
      <div
        style={{
          position: "absolute",
          left: 300,
          top: 250,
          width: 1320,
          height: 660,
          background: "linear-gradient(180deg,#31162a,#22101f)",
          borderRadius: 26,
          border: "3px solid rgba(255,207,74,0.35)",
          boxShadow: "0 50px 120px rgba(0,0,0,0.55)",
        }}
      >
        {/* 遮阳棚 */}
        <div
          style={{
            position: "absolute",
            top: -36,
            left: -18,
            right: -18,
            height: 96,
            borderRadius: 18,
            background: `repeating-linear-gradient(90deg, ${C.red} 0 90px, ${C.cream} 90px 180px)`,
            boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
          }}
        />
        {/* 橱窗 */}
        <div
          style={{
            position: "absolute",
            left: 90,
            top: 150,
            right: 90,
            bottom: 90,
            borderRadius: 20,
            background:
              "radial-gradient(ellipse at 50% 70%, rgba(255,190,110,0.55), rgba(255,140,60,0.12) 65%, rgba(255,140,60,0.04))",
            border: "3px solid rgba(255,207,74,0.5)",
            overflow: "hidden",
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 1140 420" preserveAspectRatio="xMidYMid slice">
            <rect x="0" y="320" width="1140" height="100" fill="#4b2417" />
            <ellipse cx="330" cy="320" rx="90" ry="24" fill="#e0d3b2" />
            <path d="M 240 320 C 250 382, 410 382, 420 320 Z" fill="#f2ead2" />
            <ellipse cx="700" cy="332" rx="120" ry="28" fill="#d9c9a2" />
            <path d="M 580 332 C 595 404, 805 404, 820 332 Z" fill="#efe4c6" />
            {[0, 1, 2].map((i) => (
              <ellipse
                key={i}
                cx={330 + i * 22}
                cy={230 - ((f * 1.1 + i * 40) % 170)}
                rx={26 + i * 6}
                ry={16}
                fill="rgba(255,255,255,0.16)"
              />
            ))}
          </svg>
        </div>
      </div>

      {/* 霓虹招牌 */}
      <NeonRow top={112} />
      <div
        style={{
          position: "absolute",
          top: 352,
          width: 1920,
          textAlign: "center",
          fontFamily: FONT2,
          fontSize: 30,
          letterSpacing: 16,
          color: C.gold2,
          opacity: interpolate(f, [80, 110], [0, 0.9], clampObj),
          textShadow: `0 0 18px ${C.gold}`,
        }}
      >
        BIG BOWL WIDE NOODLES
      </div>

      {/* 底部文案 */}
      <div style={{ position: "absolute", bottom: 118, width: 1920, textAlign: "center" }}>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 58,
            color: C.cream,
            letterSpacing: 10,
            opacity: interpolate(f, [130, 170], [0, 1], clampObj),
            textShadow: "0 8px 30px rgba(0,0,0,0.6)",
          }}
        >
          夜市 · 一碗热气腾腾的宽面
        </div>
        <div
          style={{
            marginTop: 18,
            fontFamily: FONT2,
            fontSize: 26,
            color: "rgba(255,243,226,0.62)",
            letterSpacing: 8,
            opacity: interpolate(f, [170, 205], [0, 1], clampObj),
          }}
        >
          2D MV 概念样片 · MADE WITH REMOTION
        </div>
      </div>

      {/* 灯笼 */}
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        <Lantern x={210} y={300} s={0.9} phase={0} />
        <Lantern x={1710} y={310} s={0.9} phase={1.6} />
      </svg>
    </AbsoluteFill>
  );
};

/* ============================================================
   场景 2：大字动态排版
   ============================================================ */
const SceneKinetic = () => {
  const f = useCurrentFrame();
  const seg = 110;
  const idx = Math.min(3, Math.floor(f / seg));
  const lf = f - idx * seg;
  const chars = ["大", "碗", "宽", "面"];
  const tags = ["BIG", "BOWL", "WIDE", "NOODLES"];
  const colors = [C.gold, C.red2, C.jade, C.magenta];
  const color = colors[idx];
  const s = spring({ frame: lf, config: { damping: 11, stiffness: 130 }, durationInFrames: 34 });
  const exit = interpolate(lf, [seg - 16, seg], [1, 0], clampObj);

  return (
    <AbsoluteFill
      style={{
        background: C.night,
        opacity: interpolate(f, [0, 12, 428, 440], [0, 1, 1, 0], clampObj),
        overflow: "hidden",
      }}
    >
      {idx === 0 ? <Sunburst /> : null}
      {idx === 1 ? <CheckerFloor /> : null}
      {idx === 2 ? <StripeBG /> : null}
      {idx === 3 ? <WaveBG /> : null}

      {/* 英文水印 */}
      <div
        style={{
          position: "absolute",
          top: 320,
          width: 1920,
          textAlign: "center",
          fontFamily: FONT2,
          fontSize: 250,
          fontWeight: 900,
          color: "transparent",
          WebkitTextStroke: "3px rgba(255,255,255,0.10)",
          letterSpacing: 30,
        }}
      >
        {tags[idx]}
      </div>

      {/* 主字 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontSize: 430,
            color: color,
            opacity: exit,
            transform: `scale(${0.35 + s * 0.75}) rotate(${(1 - s) * -10}deg)`,
            textShadow: `0 0 40px ${color}, 0 26px 60px rgba(0,0,0,0.55)`,
          }}
        >
          {chars[idx]}
        </div>
      </div>

      {/* 小标签 */}
      <div
        style={{
          position: "absolute",
          bottom: 200,
          width: 1920,
          textAlign: "center",
          fontFamily: FONT2,
          fontSize: 34,
          letterSpacing: 22,
          color: color,
          opacity: 0.9 * exit,
        }}
      >
        {tags[idx]}
      </div>

      {/* 飘浮配料 */}
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 10 }).map((_, i) => {
          const t = f / 30 + i;
          const x = rnd(i * 2.7) * 1920 + Math.sin(t * 0.7) * 40;
          const y = ((rnd(i * 5.1) * 1200 + f * (0.5 + rnd(i) * 0.8)) % 1300) - 120;
          return i % 2 ? (
            <Chili key={i} x={x} y={y} s={0.55 + rnd(i * 3) * 0.5} rot={Math.sin(t) * 30} />
          ) : (
            <Scallion key={i} x={x} y={y} s={0.7} rot={Math.sin(t * 1.3) * 40} />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/* ============================================================
   场景 3：副歌大碗 + 节拍光环
   ============================================================ */
const SceneChorusBowl = () => {
  const f = useCurrentFrame();
  const hit = beatHit(f);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 40%, #4a1226 0%, ${C.night} 70%)`,
        opacity: interpolate(f, [0, 12, 568, 580], [0, 1, 1, 0], clampObj),
        overflow: "hidden",
      }}
    >
      <Sunburst />

      {/* 节拍光环 */}
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 5 }).map((_, i) => {
          const p = Math.pow(1 - ((((f + i * 3) % BEAT) + BEAT) % BEAT) / BEAT, 3);
          return (
            <circle
              key={i}
              cx={960}
              cy={560}
              r={330 + i * 130 + p * 55}
              fill="none"
              stroke={i % 2 ? "rgba(255,207,74,0.30)" : "rgba(226,49,70,0.30)"}
              strokeWidth={3 + p * 5}
              opacity={0.75 - i * 0.12}
            />
          );
        })}
      </svg>

      {/* 大碗 + 蒸汽 */}
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        <ellipse cx="960" cy="880" rx="380" ry="46" fill="rgba(0,0,0,0.42)" />
        <BowlGroup x={960} y={640} s={1.35 + hit * 0.05} lift={Math.sin(f / 9) * 12} />
        {Array.from({ length: 6 }).map((_, i) => {
          const t = (f * 1.4 + i * 70) % 320;
          return (
            <ellipse
              key={i}
              cx={760 + i * 82 + Math.sin(f / 20 + i) * 26}
              cy={330 - t * 0.7}
              rx={40 + (i % 3) * 12}
              ry={22}
              fill="rgba(255,255,255,0.12)"
            />
          );
        })}
      </svg>

      {/* 招牌字 */}
      <div
        style={{
          position: "absolute",
          top: 82,
          width: 1920,
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 120,
          color: C.gold,
          letterSpacing: 26,
          textShadow: `0 0 18px ${C.gold}, 0 0 60px rgba(255,207,74,0.6), 0 20px 50px rgba(0,0,0,0.5)`,
          transform: `scale(${1 + hit * 0.03})`,
        }}
      >
        大碗宽面
      </div>

      <Marquee text="热气腾腾　一碗入魂　Q弹爽滑　筋道过瘾" y={218} speed={2.2} color="rgba(255,207,74,0.85)" size={30} />
      <Marquee text="BIG BOWL WIDE NOODLES　大碗宽面" y={986} speed={-2.6} color="rgba(226,49,70,0.9)" size={30} />
    </AbsoluteFill>
  );
};

/* ============================================================
   场景 4：夜市长街（视差滚动）
   ============================================================ */
const SceneNight = () => {
  const f = useCurrentFrame();
  const layer = (speed) => -((((f * speed) % 1920) + 1920) % 1920);
  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg,#0d0a24 0%, #2a1140 55%, #4a1a2c 100%)",
        opacity: interpolate(f, [0, 12, 548, 560], [0, 1, 1, 0], clampObj),
        overflow: "hidden",
      }}
    >
      <Stars />
      <div
        style={{
          position: "absolute",
          left: 260,
          top: 130,
          width: 150,
          height: 150,
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 32%, #fff6d8, #f2c25e)",
          boxShadow: "0 0 100px rgba(242,194,94,0.5)",
        }}
      />

      {/* 远景天际线 */}
      <div
        style={{
          position: "absolute",
          top: 520,
          left: 0,
          width: 3840,
          height: 320,
          transform: `translateX(${layer(0.6)}px)`,
        }}
      >
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: i * 240,
              bottom: 0,
              width: 150 + rnd(i) * 120,
              height: 120 + rnd(i * 2.2) * 220,
              background: "#1c1030",
              borderRadius: "10px 10px 0 0",
            }}
          />
        ))}
      </div>

      {/* 中景灯笼串 */}
      <svg
        width="3840"
        height="1080"
        style={{ position: "absolute", top: 0, left: 0, transform: `translateX(${layer(1.4)}px)` }}
      >
        <path
          d="M 0 190 Q 480 300 960 190 T 1920 190 T 2880 190 T 3840 190"
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="5"
        />
        {Array.from({ length: 10 }).map((_, i) => (
          <Lantern key={i} x={190 + i * 390} y={250 + (i % 2) * 70} s={0.62} phase={i * 0.9} />
        ))}
      </svg>

      {/* 近景摊位 */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: 3840,
          height: 430,
          transform: `translateX(${layer(2.6)}px)`,
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => {
          const words = ["宽面", "热汤", "夜市", "小摊"];
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: i * 500,
                bottom: 0,
                width: 430,
                height: 330 + (i % 2) * 60,
                background: "linear-gradient(180deg,#3c1b26,#251120)",
                borderRadius: "18px 18px 0 0",
                border: "3px solid rgba(255,207,74,0.28)",
                borderBottom: "none",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -52,
                  left: 40,
                  right: 40,
                  height: 84,
                  borderRadius: 14,
                  background: i % 2 ? C.red : "#b8243a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: FONT,
                  fontSize: 44,
                  color: C.gold2,
                  letterSpacing: 10,
                  boxShadow: "0 0 30px rgba(226,49,70,0.5)",
                }}
              >
                {words[i % 4]}
              </div>
              <div
                style={{
                  position: "absolute",
                  left: 60,
                  top: 110,
                  width: 310,
                  height: 150,
                  borderRadius: 12,
                  background:
                    "radial-gradient(ellipse at 50% 80%, rgba(255,190,110,0.5), rgba(255,150,70,0.06))",
                  border: "2px solid rgba(255,207,74,0.35)",
                }}
              />
            </div>
          );
        })}
      </div>

      {/* 标题 */}
      <div
        style={{
          position: "absolute",
          top: 92,
          width: 1920,
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 66,
          color: C.cream,
          letterSpacing: 18,
          textShadow: "0 10px 40px rgba(0,0,0,0.65)",
        }}
      >
        一条街 · 一碗面 · 一整晚
      </div>
    </AbsoluteFill>
  );
};

/* ============================================================
   场景 5：霓虹波浪 + 角落词卡
   ============================================================ */
const SceneWave = () => {
  const f = useCurrentFrame();
  const hit = beatHit(f);
  const words = ["Q弹", "爽滑", "筋道", "过瘾"];
  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg,#17092c 0%, #2b0f3f 55%, #0f0a22 100%)",
        opacity: interpolate(f, [0, 12, 548, 560], [0, 1, 1, 0], clampObj),
        overflow: "hidden",
      }}
    >
      <CheckerFloor />
      <div
        style={{
          position: "absolute",
          top: 460,
          left: 0,
          right: 0,
          height: 240,
          background:
            "linear-gradient(180deg, rgba(255,207,74,0), rgba(255,90,60,0.32), rgba(255,207,74,0))",
        }}
      />
      <WaveBG />

      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        <ellipse cx="960" cy="870" rx="330" ry="42" fill="rgba(0,0,0,0.5)" />
        <BowlGroup x={960} y={620} s={1.15 + hit * 0.08} lift={Math.sin(f / 7) * 14} />
      </svg>

      {words.map((w, i) => {
        const on = Math.floor(f / 60) % 4 === i;
        const s = spring({ frame: f % 60, config: { damping: 10, stiffness: 160 }, durationInFrames: 26 });
        const pos = [
          { left: 120, top: 170 },
          { right: 120, top: 170 },
          { left: 120, bottom: 170 },
          { right: 120, bottom: 170 },
        ][i];
        return (
          <div
            key={w}
            style={{
              position: "absolute",
              ...pos,
              opacity: on ? 1 : 0.12,
              transform: `scale(${on ? 0.7 + s * 0.4 : 0.8}) rotate(${i % 2 ? 4 : -4}deg)`,
              fontFamily: FONT,
              fontSize: 120,
              color: [C.gold, C.red2, C.jade, C.magenta][i],
              textShadow: "0 18px 50px rgba(0,0,0,0.55)",
            }}
          >
            {w}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ============================================================
   场景 6：结尾致谢
   ============================================================ */
const SceneOutro = () => {
  const f = useCurrentFrame();
  const seal = f < 150 ? 0 : spring({ frame: f - 150, config: { damping: 9, stiffness: 120 }, durationInFrames: 32 });
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${C.night} 0%, #2c1024 60%, #120a1c 100%)`,
        opacity: interpolate(f, [0, 12], [0, 1], clampObj),
        overflow: "hidden",
      }}
    >
      <Stars />
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        <Lantern x={330} y={330} s={0.85} phase={0.4} />
        <Lantern x={1590} y={330} s={0.85} phase={2.1} />
      </svg>

      <NeonRow top={140} />

      {/* 蒸汽帘幕 */}
      {Array.from({ length: 9 }).map((_, i) => {
        const t = (f * 1.2 + i * 90) % 460;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 90 + i * 210,
              top: 1080 - t,
              width: 220,
              height: 120,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.07)",
              filter: "blur(12px)",
            }}
          />
        );
      })}

      {/* 谢谢款待 */}
      <div
        style={{
          position: "absolute",
          top: 400,
          width: 1920,
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 150,
          color: C.cream,
          letterSpacing: 30,
          textShadow: "0 0 30px rgba(255,207,74,0.45), 0 22px 60px rgba(0,0,0,0.55)",
          opacity: interpolate(f, [70, 110], [0, 1], clampObj),
          transform: `translateY(${interpolate(f, [70, 110], [40, 0], clampObj)}px)`,
        }}
      >
        谢谢款待
      </div>

      {/* 印章 */}
      <div
        style={{
          position: "absolute",
          top: 620,
          left: 830,
          width: 260,
          height: 260,
          borderRadius: 24,
          border: `10px solid ${C.red}`,
          color: C.red,
          fontFamily: FONT,
          fontSize: 108,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          letterSpacing: 8,
          transform: `rotate(-12deg) scale(${seal})`,
          opacity: interpolate(f, [150, 165], [0, 1], clampObj),
          boxShadow: "0 0 60px rgba(226,49,70,0.4)",
          background: "rgba(226,49,70,0.08)",
        }}
      >
        完
      </div>

      {/* 结尾信息 */}
      <div
        style={{
          position: "absolute",
          bottom: 150,
          width: 1920,
          textAlign: "center",
          opacity: interpolate(f, [230, 270], [0, 1], clampObj),
        }}
      >
        <div style={{ fontFamily: FONT2, fontSize: 34, color: C.gold2, letterSpacing: 14 }}>THE END</div>
        <div
          style={{
            marginTop: 16,
            fontFamily: FONT2,
            fontSize: 24,
            color: "rgba(255,243,226,0.6)",
            letterSpacing: 6,
          }}
        >
          大碗宽面 · 2D MV 概念样片 · MADE WITH REMOTION
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ============================================================
   主合成
   ============================================================ */
const DaWanKuanMianMV = () => {
  const frame = useCurrentFrame();

  /* 字体加载完成后再截帧 */
  const [handle] = React.useState(() => delayRender("load-fonts"));
  React.useEffect(() => {
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        continueRender(handle);
      }
    };
    if (typeof document !== "undefined" && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(finish).catch(finish);
    } else {
      finish();
    }
    const timer = setTimeout(finish, 5000);
    return () => clearTimeout(timer);
  }, [handle]);

  const hit = beatHit(frame);

  return (
    <AbsoluteFill style={{ background: C.night }}>
      {TRACK ? <Audio src={TRACK} /> : null}

      {/* 轻微的节拍呼吸镜头 */}
      <AbsoluteFill style={{ transform: `scale(${1 + hit * 0.006})` }}>
        <Sequence from={0} durationInFrames={380}>
          <SceneIntro />
        </Sequence>
        <Sequence from={360} durationInFrames={440}>
          <SceneKinetic />
        </Sequence>
        <Sequence from={780} durationInFrames={580}>
          <SceneChorusBowl />
        </Sequence>
        <Sequence from={1340} durationInFrames={560}>
          <SceneNight />
        </Sequence>
        <Sequence from={1880} durationInFrames={560}>
          <SceneWave />
        </Sequence>
        <Sequence from={2420} durationInFrames={580}>
          <SceneOutro />
        </Sequence>
      </AbsoluteFill>

      {/* 暗角 */}
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background: "radial-gradient(ellipse at center, transparent 55%, rgba(10,4,18,0.55) 100%)",
        }}
      />
      {/* 颗粒质感 */}
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          opacity: 0.05,
          backgroundImage:
            'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'160\' height=\'160\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'2\'/></filter><rect width=\'160\' height=\'160\' filter=\'url(%23n)\' opacity=\'0.7\'/></svg>")',
          backgroundSize: "240px 240px",
        }}
      />
      {/* 结尾淡出 */}
      <AbsoluteFill
        style={{
          background: "#000",
          opacity: interpolate(frame, [2946, 2998], [0, 1], clampObj),
        }}
      />
    </AbsoluteFill>
  );
};

export const RemotionRoot = () => (
  <Composition
    id="ShortCircuitVideo"
    component={DaWanKuanMianMV}
    durationInFrames={3000}
    fps={30}
    width={1920}
    height={1080}
  />
);

registerRoot(RemotionRoot);