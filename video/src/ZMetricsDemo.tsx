import type {CSSProperties, ReactNode} from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {BrowserFrame} from './components/BrowserFrame';
import {Cursor} from './components/Cursor';
import {FinalCard} from './components/FinalCard';
import {SceneTransitionLayer} from './components/SceneTransitionLayer';
import {SceneTitle} from './components/SceneTitle';
import {ScreenshotScene} from './components/ScreenshotScene';
import {ShortcutBadge} from './components/ShortcutBadge';
import {
  ASSETS,
  COPY,
  CROP_PRESETS,
  LAYOUT,
  SCENE_DURATIONS,
  SCENE_FRAMES,
  SOURCE_DIMENSIONS,
  THEME,
  type DemoOrientation,
} from './constants/content';
import {fonts} from './fonts';

type ZMetricsDemoProps = {
  readonly orientation: DemoOrientation;
};

type CropRect = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

type SourceSize = {
  readonly width: number;
  readonly height: number;
};

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const editorialEase = Easing.bezier(0.45, 0, 0.55, 1);

const interpolateClamp = (
  frame: number,
  input: readonly number[],
  output: readonly number[],
  easing: ((input: number) => number) | undefined = undefined,
) =>
  interpolate(frame, input, output, {
    easing,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

const ProductShot = ({
  asset,
  width,
  height,
  style,
  imageStyle,
}: {
  readonly asset: string;
  readonly width: number;
  readonly height: number;
  readonly style?: CSSProperties;
  readonly imageStyle?: CSSProperties;
}) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 30,
        overflow: 'hidden',
        border: `1px solid ${THEME.border}`,
        boxShadow: THEME.shadow,
        backgroundColor: THEME.surface,
        position: 'relative',
        ...style,
      }}
    >
      <Img
        src={staticFile(asset)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          ...imageStyle,
        }}
      />
    </div>
  );
};

const ProductVideoShot = ({
  asset,
  width,
  height,
  playbackRate = 1,
  trimBefore,
  style,
  videoStyle,
}: {
  readonly asset: string;
  readonly width: number;
  readonly height: number;
  readonly playbackRate?: number;
  readonly trimBefore?: number;
  readonly style?: CSSProperties;
  readonly videoStyle?: CSSProperties;
}) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 30,
        overflow: 'hidden',
        border: `1px solid ${THEME.border}`,
        boxShadow: THEME.shadow,
        backgroundColor: THEME.surface,
        position: 'relative',
        ...style,
      }}
    >
      <OffthreadVideo
        src={staticFile(asset)}
        muted
        playbackRate={playbackRate}
        trimBefore={trimBefore}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          ...videoStyle,
        }}
      />
    </div>
  );
};

const AssetCrop = ({
  asset,
  sourceSize,
  crop,
  width,
  height,
  style,
  imageStyle,
}: {
  readonly asset: string;
  readonly sourceSize: SourceSize;
  readonly crop: CropRect;
  readonly width: number;
  readonly height: number;
  readonly style?: CSSProperties;
  readonly imageStyle?: CSSProperties;
}) => {
  const cropWidth = sourceSize.width * crop.width;
  const cropHeight = sourceSize.height * crop.height;
  const scale = Math.max(width / cropWidth, height / cropHeight);
  const scaledWidth = sourceSize.width * scale;
  const scaledHeight = sourceSize.height * scale;
  const left = -(crop.x * sourceSize.width * scale) + (width - cropWidth * scale) / 2;
  const top = -(crop.y * sourceSize.height * scale) + (height - cropHeight * scale) / 2;

  return (
    <div
      style={{
        width,
        height,
        borderRadius: 30,
        overflow: 'hidden',
        border: `1px solid ${THEME.border}`,
        boxShadow: THEME.shadow,
        backgroundColor: THEME.surface,
        position: 'relative',
        ...style,
      }}
    >
      <Img
        src={staticFile(asset)}
        style={{
          position: 'absolute',
          left,
          top,
          width: scaledWidth,
          height: scaledHeight,
          display: 'block',
          ...imageStyle,
        }}
      />
    </div>
  );
};

const SceneFrame = ({
  orientation,
  title,
  children,
  backgroundAsset,
  backgroundPosition = 'center center',
  overlayStrength = 0.76,
  backgroundScale = 1.02,
}: {
  readonly orientation: DemoOrientation;
  readonly title: string;
  readonly children: ReactNode;
  readonly backgroundAsset?: string;
  readonly backgroundPosition?: string;
  readonly overlayStrength?: number;
  readonly backgroundScale?: number;
}) => {
  const frame = useCurrentFrame();
  const layout = LAYOUT[orientation];
  const backgroundOpacity = interpolateClamp(frame, [0, 18, 78], [0.4, 0.7, 0.56], editorialEase);
  const backgroundZoom = interpolateClamp(frame, [0, 120], [backgroundScale + 0.04, backgroundScale], editorialEase);

  return (
    <AbsoluteFill style={{backgroundColor: THEME.background, overflow: 'hidden'}}>
      {backgroundAsset ? (
        <Img
          src={staticFile(backgroundAsset)}
          style={{
            position: 'absolute',
            inset: -80,
            width: layout.width + 160,
            height: layout.height + 160,
            objectFit: 'cover',
            objectPosition: backgroundPosition,
            opacity: backgroundOpacity,
            filter: 'blur(18px) saturate(0.9)',
            transform: `scale(${backgroundZoom})`,
          }}
        />
      ) : null}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 18% 16%, rgba(83, 230, 255, 0.18) 0%, rgba(83, 230, 255, 0) 24%), radial-gradient(circle at 82% 18%, rgba(54, 120, 255, 0.16) 0%, rgba(54, 120, 255, 0) 30%), linear-gradient(180deg, rgba(5, 7, 19, ${overlayStrength - 0.22}) 0%, rgba(5, 7, 19, ${overlayStrength}) 100%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(90deg, rgba(255, 255, 255, 0.024) 1px, transparent 1px), linear-gradient(180deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
          backgroundSize: '130px 130px',
          opacity: 0.12,
        }}
      />
      <SceneTitle title={title} orientation={orientation} />
      {children}
    </AbsoluteFill>
  );
};

