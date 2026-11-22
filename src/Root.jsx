// src/Root.jsx — 成都地铁发展史 v3（性能优化版，15分钟内可渲染完成）
// 优化：移除 drop-shadow/blur 滤镜 / 缩小SVG画布 / 缩短时长 / 降低网格密度

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
    [1910,700,"韦家碾"],[1915,830,"升仙湖"],[1935,970,"人民北路"],[1955,1110,"文殊院"],
    [1975,1250,"骡马市"],[2000,1400,"天府广场"],[2030,1520,"锦江宾馆"],[2060,1640,"华西坝"],
    [2085,1760,"省体育馆"],[2110,1880,"倪家桥"],[2135,2000,"桐梓林"],[2170,2140,"火车南站"],
    [2195,2270,"高新"],[2215,2400,"金融城"],[2235,2520,"孵化园"],[2255,2650,"世纪城"],
    [2275,2780,"四河"],[2290,2910,"华阳"],[2305,3040,"海昌路"],[2320,3170,"广都"]
  ]},
  l1b: { name: "1号线支线", color: "#0072bc", pts: [
    [2320,3170,"广都"],[2430,3235,"五根松"]
  ]},
  l2: { name: "2号线", color: "#f5a623", pts: [
    [760,1480,"犀浦"],[880,1470,"天河路"],[1020,1460,"百草路"],[1180,1450,"茶店子客运站"],
    [1310,1440,"迎宾大道"],[1460,1430,"蜀汉路东"],[1580,1420,"白果林"],[1700,1410,"通惠门"],
    [1830,1400,"人民公园"],[2130,1360,"春熙路"],[2260,1340,"东门大桥"],[2390,1330,"牛王庙"],
    [2520,1320,"牛市口"],[2650,1310,"双桥路"],[2780,1300,"塔子山公园"],[2910,1290,"成渝立交"],
    [3050,1280,"成都行政学院"],[3180,1270,"大面铺"],[3310,1260,"连山坡"],[3450,1250,"龙泉驿"]
  ]},
  l3: { name: "3号线", color: "#e8348d", pts: [
    [2280,520,"军区总医院"],[2230,680,"熊猫大道"],[2170,850,"驷马桥"],[2120,1020,"李家沱"],
    [2095,1150,"红星桥"],[2085,1270,"市二医院"],[2130,1360,"春熙路"],[2135,1520,"新南门"],
    [2105,1660,"磨子桥"],[2085,1760,"省体育馆"],[1960,1870,"衣冠庙"],[1855,1965,"高升桥"],
    [1770,2065,"红牌楼"],[1700,2170,"太平园"],[1610,2320,"川藏立交"],[1450,2520,"双流西站"]
  ]},
  l4: { name: "4号线", color: "#2ecc71", pts: [
    [880,1650,"万盛"],[1010,1648,"杨柳河"],[1140,1644,"凤溪河"],[1280,1638,"光华公园"],
    [1420,1632,"文化宫"],[1560,1628,"宽窄巷子"],[1975,1652,"骡马市"],[2380,1680,"玉双路"],
    [2650,1714,"双桥路"],[2820,1706,"万年场"],[3080,1650,"西河"]
  ]},
  l5: { name: "5号线", color: "#b24df0", pts: [
    [1450,520,"华桂路"],[1420,780,""],[1450,1050,""],[1500,1330,""],
    [1560,1620,""],[1640,1900,""],[1720,2180,""],[1820,2460,""],[1950,2760,"回龙"]
  ]},
  l6: { name: "6号线", color: "#2b5fb3", pts: [
    [900,700,"望丛祠"],[1350,1050,""],[1750,1330,""],[2050,1580,""],[2450,1860,""],[2850,2150,""]
  ]},
  l7: { name: "7号线", color: "#00b0ca", pts: [
    [2020,900,"火车北站"],[2540,1120,""],[2680,1560,""],[2500,1980,""],
    [2170,2140,"火车南站"],[1700,2170,"太平园"],[1450,1750,""],[1500,1300,""],[2020,900,""]
  ]},
  l8: { name: "8号线", color: "#d4468c", pts: [
    [2760,880,""],[2460,1240,""],[2150,1560,""],[1850,1880,""],[1600,2180,""]
  ]},
  l9: { name: "9号线", color: "#e87722", pts: [
    [1180,1180,""],[1450,1450,""],[1720,1720,""],[2020,1930,""],[2320,2140,""]
  ]},
  l10: { name: "10号线", color: "#1b6cb5", pts: [
    [1700,2170,"太平园"],[1570,2350,"金花"],[1450,2530,""],[1310,2710,"双流机场T2"],[1180,2880,""],[1040,3050,""]
  ]},
  l17: { name: "17号线", color: "#38a855", pts: [
    [820,1680,""],[1180,1580,""],[1540,1490,""],[1900,1430,""],[2260,1390,""]
  ]},
  l18: { name: "18号线", color: "#f08300", pts: [
    [2170,2140,"火车南站"],[2380,2350,""],[2640,2580,""]
  ]},
};

