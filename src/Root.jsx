// src/Root.jsx — 成都地铁发展史 2010→2030（v4）
// 修正：1号线支线改到四河前 / 4号线东段移到2号线北侧 / 站点标识区分
//       18号线跟随1号线走廊 / 地图更清晰 / 扩展到2030 / 右侧线路图例

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

if (typeof document !== "undefined" && !document.getElementById("mf")) {
  const s = document.createElement("style");
  s.id = "mf";
  s.textContent =
    "@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700;900&display=swap');";
  document.head.appendChild(s);
}

const F = '"Noto Sans SC","Noto Sans CJK SC",sans-serif';
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* ============ 线路数据 ============ */
const LINES = {
  l1: { name: "1号线", color: "#0072bc", pts: [
    [1910,700,"韦家碾","r"],[1915,830,"升仙湖","r"],[1935,970,"人民北路","r"],[1955,1110,"文殊院","r"],
    [1975,1250,"骡马市","t"],[2000,1400,"天府广场","t"],[2030,1520,"锦江宾馆","r"],[2060,1640,"华西坝","r"],
    [2085,1760,"省体育馆","t"],[2110,1880,"倪家桥","r"],[2135,2000,"桐梓林","r"],[2170,2140,"火车南站","t"],
    [2195,2270,"高新","r"],[2215,2400,"金融城","r"],[2235,2520,"孵化园","r"],[2255,2650,"世纪城","r"],
    [2275,2780,"四河","t"],[2290,2910,"华阳","r"],[2305,3040,"海昌路","r"],[2320,3170,"广都","r"]
  ]},
  l1b: { name: "1号线支线", color: "#0072bc", pts: [
    [2275,2780,"四河","t"],[2385,2870,"五根松","r"]
  ]},
  l2: { name: "2号线", color: "#f5a623", pts: [
    [760,1480,"犀浦","r"],[880,1470,"天河路","r"],[1020,1460,"百草路","r"],[1180,1450,"茶店子客运站","r"],
    [1310,1440,"迎宾大道","r"],[1460,1430,"蜀汉路东","r"],[1580,1420,"白果林","r"],[1700,1410,"通惠门","r"],
    [1830,1400,"人民公园","r"],[2130,1360,"春熙路","t"],[2260,1340,"东门大桥","r"],[2390,1330,"牛王庙","r"],
    [2520,1320,"牛市口","r"],[2650,1310,"双桥路","t"],[2780,1300,"塔子山公园","r"],[2910,1290,"成渝立交","r"],
    [3050,1280,"成都行政学院","r"],[3180,1270,"大面铺","r"],[3310,1260,"连山坡","r"],[3450,1250,"龙泉驿","r"]
  ]},
  l3: { name: "3号线", color: "#e8348d", pts: [
    [2280,520,"军区总医院","r"],[2230,680,"熊猫大道","r"],[2170,850,"驷马桥","r"],[2120,1020,"李家沱","r"],
    [2095,1150,"红星桥","r"],[2085,1270,"市二医院","r"],[2130,1360,"春熙路","t"],[2135,1520,"新南门","r"],
    [2105,1660,"磨子桥","r"],[2085,1760,"省体育馆","t"],[1960,1870,"衣冠庙","r"],[1855,1965,"高升桥","r"],
    [1770,2065,"红牌楼","r"],[1700,2170,"太平园","t"],[1610,2320,"川藏立交","r"],[1450,2520,"双流西站","r"]
  ]},
  l4: { name: "4号线", color: "#2ecc71", pts: [
    [880,1650,"万盛","r"],[1010,1648,"杨柳河","r"],[1140,1644,"凤溪河","r"],[1280,1638,"光华公园","r"],
    [1420,1632,"文化宫","r"],[1560,1628,"宽窄巷子","r"],[1975,1250,"骡马市","t"],[2160,1165,"玉双路","r"],
    [2340,1100,"双桥路","t"],[2520,1065,"万年场","r"],[2720,1085,"西河","r"]
  ]},
  l5: { name: "5号线", color: "#b24df0", pts: [
    [1450,520,"华桂路","r"],[1420,780,"","r"],[1450,1050,"","r"],[1500,1330,"","r"],
    [1560,1620,"","r"],[1640,1900,"","r"],[1720,2180,"","r"],[1820,2460,"","r"],[1950,2760,"回龙","r"]
  ]},
  l6: { name: "6号线", color: "#2b5fb3", pts: [
    [900,700,"望丛祠","r"],[1350,1050,"","r"],[1750,1330,"","r"],[2050,1580,"","r"],[2450,1860,"","r"],[2850,2150,"","r"]
  ]},
  l7: { name: "7号线", color: "#00b0ca", pts: [
    [2020,900,"火车北站","t"],[2540,1120,"","r"],[2680,1560,"","r"],[2500,1980,"","r"],
    [2170,2140,"火车南站","t"],[1700,2170,"太平园","t"],[1450,1750,"","r"],[1500,1300,"","r"],[2020,900,"","r"]
  ]},
  l8: { name: "8号线", color: "#d4468c", pts: [
    [2760,880,"","r"],[2460,1240,"","r"],[2150,1560,"","r"],[1850,1880,"","r"],[1600,2180,"","r"]
  ]},
  l9: { name: "9号线", color: "#e87722", pts: [
    [1180,1180,"","r"],[1450,1450,"","r"],[1720,1720,"","r"],[2020,1930,"","r"],[2320,2140,"","r"]
  ]},
  l10: { name: "10号线", color: "#1b6cb5", pts: [
    [1700,2170,"太平园","t"],[1570,2350,"金花","r"],[1450,2530,"","r"],[1310,2710,"双流机场T2","r"],[1180,2880,"","r"],[1040,3050,"","r"]
  ]},
  l13: { name: "13号线", color: "#f0a500", pts: [
    [1100,2000,"","r"],[1500,1920,"","r"],[1900,1840,"","r"],[2300,1760,"","r"],[2700,1680,"","r"]
  ]},
  l17: { name: "17号线", color: "#38a855", pts: [
    [820,1680,"","r"],[1180,1580,"","r"],[1540,1490,"","r"],[1900,1430,"","r"],[2260,1390,"","r"]
  ]},
  l18: { name: "18号线", color: "#f08300", pts: [
    [2170,2140,"火车南站","t"],[2215,2270,"高新","r"],[2235,2400,"金融城","r"],[2420,2560,"","r"],[2700,2820,"","r"]
  ]},
  l18b: { name: "18号线机场段", color: "#f08300", pts: [
    [2700,2820,"","r"],[3000,3100,"天府机场","r"]
  ]},
  l27: { name: "27号线", color: "#22c9a0", pts: [
    [3100,600,"","r"],[3150,1000,"","r"],[3100,1400,"","r"],[3050,1800,"","r"],[3000,2200,"","r"]
  ]},
  l30: { name: "30号线", color: "#c04dc6", pts: [
    [2000,2600,"","r"],[2400,2750,"","r"],[2800,2900,"","r"]
  ]},
};