const GlassChip = ({
  label,
  size = 'default',
  style,
}: {
  readonly label: string;
  readonly size?: 'default' | 'large';
  readonly style?: CSSProperties;
}) => {
  const isLarge = size === 'large';

  return (
    <div
      style={{
        padding: isLarge ? '16px 24px' : '12px 18px',
        borderRadius: 999,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        color: THEME.textSoft,
        fontFamily: fonts.body,
        fontSize: isLarge ? 24 : 18,
        letterSpacing: 0.2,
        backdropFilter: 'blur(12px)',
        ...style,
      }}
    >
      {label}
    </div>
  );
};

const ProblemBrowserCard = ({
  width,
  height,
  title,
  accent,
  lines,
  style,
}: {
  readonly width: number;
  readonly height: number;
  readonly title: string;
  readonly accent: string;
  readonly lines: number[];
  readonly style?: CSSProperties;
}) => {
  return (
    <BrowserFrame
      width={width}
      height={height}
      title={title}
      style={{
        opacity: 0.92,
        ...style,
      }}
      contentStyle={{padding: 18}}
    >
      <div
        style={{
          position: 'absolute',
          left: 20,
          right: 20,
          top: 20,
          height: 42,
          borderRadius: 16,
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 34,
          top: 34,
          width: 12,
          height: 12,
          borderRadius: 999,
          backgroundColor: accent,
          boxShadow: `0 0 18px ${accent}`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 56,
          top: 31,
          width: width * 0.34,
          height: 16,
          borderRadius: 999,
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
        }}
      />
      {lines.map((line, index) => (
        <div
          key={`${title}-${line}`}
          style={{
            position: 'absolute',
            left: 20,
            top: 86 + index * 34,
            width: line,
            height: index === 0 ? 48 : 14,
            borderRadius: index === 0 ? 18 : 999,
            backgroundColor: index === 0 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.08)',
            border: index === 0 ? '1px solid rgba(255, 255, 255, 0.06)' : undefined,
          }}
        />
      ))}
    </BrowserFrame>
  );
};