const EVENTS = [
  { year:"2010", date:"2010.09.27", title:"1号线一期开通", desc:"成都正式迈入地铁时代",
    extra:"升仙湖—世纪城 · 17站 · 18.5km", lines:1,
    draws:[["l1",1,15]], camF:[1950,950,1.18], camT:[2230,2500,1.02] },
  { year:"2012", date:"2012.10", title:"2号线一期开通", desc:"十字路网骨架成形",
    extra:"茶店子客运站—成都行政学院", lines:2,
    draws:[["l2",3,16]], camF:[1250,1450,1.12], camT:[3000,1300,1.0] },
  { year:"2013—2014", date:"2013 / 2014", title:"2号线东西延伸", desc:"西延犀浦 · 东延龙泉驿",
    extra:"2号线全线贯通运营", lines:2,
    draws:[["l2",0,3],["l2",16,19]], camF:[820,1480,1.1], camT:[3400,1260,0.94] },
  { year:"2015", date:"2015.07", title:"1号线南延线开通", desc:"向南挺进天府新区",
    extra:"世纪城—广都", lines:2,
    draws:[["l1",15,19]], camF:[2260,2650,1.15], camT:[2330,3120,1.05] },
  { year:"2015", date:"2015.12", title:"4号线一期开通", desc:"温江方向进城新通道",
    extra:"万盛—西河", lines:3,
    draws:[["l4",0,10]], camF:[980,1650,1.1], camT:[3000,1670,1.0] },
  { year:"2016", date:"2016.07", title:"3号线一期开通", desc:"南北向第三条骨干线",
    extra:"军区总医院—太平园", lines:4,
    draws:[["l3",0,13]], camF:[2280,650,1.12], camT:[1760,2100,1.02] },
  { year:"2017", date:"2017.09", title:"10号线一期开通", desc:"成都首条机场专线",
    extra:"太平园—双流机场T2航站楼", lines:5,
    draws:[["l10",0,3]], camF:[1700,2200,1.18], camT:[1310,2710,1.12] },
  { year:"2017", date:"2017.12", title:"7号线环线开通", desc:"成都首条环形线路",
    extra:"绕行中心城区 · 换乘之王", lines:6,
    draws:[["l7",0,8]], camF:[2060,1520,1.12], camT:[2060,1520,0.94] },
  { year:"2018", date:"2018", title:"1号线三期 · 3号线二三期", desc:"线路两端继续延伸",
    extra:"北延韦家碾 · 南延五根松 · 抵达双流西站", lines:6,
    draws:[["l1",0,1],["l1b",0,1],["l3",13,15]], camF:[1930,850,1.0], camT:[2200,2900,0.88] },
  { year:"2019", date:"2019.12", title:"5号线一二期开通", desc:"南北向新动脉",
    extra:"华桂路—回龙", lines:7,
    draws:[["l5",0,8]], camF:[1450,760,1.1], camT:[1930,2650,0.95] },
  { year:"2020", date:"2020.09", title:"18号线一二期开通", desc:"直连天府机场方向",
    extra:"火车南站—天府机场方向", lines:8,
    draws:[["l18",0,2]], camF:[2200,2180,1.15], camT:[2600,2540,1.05] },
  { year:"2020", date:"2020.12.30", title:"五线齐发", desc:"6 / 8 / 9 / 10二期 / 17号线 同步开通",
    extra:"运营里程突破 500 公里 · 网络化运营", lines:13,
    draws:[["l6",0,5],["l8",0,4],["l9",0,4],["l17",0,4],["l10",3,5]], camF:[1900,1500,0.82], camT:[2050,1650,0.52] },
];

