import Phaser from 'phaser';
import { getCurrentPalette, hexToInt } from '../utils/colors.js';

// Hole positions (x, y) — spread across the foreground hill
const HOLE_POSITIONS = [
  { x: 150, y: 420 },
  { x: 330, y: 400 },
  { x: 510, y: 400 },
  { x: 690, y: 420 },
  { x: 240, y: 480 },
  { x: 420, y: 470 },
  { x: 600, y: 480 },
];

const HOLE_WIDTH = 70;
const HOLE_HEIGHT = 28;
const MOLE_SIZE = 32;
const HAMMER_HEAD_W = 60;
const HAMMER_HEAD_H = 40;
const HAMMER_HANDLE_W = 12;
const HAMMER_HANDLE_H = 80;
const GAME_DURATION = 30; // seconds

export class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    this.colors = getCurrentPalette('grassyHills');
    this.score = 0;
    this.timeLeft = GAME_DURATION;
    this.isSmashing = false;
    this.moles = [];

    this.drawBackground();
    this.createHoles();
    this.createMoles();
    this.createHammer();
    this.createUI();
    this.startMoleTimer();
    this.startGameTimer();

    // Track mouse position
    this.input.on('pointermove', (pointer) => {
      if (!this.isSmashing) {
        this.hammerX = Phaser.Math.Clamp(pointer.x, 60, 740);
      }
    });

    // Smash on click
    this.input.on('pointerdown', () => {
      this.smashHammer();
    });

    this.hammerX = 400;
  }

  // === BACKGROUND ===

  drawBackground() {
    const c = this.colors;
    const g = this.add.graphics();

    // Sky gradient (draw vertical strips)
    const topColor = Phaser.Display.Color.HexStringToColor(c.sky.top);
    const bottomColor = Phaser.Display.Color.HexStringToColor(c.sky.bottom);
    for (let y = 0; y < 350; y++) {
      const t = y / 350;
      const r = Phaser.Math.Linear(topColor.red, bottomColor.red, t);
      const gr = Phaser.Math.Linear(topColor.green, bottomColor.green, t);
      const b = Phaser.Math.Linear(topColor.blue, bottomColor.blue, t);
      g.fillStyle(Phaser.Display.Color.GetColor(r, gr, b));
      g.fillRect(0, y, 800, 1);
    }

    // Far hills
    g.fillStyle(hexToInt(c.hills.far));
    this.drawHill(g, -50, 320, 300, 120);
    this.drawHill(g, 250, 300, 350, 140);
    this.drawHill(g, 600, 310, 300, 130);

    // Mid hills
    g.fillStyle(hexToInt(c.hills.mid));
    this.drawHill(g, 50, 360, 280, 110);
    this.drawHill(g, 350, 340, 320, 130);
    this.drawHill(g, 650, 350, 250, 120);

    // Near hill (the main center hill where the hammer sits)
    g.fillStyle(hexToInt(c.hills.near));
    this.drawHill(g, -100, 400, 1000, 160);

    // Ground fill below hills
    g.fillStyle(hexToInt(c.ground));
    g.fillRect(0, 500, 800, 100);

    // Grass line
    g.fillStyle(hexToInt(c.grass));
    g.fillRect(0, 495, 800, 8);
  }

  drawHill(graphics, x, y, width, height) {
    graphics.beginPath();
    graphics.moveTo(x, y + height);
    // Draw a smooth arc for the hill
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

  // === HOLES ===

  createHoles() {
    const c = this.colors;
    this.holeGraphics = this.add.graphics();

    HOLE_POSITIONS.forEach((pos) => {
      // Dark inside
      this.holeGraphics.fillStyle(hexToInt(c.hole.inside));
      this.holeGraphics.fillEllipse(pos.x, pos.y, HOLE_WIDTH, HOLE_HEIGHT);

      // Rim
      this.holeGraphics.lineStyle(3, hexToInt(c.hole.rim));
      this.holeGraphics.strokeEllipse(pos.x, pos.y, HOLE_WIDTH, HOLE_HEIGHT);
    });
  }

  // === MOLES ===

  createMoles() {
    const c = this.colors;

    HOLE_POSITIONS.forEach((pos, i) => {
      const container = this.add.container(pos.x, pos.y);

      // Mole body (hidden below hole initially)
      const body = this.add.graphics();
      this.drawMole(body, c);

      container.add(body);
      container.setVisible(false);

      // Mask: only show mole above the hole
      // We'll use y-position animation instead of masking for simplicity

      this.moles.push({
        container,
        pos,
        isUp: false,
        isHit: false,
        index: i,
      });
    });
  }

  drawMole(graphics, c) {
    // Body (rounded rectangle-ish shape)
    graphics.fillStyle(hexToInt(c.mole.body));
    graphics.fillEllipse(0, -20, MOLE_SIZE * 1.4, MOLE_SIZE * 1.8);

    // Cheeks
    graphics.fillStyle(hexToInt(c.mole.cheeks));
    graphics.fillCircle(-12, -14, 7);
    graphics.fillCircle(12, -14, 7);

    // Nose
    graphics.fillStyle(hexToInt(c.mole.nose));
    graphics.fillCircle(0, -18, 6);

    // Eyes
    graphics.fillStyle(0x2a2a3a);
    graphics.fillCircle(-8, -26, 4);
    graphics.fillCircle(8, -26, 4);

    // Eye shine
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(-6, -28, 2);
    graphics.fillCircle(10, -28, 2);
  }

  popUpMole() {
    // Find moles that are currently down
    const downMoles = this.moles.filter((m) => !m.isUp && !m.isHit);
    if (downMoles.length === 0) return;

    const mole = Phaser.Utils.Array.GetRandom(downMoles);
    mole.isUp = true;
    mole.isHit = false;
    mole.container.setVisible(true);
    mole.container.y = mole.pos.y + 30; // Start below
    mole.container.setScale(1);
    mole.container.setAlpha(1);

    // Pop up animation
    this.tweens.add({
      targets: mole.container,
      y: mole.pos.y - 20,
      duration: 200,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Stay up for a bit, then go back down
        this.time.delayedCall(Phaser.Math.Between(800, 2000), () => {
          if (!mole.isHit) {
            this.hideMole(mole);
          }
        });
      },
    });
  }

  hideMole(mole) {
    this.tweens.add({
      targets: mole.container,
      y: mole.pos.y + 30,
      duration: 200,
      ease: 'Quad.easeIn',
      onComplete: () => {
        mole.container.setVisible(false);
        mole.isUp = false;
        mole.isHit = false;
      },
    });
  }

  // === HAMMER ===

  createHammer() {
    const c = this.colors;
    this.hammerContainer = this.add.container(400, 200);

    const hammerGraphics = this.add.graphics();

    // Handle
    hammerGraphics.fillStyle(hexToInt(c.hammer.handle));
    hammerGraphics.fillRoundedRect(
      -HAMMER_HANDLE_W / 2,
      0,
      HAMMER_HANDLE_W,
      HAMMER_HANDLE_H,
      4
    );

    // Head
    hammerGraphics.fillStyle(hexToInt(c.hammer.head));
    hammerGraphics.fillRoundedRect(
      -HAMMER_HEAD_W / 2,
      -HAMMER_HEAD_H + 5,
      HAMMER_HEAD_W,
      HAMMER_HEAD_H,
      8
    );

    // Head highlight
    hammerGraphics.fillStyle(0xffffff, 0.25);
    hammerGraphics.fillRoundedRect(
      -HAMMER_HEAD_W / 2 + 5,
      -HAMMER_HEAD_H + 8,
      HAMMER_HEAD_W - 10,
      12,
      4
    );

    this.hammerContainer.add(hammerGraphics);
    this.hammerContainer.setDepth(100);

    // Pivot at bottom of handle for swing
    this.hammerContainer.setAngle(0);
  }

  smashHammer() {
    if (this.isSmashing || this.timeLeft <= 0) return;
    this.isSmashing = true;

    // Swing down
    this.tweens.add({
      targets: this.hammerContainer,
      angle: 0,
      y: 380,
      duration: 100,
      ease: 'Quad.easeIn',
      onComplete: () => {
        // Check hits
        this.checkHits();

        // Screen shake
        this.cameras.main.shake(80, 0.005);

        // Swing back up
        this.tweens.add({
          targets: this.hammerContainer,
          y: 200,
          duration: 300,
          ease: 'Back.easeOut',
          onComplete: () => {
            this.isSmashing = false;
          },
        });
      },
    });
  }

  checkHits() {
    const hammerX = this.hammerContainer.x;
    const hitRange = HAMMER_HEAD_W;

    this.moles.forEach((mole) => {
      if (mole.isUp && !mole.isHit) {
        const dist = Math.abs(mole.pos.x - hammerX);
        if (dist < hitRange) {
          mole.isHit = true;
          this.score += 10;
          this.updateScore();
          this.showHitEffect(mole);
        }
      }
    });
  }

  showHitEffect(mole) {
    const c = this.colors;

    // Squish the mole
    this.tweens.add({
      targets: mole.container,
      scaleY: 0.3,
      scaleX: 1.4,
      duration: 100,
      onComplete: () => {
        // Particles burst
        c.particles.forEach((color) => {
          for (let i = 0; i < 3; i++) {
            const star = this.add.star(
              mole.pos.x + Phaser.Math.Between(-20, 20),
              mole.pos.y - 30,
              5,
              4,
              10,
              hexToInt(color)
            );
            star.setDepth(99);
            this.tweens.add({
              targets: star,
              y: star.y - Phaser.Math.Between(40, 80),
              x: star.x + Phaser.Math.Between(-30, 30),
              alpha: 0,
              angle: Phaser.Math.Between(-180, 180),
              duration: 500,
              ease: 'Quad.easeOut',
              onComplete: () => star.destroy(),
            });
          }
        });

        // Score popup
        const popup = this.add.text(mole.pos.x, mole.pos.y - 40, '+10', {
          fontSize: '28px',
          fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
          color: '#FFD700',
          stroke: '#3A3A5C',
          strokeThickness: 4,
        }).setOrigin(0.5).setDepth(101);

        this.tweens.add({
          targets: popup,
          y: popup.y - 50,
          alpha: 0,
          duration: 600,
          ease: 'Quad.easeOut',
          onComplete: () => popup.destroy(),
        });

        // Hide mole
        this.time.delayedCall(200, () => {
          this.hideMole(mole);
        });
      },
    });
  }

  // === UI ===

  createUI() {
    const c = this.colors;

    // Score
    this.scoreText = this.add.text(20, 16, 'Score: 0', {
      fontSize: '28px',
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      color: c.ui.scoreText,
      stroke: c.ui.scoreShadow,
      strokeThickness: 4,
    }).setDepth(200);

    // Timer bar background
    this.timerBarBg = this.add.rectangle(400, 575, 760, 20, hexToInt(c.ui.timerBarBg))
      .setOrigin(0.5)
      .setDepth(200);

    // Timer bar
    this.timerBar = this.add.rectangle(24, 575, 752, 16, hexToInt(c.ui.timerBar))
      .setOrigin(0, 0.5)
      .setDepth(201);

    // Timer text
    this.timerText = this.add.text(780, 16, `${GAME_DURATION}s`, {
      fontSize: '28px',
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      color: c.ui.scoreText,
      stroke: c.ui.scoreShadow,
      strokeThickness: 4,
    }).setOrigin(1, 0).setDepth(200);
  }

  updateScore() {
    this.scoreText.setText(`Score: ${this.score}`);
  }

  // === TIMERS ===

  startMoleTimer() {
    this.moleEvent = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.popUpMole();
        // Speed up as time goes on
        const elapsed = GAME_DURATION - this.timeLeft;
        const newDelay = Math.max(400, 1000 - elapsed * 20);
        this.moleEvent.delay = newDelay;
      },
      loop: true,
    });
  }

  startGameTimer() {
    this.gameTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.timeLeft--;
        this.timerText.setText(`${this.timeLeft}s`);

        // Update timer bar
        const pct = this.timeLeft / GAME_DURATION;
        this.timerBar.width = 752 * pct;

        if (this.timeLeft <= 5) {
          this.timerBar.fillColor = hexToInt('#FF6B6B');
        }

        if (this.timeLeft <= 0) {
          this.endGame();
        }
      },
      repeat: GAME_DURATION - 1,
    });
  }

  endGame() {
    this.moleEvent.remove();

    // Hide all moles
    this.moles.forEach((m) => {
      if (m.isUp) this.hideMole(m);
    });

    // Game over overlay
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.5)
      .setDepth(300);

    const c = this.colors;

    this.add.text(400, 220, 'Time\'s Up!', {
      fontSize: '52px',
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      color: c.ui.scoreText,
      stroke: c.ui.scoreShadow,
      strokeThickness: 6,
    }).setOrigin(0.5).setDepth(301);

    this.add.text(400, 300, `Score: ${this.score}`, {
      fontSize: '40px',
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      color: '#FFD700',
      stroke: c.ui.scoreShadow,
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(301);

    const replay = this.add.text(400, 380, 'Click to play again!', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: c.ui.scoreText,
      stroke: c.ui.scoreShadow,
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(301);

    this.tweens.add({
      targets: replay,
      alpha: 0.5,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    this.input.once('pointerdown', () => {
      this.scene.restart();
    });
  }

  // === UPDATE LOOP ===

  update() {
    // Move hammer to follow mouse X
    if (this.hammerContainer && !this.isSmashing) {
      this.hammerContainer.x = Phaser.Math.Linear(
        this.hammerContainer.x,
        this.hammerX || 400,
        0.15
      );
    }
  }
}