const ProblemScene = ({orientation}: ZMetricsDemoProps) => {
  const frame = useCurrentFrame();
  const isVertical = orientation === 'vertical';
  const driftLeft = interpolateClamp(frame, [0, 120], [0, -28], editorialEase);
  const driftRight = interpolateClamp(frame, [0, 120], [0, 22], editorialEase);
  const driftCenter = interpolateClamp(frame, [0, 120], [0, -14], editorialEase);
  const chipRise = (index: number) =>
    interpolateClamp(frame, [8 + index * 5, 30 + index * 5], [24, 0], easeOut);
  const headlineReveal = spring({
    fps: 30,
    frame,
    config: {damping: 180, stiffness: 200, mass: 0.9},
  });
  const headlineGlow = interpolateClamp(frame, [0, 28, 80], [0.2, 0.88, 0.54], easeOut);

  return (
    <AbsoluteFill style={{backgroundColor: THEME.background, overflow: 'hidden'}}>
      <SceneTransitionLayer durationInFrames={SCENE_DURATIONS.problem}>
        <>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at 18% 18%, rgba(83, 230, 255, 0.14) 0%, rgba(83, 230, 255, 0) 24%), radial-gradient(circle at 82% 14%, rgba(53, 118, 255, 0.12) 0%, rgba(53, 118, 255, 0) 26%), linear-gradient(180deg, #050713 0%, #080b18 100%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(180deg, rgba(255, 255, 255, 0.016) 1px, transparent 1px)',
              backgroundSize: isVertical ? '140px 140px' : '160px 160px',
              opacity: 0.12,
            }}
          />

          <div
            style={{
              position: 'absolute',
              left: isVertical ? 96 : 260,
              right: isVertical ? 96 : 260,
              top: isVertical ? 150 : 128,
              display: 'flex',
              justifyContent: 'center',
              zIndex: 20,
              opacity: headlineReveal,
              transform: `translateY(${42 - headlineReveal * 42}px) scale(${0.94 + headlineReveal * 0.06})`,
            }}
          >
            <div
              style={{
                width: isVertical ? '100%' : 1220,
                maxWidth: '100%',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: isVertical ? 140 : 170,
                  height: 5,
                  margin: '0 auto 28px auto',
                  borderRadius: 999,
                  background: `linear-gradient(90deg, rgba(83, 230, 255, 0) 0%, ${THEME.accent} 50%, rgba(83, 230, 255, 0) 100%)`,
                  boxShadow: `0 0 34px rgba(83, 230, 255, ${headlineGlow})`,
                }}
              />
              <div
                style={{
                  color: THEME.text,
                  fontFamily: fonts.display,
                  fontWeight: 600,
                  fontSize: isVertical ? 96 : 104,
                  lineHeight: isVertical ? 0.96 : 0.94,
                  letterSpacing: isVertical ? -3.2 : -4.2,
                  textWrap: 'balance',
                  textShadow: `0 18px 60px rgba(0, 0, 0, 0.44), 0 0 30px rgba(83, 230, 255, ${headlineGlow * 0.18})`,
                }}
              >
                {COPY.problem}
              </div>
            </div>
          </div>

          <div
            style={{
              position: 'absolute',
              left: isVertical ? 70 : 138,
              top: isVertical ? 500 : 320,
              width: isVertical ? 820 : 620,
              height: isVertical ? 290 : 266,
              transform: `rotate(-6deg) translateY(${driftLeft}px)`,
            }}
          >
            <ProblemBrowserCard
              width={isVertical ? 820 : 620}
              height={isVertical ? 290 : 266}
              title={COPY.tabChaos[0]}
              accent="#8cb6ff"
              lines={isVertical ? [720, 680, 610, 540] : [510, 470, 420, 360]}
            />
          </div>

          <div
            style={{
              position: 'absolute',
              right: isVertical ? 88 : 200,
              top: isVertical ? 860 : 410,
              width: isVertical ? 760 : 500,
              height: isVertical ? 250 : 234,
              transform: `rotate(4deg) translateY(${driftRight}px)`,
            }}
          >
            <ProblemBrowserCard
              width={isVertical ? 760 : 500}
              height={isVertical ? 250 : 234}
              title={COPY.tabChaos[1]}
              accent="#53e6ff"
              lines={isVertical ? [680, 560, 620] : [420, 360, 390]}
            />
          </div>

          <div
            style={{
              position: 'absolute',
              left: isVertical ? 130 : 460,
              bottom: isVertical ? 360 : 146,
              width: isVertical ? 700 : 420,
              height: isVertical ? 224 : 214,
              transform: `rotate(-5deg) translateY(${driftCenter}px)`,
            }}
          >
            <ProblemBrowserCard
              width={isVertical ? 700 : 420}
              height={isVertical ? 224 : 214}
              title={COPY.tabChaos[3]}
              accent="#71f5ac"
              lines={isVertical ? [610, 530, 480] : [330, 280, 250]}
            />
          </div>

          <div
            style={{
              position: 'absolute',
              left: isVertical ? 100 : 184,
              right: isVertical ? 100 : 184,
              bottom: isVertical ? 178 : 86,
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: isVertical ? 'center' : 'flex-start',
              gap: isVertical ? 18 : 16,
            }}
          >
            {COPY.tabChaos.map((label, index) => (
              <GlassChip
                key={label}
                label={label}
                size={isVertical ? 'large' : 'default'}
                style={{
                  opacity: interpolateClamp(frame, [8 + index * 5, 26 + index * 5], [0, 1], easeOut),
                  transform: `translateY(${chipRise(index)}px)`,
                }}
              />
            ))}
          </div>
        </>
      </SceneTransitionLayer>
    </AbsoluteFill>
  );
};

const ActionOptionCard = ({
  title,
  hint,
  activeStrength,
  children,
  style,
}: {
  readonly title: string;
  readonly hint: string;
  readonly activeStrength: number;
  readonly children?: ReactNode;
  readonly style?: CSSProperties;
}) => {
  const borderOpacity = 0.08 + activeStrength * 0.3;
  const glowOpacity = 0.06 + activeStrength * 0.22;

  return (
    <div
      style={{
        borderRadius: 28,
        padding: '24px 28px',
        border: `1px solid rgba(136, 226, 255, ${borderOpacity})`,
        background:
          'linear-gradient(180deg, rgba(15, 21, 40, 0.9) 0%, rgba(9, 13, 26, 0.96) 100%)',
        boxShadow: `0 24px 70px rgba(0, 0, 0, 0.3), 0 0 42px rgba(83, 230, 255, ${glowOpacity})`,
        backdropFilter: 'blur(16px)',
        transform: `translateY(${10 - activeStrength * 10}px) scale(${0.97 + activeStrength * 0.03})`,
        opacity: 0.42 + activeStrength * 0.58,
        ...style,
      }}
    >
      <div
        style={{
          color: THEME.text,
          fontFamily: fonts.display,
          fontSize: 28,
          fontWeight: 600,
          letterSpacing: -0.4,
          marginBottom: 10,
        }}
      >
        {title}
      </div>
      <div
        style={{
          color: THEME.textSoft,
          fontFamily: fonts.body,
          fontSize: 18,
          letterSpacing: 0.2,
          lineHeight: 1.35,
        }}
      >
        {hint}
      </div>
      {children ? <div style={{marginTop: 18}}>{children}</div> : null}
    </div>
  );
};

const InlineShortcut = ({
  label,
  emphasis,
}: {
  readonly label: string;
  readonly emphasis: number;
}) => {
  return (
    <div style={{display: 'flex', gap: 10, flexWrap: 'wrap'}}>
      {label.split(' + ').map((key) => (
        <div
          key={key}
          style={{
            minWidth: 58,
            padding: '12px 16px',
            borderRadius: 14,
            textAlign: 'center',
            color: THEME.text,
            background:
              'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
            border: `1px solid rgba(255, 255, 255, ${0.08 + emphasis * 0.08})`,
            boxShadow: `0 0 22px rgba(83, 230, 255, ${emphasis * 0.12})`,
            fontFamily: fonts.display,
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: 0.4,
          }}
        >
          {key}
        </div>
      ))}
    </div>
  );
};

