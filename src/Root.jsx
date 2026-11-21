import React, {useMemo} from 'react';
import {
  AbsoluteFill,
  Audio,
  Composition,
  Easing,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  interpolateColors,
  random,
  registerRoot,
  staticFile,
  useCurrentFrame,
} from 'remotion';

/* ========================= 常量 ========================= */

const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;

const INTRO_DUR = 150;
const CHAPTER_DURATIONS = [600, 600, 660, 660, 660];
const CHAPTER_STARTS = [150, 750, 1350, 2010, 2670];
const OUTRO_DUR = 280;
const OUTRO_START = 3330;
const TOTAL_DURATION = 3610;

const COLORS = {
  bg: '#070c14',
  text: '#f4efe4',
  muted: '#98a1ab',
  gold: '#e9b44c',
};
const INTRO_ACCENT = '#e9b44c';
const OUTRO_ACCENT = '#e9b44c';

// ✅ 修改：使用 Noto Sans CJK SC（思源黑体，yml安装后系统自带）
const FONT_DISPLAY = '"Noto Sans CJK SC", sans-serif';
const FONT_BODY = '"Noto Sans CJK SC", sans-serif';
const FONT_LATIN = 'Georgia, Times New Roman, serif';

// 需要背景音乐：上传 public/music.mp3，把false改为true
const MUSIC_ENABLED = false;

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};

/* ========================= 字体（谷歌字体已全部弃用，函数保留但不调用） ========================= */
const FONT_CSS = '';
const loadFonts = () => {
  if (typeof document === 'undefined') return;
  const handle = delayRender('Loading webfonts');
  const done = () => continueRender(handle);
  done();
};

