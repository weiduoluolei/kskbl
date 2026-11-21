// ============================================================
// 三角洲 · 哈基米 文字快切 MV（36 秒 / 16:9）
// 位置：src/Root.jsx   合成 id：ShortCircuitVideo
//
// 【可选：真人语音朗读】
// 1. 本地安装 Python 后执行：
//    pip install edge-tts
//    edge-tts --voice zh-CN-YunjianNeural --text "三角洲哈基米猛攻区吃剩饭鼠鼠机密航天零号大坝得吃非洲之星哈哈币虎爸跑道德吃赛义德哈哈币磁吸炸弹投出堵桥得吃黄金瞪羚百万撤离憨皮牛业憨皮牛业为了点哈哈币连人性都不要了" --write-media public/voice.mp3
// 2. 把 public/voice.mp3 一起推到仓库，视频会自动带上人声朗读。
//    不放该文件也能正常渲染（自动使用程序化节拍音轨）。
// ============================================================

import React from "react";
import {
  AbsoluteFill,
  Audio,
  Composition,
  interpolate,
  spring as _spring,
  staticFile,
  useCurrentFrame,
  registerRoot,
  delayRender,
  continueRender,
} from "remotion";

/* spring 需要 fps */
const spring = (opts) => _spring({ fps: 30, ...opts });

/* 字体 */
if (typeof document !== "undefined" && !document.getElementById("mv-f")) {
  const st = document.createElement("style");
  st.id = "mv-f";
  st.textContent =
    "@import url('https://fonts.googleapis.com/css2?family=ZCOOL+QingKe+HuangYou&family=Noto+Sans+SC:wght@700;900&display=swap');";
  document.head.appendChild(st);
}
const FONT = '"ZCOOL QingKe HuangYou","Noto Sans SC","Noto Sans CJK SC",sans-serif';
const FONT2 = '"Noto Sans SC","Noto Sans CJK SC",sans-serif';

const C = {
  bg: "#08070d",
  bg2: "#12101f",
  red: "#ff2e4d",
  orange: "#ff8a2a",
  gold: "#ffd23f",
  cyan: "#24e5ff",
  magenta: "#ff3ec8",
  green: "#3dffa0",
  white: "#f4f2ec",
  dim: "#8b8698",
};
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };

/* 节拍 150BPM：1 拍 = 12 帧 */
const BEAT = 12;
const beatHit = (f) => Math.pow(1 - (((f % BEAT) + BEAT) % BEAT) / BEAT, 3);

const rnd = (i) => {
  const x = Math.sin(i * 78.233) * 43758.5453;
  return x - Math.floor(x);
};
const nz = (i) => {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
};

/* ============================================================
   音轨：程序化节拍（36 秒）
   ============================================================ */