/* ============ 时间轴事件 ============ */
const EVENTS = [
  { year:"2010", date:"2010.09.27", title:"1号线一期开通", desc:"成都正式迈入地铁时代",
    extra:"升仙湖—世纪城 · 17站 · 18.5km",
    draws:[["l1",1,15]], camF:[1950,950,1.18], camT:[2230,2500,1.02] },
  { year:"2012", date:"2012.10", title:"2号线一期开通", desc:"十字路网骨架成形",
    extra:"茶店子客运站—成都行政学院",
    draws:[["l2",3,16]], camF:[1250,1450,1.12], camT:[3000,1300,1.0] },
  { year:"2013—2014", date:"2013 / 2014", title:"2号线东西延伸", desc:"西延犀浦 · 东延龙泉驿",
    extra:"2号线全线贯通运营",
    draws:[["l2",0,3],["l2",16,19]], camF:[820,1480,1.1], camT:[3400,1260,0.94] },
  { year:"2015", date:"2015.07", title:"1号线南延线开通", desc:"向南挺进天府新区",
    extra:"世纪城—广都",
    draws:[["l1",15,19]], camF:[2260,2650,1.15], camT:[2330,3120,1.05] },
  { year:"2015", date:"2015.12", title:"4号线一期开通", desc:"温江方向进城新通道",
    extra:"万盛—西河",
    draws:[["l4",0,10]], camF:[960,1650,1.1], camT:[2680,1120,1.0] },
  { year:"2016", date:"2016.07", title:"3号线一期开通", desc:"南北向第三条骨干线",
    extra:"军区总医院—太平园",
    draws:[["l3",0,13]], camF:[2280,650,1.12], camT:[1760,2100,1.02] },
  { year:"2017", date:"2017.09", title:"10号线一期开通", desc:"成都首条机场专线",
    extra:"太平园—双流机场T2航站楼",
    draws:[["l10",0,3]], camF:[1700,2200,1.18], camT:[1310,2710,1.12] },
  { year:"2017", date:"2017.12", title:"7号线环线开通", desc:"成都首条环形线路",
    extra:"绕行中心城区 · 换乘之王",
    draws:[["l7",0,8]], camF:[2060,1520,1.12], camT:[2060,1520,0.94] },
  { year:"2018", date:"2018", title:"1号线三期 · 3号线二期", desc:"北延韦家碾 · 1号线支线 · 3号线延伸",
    extra:"四河—五根松支线 · 双流西站",
    draws:[["l1",0,1],["l1b",0,1],["l3",13,15]], camF:[1930,850,1.0], camT:[2300,2850,0.9] },
  { year:"2019", date:"2019.12", title:"5号线一二期开通", desc:"南北向新动脉",
    extra:"华桂路—回龙",
    draws:[["l5",0,8]], camF:[1450,760,1.1], camT:[1930,2650,0.95] },
  { year:"2020", date:"2020.09", title:"18号线一期开通", desc:"火车南站出发 · 与1号线并行",
    extra:"火车南站—天府新站方向",
    draws:[["l18",0,4]], camF:[2200,2180,1.15], camT:[2650,2750,1.02] },
  { year:"2020", date:"2020.12.30", title:"五线齐发", desc:"6 / 8 / 9 / 10二期 / 17号线 同步开通",
    extra:"运营里程突破 500 公里 · 网络化运营",
    draws:[["l6",0,5],["l8",0,4],["l9",0,4],["l17",0,4],["l10",3,5]], camF:[1900,1500,0.82], camT:[2050,1650,0.55] },
  { year:"2022", date:"2022", title:"13号线一期开通", desc:"东西向又一骨干",
    extra:"覆盖城南新兴区域",
    draws:[["l13",0,4]], camF:[1200,1950,1.05], camT:[2650,1700,0.95] },
  { year:"2024", date:"2024", title:"27号线开通", desc:"城东纵向新动脉",
    extra:"覆盖东部城区",
    draws:[["l27",0,4]], camF:[3120,700,1.0], camT:[3020,2150,0.92] },
  { year:"2025", date:"2025", title:"30号线开通", desc:"城南东西向加密",
    extra:"天府新区内部通达",
    draws:[["l30",0,2]], camF:[2050,2580,1.05], camT:[2750,2880,0.95] },
  { year:"2027", date:"2027", title:"18号线延伸天府机场", desc:"直连成都天府国际机场",
    extra:"从天府新站延伸至天府机场",
    draws:[["l18b",0,1]], camF:[2750,2850,1.1], camT:[3000,3100,1.0] },
  { year:"2028—2030", date:"2028—2030", title:"远景规划推进", desc:"更多线路持续延伸",
    extra:"成都轨道交通网络超 800 公里",
    draws:[], camF:[2200,1800,0.6], camT:[2300,1900,0.5] },
];