const KeyboardShortcutHero = ({
  label,
  pressStrengths,
  isVertical,
}: {
  readonly label: string;
  readonly pressStrengths: readonly number[];
  readonly isVertical: boolean;
}) => {
  const keys = label.split(' + ');

  return (
    <div
      style={{
        display: 'flex',
        gap: isVertical ? 18 : 16,
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}
    >
      {keys.map((key, index) => {
        const pressStrength = pressStrengths[index] ?? 0;

        return (
          <div
            key={key}
            style={{
              minWidth: isVertical ? 148 : 132,
              padding: isVertical ? '22px 26px' : '20px 24px',
              borderRadius: 22,
              textAlign: 'center',
              color: THEME.text,
              background:
                'linear-gradient(180deg, rgba(25, 31, 53, 0.98) 0%, rgba(11, 15, 30, 1) 100%)',
              border: `1px solid rgba(136, 226, 255, ${0.12 + pressStrength * 0.22})`,
              boxShadow: `0 26px 56px rgba(0, 0, 0, 0.32), 0 0 34px rgba(83, 230, 255, ${pressStrength * 0.22})`,
              fontFamily: fonts.display,
              fontSize: isVertical ? 30 : 26,
              fontWeight: 600,
              letterSpacing: 0.4,
              transform: `translateY(${pressStrength * 12}px) scale(${1 - pressStrength * 0.02})`,
            }}
          >
            {key}
          </div>
        );
      })}
    </div>
  );
};

const OpenPopupScene = ({
  orientation,
  continuous = false,
}: ZMetricsDemoProps & {readonly continuous?: boolean}) => {
  const frame = useCurrentFrame();
  const layout = LAYOUT[orientation];
  const isVertical = orientation === 'vertical';
  const baseScale = interpolateClamp(frame, [0, 120], [1.02, 1], editorialEase);
  const popupBackdropOpacity = interpolateClamp(frame, [24, 40, 90], [0, 1, 1], easeOut);
  const clickStrength = interpolateClamp(frame, [6, 18, 40, 68], [0.22, 1, 1, 0.44], easeOut);
  const cursorX = interpolateClamp(
    frame,
    [0, 20, 30, 56],
    [layout.width * 0.48, isVertical ? 948 : 1816, isVertical ? 948 : 1816, isVertical ? 948 : 1816],
    easeOut,
  );
  const cursorY = interpolateClamp(
    frame,
    [0, 20, 30, 56],
    [layout.height * 0.82, isVertical ? 132 : 62, isVertical ? 132 : 62, isVertical ? 132 : 62],
    easeOut,
  );
  const clickProgress = interpolateClamp(frame, [20, 30, 42], [0, 1, 0], easeOut);
  const cursorOpacity = interpolateClamp(frame, [0, 56, 68], [1, 1, 0], easeOut);
  const focusOpacity = interpolateClamp(frame, [12, 28, 44], [0, 1, 0.22], easeOut);
  const ringScale = interpolateClamp(frame, [14, 28, 40], [0.7, 1, 1.2], easeOut);
  const settledMotion = interpolateClamp(frame, [34, 54], [0, 1], easeOut);
  const clickCardReveal = spring({
    fps: 30,
    frame: frame - 4,
    config: {damping: 190, stiffness: 230, mass: 0.92},
  });
  const clickCardOpacity = clickCardReveal * interpolateClamp(frame, [0, 70, 84], [1, 1, 0.84], easeOut);
  const popupDriftX = Math.sin(frame / 18) * 4 * settledMotion;
  const popupDriftY = Math.sin((frame - 8) / 14) * 3 * settledMotion;
  const popupBreath = 1 + Math.sin((frame - 6) / 16) * 0.004 * settledMotion;
  const cardIdleY = Math.sin((frame - 12) / 15) * 4 * settledMotion;
  const cardIdleScale = 1 + Math.sin(frame / 20) * 0.006 * settledMotion;
  const focusPulse = 0.86 + Math.sin(frame / 8) * 0.14;
  const titleWidth = isVertical ? '100%' : 760;

  const content = (
    <>
      <Img
        src={staticFile(ASSETS.chromeBase)}
        style={{
          position: 'absolute',
          inset: 0,
          width: layout.width,
          height: layout.height,
          objectFit: 'cover',
          objectPosition: isVertical ? '58% top' : 'center top',
          transform: `scale(${baseScale})`,
        }}
      />
      <Img
        src={staticFile(ASSETS.popupInChrome)}
        style={{
          position: 'absolute',
          inset: 0,
          width: layout.width,
          height: layout.height,
          objectFit: 'cover',
          objectPosition: isVertical ? '58% top' : 'center top',
          transform: `translate(${popupDriftX}px, ${popupDriftY}px) scale(${(1.02 - popupBackdropOpacity * 0.02) * popupBreath})`,
          opacity: popupBackdropOpacity,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isVertical
            ? 'linear-gradient(180deg, rgba(5, 7, 19, 0.86) 0%, rgba(5, 7, 19, 0.56) 32%, rgba(5, 7, 19, 0.28) 64%, rgba(5, 7, 19, 0.34) 100%)'
            : 'linear-gradient(90deg, rgba(5, 7, 19, 0.88) 0%, rgba(5, 7, 19, 0.54) 34%, rgba(5, 7, 19, 0.2) 68%, rgba(5, 7, 19, 0.34) 100%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: isVertical ? 0 : layout.safeX,
          right: isVertical ? 0 : layout.safeX,
          top: isVertical ? 132 : 100,
          display: 'flex',
          justifyContent: 'center',
          zIndex: 20,
        }}
      >
        <div style={{width: titleWidth as CSSProperties['width'], maxWidth: 860}}>
          <SceneTitle title={COPY.openPopup} orientation={orientation} />
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: isVertical ? 90 : 164,
          top: isVertical ? 690 : 452,
          zIndex: 16,
        }}
      >
        <div
          style={{
            opacity: clickCardOpacity,
            transform: `translateY(${22 - clickCardReveal * 22 + cardIdleY}px) scale(${(0.97 + clickCardReveal * 0.03) * cardIdleScale})`,
          }}
        >
          <ActionOptionCard
            title={COPY.openPopupClickTitle}
            hint={COPY.openPopupClickHint}
            activeStrength={clickStrength}
            style={{width: isVertical ? 900 : 372}}
          >
            <GlassChip label={COPY.openPopupClickLabel} />
          </ActionOptionCard>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          right: isVertical ? 74 : 102,
          top: isVertical ? 108 : 36,
          width: isVertical ? 110 : 86,
          height: isVertical ? 110 : 86,
          borderRadius: 999,
          border: '1px solid rgba(83, 230, 255, 0.22)',
          backgroundColor: 'rgba(83, 230, 255, 0.08)',
          opacity: focusOpacity * (0.58 + focusPulse * 0.2),
          transform: `scale(${ringScale * (0.96 + focusPulse * 0.05)})`,
          boxShadow: `0 0 48px rgba(83, 230, 255, ${0.18 + focusPulse * 0.1})`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: cursorOpacity,
        }}
      >
        <Cursor x={cursorX} y={cursorY} scale={isVertical ? 1.16 : 1} clickProgress={clickProgress} />
      </div>
    </>
  );

  return (
    <AbsoluteFill style={{backgroundColor: THEME.background, overflow: 'hidden'}}>
      {continuous ? content : <SceneTransitionLayer durationInFrames={SCENE_DURATIONS.openPopup}>{content}</SceneTransitionLayer>}
    </AbsoluteFill>
  );
};