function buildTrack() {
  const sr = 22050;
  const n = sr * 36;
  const buf = new Float32Array(n);
  const add = (start, dur, fn) => {
    const s0 = Math.max(0, Math.floor(start * sr));
    const s1 = Math.min(n, Math.floor((start + dur) * sr));
    for (let i = s0; i < s1; i++) buf[i] += fn((i - s0) / sr, i);
  };
  const kick = (t) => Math.sin(2 * Math.PI * 55 * t + 7 * Math.exp(-t * 18)) * Math.exp(-t * 8);
  const hat = (t, i) => nz(i) * Math.exp(-t * 90) * 0.22;
  const bass = (f0) => (t) => Math.sin(2 * Math.PI * f0 * t) * Math.exp(-t * 2.2) * 0.55;
  const impact = (t, i) =>
    (nz(i) * Math.exp(-t * 9) + Math.sin(2 * Math.PI * 70 * t) * Math.exp(-t * 4)) * 0.7;
  const riser = (t) =>
    Math.sin(2 * Math.PI * (140 * Math.pow(2, t * 1.2)) * t) * (t / 1.1) * 0.22;

  for (let s = 0; s < 72; s++) {
    const t0 = s * 0.5;
    add(t0, 0.4, kick);
    add(t0 + 0.25, 0.1, hat);
  }
  const BASSN = [82.4, 98, 73.4, 87.3];
  for (let b = 0; b < 18; b++) add(b * 2, 1.2, bass(BASSN[b % 4]));
  /* 每段切换的冲击音 */
  [0, 2.7, 5.7, 8.7, 11.7, 14.8, 18.5, 21.8, 25.2, 28.5, 31.8].forEach((t, k) =>
    add(t, 0.5, (tt, i) => impact(tt, i + k * 97))
  );
  add(34.2, 1.1, riser);

  let peak = 0;
  for (let i = 0; i < n; i++) {
    if (i / sr < 0.4) buf[i] *= i / sr / 0.4;
    if (i / sr > 35.2) buf[i] *= Math.max(0, (36 - i / sr) / 0.8);
    peak = Math.max(peak, Math.abs(buf[i]));
  }
  const g = peak > 0 ? 0.85 / peak : 1;

  const bytes = new Uint8Array(44 + n * 2);
  const dv = new DataView(bytes.buffer);
  const w = (o, s) => {
    for (let k = 0; k < s.length; k++) dv.setUint8(o + k, s.charCodeAt(k));
  };
  w(0, "RIFF");
  dv.setUint32(4, 36 + n * 2, true);
  w(8, "WAVE");
  w(12, "fmt ");
  dv.setUint32(16, 16, true);
  dv.setUint16(20, 1, true);
  dv.setUint16(22, 1, true);
  dv.setUint32(24, sr, true);
  dv.setUint32(28, sr * 2, true);
  dv.setUint16(32, 2, true);
  dv.setUint16(34, 16, true);
  w(36, "data");
  dv.setUint32(40, n * 2, true);
  let off = 44;
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, buf[i] * g));
    dv.setInt16(off, s < 0 ? s * 32768 : s * 32767, true);
    off += 2;
  }
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  }
  return "data:audio/wav;base64," + btoa(bin);
}
const TRACK = typeof window !== "undefined" ? buildTrack() : "";

/* 人声检测：public/voice.mp3 存在则自动叠加 */
const useVoice = () => {
  const [ok, setOk] = React.useState(false);
  const [handle] = React.useState(() => delayRender("voice-check"));
  React.useEffect(() => {
    let dead = false;
    fetch(staticFile("voice.mp3"), { method: "HEAD" })
      .then((r) => {
        if (!dead) setOk(r.ok);
      })
      .catch(() => {})
      .finally(() => continueRender(handle));
    return () => {
      dead = true;
    };
    // eslint-disable-next-line
  }, []);
  return ok;
};

/* ============================================================
   组件
   ============================================================ */

/* 故障文字：RGB 分离 + 切片抖动 */
const GlitchText = ({ text, color, size, delay = 0 }) => {
  const f = useCurrentFrame();
  const s = spring({ frame: f - delay, config: { damping: 12, stiffness: 130 }, durationInFrames: 22 });
  const lt = f - delay;
  const jAmt = lt < 22 && lt >= 0 ? (rnd(lt * 3.7) * 2 - 1) * 16 * (1 - lt / 22) : 0;
  const glitching = lt > 0 && (lt < 16 || rnd(f * 0.9) > 0.93);
  const slice = glitching ? 20 + rnd(f * 2.1) * 30 : 0;

  const base = {
    fontFamily: FONT,
    fontSize: size,
    color,
    letterSpacing: size * 0.04,
    lineHeight: 1.1,
    whiteSpace: "pre",
  };

  return (
    <div
      style={{
        opacity: s,
        transform: `translateY(${(1 - s) * 60}px) scale(${0.8 + s * 0.2}) translateX(${jAmt}px)`,
        position: "relative",
      }}
    >
      {glitching && (
        <>
          <div style={{ ...base, position: "absolute", inset: 0, color: C.cyan, opacity: 0.75, transform: `translateX(${-8 - slice / 4}px)`, clipPath: `inset(${slice}% 0 ${30 - slice / 3}% 0)`, mixBlendMode: "screen" }}>{text}</div>
          <div style={{ ...base, position: "absolute", inset: 0, color: C.red, opacity: 0.75, transform: `translateX(${8 + slice / 4}px)`, clipPath: `inset(${10 + slice / 3}% 0 ${slice}% 0)`, mixBlendMode: "screen" }}>{text}</div>
        </>
      )}
      <div style={{ ...base, textShadow: `0 0 26px ${color}, 0 10px 44px rgba(0,0,0,0.7)` }}>{text}</div>
    </div>
  );
};