const INTRO = 72;
const SEG = 110;
const OUTRO = 150;
const starts = EVENTS.map((_, i) => INTRO + i * SEG);
const TOTAL = INTRO + EVENTS.length * SEG + OUTRO;

/* ============ 站点出现时间表 ============ */
const REVEALS = [];
EVENTS.forEach((ev, ei) => {
  ev.draws.forEach(([key, a, b]) => {
    const line = LINES[key];
    for (let i = a; i <= b; i++) {
      const [x, y, name, st] = line.pts[i];
      const frac = b === a ? 1 : (i - a) / (b - a);
      const frame = starts[ei] + 10 + frac * 84;
      if (!REVEALS.some((r) => r.x === x && r.y === y && r.frame < frame)) {
        REVEALS.push({ x, y, name, color: line.color, frame, st: st || "r" });
      }
    }
  });
});

/* ============ 计算每个事件后已开通线路 ============ */
const activeLinesAt = (f) => {
  const keys = new Set();
  EVENTS.forEach((ev, ei) => {
    if (f >= starts[ei] + 5) ev.draws.forEach(([key]) => keys.add(key));
  });
  return LINES_LINES_ORDER.filter((k) => keys.has(k));
};
const LINES_LINES_ORDER = ["l1","l1b","l2","l3","l4","l5","l6","l7","l8","l9","l10","l13","l17","l18","l18b","l27","l30"];