const AccessScene = ({orientation}: ZMetricsDemoProps) => {
  const frame = useCurrentFrame();
  const isVertical = orientation === 'vertical';
  const handoffStart = SCENE_DURATIONS.openPopup - 12;
  const handoffProgress = interpolateClamp(frame, [handoffStart, handoffStart + 12], [0, 1], easeOut);
  const clickOpacity = 1 - handoffProgress;
  const shortcutOpacity = handoffProgress;
  const bridgeX = interpolateClamp(
    frame,
    [handoffStart, handoffStart + 12],
    [isVertical ? 860 : 1760, isVertical ? 340 : 520],
    easeOut,
  );
  const bridgeY = interpolateClamp(
    frame,
    [handoffStart, handoffStart + 12],
    [isVertical ? 210 : 88, isVertical ? 920 : 520],
    easeOut,
  );

  return (
    <AbsoluteFill style={{backgroundColor: THEME.background}}>
      <Sequence from={0} durationInFrames={SCENE_DURATIONS.openPopup + 12}>
        <AbsoluteFill
          style={{
            opacity: clickOpacity,
            transform: `scale(${1 - handoffProgress * 0.015})`,
            filter: `blur(${handoffProgress * 4}px)`,
          }}
        >
          <OpenPopupScene orientation={orientation} continuous />
        </AbsoluteFill>
      </Sequence>
      <Sequence
        from={handoffStart}
        durationInFrames={SCENE_DURATIONS.customizeCoins + 12}
      >
        <AbsoluteFill
          style={{
            opacity: shortcutOpacity,
            transform: `translateY(${16 - shortcutOpacity * 16}px) scale(${0.988 + shortcutOpacity * 0.012})`,
            filter: `blur(${(1 - shortcutOpacity) * 6}px)`,
          }}
        >
          <FloatingWindowScene orientation={orientation} />
        </AbsoluteFill>
      </Sequence>
      <div
        style={{
          position: 'absolute',
          left: bridgeX - (isVertical ? 180 : 220),
          top: bridgeY - (isVertical ? 180 : 220),
          width: isVertical ? 360 : 440,
          height: isVertical ? 360 : 440,
          borderRadius: 999,
          background:
            'radial-gradient(circle at 50% 50%, rgba(83, 230, 255, 0.16) 0%, rgba(83, 230, 255, 0.07) 34%, rgba(83, 230, 255, 0) 72%)',
          filter: 'blur(18px)',
          opacity: handoffProgress * (1 - handoffProgress) * 5.2,
          pointerEvents: 'none',
          zIndex: 40,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -240,
          top: bridgeY - 2,
          width: isVertical ? 920 : 1320,
          height: 4,
          background:
            'linear-gradient(90deg, rgba(83, 230, 255, 0) 0%, rgba(83, 230, 255, 0.62) 48%, rgba(255, 255, 255, 0.4) 54%, rgba(83, 230, 255, 0) 100%)',
          opacity: handoffProgress * (1 - handoffProgress) * 4.6,
          transform: `translateX(${bridgeX - (isVertical ? 220 : 280)}px) rotate(${isVertical ? '-26deg' : '-10deg'})`,
          transformOrigin: 'left center',
          filter: 'blur(1px)',
          pointerEvents: 'none',
          zIndex: 41,
        }}
      />
    </AbsoluteFill>
  );
};

