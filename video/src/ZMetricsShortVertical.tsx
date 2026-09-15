import type {CSSProperties} from 'react';
import {
  AbsoluteFill,
  Audio,
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
import {ASSETS, LAYOUT, SOURCE_DIMENSIONS, THEME} from './constants/content';
import {fonts} from './fonts';

export const SHORT_VERTICAL_DURATION = 336;

const SHORT_COPY = {
  hook: 'Still opening tabs just to check crypto?',
  hookSub: 'That breaks your flow.',
  click: 'Click the extension icon.',
  clickSub: 'Prices appear instantly.',
  customize: 'Track only the coins you care about.',
  customizeSub: 'Search. Add. Done.',
  shortcut: 'Or press one shortcut.',
  shortcutSub: 'Open ZMetrics without leaving the page.',
  finalTitle: 'ZMetrics',
  finalSubtitle: 'Quick crypto prices, without breaking your flow.',
  finalCta: 'Join ZMetrics at zmetrics.net',
  chips: ['Google', 'CoinMarketCap', 'Exchange', 'X'],
  shortcutKeys: ['Ctrl', 'Shift', 'Z'],
} as const;

const SHORT_SCENES = {
  hook: {from: 0, duration: 72},
  click: {from: 60, duration: 72},
  customize: {from: 120, duration: 72},
  shortcut: {from: 180, duration: 78},
  final: {from: 270, duration: 66},
} as const;

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const calmEase = Easing.bezier(0.22, 0.61, 0.36, 1);

const clampInterpolate = (
  frame: number,
  input: readonly number[],
  output: readonly number[],
  easing: ((value: number) => number) | undefined = undefined,
) =>
  interpolate(frame, input, output, {
    easing,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

const getSceneStyle = (frame: number, duration: number): CSSProperties => {
  const enter = spring({
    fps: 30,
    frame,
    config: {damping: 190, stiffness: 210, mass: 0.95},
  });
  const exitOpacity = clampInterpolate(frame, [duration - 12, duration], [1, 0], easeOut);
  const exitLift = clampInterpolate(frame, [duration - 14, duration], [0, -24], calmEase);
  const exitScale = clampInterpolate(frame, [duration - 14, duration], [1, 1.02], calmEase);
  const exitBlur = clampInterpolate(frame, [duration - 12, duration], [0, 12], calmEase);

  return {
    opacity: enter * exitOpacity,
    transform: `translateY(${28 - enter * 28 + exitLift}px) scale(${(0.965 + enter * 0.035) * exitScale})`,
    filter: `blur(${exitBlur}px)`,
  };
};

const ScreenFrame = ({
  width,
  height,
  asset,
  style,
  imageStyle,
}: {
  readonly width: number;
  readonly height: number;
  readonly asset: string;
  readonly style?: CSSProperties;
  readonly imageStyle?: CSSProperties;
}) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 34,
        overflow: 'hidden',
        border: `1px solid ${THEME.border}`,
        background:
          'linear-gradient(180deg, rgba(15, 21, 40, 0.96) 0%, rgba(9, 13, 26, 0.98) 100%)',
        boxShadow: '0 38px 120px rgba(0, 0, 0, 0.46)',
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

const VideoFrame = ({
  asset,
  width,
  height,
  trimBefore,
  playbackRate,
  style,
}: {
  readonly asset: string;
  readonly width: number;
  readonly height: number;
  readonly trimBefore: number;
  readonly playbackRate: number;
  readonly style?: CSSProperties;
}) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 36,
        overflow: 'hidden',
        border: `1px solid ${THEME.border}`,
        background:
          'linear-gradient(180deg, rgba(15, 21, 40, 0.96) 0%, rgba(9, 13, 26, 0.98) 100%)',
        boxShadow: '0 38px 120px rgba(0, 0, 0, 0.46)',
        position: 'relative',
        ...style,
      }}
    >
      <OffthreadVideo
        src={staticFile(asset)}
        muted
        trimBefore={trimBefore}
        playbackRate={playbackRate}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center top',
          display: 'block',
        }}
      />
    </div>
  );
};

