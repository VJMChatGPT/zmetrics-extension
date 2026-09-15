import type {ReactNode} from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {LAYOUT, THEME, type DemoOrientation} from '../constants/content';
import {SceneTitle} from './SceneTitle';
import {SceneTransitionLayer} from './SceneTransitionLayer';

type ScreenshotSceneProps = {
  readonly title: string;
  readonly orientation: DemoOrientation;
  readonly backgroundAsset?: string;
  readonly durationInFrames: number;
  readonly children: ReactNode;
};

export const ScreenshotScene = ({
  title,
  orientation,
  backgroundAsset,
  durationInFrames,
  children,
}: ScreenshotSceneProps) => {
  const frame = useCurrentFrame();
  const layout = LAYOUT[orientation];

  const blurOpacity = interpolate(frame, [0, 18, 72], [0.12, 0.28, 0.2], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const blurScale = interpolate(frame, [0, 120], [1.08, 1.02], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.background,
        overflow: 'hidden',
      }}
    >
      <SceneTransitionLayer durationInFrames={durationInFrames}>
        <>
          {backgroundAsset ? (
            <Img
              src={staticFile(backgroundAsset)}
              style={{
                position: 'absolute',
                inset: -120,
                width: layout.width + 240,
                height: layout.height + 240,
                objectFit: 'cover',
                filter: 'blur(44px) saturate(0.8)',
                opacity: blurOpacity,
                transform: `scale(${blurScale})`,
              }}
            />
          ) : null}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at 20% 18%, rgba(83, 230, 255, 0.18) 0%, rgba(83, 230, 255, 0) 28%), radial-gradient(circle at 84% 16%, rgba(45, 115, 255, 0.14) 0%, rgba(45, 115, 255, 0) 34%), linear-gradient(180deg, rgba(5, 7, 19, 0.58) 0%, rgba(5, 7, 19, 0.88) 100%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(90deg, rgba(255, 255, 255, 0.028) 1px, transparent 1px), linear-gradient(180deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
              backgroundSize: '120px 120px',
              opacity: 0.14,
              maskImage:
                'linear-gradient(180deg, rgba(0, 0, 0, 0.72) 0%, rgba(0, 0, 0, 0.18) 60%, rgba(0, 0, 0, 0) 100%)',
            }}
          />
          <SceneTitle title={title} orientation={orientation} />
          {children}
        </>
      </SceneTransitionLayer>
    </AbsoluteFill>
  );
};