const CustomizeScene = ({orientation}: ZMetricsDemoProps) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const isVertical = orientation === 'vertical';
  const panelReveal = spring({
    fps: 30,
    frame,
    config: {damping: 180, stiffness: 200, mass: 1},
  });
  const videoWidth = isVertical ? 760 : 620;
  const videoHeight = Math.round(
    (videoWidth / SOURCE_DIMENSIONS.searchingVideo.width) * SOURCE_DIMENSIONS.searchingVideo.height,
  );
  const videoTrimBefore = Math.round(10.5 * fps);
  const trimmedVideoDurationInFrames = Math.round(21 * fps) - videoTrimBefore;
  const videoPlaybackRate = trimmedVideoDurationInFrames / SCENE_DURATIONS.customizeCoins;
  const videoDrift = interpolateClamp(frame, [0, 150], [10, -8], editorialEase);

  return (
    <ScreenshotScene
      title={COPY.customizeCoins}
      orientation={orientation}
      backgroundAsset={ASSETS.popupAfterAdd}
      durationInFrames={SCENE_DURATIONS.customizeCoins}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: isVertical ? 450 : 248,
          display: 'flex',
          justifyContent: 'center',
          opacity: panelReveal,
          transform: `translateY(${30 - panelReveal * 30 + videoDrift}px) scale(${0.965 + panelReveal * 0.035})`,
        }}
      >
        <ProductVideoShot
          asset={ASSETS.searchingVideo}
          width={videoWidth}
          height={videoHeight}
          playbackRate={videoPlaybackRate}
          trimBefore={videoTrimBefore}
          videoStyle={{objectPosition: 'center top'}}
        />
      </div>
    </ScreenshotScene>
  );
};

const FloatingWindowScene = ({orientation}: ZMetricsDemoProps) => {
  const frame = useCurrentFrame();
  const layout = LAYOUT[orientation];
  const isVertical = orientation === 'vertical';
  const popupCarryover = interpolateClamp(frame, [0, 8, 16], [1, 1, 0], easeOut);
  const baseScale = interpolateClamp(frame, [0, 120], [1.02, 1], editorialEase);
  const keyboardReveal = spring({
    fps: 30,
    frame: frame - 8,
    config: {damping: 190, stiffness: 210, mass: 0.96},
  });
  const keyPressStrengths = [0, 1, 2].map((index) =>
    interpolateClamp(frame, [20 + index * 6, 26 + index * 6, 40 + index * 6], [0, 1, 0.72], easeOut),
  );
  const reveal = spring({
    fps: 30,
    frame: frame - 42,
    config: {damping: 170, stiffness: 210, mass: 0.96},
  });
  const titleReveal = interpolateClamp(frame, [6, 16], [0, 1], easeOut);
  const activeMotion = interpolateClamp(frame, [30, 52], [0, 1], easeOut);
  const keyboardDriftY = Math.sin(frame / 16) * 5 * activeMotion;
  const keyboardDriftX = Math.sin((frame - 10) / 22) * 3 * activeMotion;
  const keyboardScale = 1 + Math.sin(frame / 20) * 0.005 * activeMotion;
  const windowFloatY = Math.sin((frame - 18) / 12) * 7 * reveal;
  const windowFloatX = Math.sin((frame - 6) / 17) * 3 * reveal;
  const windowBreath = 1 + Math.sin((frame - 12) / 18) * 0.006 * reveal;
  const haloPulse = 0.88 + Math.sin(frame / 11) * 0.12;
  const windowWidth = isVertical ? 470 : 430;
  const windowHeight = Math.round(
    (windowWidth / SOURCE_DIMENSIONS.zmetricsWindow.width) * SOURCE_DIMENSIONS.zmetricsWindow.height,
  );

  return (
    <AbsoluteFill style={{backgroundColor: THEME.background, overflow: 'hidden'}}>
      <Img
        src={staticFile(ASSETS.chromeBase)}
        style={{
          position: 'absolute',
          inset: 0,
          width: layout.width,
          height: layout.height,
          objectFit: 'cover',
          objectPosition: isVertical ? '58% top' : 'center top',
          transform: `scale(${baseScale})`,
        }}
      />
      <Img
        src={staticFile(ASSETS.popupInChrome)}
        style={{
          position: 'absolute',
          inset: 0,
          width: layout.width,
          height: layout.height,
          objectFit: 'cover',
          objectPosition: isVertical ? '58% top' : 'center top',
          transform: `scale(${baseScale})`,
          opacity: popupCarryover,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isVertical
            ? 'linear-gradient(180deg, rgba(5, 7, 19, 0.88) 0%, rgba(5, 7, 19, 0.56) 30%, rgba(5, 7, 19, 0.28) 64%, rgba(5, 7, 19, 0.4) 100%)'
            : 'linear-gradient(90deg, rgba(5, 7, 19, 0.9) 0%, rgba(5, 7, 19, 0.56) 34%, rgba(5, 7, 19, 0.22) 72%, rgba(5, 7, 19, 0.38) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: isVertical ? 72 : 96,
          top: isVertical ? 104 : 34,
          width: isVertical ? 118 : 92,
          height: isVertical ? 118 : 92,
          borderRadius: 999,
          background:
            'radial-gradient(circle at 50% 50%, rgba(83, 230, 255, 0.18) 0%, rgba(83, 230, 255, 0.06) 54%, rgba(83, 230, 255, 0) 100%)',
          opacity: popupCarryover * 0.8,
          filter: 'blur(8px)',
          transform: `scale(${0.92 + popupCarryover * 0.08})`,
          zIndex: 9,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: isVertical ? 0 : layout.safeX,
          right: isVertical ? 0 : layout.safeX,
          top: isVertical ? 132 : 100,
          display: 'flex',
          justifyContent: 'center',
          zIndex: 10,
          opacity: titleReveal,
          transform: `translateY(${18 - titleReveal * 18}px)`,
        }}
      >
        <div style={{width: isVertical ? '100%' : 780, maxWidth: 860}}>
          <SceneTitle title={COPY.floatingWindow} orientation={orientation} />
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: isVertical ? 90 : 156,
          right: isVertical ? 90 : undefined,
          top: isVertical ? 688 : 430,
          width: isVertical ? undefined : 520,
          display: 'flex',
          flexDirection: 'column',
          alignItems: isVertical ? 'center' : 'flex-start',
          opacity: keyboardReveal,
          transform: `translate(${keyboardDriftX}px, ${26 - keyboardReveal * 26 + keyboardDriftY}px) scale(${keyboardScale})`,
          zIndex: 11,
        }}
      >
        <KeyboardShortcutHero
          label={COPY.shortcutLabel}
          pressStrengths={keyPressStrengths}
          isVertical={isVertical}
        />
        <div
          style={{
            marginTop: 22,
            color: THEME.textSoft,
            fontFamily: fonts.body,
            fontSize: isVertical ? 24 : 20,
            letterSpacing: 0.2,
            textAlign: isVertical ? 'center' : 'left',
          }}
        >
          {COPY.shortcutHint}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: isVertical ? 150 : 948,
          top: isVertical ? 860 : 292,
          width: isVertical ? 780 : 620,
          height: isVertical ? 780 : 620,
          borderRadius: 999,
          background:
            'radial-gradient(circle at 50% 38%, rgba(83, 230, 255, 0.24) 0%, rgba(83, 230, 255, 0.1) 30%, rgba(83, 230, 255, 0) 70%)',
          filter: 'blur(32px)',
          opacity: reveal * haloPulse * 0.96,
          zIndex: 8,
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: isVertical ? '50%' : 1034,
          marginLeft: isVertical ? -(windowWidth / 2) : undefined,
          top: isVertical ? 942 : 350,
          width: windowWidth,
          height: windowHeight,
          opacity: reveal,
          transform: `translateY(${44 - reveal * 44 + windowFloatY}px) translateX(${(isVertical ? 0 : 30 - reveal * 30) + windowFloatX}px) scale(${(0.86 + reveal * 0.14) * windowBreath})`,
          zIndex: 10,
        }}
      >
        <ProductShot
          asset={ASSETS.zmetricsWindow}
          width={windowWidth}
          height={windowHeight}
          style={{
            borderRadius: 32,
            backgroundColor: 'transparent',
            border: 'none',
            boxShadow: '0 34px 120px rgba(0, 0, 0, 0.42)',
          }}
          imageStyle={{objectFit: 'contain'}}
        />
      </div>
    </AbsoluteFill>
  );
};

