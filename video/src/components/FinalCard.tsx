import {Img, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {THEME} from '../constants/content';
import {fonts} from '../fonts';

type FinalCardProps = {
  readonly title: string;
  readonly subtitle: string;
  readonly cta?: string;
  readonly wordmarkAsset?: string;
  readonly iconAsset?: string;
  readonly orientation?: 'horizontal' | 'vertical';
};

export const FinalCard = ({
  title,
  subtitle,
  cta,
  wordmarkAsset,
  iconAsset,
  orientation = 'horizontal',
}: FinalCardProps) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const isVertical = orientation === 'vertical';

  const reveal = spring({
    fps,
    frame,
    config: {
      damping: 200,
      stiffness: 220,
      mass: 0.9,
    },
  });
  const headerReveal = spring({
    fps,
    frame: frame - 5,
    config: {
      damping: 200,
      stiffness: 220,
      mass: 0.9,
    },
  });
  const bodyReveal = spring({
    fps,
    frame: frame - 11,
    config: {
      damping: 200,
      stiffness: 220,
      mass: 0.92,
    },
  });
  const ctaReveal = spring({
    fps,
    frame: frame - 18,
    config: {
      damping: 200,
      stiffness: 220,
      mass: 0.95,
    },
  });
  const ctaPulse = 0.55 + Math.sin(frame / 7) * 0.08;

  return (
    <div
      style={{
        width: isVertical ? 'min(86vw, 860px)' : 'min(78vw, 980px)',
        padding: isVertical ? '58px 46px' : '56px 64px',
        borderRadius: 38,
        background:
          'radial-gradient(circle at 50% 0%, rgba(83, 230, 255, 0.18) 0%, rgba(83, 230, 255, 0) 44%), linear-gradient(180deg, rgba(15, 22, 43, 0.97) 0%, rgba(7, 10, 22, 0.99) 100%)',
        border: `1px solid ${THEME.border}`,
        boxShadow:
          '0 50px 160px rgba(0, 0, 0, 0.54), 0 0 80px rgba(83, 230, 255, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
        opacity: reveal,
        transform: `translateY(${36 - reveal * 36}px) scale(${0.93 + reveal * 0.07})`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -120,
          left: '50%',
          width: isVertical ? 340 : 420,
          height: isVertical ? 340 : 420,
          marginLeft: isVertical ? -170 : -210,
          borderRadius: 999,
          background:
            'radial-gradient(circle at 50% 50%, rgba(83, 230, 255, 0.18) 0%, rgba(83, 230, 255, 0.06) 42%, rgba(83, 230, 255, 0) 72%)',
          filter: 'blur(18px)',
          opacity: 0.9,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: -120,
          width: 220,
          height: '100%',
          background:
            'linear-gradient(90deg, rgba(83, 230, 255, 0) 0%, rgba(83, 230, 255, 0.08) 52%, rgba(83, 230, 255, 0) 100%)',
          opacity: reveal * 0.7,
          transform: `translateX(${frame * 14 - 280}px) skewX(-18deg)`,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          marginBottom: 30,
          opacity: headerReveal,
          transform: `translateY(${18 - headerReveal * 18}px)`,
          position: 'relative',
        }}
      >
        {iconAsset ? (
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 22,
              background:
                'linear-gradient(180deg, rgba(17, 24, 44, 0.96) 0%, rgba(9, 13, 26, 0.98) 100%)',
              border: `1px solid ${THEME.border}`,
              boxShadow: '0 20px 54px rgba(0, 0, 0, 0.34), 0 0 34px rgba(83, 230, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Img
              src={staticFile(iconAsset)}
              style={{
                width: 38,
                height: 38,
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>
        ) : null}
        <div
          style={{
            width: isVertical ? 132 : 122,
            height: 5,
            borderRadius: 999,
            background: `linear-gradient(90deg, ${THEME.accent} 0%, rgba(83, 230, 255, 0) 100%)`,
            boxShadow: '0 0 24px rgba(83, 230, 255, 0.34)',
          }}
        />
      </div>
      {wordmarkAsset ? (
        <div
          style={{
            opacity: bodyReveal,
            transform: `translateY(${20 - bodyReveal * 20}px)`,
            position: 'relative',
          }}
        >
          <Img
            src={staticFile(wordmarkAsset)}
            style={{
              width: isVertical ? 'min(100%, 480px)' : 'min(100%, 440px)',
              height: isVertical ? 82 : 78,
              objectFit: 'contain',
              objectPosition: 'left center',
              display: 'block',
              marginBottom: 22,
            }}
          />
        </div>
      ) : (
        <div
          style={{
            color: THEME.text,
            fontFamily: fonts.display,
            fontWeight: 600,
            fontSize: 76,
            letterSpacing: -2,
            marginBottom: 18,
            opacity: bodyReveal,
            transform: `translateY(${20 - bodyReveal * 20}px)`,
          }}
        >
          {title}
        </div>
      )}
      <div
        style={{
          color: THEME.textSoft,
          fontFamily: fonts.body,
          fontSize: isVertical ? 30 : 32,
          lineHeight: 1.35,
          letterSpacing: 0.2,
          opacity: bodyReveal,
          transform: `translateY(${18 - bodyReveal * 18}px)`,
        }}
      >
        {subtitle}
      </div>
      {cta ? (
        <div
          style={{
            marginTop: 32,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 16,
            padding: isVertical ? '18px 24px' : '18px 26px',
            borderRadius: 999,
            background:
              'linear-gradient(180deg, rgba(15, 24, 44, 0.96) 0%, rgba(8, 14, 28, 0.98) 100%)',
            border: `1px solid rgba(83, 230, 255, ${0.2 + ctaPulse * 0.14})`,
            boxShadow: `0 20px 50px rgba(0, 0, 0, 0.34), 0 0 36px rgba(83, 230, 255, ${ctaPulse * 0.22})`,
            color: THEME.text,
            fontFamily: fonts.body,
            fontSize: isVertical ? 24 : 25,
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
              boxShadow: `0 0 24px rgba(83, 230, 255, ${0.36 + ctaPulse * 0.28})`,
              flexShrink: 0,
            }}
          />
          {cta}
        </div>
      ) : null}
    </div>
  );
};