/* ============ 相机 ============ */
const toXY = (c) => {
  const dx = c[0] - 2000, dy = c[1] - 1400;
  const x1 = dx * 0.848 + dy * 0.530;
  const y1 = (-dx * 0.530 + dy * 0.848) * 0.616;
  return { x: -x1 * c[2], y: -y1 * c[2], s: c[2] };
};
const lerpCam = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, s: a.s + (b.s - a.s) * t });
const camAt = (f) => {
  if (f < INTRO) return lerpCam(toXY([2050, 1700, 0.58]), toXY([2050, 1600, 0.72]), ease(f / INTRO));
  for (let i = 0; i < EVENTS.length; i++) {
    const s = starts[i];
    if (f >= s && f < s + SEG) {
      const t = ease(Math.min(1, (f - s) / (SEG - 16)));
      return lerpCam(toXY(EVENTS[i].camF), toXY(EVENTS[i].camT), t);
    }
  }
  const lastEnd = starts[EVENTS.length - 1] + SEG;
  const t = ease(Math.min(1, (f - lastEnd) / 80));
  return lerpCam(toXY([2050, 1650, 0.52]), toXY([2050, 1600, 0.46]), t);
};
const getRot = (f) => {
  const fs = starts[EVENTS.length - 1];
  const front = interpolate(f, [fs, fs + 120], [0, 1], clamp);
  return { rotX: 52 - front * 22, rotZ: -32 + front * 18 };
};

