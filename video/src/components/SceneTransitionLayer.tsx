import type {ReactNode} from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

type SceneTransitionLayerProps = {
  readonly children: ReactNode;
  readonly durationInFrames: number;
};

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

export const SceneTransitionLayer = ({
  children,
  durationInFrames,
}: SceneTransitionLayerProps) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const intro = spring({
    fps,
    frame: frame - 2,
    config: {
      damping: 200,
      stiffness: 220,
      mass: 0.92,
    },
  });

  const outro = interpolate(frame, [durationInFrames - 18, durationInFrames - 2], [0, 1], {
    easing: easeOut,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const contentOpacity = 0.9 + intro * 0.1 - outro * 0.06;
  const contentScale = 0.972 + intro * 0.028 + outro * 0.014;
  const contentTranslateY = (1 - intro) * 28 - outro * 12;
  const contentBlur = (1 - intro) * 14 + outro * 1.5;

  const introBeamX = interpolate(frame, [0, 24], [-360, 2400], {
    easing: easeOut,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const outroBeamX = interpolate(frame, [durationInFrames - 18, durationInFrames], [-360, 2400], {
    easing: easeOut,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <>
      <AbsoluteFill
        style={{
          opacity: contentOpacity,
          transform: `translateY(${contentTranslateY}px) scale(${contentScale})`,
          filter: `blur(${contentBlur}px)`,
        }}
      >
        {children}
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          zIndex: 60,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at 50% 46%, rgba(83, 230, 255, ${0.04 + intro * 0.08 - outro * 0.03}) 0%, rgba(83, 230, 255, 0) 42%)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: -360,
            top: -140,
            width: 260,
            height: '150%',
            background:
              'linear-gradient(90deg, rgba(83, 230, 255, 0) 0%, rgba(83, 230, 255, 0.16) 52%, rgba(83, 230, 255, 0) 100%)',
            opacity: intro * 0.62 * (1 - outro),
            transform: `translateX(${introBeamX}px) skewX(-18deg)`,
            mixBlendMode: 'screen',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: -320,
            top: -100,
            width: 220,
            height: '140%',
            background:
              'linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.1) 52%, rgba(255, 255, 255, 0) 100%)',
            opacity: outro * 0.55,
            transform: `translateX(${outroBeamX}px) skewX(-18deg)`,
            mixBlendMode: 'screen',
          }}
        />
      </AbsoluteFill>
    </>
  );
};
