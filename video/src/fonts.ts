import {loadFont as loadSora} from '@remotion/google-fonts/Sora';

const sora = loadSora();

export const fonts = {
  display: sora.fontFamily,
  body: sora.fontFamily,
};
