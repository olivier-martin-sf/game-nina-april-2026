import Phaser from 'phaser';
import { getCurrentPalette, hexToInt } from '../utils/colors.js';
import { resumeAudio } from '../utils/sounds.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    const c = getCurrentPalette('grassyHills');
    const g = this.add.graphics();

    // Sky gradient background
    const top = Phaser.Display.Color.HexStringToColor(c.sky.top);
    const bot = Phaser.Display.Color.HexStringToColor(c.sky.bottom);
    for (let y = 0; y < 600; y++) {
      const t = y / 600;
      g.fillStyle(Phaser.Display.Color.GetColor(
        Phaser.Math.Linear(top.red, bot.red, t),
        Phaser.Math.Linear(top.green, bot.green, t),
        Phaser.Math.Linear(top.blue, bot.blue, t),
      ));
      g.fillRect(0, y, 800, 1);
    }

    // Decorative hills at bottom
    g.fillStyle(hexToInt(c.hills.far));
    this.drawHill(g, -50, 440, 400, 120);
    this.drawHill(g, 450, 450, 400, 110);

    g.fillStyle(hexToInt(c.hills.near));
    this.drawHill(g, 100, 500, 600, 100);

    // Ground
    g.fillStyle(hexToInt(c.ground));
    g.fillRect(0, 560, 800, 40);

    // Title
    const title = this.add.text(400, 200, 'Smash-a-Mole!', {
      fontSize: '58px',
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      color: c.ui.buttonBg,
      stroke: c.ui.scoreShadow,
      strokeThickness: 8,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      scaleX: 1.04,
      scaleY: 1.04,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Draw a cute mole in the center
    const mole = this.add.graphics();
    mole.x = 400;
    mole.y = 360;

    // Body
    mole.fillStyle(hexToInt(c.mole.body));
    mole.fillEllipse(0, 0, 70, 80);
    // Belly
    mole.fillStyle(hexToInt(c.mole.cheeks));
    mole.fillEllipse(0, 10, 50, 50);
    // Ears
    mole.fillStyle(hexToInt(c.mole.body));
    mole.fillCircle(-24, -36, 12);
    mole.fillCircle(24, -36, 12);
    mole.fillStyle(hexToInt(c.mole.nose));
    mole.fillCircle(-24, -36, 6);
    mole.fillCircle(24, -36, 6);
    // Eyes
    mole.fillStyle(0xffffff);
    mole.fillCircle(-12, -18, 11);
    mole.fillCircle(12, -18, 11);
    mole.fillStyle(0x2a2a3a);
    mole.fillCircle(-10, -16, 7);
    mole.fillCircle(14, -16, 7);
    mole.fillStyle(0xffffff);
    mole.fillCircle(-8, -20, 3);
    mole.fillCircle(16, -20, 3);
    // Nose
    mole.fillStyle(hexToInt(c.mole.nose));
    mole.fillEllipse(0, -6, 14, 10);
    // Mouth
    mole.lineStyle(2, 0x8B6F4E);
    mole.beginPath();
    mole.arc(0, 0, 7, 0, Math.PI, false);
    mole.strokePath();

    this.tweens.add({
      targets: mole,
      y: 355,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Subtitle
    const sub = this.add.text(400, 470, 'Click anywhere to start!', {
      fontSize: '22px',
      fontFamily: 'Arial, sans-serif',
      color: c.ui.scoreText,
      stroke: c.ui.scoreShadow,
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: sub,
      alpha: 0.4,
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    this.input.once('pointerdown', () => {
      resumeAudio();
      this.scene.start('Game');
    });
  }

  drawHill(graphics, x, y, width, height) {
    graphics.beginPath();
    const steps = 30;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = x + t * width;
      const py = y + height - Math.sin(t * Math.PI) * height;
      if (i === 0) graphics.moveTo(px, y + height);
      else graphics.lineTo(px, py);
    }
    graphics.lineTo(x + width, y + height);
    graphics.closePath();
    graphics.fillPath();
  }
}