/* ============ 地图舞台 ============ */
const MapStage = () => {
  const f = useCurrentFrame();
  const cam = camAt(f);
  const { rotX, rotZ } = getRot(f);

  return (
    <div style={{ position: "absolute", inset: 0, perspective: "1600px", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${cam.x}px,${cam.y}px) scale(${cam.s})`, transformStyle: "preserve-3d" }}>
        <div style={{ position: "absolute", left: "50%", top: "50%", width: 0, height: 0, transform: `rotateX(${rotX}deg) rotateZ(${rotZ}deg)`, transformStyle: "preserve-3d" }}>
          {/* 网格地板 */}
          <svg width={4800} height={4000} viewBox="-2400 -2000 4800 4000"
            style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}>
            <defs>
              <radialGradient id="cityGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(0 0) scale(1400)">
                <stop offset="0%" stopColor="#2a6bd4" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#2a6bd4" stopOpacity="0" />
              </radialGradient>
              <pattern id="grid" width="320" height="320" patternUnits="userSpaceOnUse">
                <path d="M320 0 L0 0 0 320" fill="none" stroke="rgba(120,180,255,0.10)" strokeWidth="1.5" />
              </pattern>
            </defs>
            <rect x="-2400" y="-2000" width="4800" height="4000" fill="url(#grid)" />
            <rect x="-2400" y="-2000" width="4800" height="4000" fill="url(#cityGlow)" />
          </svg>

          {/* 线路 */}
          <svg width={4800} height={4000} viewBox="-2400 -2000 4800 4000"
            style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}>
            {EVENTS.map((ev, ei) => (
              <React.Fragment key={ei}>
                {ev.draws.map(([key, a, b], di) => {
                  const line = LINES[key];
                  const sub = line.pts.slice(a, b + 1);
                  const d = sub.map((p, i) => `${i ? "L" : "M"}${p[0] - 2000} ${p[1] - 1400}`).join(" ");
                  const prog = interpolate(f, [starts[ei] + 10, starts[ei] + 94], [0, 1], clamp);
                  const isBranch = key === "l1b" || key === "l18b";
                  return (
                    <g key={di}>
                      {!isBranch && (
                        <path d={d} fill="none" stroke={line.color} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round"
                          opacity={(0.06 + 0.14 * prog) * prog} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog} />
                      )}
                      <path d={d} fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth={isBranch ? 10 : 16} strokeLinecap="round" strokeLinejoin="round"
                        opacity={0.12 + 0.88 * prog} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog} />
                      <path d={d} fill="none" stroke={line.color} strokeWidth={isBranch ? 5 : 9} strokeLinecap="round" strokeLinejoin="round"
                        strokeDasharray={isBranch ? "28 14" : 1} strokeDashoffset={isBranch ? 0 : 1 - prog}
                        pathLength={isBranch ? undefined : 1}
                        opacity={0.14 + 0.86 * prog} />
                      {prog >= 1 && (
                        <path d={d} fill="none" stroke="#ffffff" strokeWidth={3} strokeLinecap="round"
                          strokeDasharray="16 56" strokeDashoffset={-f * 1.6} opacity={0.35} />
                      )}
                    </g>
                  );
                })}
              </React.Fragment>
            ))}
          </svg>

          {/* 站点 */}
          {REVEALS.map((r, i) => {
            if (f < r.frame) return null;
            const pop = interpolate(f, [r.frame, r.frame + 8], [0, 1], clamp);
            const isTransfer = r.st === "t";
            return (
              <div key={i} style={{
                position: "absolute", left: r.x - 2000, top: r.y - 1400,
                transform: `translate(-50%,-50%) translateZ(28px) rotateZ(${-rotZ}deg) rotateX(${-rotX}deg) scale(${0.3 + 0.7 * pop})`,
                display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap",
              }}>
                {/* 辉光 */}
                <div style={{ position: "absolute", left: isTransfer ? -11 : -8, top: isTransfer ? -11 : -8,
                  width: isTransfer ? 30 : 26, height: isTransfer ? 30 : 26,
                  borderRadius: "50%", background: r.color, opacity: isTransfer ? 0.32 : 0.22 }} />
                {/* 站点圆 */}
                {isTransfer ? (
                  /* 换乘站：大空心圆 + 双层环 */
                  <>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: "transparent", border: `3.5px solid ${r.color}`, position: "relative" }} />
                    <div style={{ position: "absolute", left: -5, top: -5, width: 14, height: 14, borderRadius: "50%", background: "#fff", opacity: 0.9 }} />
                  </>
                ) : (
                  /* 普通站：小实心圆 */
                  <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#fff", border: `2.5px solid ${r.color}`, flexShrink: 0, position: "relative" }} />
                )}
                {r.name ? (
                  <div style={{ fontFamily: F, fontWeight: 700, fontSize: isTransfer ? 20 : 17,
                    color: isTransfer ? "#fff" : "#c8ddf2",
                    textShadow: "0 1px 6px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.7)",
                    padding: isTransfer ? "2px 7px" : "1px 5px",
                    background: isTransfer ? "rgba(10,18,36,0.72)" : "rgba(8,16,34,0.45)",
                    borderRadius: isTransfer ? 6 : 4, position: "relative" }}>
                    {r.name}
                    {isTransfer && <span style={{ marginLeft: 6, fontSize: 14, color: r.color, fontWeight: 400 }}>换乘</span>}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ============ 线路图例（右侧） ============ */
const LineLegend = () => {
  const f = useCurrentFrame();
  const activeKeys = activeLinesAt(f);
  return (
    <div style={{
      position: "absolute", right: 28, top: 56, width: 240,
      background: "rgba(6,14,30,0.82)", border: "1px solid rgba(100,160,255,0.22)",
      borderRadius: 16, padding: "18px 16px", backdropFilter: "blur(4px)",
    }}>
      <div style={{ fontFamily: F, fontWeight: 900, fontSize: 22, color: "#7eb8ff", letterSpacing: 4, marginBottom: 14, textAlign: "center" }}>
        成都地铁 · 线路图
      </div>
      {LINES_LINES_ORDER.map((key) => {
        const line = LINES[key];
        const active = activeKeys.includes(key);
        return (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 4px", opacity: active ? 1 : 0.15, transition: "opacity 0.4s" }}>
            <div style={{ width: 32, height: 5, borderRadius: 3, background: line.color, flexShrink: 0, boxShadow: active ? `0 0 8px ${line.color}80` : undefined }} />
            <div style={{ fontFamily: F, fontSize: 16, color: active ? "#d0e4ff" : "#556", fontWeight: 700 }}>{line.name}</div>
          </div>
        );
      })}
      {/* 站点图例 */}
      <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(100,160,255,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 4px" }}>
          <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#fff", border: "3px solid #4fd1ff", flexShrink: 0 }} />
          <div style={{ fontFamily: F, fontSize: 14, color: "#8ab" }}>换乘站</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 4px" }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#fff", border: "2px solid #4fd1ff", flexShrink: 0 }} />
          <div style={{ fontFamily: F, fontSize: 14, color: "#8ab" }}>普通站</div>
        </div>
      </div>
    </div>
  );
};

/* ============ 文案覆盖层 ============ */
const InfoCard = ({ ev, lf, evIdx }) => {
  const inO = interpolate(lf, [0, 14], [0, 1], clamp);
  const inY = interpolate(lf, [0, 14], [26, 0], clamp);
  const outO = interpolate(lf, [SEG - 12, SEG], [1, 0], clamp);
  const lineCount = activeLinesAt(starts[evIdx] + lf).length;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: outO }}>
      <div style={{ position: "absolute", left: 70, top: 56, opacity: inO, transform: `translateY(${inY}px)` }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 22 }}>
          <div style={{ fontFamily: F, fontWeight: 900, fontSize: 104, color: "#fff", lineHeight: 1, textShadow: "0 6px 30px rgba(0,0,0,0.85)" }}>{ev.year}</div>
          <div style={{ fontFamily: F, fontSize: 25, fontWeight: 700, color: "#0a1226", background: "linear-gradient(90deg,#4fd1ff,#7ef0c0)", padding: "7px 18px", borderRadius: 999 }}>{ev.date}</div>
        </div>
        <div style={{ marginTop: 14, fontFamily: F, fontWeight: 900, fontSize: 48, color: "#ffd76a", letterSpacing: 2, textShadow: "0 5px 24px rgba(0,0,0,0.88)" }}>{ev.title}</div>
        <div style={{ marginTop: 9, fontFamily: F, fontSize: 28, color: "#dceaff", letterSpacing: 2, textShadow: "0 3px 16px rgba(0,0,0,0.9)" }}>{ev.desc}</div>
        <div style={{ marginTop: 10, fontFamily: F, fontSize: 22, color: "rgba(200,225,255,0.78)", letterSpacing: 1 }}>{ev.extra}</div>
      </div>
      <div style={{ position: "absolute", right: 290, top: 62, display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end", opacity: inO }}>
        <div style={{ fontFamily: F, fontWeight: 900, fontSize: 32, color: "#fff", background: "rgba(10,20,40,0.72)", border: "1px solid rgba(120,180,255,0.3)", padding: "10px 24px", borderRadius: 12, letterSpacing: 2 }}>
          运营线路 <span style={{ color: "#5ff0c0", fontSize: 42 }}>{lineCount}</span> 条
        </div>
        <div style={{ fontFamily: F, fontSize: 21, color: "rgba(190,215,255,0.72)", letterSpacing: 3 }}>成都地铁 · 网络生长中</div>
      </div>
      <div style={{ position: "absolute", left: 90, right: 290, bottom: 52 }}>
        <div style={{ height: 5, borderRadius: 999, background: "rgba(255,255,255,0.12)", position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${((starts[evIdx] + lf) / TOTAL) * 100}%`, background: "linear-gradient(90deg,#4fd1ff,#ffd76a,#ff6b6b)", borderRadius: 999 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: F, fontSize: 19, color: "rgba(180,210,255,0.55)", letterSpacing: 3 }}>
          <span>2010</span><span>2015</span><span>2020</span><span>2025</span><span>2030</span>
        </div>
      </div>
    </div>
  );
};

