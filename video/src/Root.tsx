import {Composition, Folder} from 'remotion';
import {LAYOUT, VIDEO_META} from './constants/content';
import {ZMetricsDemo} from './ZMetricsDemo';
import {SHORT_VERTICAL_DURATION, ZMetricsShortVertical} from './ZMetricsShortVertical';

export const RemotionRoot = () => {
  return (
    <Folder name="ZMetrics">
      <Composition
        id="ZMetricsDemoHorizontal"
        component={ZMetricsDemo}
        durationInFrames={VIDEO_META.durationInFrames}
        fps={VIDEO_META.fps}
        width={LAYOUT.horizontal.width}
        height={LAYOUT.horizontal.height}
        defaultProps={{orientation: 'horizontal' as const}}
      />
      <Composition
        id="ZMetricsDemoVertical"
        component={ZMetricsDemo}
        durationInFrames={VIDEO_META.durationInFrames}
        fps={VIDEO_META.fps}
        width={LAYOUT.vertical.width}
        height={LAYOUT.vertical.height}
        defaultProps={{orientation: 'vertical' as const}}
      />
      <Composition
        id="ZMetricsShortVertical"
        component={ZMetricsShortVertical}
        durationInFrames={SHORT_VERTICAL_DURATION}
        fps={VIDEO_META.fps}
        width={LAYOUT.vertical.width}
        height={LAYOUT.vertical.height}
      />
    </Folder>
  );
};