const WorkflowScene = ({orientation}: ZMetricsDemoProps) => {
  const frame = useCurrentFrame();
  const layout = LAYOUT[orientation];
  const isVertical = orientation === 'vertical';
  const panX = interpolateClamp(frame, [0, 120], [0, -18], editorialEase);
  const panScale = interpolateClamp(frame, [0, 120], [1.02, 1.04], editorialEase);
  const focusOpacity = interpolateClamp(frame, [0, 24, 88], [0, 0.78, 0.7], easeOut);

  return (
    <AbsoluteFill style={{backgroundColor: THEME.background, overflow: 'hidden'}}>
      <SceneTransitionLayer durationInFrames={SCENE_DURATIONS.realWorkflow}>
        <>
          <Img
            src={staticFile(ASSETS.floatingWindowOnX)}
            style={{
              position: 'absolute',
              inset: 0,
              width: layout.width,
              height: layout.height,
              objectFit: 'cover',
              objectPosition: isVertical ? '56% top' : 'center top',
              transform: `translateX(${panX}px) scale(${panScale})`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: isVertical
                ? 'linear-gradient(180deg, rgba(5, 7, 19, 0.78) 0%, rgba(5, 7, 19, 0.38) 32%, rgba(5, 7, 19, 0.24) 62%, rgba(5, 7, 19, 0.32) 100%)'
                : 'linear-gradient(180deg, rgba(5, 7, 19, 0.52) 0%, rgba(5, 7, 19, 0.18) 28%, rgba(5, 7, 19, 0.3) 100%)',
            }}
          />
          <SceneTitle title={COPY.realWorkflow} orientation={orientation} />

          <div
            style={{
              position: 'absolute',
              left: isVertical ? 180 : undefined,
              right: isVertical ? undefined : 126,
              top: isVertical ? 832 : 126,
              width: isVertical ? 720 : 450,
              height: isVertical ? 720 : 440,
              borderRadius: 999,
              background:
                'radial-gradient(circle at 50% 42%, rgba(83, 230, 255, 0.28) 0%, rgba(83, 230, 255, 0.08) 36%, rgba(83, 230, 255, 0) 72%)',
              filter: 'blur(28px)',
              opacity: focusOpacity,
            }}
          />
        </>
      </SceneTransitionLayer>
    </AbsoluteFill>
  );
};