const Intro = ({ f }) => (
  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
    <div style={{ fontFamily: F, fontWeight: 900, fontSize: 120, color: "#fff", letterSpacing: 12, opacity: interpolate(f, [6, 26], [0, 1], clamp), transform: `translateY(${interpolate(f, [6, 26], [42, 0], clamp)}px)`, textShadow: "0 6px 36px rgba(80,180,255,0.5), 0 16px 56px rgba(0,0,0,0.8)" }}>
      成都地铁发展史
    </div>
    <div style={{ marginTop: 22, fontFamily: F, fontSize: 50, fontWeight: 700, letterSpacing: 14, color: "#ffd76a", opacity: interpolate(f, [26, 44], [0, 1], clamp), transform: `translateY(${interpolate(f, [26, 44], [26, 0], clamp)}px)` }}>
      2010 → 2030
    </div>
    <div style={{ marginTop: 18, fontFamily: F, fontSize: 28, color: "rgba(205,228,255,0.82)", letterSpacing: 10, opacity: interpolate(f, [44, 62], [0, 1], clamp) }}>
      从第一条线路开通 · 到未来远景规划
    </div>
  </div>
);

const Outro = ({ f }) => (
  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", paddingTop: 56, pointerEvents: "none" }}>
    <div style={{ fontFamily: F, fontWeight: 900, fontSize: 88, color: "#fff", letterSpacing: 9, opacity: interpolate(f, [8, 28], [0, 1], clamp), transform: `scale(${interpolate(f, [8, 28], [0.92, 1], clamp)})`, textShadow: "0 6px 40px rgba(255,190,80,0.45), 0 16px 56px rgba(0,0,0,0.85)" }}>
      成都地铁 · 驶向未来
    </div>
    <div style={{ marginTop: 18, display: "flex", gap: 22, opacity: interpolate(f, [30, 50], [0, 1], clamp) }}>
      {["17+ 条线路", "800+ 公里", "500+ 车站"].map((t, i) => (
        <div key={i} style={{ fontFamily: F, fontWeight: 700, fontSize: 32, color: "#0a1226", background: ["#5ff0c0", "#ffd76a", "#ff8f8f"][i], padding: "12px 32px", borderRadius: 14 }}>{t}</div>
      ))}
    </div>
    <div style={{ marginTop: 18, fontFamily: F, fontSize: 26, color: "rgba(210,232,255,0.82)", letterSpacing: 10, opacity: interpolate(f, [54, 76], [0, 1], clamp) }}>
      轨道上的公园城市 · 成都
    </div>
  </div>
);