/* 扫描线 + 网格背景 */
const GridBG = ({ f }) => (
  <>
    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${C.bg} 0%, ${C.bg2} 60%, #1a0c1a 100%)` }} />
    <div
      style={{
        position: "absolute",
        inset: -200,
        transform: `translateY(${(f * 3) % 120}px)`,
        backgroundImage: "linear-gradient(rgba(36,229,255,0.07) 2px, transparent 2px), linear-gradient(90deg, rgba(36,229,255,0.07) 2px, transparent 2px)",
        backgroundSize: "120px 120px",
      }}
    />
    <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0 3px, transparent 3px 6px)" }} />
  </>
);

/* 斜条纹背景 */
const StripeBG = ({ f }) => (
  <>
    <div style={{ position: "absolute", inset: 0, background: "#14060c" }} />
    <div
      style={{
        position: "absolute",
        inset: -300,
        transform: `translateX(${(f * 6) % 200}px)`,
        background: `repeating-linear-gradient(118deg, #2a0a14 0 60px, #48101e 60px 120px, #1c0810 120px 180px)`,
      }}
    />
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.65) 100%)" }} />
  </>
);

/* 放射爆闪背景 */
const BurstBG = ({ f }) => {
  const hit = beatHit(f);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "#0a0714" }} />
      <div
        style={{
          position: "absolute",
          left: -500,
          top: -700,
          width: 2920,
          height: 2920,
          borderRadius: "50%",
          background: `repeating-conic-gradient(from ${f * 0.4}deg, rgba(255,210,63,${0.1 + hit * 0.12}) 0deg 9deg, transparent 9deg 18deg)`,
        }}
      />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.75) 100%)" }} />
    </>
  );
};

/* 霓虹波纹背景 */
const WaveBG = ({ f }) => (
  <>
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#0d0a1c,#1c0b2e)" }} />
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <path
          key={i}
          d={`M -60 ${140 + i * 130} Q 480 ${80 + i * 130 + Math.sin(f / 12 + i) * 80} 960 ${140 + i * 130} T 1980 ${140 + i * 130}`}
          fill="none"
          stroke={i % 2 ? "rgba(255,62,200,0.22)" : "rgba(36,229,255,0.22)"}
          strokeWidth="9"
        />
      ))}
    </svg>
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)" }} />
  </>
);

const BG_VARIANTS = [GridBG, StripeBG, BurstBG, WaveBG];

/* 飞散碎片 */
const Shards = ({ f, color }) => (
  <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
    {Array.from({ length: 16 }).map((_, i) => {
      const t = (f * (0.8 + rnd(i) * 1.6) + rnd(i * 3) * 1200) % 1300;
      const x = rnd(i * 7.1) * 1920;
      const y = 1180 - t;
      const w = 14 + rnd(i * 2.2) * 46;
      return (
        <rect
          key={i}
          x={x}
          y={y}
          width={w}
          height={5}
          rx={2}
          fill={color}
          opacity={0.14 + rnd(i * 5.5) * 0.3}
          transform={`rotate(${nz(i * 9.3) * 40} ${x} ${y})`}
        />
      );
    })}
  </svg>
);