/* ========================= 文案数据 ========================= */
const CHAPTERS = [
  {
    cn: '一',
    latin: 'THE PALEOLITHIC',
    short: '旧石器',
    title: '旧石器时代',
    era: '约 250 万年前 — 1 万年前',
    lead: '一块石头、一团火，把人类推出了动物的行列',
    accent: '#e2673f',
    points: [
      {
        year: '250 万年前',
        head: '能人打制第一件石器',
        desc: '东非能人敲击砾石造出奥杜威砍砸器，工具的时代由此开启。',
        sub: '250 万年前，人类第一次把石头变成了工具。',
      },
      {
        year: '100 万年前',
        head: '直立人带着火种走出非洲',
        desc: '直立人学会保存与管理火种，并向欧亚大陆迁徙扩散。',
        sub: '一百万年前，我们的祖先举着火种走出了非洲。',
      },
      {
        year: '30 万年前',
        head: '智人在非洲诞生',
        desc: '化石证据显示，解剖学意义上的智人约 30 万年前出现在非洲。',
        sub: '30 万年前，智人在非洲大陆登场。',
      },
      {
        year: '7 万年前',
        head: '认知革命',
        desc: '语言、抽象思维与艺术出现，人类开始讲述「不存在的故事」。',
        sub: '7 万年前的认知革命，让人类会想象、会讲故事。',
      },
      {
        year: '1.5 万年前',
        head: '冰期结束，走向全球',
        desc: '末次冰期结束，人类经白令陆桥进入美洲，足迹覆盖各大洲。',
        sub: '冰川退去，人类已遍布除南极之外的所有大陆。',
      },
    ],
  },
  {
    cn: '二',
    latin: 'THE NEOLITHIC',
    short: '农业',
    title: '农业革命',
    era: '约 1.2 万年前 — 5 千年前',
    lead: '一粒种子落下，人类从此不再流浪',
    accent: '#dda33f',
    points: [
      {
        year: '1.2 万年前',
        head: '新月沃地驯化小麦',
        desc: '两河流域先民把野麦培育成作物，第一次「种下」自己的口粮。',
        sub: '一万两千年前，人类开始驯化小麦与绵羊。',
      },
      {
        year: '1 万年前',
        head: '长江流域的稻作',
        desc: '上山文化、河姆渡文化培育水稻，奠定东方农耕传统。',
        sub: '几乎同时，长江边的人们开始栽培水稻。',
      },
      {
        year: '9 千年前',
        head: '村落与定居生活',
        desc: '杰里科、恰塔霍裕克等村落出现，人类建起第一批永久家园。',
        sub: '定居让人口暴涨，也催生了社会分工。',
      },
      {
        year: '6 千年前',
        head: '剩余、阶层与城市',
        desc: '粮食剩余带来工匠、祭司与统治者，私有制与城市雏形出现。',
        sub: '粮食有了剩余，阶层与城市随之诞生。',
      },
      {
        year: '5 千年前',
        head: '文字的前夜',
        desc: '结绳、陶符与印章广泛使用，管理的需求呼唤文字降临。',
        sub: '为了记账与管理，人类即将发明文字。',
      },
    ],
  },
  {
    cn: '三',
    latin: 'THE FIRST CIVILIZATIONS',
    short: '文明',
    title: '文明的曙光',
    era: '约公元前 3500 年 — 公元前 200 年',
    lead: '文字让知识跨越生死，思想让文明有了方向',
    accent: '#c07d4c',
    points: [
      {
        year: '公元前 3400 年',
        head: '楔形文字诞生',
        desc: '苏美尔人用芦苇杆压印泥板，人类第一次把声音变成符号。',
        sub: '约 5400 年前，苏美尔人写下人类最早的文字。',
      },
      {
        year: '公元前 3100 年',
        head: '埃及统一与金字塔',
        desc: '尼罗河畔出现统一王国，象形文字、金字塔与天文学同步兴起。',
        sub: '尼罗河畔，金字塔与象形文字一同升起。',
      },
      {
        year: '公元前 2070 年',
        head: '夏商王朝与甲骨文',
        desc: '中国进入王朝时代，商代甲骨文已是成熟的文字系统。',
        sub: '东方的夏商王朝，留下了成熟的甲骨文。',
      },
      {
        year: '公元前 1754 年',
        head: '《汉谟拉比法典》',
        desc: '现存最早的较完整成文法典，把社会秩序刻上黑色玄武岩。',
        sub: '成文法出现，社会第一次被规则写了下来。',
      },
      {
        year: '公元前 800 年',
        head: '轴心时代',
        desc: '孔子、苏格拉底、释迦牟尼、老子相继思索，奠定文明底色。',
        sub: '轴心时代，人类同时开始追问终极问题。',
      },
    ],
  },
  {
    cn: '四',
    latin: 'SCIENCE & INDUSTRY',
    short: '工业',
    title: '科学与工业革命',
    era: '1543 — 1900',
    lead: '从仰望星空到机器轰鸣，知识第一次成倍放大',
    accent: '#8fa9bd',
    points: [
      {
        year: '1543',
        head: '哥白尼日心说',
        desc: '《天体运行论》把地球移出宇宙中心，近代科学由此启程。',
        sub: '1543 年，人类把地球请下了宇宙中心。',
      },
      {
        year: '1687',
        head: '牛顿力学',
        desc: '《自然哲学的数学原理》用数学语言描述运动与万有引力。',
        sub: '牛顿用几条定律，解释了天上与地上的运动。',
      },
      {
        year: '1776',
        head: '蒸汽机改良',
        desc: '瓦特改良蒸汽机，化石能源替代人力，机器大工业时代来临。',
        sub: '蒸汽机一响，人类进入机器生产的时代。',
      },
      {
        year: '1859',
        head: '《物种起源》',
        desc: '达尔文提出进化论，把人类重新放回自然演化的谱系之中。',
        sub: '进化论告诉人类：我们也是自然的一部分。',
      },
      {
        year: '1870 年代',
        head: '电力与元素周期表',
        desc: '门捷列夫排布元素周期表，电灯、电话、汽车接连点亮世界。',
        sub: '电力与化学，让世界在一百年里彻底变样。',
      },
    ],
  },
  {
    cn: '五',
    latin: 'THE INFORMATION AGE',
    short: '信息',
    title: '信息时代',
    era: '1945 — 至今',
    lead: '机器开始思考，世界连成一张网',
    accent: '#5fc4c4',
    points: [
      {
        year: '1945',
        head: '第一台电子计算机',
        desc: 'ENIAC 每秒运算五千次，人类第一次把计算交给机器。',
        sub: '1945 年，电子计算机接过了人类的算盘。',
      },
      {
        year: '1969',
        head: '互联网与登月',
        desc: 'ARPANET 传出第一条网络信息；阿波罗 11 号踏上月球。',
        sub: '1969 年，人类登上月球，也把电脑连成了网络。',
      },
      {
        year: '1989',
        head: '万维网诞生',
        desc: '蒂姆·伯纳斯‑李提出万维网，知识第一次真正全球共享。',
        sub: '万维网让知识几乎零成本地流向每个人。',
      },
      {
        year: '2003',
        head: '人类基因组计划',
        desc: '约 30 亿对碱基测序完成，生命之书第一次被完整读出。',
        sub: '基因组测序完成，人类读懂了自己的生命之书。',
      },
      {
        year: '2020 年代',
        head: 'AI 与深空时代',
        desc: '大模型、mRNA 疫苗、可复用火箭、黑洞照片，探索仍在加速。',
        sub: '人工智能与深空探索，正在写下全新的篇章。',
      },
    ],
  },
];