/* ============ 主合成 ============ */
const ChengduMetro = () => {
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

  const evIdx = f < INTRO ? -1 : Math.min(EVENTS.length - 1, Math.floor((f - INTRO) / SEG));
  const lf = evIdx >= 0 ? f - starts[evIdx] : 0;

  return (
    <AbsoluteFill style={{ background: "#060d1c", fontFamily: F }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 20%, #10264d 0%, #08101f 55%, #04070e 100%)" }} />
      <MapStage />
      <LineLegend />
      <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse at center, transparent 48%, rgba(2,6,14,0.6) 100%)" }} />
      <AbsoluteFill style={{ pointerEvents: "none", background: "repeating-linear-gradient(0deg, transparent 0 3px, rgba(0,0,0,0.035) 3px 4px)" }} />

      {f < INTRO && <Intro f={f} />}
      {evIdx >= 0 && f < INTRO + EVENTS.length * SEG && <InfoCard ev={EVENTS[evIdx]} lf={lf} evIdx={evIdx} />}
      {f >= INTRO + EVENTS.length * SEG && <Outro f={f - INTRO - EVENTS.length * SEG} />}

      <AbsoluteFill style={{ background: "#000", opacity: interpolate(f, [TOTAL - 22, TOTAL - 2], [0, 1], clamp), pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export const RemotionRoot = () => (
  <Composition id="ShortCircuitVideo" component={ChengduMetro} durationInFrames={TOTAL} fps={30} width={1920} height={1080} />
);

registerRoot(RemotionRoot);