const AccentBar = ({center = true}: {readonly center?: boolean}) => {
  return (
    <div
      style={{
        width: 144,
        height: 5,
        margin: center ? '0 auto 28px auto' : '0 0 28px 0',
        borderRadius: 999,
        background: `linear-gradient(90deg, rgba(83, 230, 255, 0) 0%, ${THEME.accent} 52%, rgba(83, 230, 255, 0) 100%)`,
        boxShadow: '0 0 30px rgba(83, 230, 255, 0.46)',
      }}
    />
  );
};

const HeroCopy = ({
  title,
  subtitle,
  frame,
  align = 'center',
}: {
  readonly title: string;
  readonly subtitle?: string;
  readonly frame: number;
  readonly align?: 'center' | 'left';
}) => {
  const enter = spring({
    fps: 30,
    frame,
    config: {damping: 200, stiffness: 220, mass: 0.9},
  });
  const textGlow = clampInterpolate(frame, [0, 20, 56], [0.16, 0.4, 0.24], easeOut);

  return (
    <div
      style={{
        width: 920,
        maxWidth: '100%',
        opacity: enter,
        transform: `translateY(${32 - enter * 32}px)`,
        textAlign: align,
      }}
    >
      <AccentBar center={align === 'center'} />
      <div
        style={{
          color: THEME.text,
          fontFamily: fonts.display,
          fontWeight: 600,
          fontSize: 98,
          lineHeight: 0.96,
          letterSpacing: -3.4,
          textWrap: 'balance',
          textShadow: `0 18px 54px rgba(0, 0, 0, 0.42), 0 0 26px rgba(83, 230, 255, ${textGlow})`,
        }}
      >
        {title}
      </div>
      {subtitle ? (
        <div
          style={{
            marginTop: 22,
            color: THEME.textSoft,
            fontFamily: fonts.body,
            fontSize: 30,
            lineHeight: 1.35,
            letterSpacing: 0.2,
          }}
        >
          {subtitle}
        </div>
      ) : null}
    </div>
  );
};

const GlassChip = ({
  label,
  frame,
  index,
}: {
  readonly label: string;
  readonly frame: number;
  readonly index: number;
}) => {
  const chipIn = spring({
    fps: 30,
    frame: frame - index * 3,
    config: {damping: 180, stiffness: 210, mass: 0.9},
  });
  const drift = Math.sin((frame + index * 7) / 18) * 6;

  return (
    <div
      style={{
        padding: '16px 22px',
        borderRadius: 999,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(14px)',
        color: THEME.textSoft,
        fontFamily: fonts.body,
        fontSize: 22,
        letterSpacing: 0.2,
        opacity: chipIn,
        transform: `translateY(${20 - chipIn * 20 + drift}px)`,
      }}
    >
      {label}
    </div>
  );
};

