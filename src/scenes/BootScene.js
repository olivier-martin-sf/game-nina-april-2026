import Phaser from 'phaser';
import { getCurrentPalette, hexToInt } from '../utils/colors.js';
import { resumeAudio } from '../utils/sounds.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    this.load.audio('bgMusic', 'assets/music/home-page-bg-music.m4a');
    this.load.spritesheet('mole', 'assets/sprites/mole-character.svg', {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet('rattle', 'assets/sprites/rattle.svg', {
      frameWidth: 128,
      frameHeight: 128,
    });
  }

  create() {
    const c = getCurrentPalette('grassyHills');
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;
    const cx = W / 2;
    const g = this.add.graphics();

    // Sky gradient background
    const top = Phaser.Display.Color.HexStringToColor(c.sky.top);
    const bot = Phaser.Display.Color.HexStringToColor(c.sky.bottom);
    for (let y = 0; y < H; y++) {
      const t = y / H;
      g.fillStyle(Phaser.Display.Color.GetColor(
        Phaser.Math.Linear(top.red, bot.red, t),
        Phaser.Math.Linear(top.green, bot.green, t),
        Phaser.Math.Linear(top.blue, bot.blue, t),
      ));
      g.fillRect(0, y, W, 1);
    }

    // Decorative hills at bottom
    g.fillStyle(hexToInt(c.hills.far));
    this.drawHill(g, -50, H * 0.73, W * 0.5, H * 0.2);
    this.drawHill(g, W * 0.55, H * 0.75, W * 0.5, H * 0.18);

    g.fillStyle(hexToInt(c.hills.near));
    this.drawHill(g, W * 0.1, H * 0.83, W * 0.8, H * 0.17);

    // Ground
    g.fillStyle(hexToInt(c.ground));
    g.fillRect(0, H * 0.93, W, H * 0.07);

    // Title
    const title = this.add.text(cx, H * 0.18, 'Smash-a-Mole!', {
      fontSize: '52px',
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      color: c.ui.buttonBg,
      stroke: c.ui.scoreShadow,
      strokeThickness: 8,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      scaleX: 1.04, scaleY: 1.04,
      duration: 900,
      yoyo: true, repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // ─── LEVEL SELECT ─────────────────────────────────────
    const sub = this.add.text(cx, H * 0.30, 'Pick a level!', {
      fontSize: '22px',
      fontFamily: 'Arial, sans-serif',
      color: c.ui.scoreText,
      stroke: c.ui.scoreShadow,
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: sub,
      alpha: 0.5,
      duration: 800,
      yoyo: true, repeat: -1,
    });

    // --- Level 1 Card: Grassy Hills ---
    const cardW = 130;
    const cardH = 160;
    const cardY = H * 0.55;
    const gap = 20;
    const card1X = cx - cardW / 2 - gap;
    const card2X = cx + cardW / 2 + gap;

    this.createLevelCard(card1X, cardY, cardW, cardH, {
      label: 'Level 1',
      subtitle: 'Grassy Hills',
      bgColor: 0x6CC56C,
      borderColor: 0x5CB85C,
      spriteKey: 'mole',
      spriteFrame: 1,
      spriteScale: 0.7,
      onClick: () => this.startLevel('Game'),
    });

    // --- Level 2 Card: Beach ---
    this.createLevelCard(card2X, cardY, cardW, cardH, {
      label: 'Level 2',
      subtitle: 'Beach & Ocean',
      bgColor: 0xF5DEB3,
      borderColor: 0xD4B886,
      spriteKey: 'rattle',
      spriteFrame: 0,
      spriteScale: 0.6,
      onClick: () => this.startLevel('BeachGame'),
    });
  }

  createLevelCard(x, y, w, h, opts) {
    const container = this.add.container(x, y);

    // Card shadow
    const shadow = this.add.rectangle(3, 3, w, h, 0x000000, 0.15).setOrigin(0.5);
    shadow.setStrokeStyle(0);
    container.add(shadow);

    // Card background
    const bg = this.add.rectangle(0, 0, w, h, opts.bgColor).setOrigin(0.5);
    bg.setStrokeStyle(3, opts.borderColor);
    container.add(bg);

    // Sprite preview
    const sprite = this.add.sprite(0, -14, opts.spriteKey, opts.spriteFrame);
    sprite.setScale(opts.spriteScale);
    container.add(sprite);

    // Gentle bob
    this.tweens.add({
      targets: sprite,
      y: -18,
      duration: 1000,
      yoyo: true, repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Level label
    const label = this.add.text(0, h / 2 - 44, opts.label, {
      fontSize: '20px',
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      color: '#FFFAF0',
      stroke: '#3A3A5C',
      strokeThickness: 4,
    }).setOrigin(0.5);
    container.add(label);

    // Subtitle
    const sub = this.add.text(0, h / 2 - 24, opts.subtitle, {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: '#FFFAF0',
      stroke: '#3A3A5C',
      strokeThickness: 2,
    }).setOrigin(0.5);
    container.add(sub);

    // Interactive
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => {
      this.tweens.add({
        targets: container,
        scaleX: 1.08, scaleY: 1.08,
        duration: 120,
        ease: 'Back.easeOut',
      });
    });
    bg.on('pointerout', () => {
      this.tweens.add({
        targets: container,
        scaleX: 1, scaleY: 1,
        duration: 120,
      });
    });
    bg.on('pointerdown', () => {
      resumeAudio();
      opts.onClick();
    });

    return container;
  }

  startLevel(sceneKey) {
    if (this.cache.audio.exists('bgMusic')) {
      const bgMusic = this.sound.add('bgMusic', { loop: true, volume: 0.3 });
      bgMusic.play();
      this.registry.set('bgMusic', bgMusic);
    }
    this.scene.start(sceneKey);
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
