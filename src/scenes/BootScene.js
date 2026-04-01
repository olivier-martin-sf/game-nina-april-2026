import Phaser from 'phaser';
import { getCurrentPalette, hexToInt } from '../utils/colors.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    const colors = getCurrentPalette('grassyHills');

    // Simple loading text
    const text = this.add.text(400, 280, 'Smash-a-Mole!', {
      fontSize: '48px',
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      color: colors.ui.scoreText,
      stroke: colors.ui.scoreShadow,
      strokeThickness: 6,
    }).setOrigin(0.5);

    const subText = this.add.text(400, 340, 'Click anywhere to start!', {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: colors.ui.scoreText,
      stroke: colors.ui.scoreShadow,
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Pulse the title
    this.tweens.add({
      targets: text,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Click to start
    this.input.once('pointerdown', () => {
      this.scene.start('Game');
    });
  }
}