const ProblemCard = ({
  title,
  accent,
  width,
  height,
  frame,
  driftSeed,
  style,
}: {
  readonly title: string;
  readonly accent: string;
  readonly width: number;
  readonly height: number;
  readonly frame: number;
  readonly driftSeed: number;
  readonly style?: CSSProperties;
}) => {
  const floatY = Math.sin((frame + driftSeed) / 18) * 10;
  const floatX = Math.sin((frame + driftSeed * 2) / 24) * 7;

  return (
    <BrowserFrame
      width={width}
      height={height}
      title={title}
      style={{
        opacity: 0.92,
        transform: `translate(${floatX}px, ${floatY}px)`,
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
          height: 40,
          borderRadius: 16,
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 34,
          top: 33,
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
          left: 22,
          right: 22,
          top: 84,
          height: 50,
          borderRadius: 18,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      />
      {[0.78, 0.68, 0.84].map((ratio, index) => (
        <div
          key={`${title}-${ratio}`}
          style={{
            position: 'absolute',
            left: 22,
            top: 152 + index * 28,
            width: (width - 44) * ratio,
            height: 14,
            borderRadius: 999,
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          }}
        />
      ))}
    </BrowserFrame>
  );
};

const ShortcutKeys = ({frame}: {readonly frame: number}) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: 18,
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}
    >
      {SHORT_COPY.shortcutKeys.map((label, index) => {
        const press = clampInterpolate(
          frame,
          [18 + index * 6, 26 + index * 6, 38 + index * 6],
          [0, 1, 0.76],
          easeOut,
        );
        const hover = Math.sin((frame + index * 11) / 14) * 5;

        return (
          <div
            key={label}
            style={{
              minWidth: 154,
              padding: '22px 26px',
              borderRadius: 24,
              textAlign: 'center',
              color: THEME.text,
              background:
                'linear-gradient(180deg, rgba(20, 28, 51, 0.98) 0%, rgba(9, 14, 28, 1) 100%)',
              border: `1px solid rgba(136, 226, 255, ${0.12 + press * 0.28})`,
              boxShadow: `0 28px 60px rgba(0, 0, 0, 0.34), 0 0 38px rgba(83, 230, 255, ${press * 0.22})`,
              fontFamily: fonts.display,
              fontSize: 30,
              fontWeight: 600,
              letterSpacing: 0.3,
              transform: `translateY(${hover + press * 12}px) scale(${1 - press * 0.06})`,
            }}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
};

const HookScene = () => {
  const frame = useCurrentFrame();
  const sceneStyle = getSceneStyle(frame, SHORT_SCENES.hook.duration);
  const logoPulse = 0.9 + Math.sin(frame / 12) * 0.08;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.background,
        overflow: 'hidden',
        ...sceneStyle,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 18% 18%, rgba(83, 230, 255, 0.16) 0%, rgba(83, 230, 255, 0) 24%), radial-gradient(circle at 84% 14%, rgba(54, 120, 255, 0.12) 0%, rgba(54, 120, 255, 0) 28%), linear-gradient(180deg, #050713 0%, #080b18 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(180deg, rgba(255, 255, 255, 0.016) 1px, transparent 1px)',
          backgroundSize: '144px 144px',
          opacity: 0.12,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 88,
          width: 78,
          height: 78,
          marginLeft: -39,
          borderRadius: 24,
          background:
            'linear-gradient(180deg, rgba(17, 24, 44, 0.96) 0%, rgba(9, 13, 26, 0.98) 100%)',
          border: `1px solid ${THEME.border}`,
          boxShadow: `0 0 40px rgba(83, 230, 255, 0.12), 0 26px 60px rgba(0, 0, 0, 0.32)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${logoPulse})`,
        }}
      >
        <Img
          src={staticFile(ASSETS.brandIcon)}
          style={{width: 42, height: 42, objectFit: 'contain', display: 'block'}}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 82,
          top: 468,
          width: 840,
          height: 304,
          transform: 'rotate(-7deg)',
        }}
      >
        <ProblemCard
          title={SHORT_COPY.chips[0]}
          accent="#8cb6ff"
          width={840}
          height={304}
          frame={frame}
          driftSeed={8}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          right: 78,
          top: 980,
          width: 742,
          height: 286,
          transform: 'rotate(6deg)',
        }}
      >
        <ProblemCard
          title={SHORT_COPY.chips[1]}
          accent="#53e6ff"
          width={742}
          height={286}
          frame={frame}
          driftSeed={18}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 166,
          bottom: 384,
          width: 678,
          height: 250,
          transform: 'rotate(-6deg)',
        }}
      >
        <ProblemCard
          title={SHORT_COPY.chips[3]}
          accent="#71f5ac"
          width={678}
          height={250}
          frame={frame}
          driftSeed={28}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 92,
          right: 92,
          top: 248,
          display: 'flex',
          justifyContent: 'center',
          zIndex: 10,
        }}
      >
        <HeroCopy title={SHORT_COPY.hook} subtitle={SHORT_COPY.hookSub} frame={frame} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 92,
          right: 92,
          bottom: 136,
          display: 'flex',
          justifyContent: 'center',
          gap: 18,
          flexWrap: 'wrap',
        }}
      >
        {SHORT_COPY.chips.map((label, index) => (
          <GlassChip key={label} label={label} frame={frame} index={index} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const ClickScene = () => {
  const frame = useCurrentFrame();
  const sceneStyle = getSceneStyle(frame, SHORT_SCENES.click.duration);
  const chromeReveal = clampInterpolate(frame, [0, 16], [0.92, 1], calmEase);
  const popupReveal = clampInterpolate(frame, [25, 40], [0, 1], easeOut);
  const cursorX = clampInterpolate(frame, [0, 16, 24, 34], [496, 880, 918, 918], easeOut);
  const cursorY = clampInterpolate(frame, [0, 16, 24, 34], [1038, 170, 128, 128], easeOut);
  const clickProgress = clampInterpolate(frame, [18, 24, 32], [0, 1, 0], easeOut);
  const haloScale = clampInterpolate(frame, [16, 28, 44], [0.86, 1.18, 1.02], easeOut);
  const haloOpacity = clampInterpolate(frame, [12, 24, 46], [0.14, 0.82, 0.24], easeOut);
  const popupDrift = Math.sin((frame - 20) / 13) * 7 * popupReveal;
  const idleScale = 1 + Math.sin(frame / 26) * 0.004;
  const iconFocusX = clampInterpolate(frame, [10, 24, 40], [930, 930, 930], easeOut);
  const iconFocusY = clampInterpolate(frame, [10, 24, 40], [118, 118, 118], easeOut);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.background,
        overflow: 'hidden',
        ...sceneStyle,
      }}
      >
      <Img
        src={staticFile(ASSETS.chromeBaseVertical)}
        style={{
          position: 'absolute',
          inset: 0,
          width: LAYOUT.vertical.width,
          height: LAYOUT.vertical.height,
          objectFit: 'cover',
          objectPosition: 'center top',
          transform: `scale(${chromeReveal * idleScale})`,
        }}
      />
      <Img
        src={staticFile(ASSETS.popupInChromeVertical)}
        style={{
          position: 'absolute',
          inset: 0,
          width: LAYOUT.vertical.width,
          height: LAYOUT.vertical.height,
          objectFit: 'cover',
          objectPosition: 'center top',
          opacity: popupReveal,
          transform: `scale(${0.992 + popupReveal * 0.012}) translateY(${popupDrift}px)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(5, 7, 19, 0.88) 0%, rgba(5, 7, 19, 0.5) 34%, rgba(5, 7, 19, 0.28) 68%, rgba(5, 7, 19, 0.42) 100%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 92,
          right: 92,
          top: 204,
          zIndex: 10,
        }}
      >
        <HeroCopy title={SHORT_COPY.click} subtitle={SHORT_COPY.clickSub} frame={frame} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: iconFocusX - 68,
          top: iconFocusY - 68,
          width: 136,
          height: 136,
          borderRadius: 999,
          background:
            'radial-gradient(circle at 50% 50%, rgba(83, 230, 255, 0.2) 0%, rgba(83, 230, 255, 0.08) 42%, rgba(83, 230, 255, 0) 100%)',
          opacity: haloOpacity,
          transform: `scale(${haloScale})`,
          filter: 'blur(10px)',
          zIndex: 8,
        }}
      />

      <div style={{position: 'absolute', inset: 0, zIndex: 12}}>
        <Cursor x={cursorX} y={cursorY} scale={1.18} clickProgress={clickProgress} />
      </div>
    </AbsoluteFill>
  );
};

const CustomizeScene = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sceneStyle = getSceneStyle(frame, SHORT_SCENES.customize.duration);
  const cardReveal = spring({
    fps,
    frame,
    config: {damping: 180, stiffness: 200, mass: 0.96},
  });
  const videoWidth = 782;
  const videoHeight = Math.round(
    (videoWidth / SOURCE_DIMENSIONS.searchingVideo.width) * SOURCE_DIMENSIONS.searchingVideo.height,
  );
  const videoTrimBefore = Math.round(10.5 * fps);
  const trimmedVideoDuration = Math.round(21 * fps) - videoTrimBefore;
  const playbackRate = trimmedVideoDuration / SHORT_SCENES.customize.duration;
  const cardFloat = Math.sin(frame / 16) * 10;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.background,
        overflow: 'hidden',
        ...sceneStyle,
      }}
    >
      <Img
        src={staticFile(ASSETS.popupAfterAdd)}
        style={{
          position: 'absolute',
          inset: -80,
          width: LAYOUT.vertical.width + 160,
          height: LAYOUT.vertical.height + 160,
          objectFit: 'cover',
          objectPosition: '54% center',
          opacity: 0.5,
          filter: 'blur(20px) saturate(0.92)',
          transform: 'scale(1.06)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 26%, rgba(83, 230, 255, 0.16) 0%, rgba(83, 230, 255, 0) 26%), linear-gradient(180deg, rgba(5, 7, 19, 0.9) 0%, rgba(5, 7, 19, 0.64) 36%, rgba(5, 7, 19, 0.86) 100%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 90,
          right: 90,
          top: 192,
          zIndex: 8,
        }}
      >
        <HeroCopy title={SHORT_COPY.customize} subtitle={SHORT_COPY.customizeSub} frame={frame} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 640,
          width: 860,
          height: 1160,
          marginLeft: -430,
          borderRadius: 999,
          background:
            'radial-gradient(circle at 50% 38%, rgba(83, 230, 255, 0.18) 0%, rgba(83, 230, 255, 0.06) 34%, rgba(83, 230, 255, 0) 72%)',
          filter: 'blur(32px)',
          opacity: cardReveal * 0.9,
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 636,
          marginLeft: -(videoWidth / 2),
          opacity: cardReveal,
          transform: `translateY(${28 - cardReveal * 28 + cardFloat}px) scale(${0.96 + cardReveal * 0.04})`,
        }}
      >
        <VideoFrame
          asset={ASSETS.searchingVideo}
          width={videoWidth}
          height={videoHeight}
          trimBefore={videoTrimBefore}
          playbackRate={playbackRate}
        />
      </div>
    </AbsoluteFill>
  );
};

const ShortcutScene = () => {
  const frame = useCurrentFrame();
  const sceneStyle = getSceneStyle(frame, SHORT_SCENES.shortcut.duration);
  const titleReveal = clampInterpolate(frame, [0, 18], [0, 1], easeOut);
  const windowReveal = spring({
    fps: 30,
    frame: frame - 34,
    config: {damping: 170, stiffness: 210, mass: 0.96},
  });
  const windowWidth = 520;
  const windowHeight = Math.round(
    (windowWidth / SOURCE_DIMENSIONS.zmetricsWindow.width) * SOURCE_DIMENSIONS.zmetricsWindow.height,
  );
  const beamOpacity = clampInterpolate(frame, [26, 38, 52], [0, 1, 0.2], easeOut);
  const windowFloatY = Math.sin((frame - 12) / 14) * 8 * windowReveal;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.background,
        overflow: 'hidden',
        ...sceneStyle,
      }}
    >
      <Img
        src={staticFile(ASSETS.chromeBase)}
        style={{
          position: 'absolute',
          inset: 0,
          width: LAYOUT.vertical.width,
          height: LAYOUT.vertical.height,
          objectFit: 'cover',
          objectPosition: '58% top',
          transform: 'scale(1.02)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(5, 7, 19, 0.88) 0%, rgba(5, 7, 19, 0.58) 36%, rgba(5, 7, 19, 0.36) 62%, rgba(5, 7, 19, 0.5) 100%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 92,
          right: 92,
          top: 186,
          opacity: titleReveal,
          transform: `translateY(${20 - titleReveal * 20}px)`,
        }}
      >
        <HeroCopy title={SHORT_COPY.shortcut} subtitle={SHORT_COPY.shortcutSub} frame={frame} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 92,
          right: 92,
          top: 820,
          zIndex: 10,
        }}
      >
        <ShortcutKeys frame={frame} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 1032,
          width: 460,
          height: 4,
          marginLeft: -230,
          background:
            'linear-gradient(90deg, rgba(83, 230, 255, 0) 0%, rgba(83, 230, 255, 0.84) 50%, rgba(83, 230, 255, 0) 100%)',
          opacity: beamOpacity,
          filter: 'blur(1px)',
          zIndex: 9,
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 1006,
          width: 760,
          height: 760,
          marginLeft: -380,
          borderRadius: 999,
          background:
            'radial-gradient(circle at 50% 42%, rgba(83, 230, 255, 0.26) 0%, rgba(83, 230, 255, 0.08) 34%, rgba(83, 230, 255, 0) 72%)',
          opacity: windowReveal * 0.92,
          filter: 'blur(34px)',
          zIndex: 8,
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 1088,
          width: windowWidth,
          height: windowHeight,
          marginLeft: -(windowWidth / 2),
          opacity: windowReveal,
          transform: `translateY(${54 - windowReveal * 54 + windowFloatY}px) scale(${0.88 + windowReveal * 0.12})`,
          zIndex: 10,
        }}
      >
        <ScreenFrame
          asset={ASSETS.zmetricsWindow}
          width={windowWidth}
          height={windowHeight}
          style={{borderRadius: 34, border: 'none', background: 'transparent'}}
          imageStyle={{objectFit: 'contain'}}
        />
      </div>
    </AbsoluteFill>
  );
};

const WorkflowScene = () => {
  const frame = useCurrentFrame();
  const workflowDuration = 60;
  const sceneStyle = getSceneStyle(frame, workflowDuration);
  const panX = clampInterpolate(frame, [0, workflowDuration], [0, -18], calmEase);
  const panScale = clampInterpolate(frame, [0, workflowDuration], [1.02, 1.05], calmEase);
  const glowPulse = 0.68 + Math.sin(frame / 12) * 0.14;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.background,
        overflow: 'hidden',
        ...sceneStyle,
      }}
    >
      <Img
        src={staticFile(ASSETS.floatingWindowOnX)}
        style={{
          position: 'absolute',
          inset: 0,
          width: LAYOUT.vertical.width,
          height: LAYOUT.vertical.height,
          objectFit: 'cover',
          objectPosition: '56% top',
          transform: `translateX(${panX}px) scale(${panScale})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(5, 7, 19, 0.8) 0%, rgba(5, 7, 19, 0.34) 30%, rgba(5, 7, 19, 0.22) 58%, rgba(5, 7, 19, 0.34) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 200,
          top: 818,
          width: 692,
          height: 692,
          borderRadius: 999,
          background:
            'radial-gradient(circle at 50% 42%, rgba(83, 230, 255, 0.26) 0%, rgba(83, 230, 255, 0.08) 36%, rgba(83, 230, 255, 0) 72%)',
          opacity: glowPulse,
          filter: 'blur(28px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 92,
          right: 92,
          top: 218,
          zIndex: 10,
        }}
      >
        <HeroCopy title="Keep browsing. Keep prices visible." subtitle="Quick checks, without tab chaos." frame={frame} />
      </div>
    </AbsoluteFill>
  );
};