/* ========================= 背景 / 颗粒 / 时间轴 ========================= */
const buildAccentKeys = () => {
  const frames = [];
  const colors = [];
  const list = [
    {start: 0, end: INTRO_DUR, color: INTRO_ACCENT},
    ...CHAPTERS.map((c, i) => ({
      start: CHAPTER_STARTS[i],
      end: CHAPTER_STARTS[i] + CHAPTER_DURATIONS[i],
      color: c.accent,
    })),
    {start: OUTRO_START, end: TOTAL_DURATION, color: OUTRO_ACCENT},
  ];
  list.forEach((s) => {
    frames.push(s.start + 36, s.end - 36);
    colors.push(s.color, s.color);
  });
  return {frames, colors};
};

const ACCENT_KEYS = buildAccentKeys();

const Background = () => {
  const frame = useCurrentFrame();
  const accent = interpolateColors(frame, ACCENT_KEYS.frames, ACCENT_KEYS.colors);
  const stars = useMemo(
    () =>
      new Array(66).fill(0).map((_, i) => ({
        x: random(`sx${i}`) * WIDTH,
        y: random(`sy${i}`) * HEIGHT,
        r: 0.6 + random(`sr${i}`) * 2.1,
        phase: random(`sp${i}`) * Math.PI * 2,
        speed: 0.35 + random(`ss${i}`) * 1.1,
        drift: 0.06 + random(`sd${i}`) * 0.22,
        base: 0.25 + random(`sb${i}`) * 0.6,
      })),
    []
  );

  return (
    <AbsoluteFill
      style={{background: 'linear-gradient(158deg, #060a12 0%, #0a1220 52%, #070c14 100%)'}}
    >
      <div
        style={{
          position: 'absolute',
          left: -220 + Math.sin(frame * 0.004) * 60,
          top: -160 + Math.cos(frame * 0.0032) * 50,
          width: 1150,
          height: 920,
          borderRadius: '50%',
          background: accent,
          opacity: 0.17,
          filter: 'blur(120px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: -180 + Math.cos(frame * 0.0035) * 70,
          bottom: -240 + Math.sin(frame * 0.0028) * 60,
          width: 1100,
          height: 900,
          borderRadius: '50%',
          background: '#2a4d8f',
          opacity: 0.2,
          filter: 'blur(130px)',
        }}
      />
      <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', inset: 0}}>
        {stars.map((s, i) => {
          const twinkle = 0.55 + 0.45 * Math.sin(frame * 0.03 * s.speed + s.phase);
          const y = (((s.y - frame * s.drift) % HEIGHT) + HEIGHT) % HEIGHT;
          return (
            <circle key={i} cx={s.x} cy={y} r={s.r} fill="#dce8ff" opacity={s.base * twinkle * 0.8} />
          );
        })}
      </svg>
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse at 50% 46%, transparent 48%, rgba(2,4,9,0.62) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

const NOISE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/></filter><rect width='260' height='260' filter='url(%23n)' opacity='0.55'/></svg>";

const Grain = () => (
  <AbsoluteFill
    style={{
      backgroundImage: `url("${NOISE}")`,
      backgroundSize: '260px 260px',
      opacity: 0.055,
      mixBlendMode: 'overlay',
      pointerEvents: 'none',
    }}
  />
);

const Timeline = () => {
  const frame = useCurrentFrame();
  const progress = frame / TOTAL_DURATION;
  const trackLeft = 100;
  const trackWidth = 1720;

  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 22, height: 62}}>
      <div
        style={{
          position: 'absolute',
          left: trackLeft,
          top: 12,
          width: trackWidth,
          height: 3,
          background: 'rgba(244,239,228,0.14)',
          borderRadius: 2,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: trackLeft,
          top: 12,
          width: trackWidth * progress,
          height: 3,
          borderRadius: 2,
          background: `linear-gradient(90deg, ${CHAPTERS.map((c) => c.accent).join(', ')}, ${COLORS.gold})`,
          boxShadow: '0 0 16px rgba(233,180,76,0.35)',
        }}
      />

      {CHAPTERS.map((c, i) => {
        const start = CHAPTER_STARTS[i];
        const end = start + CHAPTER_DURATIONS[i];
        const x1 = trackLeft + (trackWidth * start) / TOTAL_DURATION;
        const x2 = trackLeft + (trackWidth * end) / TOTAL_DURATION;
        const active = frame >= start && frame < end;
        return (
          <React.Fragment key={c.short}>
            <div
              style={{
                position: 'absolute',
                left: x1,
                top: 5,
                width: 1,
                height: 17,
                background: 'rgba(244,239,228,0.22)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: x1,
                top: 30,
                width: x2 - x1,
                textAlign: 'center',
                fontFamily: FONT_BODY,
                fontSize: 19,
                letterSpacing: 4,
                color: active ? COLORS.text : 'rgba(152,161,171,0.55)',
              }}
            >
              {c.short}
            </div>
          </React.Fragment>
        );
      })}

      <div
        style={{
          position: 'absolute',
          left: trackLeft + trackWidth * progress - 7,
          top: 6,
          width: 15,
          height: 15,
          borderRadius: '50%',
          background: COLORS.gold,
          boxShadow: '0 0 22px rgba(233,180,76,0.9)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 100,
          top: 28,
          fontFamily: FONT_LATIN,
          fontSize: 18,
          letterSpacing: 6,
          color: 'rgba(152,161,171,0.6)',
        }}
      >
        TIMELINE
      </div>
    </div>
  );
};