const FinalScene = ({orientation}: ZMetricsDemoProps) => {
  const isVertical = orientation === 'vertical';
  const frame = useCurrentFrame();
  const fade = interpolateClamp(frame, [0, 20, 70], [0.1, 0.38, 0.28], editorialEase);
  const leftCardDrift = interpolateClamp(frame, [0, 90], [26, -8], editorialEase);
  const rightCardDrift = interpolateClamp(frame, [0, 90], [-22, 10], editorialEase);
  const heroGlow = interpolateClamp(frame, [0, 24, 72], [0.22, 0.9, 0.72], easeOut);
  const cardClusterReveal = spring({
    fps: 30,
    frame: frame - 4,
    config: {damping: 190, stiffness: 210, mass: 0.96},
  });

  return (
    <AbsoluteFill style={{backgroundColor: THEME.background, overflow: 'hidden'}}>
      <SceneTransitionLayer durationInFrames={SCENE_DURATIONS.finalCta}>
        <>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at 50% 16%, rgba(83, 230, 255, 0.22) 0%, rgba(83, 230, 255, 0) 30%), radial-gradient(circle at 80% 24%, rgba(54, 120, 255, 0.18) 0%, rgba(54, 120, 255, 0) 32%), radial-gradient(circle at 22% 78%, rgba(83, 230, 255, 0.12) 0%, rgba(83, 230, 255, 0) 26%), linear-gradient(180deg, rgba(5, 7, 19, 0.92) 0%, rgba(5, 7, 19, 1) 100%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(90deg, rgba(255, 255, 255, 0.024) 1px, transparent 1px), linear-gradient(180deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
              backgroundSize: '140px 140px',
              opacity: 0.08,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: isVertical ? 470 : 260,
              width: isVertical ? 900 : 1100,
              height: isVertical ? 900 : 1100,
              marginLeft: isVertical ? -450 : -550,
              borderRadius: 999,
              background:
                'radial-gradient(circle at 50% 50%, rgba(83, 230, 255, 0.18) 0%, rgba(83, 230, 255, 0.08) 28%, rgba(83, 230, 255, 0) 68%)',
              filter: 'blur(40px)',
              opacity: heroGlow,
            }}
          />
          <ProductShot
            asset={ASSETS.popupClean}
            width={isVertical ? 320 : 270}
            height={isVertical ? 384 : 324}
            style={{
              position: 'absolute',
              left: isVertical ? -24 : 72,
              bottom: isVertical ? 160 : 48,
              opacity: fade * cardClusterReveal,
              transform: `translateY(${leftCardDrift}px) rotate(-14deg) scale(${0.94 + cardClusterReveal * 0.06})`,
            }}
          />
          <AssetCrop
            asset={ASSETS.floatingWindowOnX}
            sourceSize={SOURCE_DIMENSIONS.floatingWindowOnX}
            crop={CROP_PRESETS.floatingWorkflow}
            width={isVertical ? 360 : 300}
            height={isVertical ? 360 : 300}
            style={{
              position: 'absolute',
              right: isVertical ? -20 : 74,
              top: isVertical ? 250 : 120,
              opacity: fade * cardClusterReveal,
              transform: `translateY(${rightCardDrift}px) rotate(10deg) scale(${0.94 + cardClusterReveal * 0.06})`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: -200,
              top: isVertical ? 980 : 520,
              width: isVertical ? 520 : 680,
              height: 2,
              background:
                'linear-gradient(90deg, rgba(83, 230, 255, 0) 0%, rgba(83, 230, 255, 0.72) 52%, rgba(83, 230, 255, 0) 100%)',
              opacity: heroGlow * 0.72,
              transform: `translateX(${frame * 18}px)`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FinalCard
              title={COPY.finalTitle}
              subtitle={COPY.finalSubtitle}
              cta={COPY.finalQuestion}
              wordmarkAsset={ASSETS.brandWordmark}
              iconAsset={ASSETS.brandIcon}
              orientation={orientation}
            />
          </div>
        </>
      </SceneTransitionLayer>
    </AbsoluteFill>
  );
};

export const ZMetricsDemo = ({orientation}: ZMetricsDemoProps) => {
  return (
    <AbsoluteFill style={{backgroundColor: THEME.background}}>
      <Sequence from={SCENE_FRAMES.problem} durationInFrames={SCENE_DURATIONS.problem} premountFor={15}>
        <ProblemScene orientation={orientation} />
      </Sequence>
      <Sequence
        from={SCENE_FRAMES.openPopup}
        durationInFrames={SCENE_DURATIONS.openPopup + SCENE_DURATIONS.customizeCoins}
        premountFor={15}
      >
        <AccessScene orientation={orientation} />
      </Sequence>
      <Sequence
        from={SCENE_FRAMES.floatingWindow}
        durationInFrames={SCENE_DURATIONS.floatingWindow}
        premountFor={15}
      >
        <CustomizeScene orientation={orientation} />
      </Sequence>
      <Sequence
        from={SCENE_FRAMES.realWorkflow}
        durationInFrames={SCENE_DURATIONS.realWorkflow}
        premountFor={15}
      >
        <WorkflowScene orientation={orientation} />
      </Sequence>
      <Sequence from={SCENE_FRAMES.finalCta} durationInFrames={SCENE_DURATIONS.finalCta} premountFor={15}>
        <FinalScene orientation={orientation} />
      </Sequence>
    </AbsoluteFill>
  );
};
