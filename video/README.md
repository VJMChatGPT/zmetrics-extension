# ZMetrics Remotion Demo

This folder contains a standalone Remotion project for the ZMetrics product demo videos.

## Assets

Put the screenshots in:

`public/assets/zmetrics-demo/`

Expected files:

- `browser-popup-main.png`
- `browser-popup-options.png`
- `browser-popup-after-add.png`
- `floating-window-main.png`
- `chrome-store-listing.png`
- `x-profile-floating.png`

## Preview

Install dependencies and start Remotion Studio:

```bash
npm install
npm run dev
```

## Render

Render the horizontal 1920x1080 MP4:

```bash
npm run render:horizontal
```

Render the vertical 1080x1920 MP4:

```bash
npm run render:vertical
```
