import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {THEME} from '../constants/content';
import {fonts} from '../fonts';

type ShortcutBadgeProps = {
  readonly label: string;
  readonly hint?: string;
  readonly size?: 'default' | 'hero';
};

export const ShortcutBadge = ({
  label,
  hint,
  size = 'default',
}: ShortcutBadgeProps) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const isHero = size === 'hero';

  const entrance = spring({
    fps,
    frame,
    config: {
      damping: 200,
      stiffness: 240,
      mass: 0.9,
    },
  });

  return (
    <div
      style={{
        alignSelf: 'center',
        display: 'inline-flex',
        flexDirection: 'column',
        gap: isHero ? 18 : 14,
        padding: isHero ? '26px 34px' : '20px 28px',
        borderRadius: isHero ? 28 : 24,
        border: `1px solid ${THEME.border}`,
        background:
          'radial-gradient(circle at 50% 0%, rgba(83, 230, 255, 0.14) 0%, rgba(83, 230, 255, 0) 46%), linear-gradient(180deg, rgba(13, 19, 38, 0.9) 0%, rgba(8, 12, 24, 0.95) 100%)',
        boxShadow: '0 24px 70px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
        opacity: entrance,
        transform: `translateY(${18 - entrance * 18}px) scale(${0.92 + entrance * 0.08})`,
      }}
    >
      <div style={{display: 'flex', gap: 10, justifyContent: 'center'}}>
        {label.split(' + ').map((key) => (
          <div
            key={key}
            style={{
              minWidth: isHero ? 74 : 54,
              padding: isHero ? '18px 24px' : '14px 18px',
              borderRadius: isHero ? 18 : 14,
              textAlign: 'center',
              color: THEME.text,
              background:
                'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: 'inset 0 -4px 18px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(255, 255, 255, 0.02)',
              fontFamily: fonts.display,
              fontSize: isHero ? 34 : 26,
              fontWeight: 600,
              letterSpacing: 0.6,
            }}
          >
            {key}
          </div>
        ))}
      </div>
      {hint ? (
        <div
          style={{
            textAlign: 'center',
            color: THEME.textSoft,
            fontFamily: fonts.body,
            fontSize: isHero ? 24 : 20,
            letterSpacing: 0.2,
          }}
        >
          {hint}
        </div>
      ) : null}
    </div>
  );
};
