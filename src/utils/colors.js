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

  beachOcean: {
    name: 'Beach & Ocean',

    sky: { top: '#5BC0EB', bottom: '#A8E6F0' },

    ocean: {
      deep:  '#1B7A9E',
      mid:   '#3CB5D6',
      shore: '#7DD4E8',
      foam:  '#E8F8FF',
    },
    sand: {
      dry:   '#F5DEB3',
      wet:   '#D4B886',
      dark:  '#C4A56A',
    },
    ground: '#F5DEB3',

    mole: {
      body:   '#C4956A',
      nose:   '#FF9B9B',
      cheeks: '#FFB8B8',
    },
    hole: {
      rim:    '#C4A56A',
      inside: '#8B7340',
    },
    rattle: {
      head:   '#E03030',
      handle: '#FFE4B5',
      dots:   '#FFD700',
    },

    ui: {
      scoreText:   '#FFFAF0',
      scoreShadow: '#2A4858',
      buttonBg:    '#FF7F50',
      buttonText:  '#2A4858',
      timerBar:    '#5BC0EB',
      timerBarBg:  '#E0E0E0',
    },

    particles: ['#FFD700', '#FF7F50', '#5BC0EB'],
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
