// Game color palettes — generated via /game-palette skill
// Pastel, cartoonish, kid-friendly colors for each stage

export const PALETTES = {
  grassyHills: {
    name: 'Grassy Hills',

    sky: { top: '#87CEEB', bottom: '#D4F1F9' },

    hills: {
      far:  '#B8E6B8',
      mid:  '#8FD88F',
      near: '#6CC56C',
    },
    grass:  '#5CB85C',
    ground: '#D2A679',

    mole: {
      body:   '#C4956A',
      nose:   '#FF9B9B',
      cheeks: '#FFB8B8',
    },
    hole: {
      rim:    '#8B6F4E',
      inside: '#5A4232',
    },
    hammer: {
      head:   '#F4A460',
      handle: '#DEB887',
    },

    ui: {
      scoreText:   '#FFFAF0',
      scoreShadow: '#3A3A5C',
      buttonBg:    '#FFD166',
      buttonText:  '#3A3A5C',
      timerBar:    '#77DD77',
      timerBarBg:  '#E0E0E0',
    },

    particles: ['#FFD700', '#FF9FF3', '#77DD77'],
  },
};

export const DEFAULT_STAGE = 'grassyHills';

export function getCurrentPalette(stageName) {
  return PALETTES[stageName] || PALETTES[DEFAULT_STAGE];
}

// Helper: convert '#hex' to Phaser-friendly integer
export function hexToInt(hex) {
  return parseInt(hex.replace('#', ''), 16);
}