/* ========================= 通用组件 ========================= */
const Sweep = () => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, 50], [-1500, 2500], CLAMP);
  const opacity = interpolate(frame, [0, 6, 32, 50], [0, 0.45, 0.3, 0], CLAMP);
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          top: -220,
          left: 0,
          width: 860,
          height: 1560,
          transform: `translateX(${x}px) rotate(18deg)`,
          background: 'linear-gradient(90deg, transparent, rgba(255,222,178,0.18), transparent)',
          filter: 'blur(16px)',
          opacity,
        }}
      />
    </div>
  );
};

const Reveal = ({delay, children, style}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame - delay, [0, 30], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
  return (
    <div style={{opacity: t, transform: `translateY(${(1 - t) * 26}px)`, ...style}}>{children}</div>
  );
};

const PointItem = ({point, delay, accent, style}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame - delay, [0, 30], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
  return (
    <div
      style={{
        position: 'absolute',
        width: 660,
        opacity: t,
        transform: `translateY(${(1 - t) * 28}px)`,
        ...style,
      }}
    >
      <div
        style={{
          fontFamily: FONT_LATIN,
          fontStyle: 'italic',
          fontSize: 39,
          letterSpacing: 1,
          color: accent,
        }}
      >
        {point.year}
      </div>
      <div
        style={{
          fontFamily: FONT_BODY,
          fontWeight: 700,
          fontSize: 33,
          marginTop: 2,
          color: COLORS.text,
        }}
      >
        {point.head}
      </div>
      <div
        style={{
          fontFamily: FONT_BODY,
          fontSize: 22.5,
          lineHeight: 1.55,
          marginTop: 8,
          maxWidth: 640,
          color: COLORS.muted,
        }}
      >
        {point.desc}
      </div>
      <div style={{width: 56, height: 3, marginTop: 12, background: accent, opacity: 0.85}} />
    </div>
  );
};

