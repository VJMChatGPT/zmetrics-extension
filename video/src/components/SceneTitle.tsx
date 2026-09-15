import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {LAYOUT, THEME, type DemoOrientation} from '../constants/content';
import {fonts} from '../fonts';

type SceneTitleProps = {
  readonly title: string;
  readonly orientation: DemoOrientation;
};

export const SceneTitle = ({title, orientation}: SceneTitleProps) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const layout = LAYOUT[orientation];
  const enter = spring({
    fps,
    frame,
    config: {
      damping: 200,
      stiffness: 220,
      mass: 0.9,
    },
  });
  const glowOpacity = interpolate(frame, [0, 20, 70], [0, 0.85, 0.5], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const lineReveal = interpolate(frame, [0, 16, 34], [0.28, 1, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const lineSweep = interpolate(frame, [0, 26], [-90, 180], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const isVertical = orientation === 'vertical';

  return (
    <div
      style={{
        position: 'absolute',
        top: layout.safeY,
        left: isVertical ? layout.safeX : layout.safeX,
        right: layout.safeX,
        display: 'flex',
        justifyContent: isVertical ? 'center' : 'flex-start',
        zIndex: 20,
        opacity: enter,
        transform: `translateY(${36 - enter * 36}px)`,
      }}
    >
      <div
        style={{
          width: isVertical ? '100%' : layout.titleWidth,
          maxWidth: layout.titleWidth,
          textAlign: isVertical ? 'center' : 'left',
        }}
      >
        <div
          style={{
            width: 96,
            height: 4,
            margin: isVertical ? '0 auto 24px auto' : '0 0 24px 0',
            borderRadius: 999,
            background: `linear-gradient(90deg, ${THEME.accent} 0%, rgba(83, 230, 255, 0) 100%)`,
            boxShadow: `0 0 28px rgba(83, 230, 255, ${glowOpacity})`,
            transform: `scaleX(${lineReveal})`,
            transformOrigin: isVertical ? 'center center' : 'left center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -2,
              left: -48,
              width: 42,
              height: 8,
              borderRadius: 999,
              background: 'rgba(255, 255, 255, 0.72)',
              opacity: enter * 0.7,
              transform: `translateX(${lineSweep}px)`,
              filter: 'blur(2px)',
            }}
          />
        </div>
        <div
          style={{
            color: THEME.text,
            fontFamily: fonts.display,
            fontWeight: 600,
            fontSize: isVertical ? 68 : 62,
            lineHeight: isVertical ? 1.06 : 1.08,
            letterSpacing: -1.6,
            textWrap: 'balance',
            textShadow: `0 12px 40px rgba(0, 0, 0, 0.28), 0 0 24px rgba(83, 230, 255, ${glowOpacity * 0.12})`,
            transform: `translateY(${18 - enter * 18}px)`,
          }}
        >
          {title}
        </div>
      </div>
    </div>
  );
};
