import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Reveal} from '../components/Bits';
import {COLORS, FONT_BODY, FONT_DISPLAY, FONT_LATIN} from '../theme';

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const Outro: React.FC = () => {
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
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 92,
            letterSpacing: 6,
            color: COLORS.text,
          }}
        >
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