const FinalScene = () => {
  const frame = useCurrentFrame();
  const sceneStyle = getSceneStyle(frame, SHORT_SCENES.final.duration);
  const heroReveal = spring({
    fps: 30,
    frame,
    config: {damping: 190, stiffness: 210, mass: 0.94},
  });
  const ctaReveal = spring({
    fps: 30,
    frame: frame - 8,
    config: {damping: 190, stiffness: 210, mass: 0.96},
  });
  const ctaPulse = 0.62 + Math.sin(frame / 7) * 0.08;
  const leftCardDrift = Math.sin(frame / 16) * 10;
  const rightCardDrift = Math.sin((frame + 14) / 18) * 10;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.background,
        overflow: 'hidden',
        ...sceneStyle,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 16%, rgba(83, 230, 255, 0.24) 0%, rgba(83, 230, 255, 0) 30%), radial-gradient(circle at 82% 22%, rgba(54, 120, 255, 0.18) 0%, rgba(54, 120, 255, 0) 32%), linear-gradient(180deg, rgba(5, 7, 19, 0.94) 0%, rgba(5, 7, 19, 1) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(180deg, rgba(255, 255, 255, 0.016) 1px, transparent 1px)',
          backgroundSize: '140px 140px',
          opacity: 0.08,
        }}
      />

      <ScreenFrame
        asset={ASSETS.popupClean}
        width={270}
        height={324}
        style={{
          position: 'absolute',
          left: -18,
          bottom: 190,
          opacity: 0.46 * heroReveal,
          transform: `translateY(${leftCardDrift}px) rotate(-14deg) scale(${0.94 + heroReveal * 0.06})`,
        }}
      />
      <ScreenFrame
        asset={ASSETS.zmetricsWindow}
        width={286}
        height={352}
        style={{
          position: 'absolute',
          right: -16,
          top: 264,
          opacity: 0.48 * heroReveal,
          transform: `translateY(${rightCardDrift}px) rotate(12deg) scale(${0.94 + heroReveal * 0.06})`,
          background: 'transparent',
          border: 'none',
        }}
        imageStyle={{objectFit: 'contain'}}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          textAlign: 'center',
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: 86,
            height: 86,
            borderRadius: 26,
            background:
              'linear-gradient(180deg, rgba(17, 24, 44, 0.96) 0%, rgba(9, 13, 26, 0.98) 100%)',
            border: `1px solid ${THEME.border}`,
            boxShadow:
              '0 28px 70px rgba(0, 0, 0, 0.38), 0 0 44px rgba(83, 230, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 28,
            opacity: heroReveal,
            transform: `translateY(${22 - heroReveal * 22}px) scale(${0.94 + heroReveal * 0.06})`,
          }}
        >
          <Img
            src={staticFile(ASSETS.brandIcon)}
            style={{width: 46, height: 46, objectFit: 'contain', display: 'block'}}
          />
        </div>

        <Img
          src={staticFile(ASSETS.brandWordmark)}
          style={{
            width: 468,
            height: 84,
            objectFit: 'contain',
            display: 'block',
            marginBottom: 24,
            opacity: heroReveal,
            transform: `translateY(${24 - heroReveal * 24}px)`,
          }}
        />

        <div
          style={{
            width: 780,
            maxWidth: '100%',
            color: THEME.textSoft,
            fontFamily: fonts.body,
            fontSize: 30,
            lineHeight: 1.35,
            letterSpacing: 0.2,
            opacity: heroReveal,
            transform: `translateY(${22 - heroReveal * 22}px)`,
          }}
        >
          {SHORT_COPY.finalSubtitle}
        </div>

        <div
          style={{
            marginTop: 34,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 16,
            padding: '18px 26px',
            borderRadius: 999,
            background:
              'linear-gradient(180deg, rgba(16, 24, 44, 0.96) 0%, rgba(8, 14, 28, 0.98) 100%)',
            border: `1px solid rgba(83, 230, 255, ${0.24 + ctaPulse * 0.14})`,
            boxShadow: `0 24px 56px rgba(0, 0, 0, 0.34), 0 0 42px rgba(83, 230, 255, ${ctaPulse * 0.22})`,
            color: THEME.text,
            fontFamily: fonts.body,
            fontSize: 25,
            fontWeight: 500,
            letterSpacing: 0.2,
            opacity: ctaReveal,
            transform: `translateY(${20 - ctaReveal * 20}px) scale(${0.96 + ctaReveal * 0.04})`,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              backgroundColor: THEME.accent,
              boxShadow: `0 0 28px rgba(83, 230, 255, ${0.34 + ctaPulse * 0.24})`,
            }}
          />
          {SHORT_COPY.finalCta}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: -220,
          top: 982,
          width: 620,
          height: 2,
          background:
            'linear-gradient(90deg, rgba(83, 230, 255, 0) 0%, rgba(83, 230, 255, 0.7) 52%, rgba(83, 230, 255, 0) 100%)',
          opacity: heroReveal * 0.74,
          transform: `translateX(${frame * 18}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

export const ZMetricsShortVertical = () => {
  const frame = useCurrentFrame();
  const audioVolume = interpolate(frame, [0, 10, SHORT_VERTICAL_DURATION - 16, SHORT_VERTICAL_DURATION], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: THEME.background}}>
      <Audio src={staticFile('assets/audio/ZMetricsShortVertical.mp3')} volume={audioVolume} />
      <Sequence from={SHORT_SCENES.hook.from} durationInFrames={SHORT_SCENES.hook.duration} premountFor={12}>
        <HookScene />
      </Sequence>
      <Sequence from={SHORT_SCENES.click.from} durationInFrames={SHORT_SCENES.click.duration} premountFor={12}>
        <ClickScene />
      </Sequence>
      <Sequence
        from={SHORT_SCENES.customize.from}
        durationInFrames={SHORT_SCENES.shortcut.duration}
        premountFor={12}
      >
        <ShortcutScene />
      </Sequence>
      <Sequence
        from={SHORT_SCENES.customize.from + SHORT_SCENES.shortcut.duration}
        durationInFrames={SHORT_SCENES.customize.duration}
        premountFor={12}
      >
        <CustomizeScene />
      </Sequence>
      <Sequence
        from={SHORT_SCENES.final.from}
        durationInFrames={SHORT_SCENES.final.duration}
        premountFor={12}
      >
        <FinalScene />
      </Sequence>
    </AbsoluteFill>
  );
};