/* 顶部进度条 + 时间标签 */
const HUD = () => {
  const f = useCurrentFrame();
  const p = f / 1080;
  return (
    <>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 8, background: "rgba(255,255,255,0.08)" }}>
        <div style={{ height: "100%", width: `${p * 100}%`, background: `linear-gradient(90deg, ${C.cyan}, ${C.red})`, boxShadow: `0 0 14px ${C.cyan}` }} />
      </div>
      <div style={{ position: "absolute", top: 30, left: 44, fontFamily: FONT2, fontSize: 22, letterSpacing: 6, color: C.dim }}>
        ▌DELTA · MEME CUT
      </div>
      <div style={{ position: "absolute", top: 30, right: 44, fontFamily: FONT2, fontSize: 22, letterSpacing: 4, color: C.dim }}>
        {String(Math.floor(f / 30)).padStart(2, "0")}:{String(Math.floor((f % 30) / 5)).padStart(2, "0")}
      </div>
    </>
  );
};

/* ============================================================
   文本段落
   ============================================================ */
const SEGS = [
  { l1: "三角洲", l2: "哈基米", tag: "TIK TALK MEME", c: C.gold },
  { l1: "猛攻区", l2: "吃剩饭", tag: "RUSH ZONE", c: C.red },
  { l1: "鼠鼠", l2: "机密航天", tag: "TOP SECRET", c: C.cyan },
  { l1: "零号大坝", l2: "得吃！", tag: "DAM · YUMMY", c: C.orange },
  { l1: "非洲之星", l2: "哈哈币", tag: "AFRICA STAR", c: C.magenta },
  { l1: "虎爸跑刀", l2: "德吃赛义德", tag: "KNIFE RUN", c: C.green },
  { l1: "磁吸炸弹", l2: "投出！", tag: "MAG BOMB", c: C.red },
  { l1: "堵桥得吃", l2: "黄金瞪羚", tag: "GOLD GAZELLE", c: C.gold },
  { l1: "百万撤离", l2: "", tag: "1,000,000 EXTRACT", c: C.cyan },
  { l1: "憨皮牛业", l2: "憨皮牛业", tag: "BRUH ×2", c: C.orange },
  { l1: "为了点哈哈币", l2: "连人性都不要了", tag: "NO MORE HUMANITY", c: C.red },
];

/* 每段时长（帧） */
const SEGDUR = [80, 90, 90, 90, 95, 110, 100, 105, 95, 100, 105];

const Seg = ({ idx }) => {
  const f = useCurrentFrame();
  const seg = SEGS[idx];
  const dur = SEGDUR[idx];
  const Bg = BG_VARIANTS[idx % 4];
  const hit = beatHit(f);
  const entry = f < 10;
  const shake = entry ? nz(f * 4.1) * (14 - f * 1.3) : 0;
  const punch = entry ? 1.12 - Math.min(1, f / 10) * 0.12 : 1 + hit * 0.012;
  const flash = interpolate(f, [0, 3, 10], [0.85, 0.4, 0], cl);

  return (
    <AbsoluteFill
      style={{
        opacity: interpolate(f, [0, 6, dur - 6, dur], [0, 1, 1, 0], cl),
        transform: `translateX(${shake}px) scale(${punch})`,
        overflow: "hidden",
      }}
    >
      <Bg f={f} />
      <Shards f={f} color={seg.c} />

      {/* 底部装饰字 */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          width: 1920,
          textAlign: "center",
          fontFamily: FONT2,
          fontSize: 26,
          letterSpacing: 18,
          color: seg.c,
          opacity: interpolate(f, [18, 34], [0, 0.8], cl),
        }}
      >
        {seg.tag}
      </div>

      {/* 主文字 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}
      >
        <GlitchText text={seg.l1} color={seg.c} size={seg.l1.length > 5 ? 150 : 190} delay={2} />
        {seg.l2 ? (
          <GlitchText text={seg.l2} color={C.white} size={seg.l2.length > 5 ? 118 : 150} delay={12} />
        ) : null}
      </div>

      {/* 冲击白闪 */}
      <AbsoluteFill style={{ background: "#fff", opacity: flash, mixBlendMode: "overlay", pointerEvents: "none" }} />
      {/* 四角括号装饰 */}
      {[
        { left: 70, top: 70 },
        { right: 70, top: 70 },
        { left: 70, bottom: 70 },
        { right: 70, bottom: 70 },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            ...pos,
            width: 66,
            height: 66,
            borderTop: i < 2 ? `5px solid ${seg.c}` : "none",
            borderBottom: i >= 2 ? `5px solid ${seg.c}` : "none",
            borderLeft: i % 2 === 0 ? `5px solid ${seg.c}` : "none",
            borderRight: i % 2 === 1 ? `5px solid ${seg.c}` : "none",
            opacity: interpolate(f, [6, 18], [0, 0.85], cl),
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

/* 开场标题 */
const SceneTitle = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden", opacity: interpolate(f, [0, 8, 68, 82], [0, 1, 1, 0], cl) }}>
      <BurstBG f={f} />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <GlitchText text="三角洲" color={C.gold} size={210} delay={4} />
        <div style={{ height: 18 }} />
        <GlitchText text="梗百科 · 高能切片" color={C.cyan} size={64} delay={18} />
      </div>
    </AbsoluteFill>
  );
};

/* 结尾 */
const SceneEnd = () => {
  const f = useCurrentFrame();
  const hit = beatHit(f);
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden", opacity: interpolate(f, [0, 8], [0, 1], cl) }}>
      <WaveBG f={f} />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30 }}>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 170,
            color: C.white,
            letterSpacing: 16,
            textShadow: `0 0 40px ${C.red}, 0 16px 60px rgba(0,0,0,0.7)`,
            transform: `scale(${1 + hit * 0.02})`,
          }}
        >
          全 剧 终
        </div>
        <div style={{ fontFamily: FONT2, fontSize: 30, letterSpacing: 12, color: C.dim }}>MADE WITH REMOTION</div>
      </div>
    </AbsoluteFill>
  );
};