const SubtitleBar = ({items, fadeAt, accent}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 92, height: 80}}>
      {items.map((it, i) => {
        const next = items[i + 1]?.start ?? fadeAt;
        const opacity = Math.min(
          interpolate(frame, [it.start, it.start + 12], [0, 1], CLAMP),
          interpolate(frame, [next - 12, next], [1, 0], CLAMP)
        );
        return (
          <div key={i} style={{position: 'absolute', inset: 0, opacity, textAlign: 'center'}}>
            <div
              style={{width: 46, height: 2, margin: '0 auto 18px', background: accent, opacity: 0.75}}
            />
            <div
              style={{
                fontFamily: FONT_BODY,
                fontSize: 33,
                letterSpacing: 2,
                color: COLORS.text,
                textShadow: '0 2px 20px rgba(0,0,0,0.9)',
              }}
            >
              {it.text}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ========================= 片头 ========================= */
const TITLE = '人类发展史';

const Intro = () => {
  const frame = useCurrentFrame();
  const ruleWidth = interpolate(frame, [46, 92], [0, 560], {
    ...CLAMP,
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          top: 300,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONT_LATIN,
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: 250,
          color: '#ffffff',
          opacity: 0.05,
          letterSpacing: 6,
        }}
      >
        7,000,000 Years
      </div>

      <Reveal delay={2} style={{position: 'absolute', top: 268, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{fontFamily: FONT_LATIN, fontSize: 22, letterSpacing: 12, color: COLORS.gold}}>
          KNOWLEDGE FILM · 知识科普
        </div>
      </Reveal>

      <div style={{position: 'absolute', top: 340, left: 0, right: 0, textAlign: 'center'}}>
        {TITLE.split('').map((ch, i) => {
          const t = interpolate(frame, [16 + i * 10, 54 + i * 10], [0, 1], {
            ...CLAMP,
            easing: Easing.out(Easing.cubic),
          });
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                fontFamily: FONT_DISPLAY,
                fontSize: 168,
                lineHeight: 1.2,
                opacity: t,
                transform: `translateY(${(1 - t) * 64}px)`,
                background: 'linear-gradient(180deg, #f8e7b8 0%, #e9b44c 52%, #c8892c 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>

      <div
        style={{
          position: 'absolute',
          top: 596,
          left: '50%',
          transform: 'translateX(-50%)',
          width: ruleWidth,
          height: 2,
          background: 'linear-gradient(90deg, transparent, #e9b44c, transparent)',
        }}
      />

      <Reveal delay={96} style={{position: 'absolute', top: 636, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{fontFamily: FONT_BODY, fontSize: 32, letterSpacing: 5, color: COLORS.text}}>
          五个关键转折，看懂人类如何走到今天
        </div>
      </Reveal>

      <Reveal delay={112} style={{position: 'absolute', top: 702, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{fontFamily: FONT_BODY, fontSize: 23, letterSpacing: 4, color: COLORS.muted}}>
          从非洲丛林到星辰大海 · 七百万年的旅程
        </div>
      </Reveal>
    </AbsoluteFill>
  );
};

/* ========================= 章节 ========================= */
const POSITIONS = [
  {left: 200, top: 340},
  {left: 200, top: 535},
  {left: 200, top: 730},
  {left: 1050, top: 425},
  {left: 1050, top: 620},
];

const ChapterScene = ({chapter, duration, index}) => {
  const frame = useCurrentFrame();
  const interval = Math.round((duration - 130) / chapter.points.length);
  const starts = chapter.points.map((_, i) => 46 + i * interval);
  const sceneOpacity = interpolate(frame, [0, 12, duration - 18, duration - 2], [0, 1, 1, 0], CLAMP);
  const subtitleItems = [
    {start: 6, text: chapter.lead},
    ...chapter.points.map((p, i) => ({start: starts[i], text: p.sub})),
  ];

  return (
    <AbsoluteFill style={{opacity: sceneOpacity}}>
      <Sweep />

      <div
        style={{
          position: 'absolute',
          left: 78,
          top: 96,
          width: 2,
          height: 800,
          background: `linear-gradient(180deg, ${chapter.accent}00, ${chapter.accent}55 30%, ${chapter.accent}22 75%, ${chapter.accent}00)`,
        }}
      />

      <Reveal
        delay={10}
        style={{
          position: 'absolute',
          left: 56,
          top: 132,
          writingMode: 'vertical-rl',
          fontFamily: FONT_BODY,
          fontSize: 23,
          letterSpacing: 9,
          color: chapter.accent,
        }}
      >
        {`第${chapter.cn}章 · ${chapter.title}`}
      </Reveal>

      <div
        style={{
          position: 'absolute',
          right: -250,
          top: 420,
          width: 940,
          textAlign: 'center',
          transform: 'rotate(-90deg)',
          fontFamily: FONT_LATIN,
          fontStyle: 'italic',
          fontSize: 190,
          whiteSpace: 'nowrap',
          color: '#ffffff',
          opacity: 0.05,
        }}
      >
        {chapter.latin}
      </div>

      <Reveal delay={2} style={{position: 'absolute', left: 200, top: 66}}>
        <div style={{fontFamily: FONT_LATIN, fontSize: 21, letterSpacing: 8, color: chapter.accent}}>
          {`CHAPTER 0${index + 1} · ${chapter.latin}`}
        </div>
      </Reveal>

      <Reveal delay={8} style={{position: 'absolute', left: 200, top: 102}}>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 88,
            lineHeight: 1.18,
            color: COLORS.text,
            letterSpacing: 3,
          }}
        >
          {chapter.title}
        </div>
      </Reveal>

      <Reveal delay={18} style={{position: 'absolute', left: 200, top: 222}}>
        <div style={{fontFamily: FONT_BODY, fontSize: 27, letterSpacing: 2, color: COLORS.muted}}>
          {chapter.lead}
        </div>
      </Reveal>

      <Reveal delay={26} style={{position: 'absolute', right: 200, top: 72}}>
        <div
          style={{
            padding: '10px 26px',
            borderRadius: 999,
            border: `1px solid ${chapter.accent}66`,
            fontFamily: FONT_LATIN + ', ' + FONT_BODY,
            fontSize: 23,
            letterSpacing: 2,
            color: chapter.accent,
            background: 'rgba(255,255,255,0.03)',
          }}
        >
          {chapter.era}
        </div>
      </Reveal>

      {chapter.points.map((p, i) => (
        <PointItem
          key={p.head}
          point={p}
          delay={starts[i]}
          accent={chapter.accent}
          style={POSITIONS[i % POSITIONS.length]}
        />
      ))}

      <SubtitleBar items={subtitleItems} fadeAt={duration - 10} accent={chapter.accent} />
    </AbsoluteFill>
  );
};

/* ========================= 片尾 ========================= */
const Outro = () => {
  const frame = useCurrentFrame();
  const ruleWidth = interpolate(frame, [40, 86], [0, 520], {
    ...CLAMP,
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          top: 210,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONT_LATIN,
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: 210,
          color: '#ffffff',
          opacity: 0.045,
        }}
      >
        To Be Continued
      </div>

      <Reveal delay={8} style={{position: 'absolute', top: 330, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{fontFamily: FONT_DISPLAY, fontSize: 92, letterSpacing: 6, color: COLORS.text}}>
          人类的故事，未完待续
        </div>
      </Reveal>

      <div
        style={{
          position: 'absolute',
          top: 488,
          left: '50%',
          transform: 'translateX(-50%)',
          width: ruleWidth,
          height: 2,
          background: 'linear-gradient(90deg, transparent, #e9b44c, transparent)',
        }}
      />

      <Reveal delay={62} style={{position: 'absolute', top: 528, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{fontFamily: FONT_BODY, fontSize: 33, letterSpacing: 6, color: COLORS.gold}}>
          认识过去 · 理解现在 · 想象未来
        </div>
      </Reveal>

      <Reveal delay={78} style={{position: 'absolute', top: 600, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{fontFamily: FONT_BODY, fontSize: 24, letterSpacing: 4, color: COLORS.muted}}>
          从一粒火种到星辰大海，探索仍将继续
        </div>
      </Reveal>

      <Reveal delay={104} style={{position: 'absolute', top: 782, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{fontFamily: FONT_BODY, fontSize: 27, letterSpacing: 10, color: COLORS.text}}>
          感谢观看
        </div>
        <div
          style={{
            marginTop: 14,
            fontFamily: FONT_LATIN,
            fontSize: 19,
            letterSpacing: 10,
            color: 'rgba(233,180,76,0.8)',
          }}
        >
          THANKS FOR WATCHING
        </div>
      </Reveal>
    </AbsoluteFill>
  );
};

/* ========================= 主合成 ========================= */
const HumanHistory = () => (
  <AbsoluteFill style={{backgroundColor: COLORS.bg, fontFamily: FONT_BODY, color: COLORS.text}}>
    <Background />

    <Sequence from={0} durationInFrames={INTRO_DUR}>
      <Intro />
    </Sequence>

    {CHAPTERS.map((chapter, i) => (
      <Sequence key={chapter.title} from={CHAPTER_STARTS[i]} durationInFrames={CHAPTER_DURATIONS[i]}>
        <ChapterScene chapter={chapter} duration={CHAPTER_DURATIONS[i]} index={i} />
      </Sequence>
    ))}

    <Sequence from={OUTRO_START} durationInFrames={OUTRO_DUR}>
      <Outro />
    </Sequence>

    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        background:
          'linear-gradient(to top, rgba(4,7,12,0.8) 0%, rgba(4,7,12,0.38) 15%, transparent 27%)',
      }}
    />

    <Timeline />
    <Grain />

    {MUSIC_ENABLED ? (
      <Audio
        loop
        src={staticFile('music.mp3')}
        volume={(f) =>
          interpolate(f, [0, 50, TOTAL_DURATION - 110, TOTAL_DURATION - 8], [0, 0.42, 0.42, 0], CLAMP)
        }
      />
    ) : null}
  </AbsoluteFill>
);

// loadFonts(); // 已禁用，不再加载谷歌在线字体
const Root = () => (
  <Composition
    id="HumanHistory"
    component={HumanHistory}
    durationInFrames={TOTAL_DURATION}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);

registerRoot(Root);
