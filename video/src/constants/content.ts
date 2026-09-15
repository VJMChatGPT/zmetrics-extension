export type DemoOrientation = 'horizontal' | 'vertical';

export const VIDEO_META = {
  fps: 30,
  durationInFrames: 18 * 30,
} as const;

export const SCENE_DURATIONS = {
  problem: 3 * VIDEO_META.fps,
  openPopup: 3 * VIDEO_META.fps,
  customizeCoins: Math.round(3.5 * VIDEO_META.fps),
  floatingWindow: 3 * VIDEO_META.fps,
  realWorkflow: 3 * VIDEO_META.fps,
  finalCta: Math.round(2.5 * VIDEO_META.fps),
} as const;

export const SCENE_FRAMES = {
  problem: 0,
  openPopup: SCENE_DURATIONS.problem,
  customizeCoins: SCENE_DURATIONS.problem + SCENE_DURATIONS.openPopup,
  floatingWindow:
    SCENE_DURATIONS.problem + SCENE_DURATIONS.openPopup + SCENE_DURATIONS.customizeCoins,
  realWorkflow:
    SCENE_DURATIONS.problem +
    SCENE_DURATIONS.openPopup +
    SCENE_DURATIONS.customizeCoins +
    SCENE_DURATIONS.floatingWindow,
  finalCta:
    SCENE_DURATIONS.problem +
    SCENE_DURATIONS.openPopup +
    SCENE_DURATIONS.customizeCoins +
    SCENE_DURATIONS.floatingWindow +
    SCENE_DURATIONS.realWorkflow,
} as const;

export const ASSETS = {
  chromeBase: 'assets/zmetrics-selected/00-chrome.png',
  chromeBaseVertical: 'assets/zmetrics-selected/00-chrome_vertical.png',
  popupInChrome: 'assets/zmetrics-selected/01-popup-in-chrome.png',
  popupInChromeVertical: 'assets/zmetrics-selected/01-popup-in-chrome_vertical.png',
  popupClean: 'assets/zmetrics-selected/02-popup-clean.png',
  popupSettingsOverview: 'assets/zmetrics-selected/03-popup-settings-overview.png',
  popupSearchBeforeAdd: 'assets/zmetrics-selected/04-popup-search-before-add.png',
  popupAfterAdd: 'assets/zmetrics-selected/05-popup-after-add.png',
  floatingWindowOnX: 'assets/zmetrics-selected/06-floating-window-on-x.png',
  brandWordmark: 'assets/zmetrics-selected/ZMetrics_banner_white.png',
  brandIcon: 'assets/zmetrics-selected/zmetrics_logo.png',
  searchingVideo: 'assets/zmetrics-demo/searching_video.mp4',
  zmetricsWindow: 'assets/zmetrics-demo/zmetrics_window.png',
} as const;

export const COPY = {
  brand: 'ZMetrics',
  productName: 'ZMetrics - Crypto Price Tracker',
  problem: "Checking crypto prices shouldn't break your flow.",
  openPopup: 'Open your prices instantly from Chrome.',
  openPopupClickLabel: 'Click',
  openPopupClickTitle: 'Click the extension icon',
  openPopupClickHint: 'Open it from any Chrome tab',
  openPopupShortcutTitle: 'Or press your shortcut',
  openPopupShortcutHint: 'Faster when you stay in flow',
  customizeCoins: 'Choose the coins you actually care about.',
  floatingWindow: 'Open it even faster with your shortcut.',
  realWorkflow: 'Keep prices visible while you browse.',
  finalTitle: 'ZMetrics',
  finalSubtitle: 'Quick crypto prices, one shortcut away.',
  finalQuestion: 'Join ZMetrics at zmetrics.net.',
  shortcutLabel: 'Ctrl + Shift + Z',
  shortcutHint: 'Shortcut can be changed',
  browserBadge: 'Chrome extension',
  tabChaos: ['Google', 'CoinMarketCap', 'Exchange', 'X', 'Portfolio', 'Alerts'],
} as const;

export const SOURCE_DIMENSIONS = {
  chromeBase: {width: 1920, height: 1042},
  popupInChrome: {width: 1920, height: 1042},
  floatingWindowOnX: {width: 1919, height: 997},
  searchingVideo: {width: 640, height: 796},
  zmetricsWindow: {width: 368, height: 452},
} as const;

export const CROP_PRESETS = {
  popupFocus: {
    x: 0.722,
    y: 0.078,
    width: 0.23,
    height: 0.43,
  },
  floatingReveal: {
    x: 0.732,
    y: 0.056,
    width: 0.224,
    height: 0.462,
  },
  floatingWorkflow: {
    x: 0.726,
    y: 0.084,
    width: 0.218,
    height: 0.442,
  },
} as const;

export const THEME = {
  background: '#050713',
  surface: '#0d1224',
  surfaceSoft: '#121936',
  border: 'rgba(136, 226, 255, 0.18)',
  text: '#f5f8ff',
  textSoft: 'rgba(230, 240, 255, 0.72)',
  accent: '#53e6ff',
  accentSoft: 'rgba(83, 230, 255, 0.18)',
  shadow: '0 36px 120px rgba(0, 0, 0, 0.48)',
} as const;

export const LAYOUT = {
  horizontal: {
    width: 1920,
    height: 1080,
    safeX: 118,
    safeY: 92,
    titleWidth: 700,
    sceneCardWidth: 1320,
    popupWidth: 520,
    floatingWidth: 560,
  },
  vertical: {
    width: 1080,
    height: 1920,
    safeX: 82,
    safeY: 118,
    titleWidth: 780,
    sceneCardWidth: 920,
    popupWidth: 610,
    floatingWidth: 620,
  },
} as const;