/* ============================================================
   主合成
   ============================================================ */
const MemeCut = () => {
  const frame = useCurrentFrame();
  const voice = useVoice();

  /* 字体就绪后再截帧 */
  const [handle] = React.useState(() => delayRender("fonts"));
  React.useEffect(() => {
    let done = false;
    const fin = () => {
      if (!done) {
        done = true;
        continueRender(handle);
      }
    };
    if (typeof document !== "undefined" && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(fin).catch(fin);
    } else fin();
    const t = setTimeout(fin, 5000);
    return () => clearTimeout(t);
  }, [handle]);

  /* 各段起始帧 */
  let acc = 82;
  const starts = SEGDUR.map((d) => {
    const s = acc;
    acc += d;
    return s;
  });
  const endStart = acc; // 1070 附近

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {TRACK ? <Audio src={TRACK} volume={voice ? 0.32 : 1} /> : null}
      {voice ? <Audio src={staticFile("voice.mp3")} volume={1} /> : null}

      <HUD />

      <SceneTitle />
      {SEGS.map((_, i) => (
        <AbsoluteFill key={i} style={{ display: frame >= starts[i] && frame < starts[i] + SEGDUR[i] ? "block" : "none" }}>
          <div style={{ transform: `translateY(${-(frame - starts[i])}px)`, height: 1080 }}>
            <div style={{ transform: `translateY(${frame - starts[i]}px)` }}>
              <Seg idx={i} />
            </div>
          </div>
        </AbsoluteFill>
      ))}
      <AbsoluteFill style={{ display: frame >= endStart ? "block" : "none" }}>
        <SceneEnd />
      </AbsoluteFill>

      {/* 暗角 + 颗粒 */}
      <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse at center, transparent 52%, rgba(0,0,0,0.6) 100%)" }} />
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          opacity: 0.055,
          backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'140\' height=\'140\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'2\'/></filter><rect width=\'140\' height=\'140\' filter=\'url(%23n)\' opacity=\'0.7\'/></svg>")',
          backgroundSize: "210px 210px",
        }}
      />
      {/* 整体淡出 */}
      <AbsoluteFill style={{ background: "#000", opacity: interpolate(frame, [1058, 1078], [0, 1], cl), pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export const RemotionRoot = () => (
  <Composition id="ShortCircuitVideo" component={MemeCut} durationInFrames={1080} fps={30} width={1920} height={1080} />
);

registerRoot(RemotionRoot);