import {interpolate} from 'remotion';

type CursorProps = {
  readonly x: number;
  readonly y: number;
  readonly scale?: number;
  readonly clickProgress?: number;
};

export const Cursor = ({
  x,
  y,
  scale = 1,
  clickProgress = 0,
}: CursorProps) => {
  const ringScale = interpolate(clickProgress, [0, 1], [0.3, 1.5], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const ringOpacity = interpolate(clickProgress, [0, 0.85, 1], [0.65, 0.2, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const pointerScale = interpolate(clickProgress, [0, 0.18, 0.45, 1], [1, 0.92, 1.04, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-16px, -10px) scale(${scale})`,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: -22,
          borderRadius: 999,
          border: '2px solid rgba(83, 230, 255, 0.7)',
          transform: `scale(${ringScale})`,
          opacity: ringOpacity,
        }}
      />
      <svg
        width={44}
        height={56}
        viewBox="0 0 44 56"
        style={{
          display: 'block',
          filter: 'drop-shadow(0 10px 24px rgba(0, 0, 0, 0.48))',
          transform: `scale(${pointerScale})`,
          transformOrigin: '16px 8px',
        }}
      >
        <path
          d="M6 3L34 30H21L28 51L18.5 54L12 34L3 43V3Z"
          fill="#FFFFFF"
          stroke="#0A1020"
          strokeWidth={2.4}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
