import type {CSSProperties, ReactNode} from 'react';
import {Img, staticFile} from 'remotion';
import {THEME} from '../constants/content';
import {fonts} from '../fonts';

type BrowserFrameProps = {
  readonly width: number;
  readonly height: number;
  readonly src?: string;
  readonly title?: string;
  readonly style?: CSSProperties;
  readonly contentStyle?: CSSProperties;
  readonly imageStyle?: CSSProperties;
  readonly children?: ReactNode;
};

export const BrowserFrame = ({
  width,
  height,
  src,
  title = 'zmetrics.app',
  style,
  contentStyle,
  imageStyle,
  children,
}: BrowserFrameProps) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 30,
        overflow: 'hidden',
        position: 'relative',
        border: `1px solid ${THEME.border}`,
        background:
          'linear-gradient(180deg, rgba(14, 20, 41, 0.98) 0%, rgba(7, 11, 24, 0.98) 100%)',
        boxShadow: THEME.shadow,
        ...style,
      }}
    >
      <div
        style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '0 18px',
          borderBottom: `1px solid ${THEME.border}`,
          background:
            'linear-gradient(180deg, rgba(18, 25, 49, 0.95) 0%, rgba(10, 16, 31, 0.9) 100%)',
        }}
      >
        <div style={{display: 'flex', gap: 8}}>
          {['#ff6b6b', '#ffbd4a', '#2fd671'].map((color) => (
            <div
              key={color}
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                backgroundColor: color,
                opacity: 0.92,
              }}
            />
          ))}
        </div>
        <div
          style={{
            flex: 1,
            height: 34,
            borderRadius: 999,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '0 14px',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              backgroundColor: THEME.accent,
              boxShadow: '0 0 18px rgba(83, 230, 255, 0.55)',
            }}
          />
          <span
            style={{
              color: THEME.textSoft,
              fontFamily: fonts.body,
              fontSize: 16,
              letterSpacing: 0.2,
            }}
          >
            {title}
          </span>
        </div>
      </div>
      <div
        style={{
          position: 'relative',
          height: height - 56,
          padding: 18,
          overflow: 'hidden',
          ...contentStyle,
        }}
      >
        {src ? (
          <Img
            src={staticFile(src)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: 18,
              display: 'block',
              ...imageStyle,
            }}
          />
        ) : null}
        {children}
      </div>
    </div>
  );
};
