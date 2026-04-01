---
name: game-palette
description: >
  Generate and manage color palettes for kids' game levels. Produces a JS constants file
  with structured palettes (sky, terrain, UI, characters, effects) using pastel, cartoonish,
  kid-friendly colors. Trigger: "color palette", "game colors", "level palette", "stage colors".
user-invocable: true
argument-hint: "[stage-name] or 'new [theme]' to add a stage"
allowed-tools: Read, Write, Edit, AskUserQuestion
---

# Game Color Palette Generator

Generate structured, kid-friendly color palettes for game levels. Output is a single JS constants
file that Phaser scenes import directly.

---

## Output File

Write palette to: `src/utils/colors.js`

The file exports:
- `PALETTES` — object keyed by stage name (e.g., `grassyHills`, `spookyCave`)
- `getCurrentPalette(stageName)` — helper that returns a palette or the default
- `DEFAULT_STAGE` — string, currently `'grassyHills'`

---

## Palette Structure

Every stage palette MUST have these keys:

```js
{
  name: 'Human-readable Stage Name',

  // Background / sky
  sky: { top: '#hex', bottom: '#hex' },  // gradient top to bottom

  // Terrain layers (back to front for parallax depth)
  hills: {
    far:  '#hex',   // most distant, lightest
    mid:  '#hex',
    near: '#hex',   // closest, most saturated
  },
  grass:  '#hex',   // grass line / ground surface
  ground: '#hex',   // dirt / below-surface

  // Game objects
  mole: {
    body:   '#hex',
    nose:   '#hex',
    cheeks: '#hex',
  },
  hole: {
    rim:    '#hex',
    inside: '#hex',
  },
  hammer: {
    head:   '#hex',
    handle: '#hex',
  },

  // UI
  ui: {
    scoreText:   '#hex',
    scoreShadow: '#hex',
    buttonBg:    '#hex',
    buttonText:  '#hex',
    timerBar:    '#hex',
    timerBarBg:  '#hex',
  },

  // Particle effects (stars, puffs on hit)
  particles: ['#hex', '#hex', '#hex'],
}
```

---

## Color Rules for Kids' Games

1. **Pastel first**: Saturation 40-70%, lightness 55-80%. No neon. No dark/muddy tones.
2. **Warm and inviting**: Lean toward warm hues for primary elements. Cool pastels fine for sky/background.
3. **High contrast where it matters**: Moles must pop against holes. Score text must be readable. Hammer must be visible during swing.
4. **Depth through value**: Far hills lighter/cooler, near hills darker/warmer. Creates parallax depth cheaply.
5. **Limit the palette**: 15-20 unique colors max per stage. Reuse is good.
6. **No pure black or white**: Use soft darks (`#3a3a5c`) and warm whites (`#fff8f0`) instead.

---

## Adding a New Stage

When invoked with `/game-palette new [theme]`:

1. Ask the user about the mood/setting (if not obvious from the theme name)
2. Copy the palette structure exactly — every key must be present
3. Follow the color rules above
4. Pick colors that feel cohesive for the theme while staying kid-friendly
5. Add the new palette to the `PALETTES` object in `src/utils/colors.js`
6. Do NOT change `DEFAULT_STAGE` unless asked

---

## Usage in Phaser Scenes

```js
import { getCurrentPalette } from '../utils/colors.js';

const colors = getCurrentPalette('grassyHills');

// Sky gradient
this.cameras.main.setBackgroundColor(colors.sky.top);

// Convert hex to Phaser-friendly integer
const hexToInt = (hex) => parseInt(hex.replace('#', ''), 16);

// Hill graphics
const g = this.add.graphics();
g.fillStyle(hexToInt(colors.hills.far));
```