const INTRO = 72;
const SEG = 110;
const OUTRO = 132;
const starts = EVENTS.map((_, i) => INTRO + i * SEG);
const TOTAL = INTRO + EVENTS.length * SEG + OUTRO;

const REVEALS = [];
EVENTS.forEach((ev, ei) => {
  ev.draws.forEach(([key, a, b]) => {
    const line = LINES[key];
    for (let i = a; i <= b; i++) {
      const [x, y, name] = line.pts[i];
      const frac = b === a ? 1 : (i - a) / (b - a);
      const frame = starts[ei] + 10 + frac * 84;
      if (!REVEALS.some((r) => r.x === x && r.y === y && r.frame < frame)) {
        REVEALS.push({ x, y, name, color: line.color, frame });
      }
    }
  });
});

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
  const t = ease(Math.min(1, (f - lastEnd) / 70));
  return lerpCam(toXY([2050, 1650, 0.52]), toXY([2050, 1600, 0.48]), t);
};
const getRot = (f) => {
  const fs = starts[EVENTS.length - 1];
  const front = interpolate(f, [fs, fs + 115], [0, 1], clamp);
  return { rotX: 52 - front * 20, rotZ: -32 + front * 16 };
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
          {/* 网格地板（缩小画布提升性能） */}
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

          {/* 线路（去掉 drop-shadow，改用双层描边模拟辉光） */}
          <svg width={4800} height={4000} viewBox="-2400 -2000 4800 4000"
            style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}>
            {EVENTS.map((ev, ei) => (
              <React.Fragment key={ei}>
                {ev.draws.map(([key, a, b], di) => {
                  const line = LINES[key];
                  const sub = line.pts.slice(a, b + 1);
                  const d = sub.map((p, i) => `${i ? "L" : "M"}${p[0] - 2000} ${p[1] - 1400}`).join(" ");
                  const prog = interpolate(f, [starts[ei] + 10, starts[ei] + 94], [0, 1], clamp);
                  const isBranch = key === "l1b";
                  return (
                    <g key={di}>
                      {/* 辉光层：宽半透明描边代替 drop-shadow */}
                      {!isBranch && (
                        <path d={d} fill="none" stroke={line.color} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round"
                          opacity={(0.06 + 0.14 * prog) * prog} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog} />
                      )}
                      {/* 底衬 */}
                      <path d={d} fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth={isBranch ? 10 : 16} strokeLinecap="round" strokeLinejoin="round"
                        opacity={0.12 + 0.88 * prog} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog} />
                      {/* 主线 */}
                      <path d={d} fill="none" stroke={line.color} strokeWidth={isBranch ? 5 : 9} strokeLinecap="round" strokeLinejoin="round"
                        strokeDasharray={isBranch ? "28 14" : 1} strokeDashoffset={isBranch ? 0 : 1 - prog}
                        pathLength={isBranch ? undefined : 1}
                        opacity={0.14 + 0.86 * prog} />
                      {/* 行车流光 */}
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

          {/* 站点（只渲染已出现的，减少DOM） */}
          {REVEALS.map((r, i) => {
            if (f < r.frame) return null;
            const pop = interpolate(f, [r.frame, r.frame + 8], [0, 1], clamp);
            return (
              <div key={i} style={{
                position: "absolute", left: r.x - 2000, top: r.y - 1400,
                transform: `translate(-50%,-50%) translateZ(28px) rotateZ(${-rotZ}deg) rotateX(${-rotX}deg) scale(${0.3 + 0.7 * pop})`,
                display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap",
              }}>
                {/* 点亮圈（代替 boxShadow 辉光） */}
                <div style={{ position: "absolute", left: -8, top: -8, width: 26, height: 26, borderRadius: "50%", background: r.color, opacity: 0.22 }} />
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#fff", border: `3px solid ${r.color}`, flexShrink: 0, position: "relative" }} />
                {r.name ? (
                  <div style={{ fontFamily: F, fontWeight: 700, fontSize: 18, color: "#eaf4ff", textShadow: "0 1px 6px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.7)", padding: "1px 5px", background: "rgba(8,16,34,0.5)", borderRadius: 4, position: "relative" }}>
                    {r.name}
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

/* ============ 文案覆盖层 ============ */
const InfoCard = ({ ev, lf }) => {
  const inO = interpolate(lf, [0, 14], [0, 1], clamp);
  const inY = interpolate(lf, [0, 14], [26, 0], clamp);
  const outO = interpolate(lf, [SEG - 12, SEG], [1, 0], clamp);
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
      <div style={{ position: "absolute", right: 70, top: 62, display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end", opacity: inO }}>
        <div style={{ fontFamily: F, fontWeight: 900, fontSize: 32, color: "#fff", background: "rgba(10,20,40,0.72)", border: "1px solid rgba(120,180,255,0.3)", padding: "10px 24px", borderRadius: 12, letterSpacing: 2 }}>
          运营线路 <span style={{ color: "#5ff0c0", fontSize: 42 }}>{ev.lines}</span> 条
        </div>
        <div style={{ fontFamily: F, fontSize: 21, color: "rgba(190,215,255,0.72)", letterSpacing: 3 }}>成都地铁 · 网络生长中</div>
      </div>
      <div style={{ position: "absolute", left: 90, right: 90, bottom: 52 }}>
        <div style={{ height: 5, borderRadius: 999, background: "rgba(255,255,255,0.12)", position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${((starts[EVENTS.indexOf(ev)] + lf) / TOTAL) * 100}%`, background: "linear-gradient(90deg,#4fd1ff,#ffd76a,#ff6b6b)", borderRadius: 999 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: F, fontSize: 19, color: "rgba(180,210,255,0.55)", letterSpacing: 4 }}>
          <span>2010</span><span>2013</span><span>2016</span><span>2018</span><span>2020</span>
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
      2010 → 2020
    </div>
    <div style={{ marginTop: 18, fontFamily: F, fontSize: 28, color: "rgba(205,228,255,0.82)", letterSpacing: 10, opacity: interpolate(f, [44, 62], [0, 1], clamp) }}>
      从第一条线路开通 · 到五线齐发
    </div>
  </div>
);

const Outro = ({ f }) => (
  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", paddingTop: 64, pointerEvents: "none" }}>
    <div style={{ fontFamily: F, fontWeight: 900, fontSize: 88, color: "#fff", letterSpacing: 9, opacity: interpolate(f, [8, 28], [0, 1], clamp), transform: `scale(${interpolate(f, [8, 28], [0.92, 1], clamp)})`, textShadow: "0 6px 40px rgba(255,190,80,0.45), 0 16px 56px rgba(0,0,0,0.85)" }}>
      五线齐发 · 网络新时代
    </div>
    <div style={{ marginTop: 18, display: "flex", gap: 22, opacity: interpolate(f, [30, 50], [0, 1], clamp) }}>
      {["13 条线路", "500+ 公里", "350+ 车站"].map((t, i) => (
        <div key={i} style={{ fontFamily: F, fontWeight: 700, fontSize: 32, color: "#0a1226", background: ["#5ff0c0", "#ffd76a", "#ff8f8f"][i], padding: "12px 32px", borderRadius: 14 }}>{t}</div>
      ))}
    </div>
    <div style={{ marginTop: 18, fontFamily: F, fontSize: 26, color: "rgba(210,232,255,0.82)", letterSpacing: 10, opacity: interpolate(f, [54, 76], [0, 1], clamp) }}>
      成都，正驶向未来
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
      {/* 暗角（纯渐变，无滤镜） */}
      <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse at center, transparent 48%, rgba(2,6,14,0.65) 100%)" }} />
      {/* 扫描线纹理（纯CSS渐变，无SVG滤镜） */}
      <AbsoluteFill style={{ pointerEvents: "none", background: "repeating-linear-gradient(0deg, transparent 0 3px, rgba(0,0,0,0.04) 3px 4px)" }} />

      {f < INTRO && <Intro f={f} />}
      {evIdx >= 0 && f < INTRO + EVENTS.length * SEG && <InfoCard ev={EVENTS[evIdx]} lf={lf} />}
      {f >= INTRO + EVENTS.length * SEG && <Outro f={f - INTRO - EVENTS.length * SEG} />}

      <AbsoluteFill style={{ background: "#000", opacity: interpolate(f, [TOTAL - 22, TOTAL - 2], [0, 1], clamp), pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export const RemotionRoot = () => (
  <Composition id="ShortCircuitVideo" component={ChengduMetro} durationInFrames={TOTAL} fps={30} width={1920} height={1080} />
);

registerRoot(RemotionRoot);
