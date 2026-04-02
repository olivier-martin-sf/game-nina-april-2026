import Phaser from 'phaser';
import { getCurrentPalette, hexToInt } from '../utils/colors.js';
import { resumeAudio, playBonk, playWhoosh, playPop, playMiss, playCombo, playGameOver } from '../utils/sounds.js';

// Hole positions (x, y) — spread across the grassy foreground
const HOLE_POSITIONS = [
  { x: 150, y: 410 },
  { x: 330, y: 390 },
  { x: 510, y: 390 },
  { x: 690, y: 410 },
  { x: 240, y: 470 },
  { x: 420, y: 460 },
  { x: 600, y: 470 },
];

const HOLE_WIDTH = 74;
const HOLE_HEIGHT = 30;
const MOLE_BODY_W = 44;
const MOLE_BODY_H = 54;
const HAMMER_HEAD_W = 70;
const HAMMER_HEAD_H = 48;
const HAMMER_HANDLE_W = 14;
const HAMMER_HANDLE_H = 90;
const GAME_DURATION = 30;
const HAMMER_REST_Y = 180;
const HAMMER_SMASH_Y = 390;

export class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    this.colors = getCurrentPalette('grassyHills');
    this.score = 0;
    this.combo = 0;
    this.timeLeft = GAME_DURATION;
    this.isSmashing = false;
    this.moles = [];
    this.hammerX = 400;

    this.drawBackground();
    this.createHoleBacks();
    this.createMoles();
    this.createHoleFronts();
    this.createHammer();
    this.createUI();
    this.startMoleTimer();
    this.startGameTimer();

    this.input.on('pointermove', (pointer) => {
      this.hammerX = Phaser.Math.Clamp(pointer.x, 60, 740);
    });

    this.input.on('pointerdown', () => {
      resumeAudio();
      this.smashHammer();
    });
  }

  // ─── BACKGROUND ─────────────────────────────────────────

  drawBackground() {
    const c = this.colors;
    const g = this.add.graphics();

    // Sky gradient
    const top = Phaser.Display.Color.HexStringToColor(c.sky.top);
    const bot = Phaser.Display.Color.HexStringToColor(c.sky.bottom);
    for (let y = 0; y < 360; y++) {
      const t = y / 360;
      g.fillStyle(Phaser.Display.Color.GetColor(
        Phaser.Math.Linear(top.red, bot.red, t),
        Phaser.Math.Linear(top.green, bot.green, t),
        Phaser.Math.Linear(top.blue, bot.blue, t),
      ));
      g.fillRect(0, y, 800, 1);
    }

    // Cute clouds
    this.drawCloud(g, 120, 70, 1.0);
    this.drawCloud(g, 500, 50, 0.8);
    this.drawCloud(g, 700, 100, 0.6);

    // Far hills
    g.fillStyle(hexToInt(c.hills.far));
    this.drawHill(g, -50, 300, 300, 130);
    this.drawHill(g, 250, 280, 350, 150);
    this.drawHill(g, 600, 290, 300, 140);

    // Mid hills
    g.fillStyle(hexToInt(c.hills.mid));
    this.drawHill(g, 50, 340, 280, 120);
    this.drawHill(g, 350, 320, 320, 140);
    this.drawHill(g, 650, 330, 250, 130);

    // Near hill (main play area)
    g.fillStyle(hexToInt(c.hills.near));
    this.drawHill(g, -100, 370, 1000, 180);

    // Ground fill
    g.fillStyle(hexToInt(c.ground));
    g.fillRect(0, 510, 800, 90);

    // Grass tufts along the ground line
    g.fillStyle(hexToInt(c.grass));
    for (let x = 0; x < 820; x += 12) {
      const h = 6 + Math.sin(x * 0.3) * 3;
      g.fillTriangle(x, 510, x + 6, 510 - h, x + 12, 510);
    }
  }

  drawCloud(graphics, x, y, scale) {
    graphics.fillStyle(0xffffff, 0.7);
    graphics.fillCircle(x, y, 24 * scale);
    graphics.fillCircle(x + 22 * scale, y - 6 * scale, 20 * scale);
    graphics.fillCircle(x + 40 * scale, y, 18 * scale);
    graphics.fillCircle(x + 18 * scale, y + 5 * scale, 16 * scale);
  }

  drawHill(graphics, x, y, width, height) {
    graphics.beginPath();
    const steps = 40;
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

  // ─── HOLES (split into back + front for masking) ────────

  createHoleBacks() {
    const c = this.colors;
    const g = this.add.graphics();
    g.setDepth(5);

    HOLE_POSITIONS.forEach((pos) => {
      // Dark inside
      g.fillStyle(hexToInt(c.hole.inside));
      g.fillEllipse(pos.x, pos.y, HOLE_WIDTH, HOLE_HEIGHT);
    });
  }

  createHoleFronts() {
    // Draw the front lip of each hole ON TOP of moles to create masking effect
    const c = this.colors;

    HOLE_POSITIONS.forEach((pos) => {
      const front = this.add.graphics();
      front.setDepth(15);

      // Front dirt mound (half-ellipse covering bottom of hole)
      front.fillStyle(hexToInt(c.hills.near));
      front.fillEllipse(pos.x, pos.y + 10, HOLE_WIDTH + 16, 24);

      // Front rim line
      front.lineStyle(2, hexToInt(c.hole.rim), 0.6);
      front.beginPath();
      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        const angle = Math.PI * t;
        const rx = (HOLE_WIDTH / 2) * Math.cos(angle);
        const ry = (HOLE_HEIGHT / 2) * Math.sin(angle);
        if (i === 0) front.moveTo(pos.x + rx, pos.y + ry);
        else front.lineTo(pos.x + rx, pos.y + ry);
      }
      front.strokePath();
    });
  }

  // ─── MOLES ──────────────────────────────────────────────

  createMoles() {
    const c = this.colors;

    HOLE_POSITIONS.forEach((pos, i) => {
      const container = this.add.container(pos.x, pos.y + 30);
      container.setDepth(10);

      const body = this.add.graphics();
      this.drawMole(body, c);
      container.add(body);
      container.setVisible(false);

      this.moles.push({
        container,
        pos,
        isUp: false,
        isHit: false,
        hideTimer: null,
        index: i,
      });
    });
  }

  drawMole(g, c) {
    // Shadow under body
    g.fillStyle(0x000000, 0.1);
    g.fillEllipse(0, 2, MOLE_BODY_W + 4, MOLE_BODY_H);

    // Body
    g.fillStyle(hexToInt(c.mole.body));
    g.fillEllipse(0, -4, MOLE_BODY_W, MOLE_BODY_H);

    // Belly (lighter)
    g.fillStyle(hexToInt(c.mole.cheeks));
    g.fillEllipse(0, 6, MOLE_BODY_W - 14, MOLE_BODY_H - 20);

    // Ears
    g.fillStyle(hexToInt(c.mole.body));
    g.fillCircle(-16, -30, 8);
    g.fillCircle(16, -30, 8);
    // Inner ears
    g.fillStyle(hexToInt(c.mole.nose));
    g.fillCircle(-16, -30, 4);
    g.fillCircle(16, -30, 4);

    // Eyes (big cute eyes)
    // White
    g.fillStyle(0xffffff);
    g.fillCircle(-9, -20, 8);
    g.fillCircle(9, -20, 8);
    // Pupils
    g.fillStyle(0x2a2a3a);
    g.fillCircle(-8, -19, 5);
    g.fillCircle(10, -19, 5);
    // Shine
    g.fillStyle(0xffffff);
    g.fillCircle(-6, -22, 2.5);
    g.fillCircle(12, -22, 2.5);

    // Nose
    g.fillStyle(hexToInt(c.mole.nose));
    g.fillEllipse(0, -10, 10, 7);
    // Nose shine
    g.fillStyle(0xffffff, 0.4);
    g.fillCircle(-1, -12, 2);

    // Mouth
    g.lineStyle(2, 0x8B6F4E);
    g.beginPath();
    g.arc(0, -6, 5, 0, Math.PI, false);
    g.strokePath();

    // Cheeks
    g.fillStyle(hexToInt(c.mole.cheeks), 0.5);
    g.fillCircle(-16, -12, 6);
    g.fillCircle(16, -12, 6);

    // Little paws at the bottom
    g.fillStyle(hexToInt(c.mole.body));
    g.fillEllipse(-10, 20, 12, 8);
    g.fillEllipse(10, 20, 12, 8);
  }

  popUpMole() {
    const downMoles = this.moles.filter((m) => !m.isUp && !m.isHit);
    if (downMoles.length === 0) return;

    const mole = Phaser.Utils.Array.GetRandom(downMoles);
    mole.isUp = true;
    mole.isHit = false;
    mole.container.setVisible(true);
    mole.container.y = mole.pos.y + 30;
    mole.container.setScale(1);
    mole.container.setAlpha(1);

    playPop();

    // Pop up with spring
    this.tweens.add({
      targets: mole.container,
      y: mole.pos.y - 22,
      duration: 250,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Idle wobble
        this.tweens.add({
          targets: mole.container,
          y: mole.pos.y - 20,
          duration: 400,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });

        const stayTime = Phaser.Math.Between(700, 2200);
        mole.hideTimer = this.time.delayedCall(stayTime, () => {
          if (!mole.isHit && mole.isUp) {
            this.combo = 0;
            this.updateComboText();
            this.hideMole(mole);
          }
        });
      },
    });
  }

  hideMole(mole) {
    this.tweens.killTweensOf(mole.container);
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

  // ─── HAMMER ─────────────────────────────────────────────

  createHammer() {
    const c = this.colors;
    this.hammerContainer = this.add.container(400, HAMMER_REST_Y);
    this.hammerContainer.setDepth(100);

    const g = this.add.graphics();

    // Shadow on ground
    this.hammerShadow = this.add.ellipse(400, HAMMER_SMASH_Y + 10, 50, 14, 0x000000, 0.15);
    this.hammerShadow.setDepth(4);

    // Handle
    g.fillStyle(hexToInt(c.hammer.handle));
    g.fillRoundedRect(-HAMMER_HANDLE_W / 2, 0, HAMMER_HANDLE_W, HAMMER_HANDLE_H, 5);
    // Handle wood grain
    g.lineStyle(1, 0x000000, 0.08);
    for (let i = 10; i < HAMMER_HANDLE_H; i += 12) {
      g.lineBetween(-HAMMER_HANDLE_W / 2 + 3, i, HAMMER_HANDLE_W / 2 - 3, i);
    }

    // Head - main body
    g.fillStyle(hexToInt(c.hammer.head));
    g.fillRoundedRect(-HAMMER_HEAD_W / 2, -HAMMER_HEAD_H + 8, HAMMER_HEAD_W, HAMMER_HEAD_H, 10);

    // Head - darker bottom edge
    g.fillStyle(0x000000, 0.15);
    g.fillRoundedRect(-HAMMER_HEAD_W / 2, -HAMMER_HEAD_H + 8 + HAMMER_HEAD_H - 12, HAMMER_HEAD_W, 12, { tl: 0, tr: 0, bl: 10, br: 10 });

    // Head - top highlight
    g.fillStyle(0xffffff, 0.3);
    g.fillRoundedRect(-HAMMER_HEAD_W / 2 + 4, -HAMMER_HEAD_H + 12, HAMMER_HEAD_W - 8, 14, 6);

    // Head - side bands
    g.fillStyle(0x000000, 0.08);
    g.fillRect(-HAMMER_HEAD_W / 2 + 6, -HAMMER_HEAD_H + 10, 4, HAMMER_HEAD_H - 6);
    g.fillRect(HAMMER_HEAD_W / 2 - 10, -HAMMER_HEAD_H + 10, 4, HAMMER_HEAD_H - 6);

    this.hammerContainer.add(g);
  }

  smashHammer() {
    if (this.isSmashing || this.timeLeft <= 0) return;
    this.isSmashing = true;

    playWhoosh();

    // Quick swing down
    this.tweens.add({
      targets: this.hammerContainer,
      y: HAMMER_SMASH_Y,
      scaleX: 1.1,
      scaleY: 0.9,
      duration: 80,
      ease: 'Quad.easeIn',
      onComplete: () => {
        const didHit = this.checkHits();
        this.cameras.main.shake(80, 0.006);

        if (!didHit) {
          playMiss();
          this.showMissEffect();
          this.combo = 0;
          this.updateComboText();
        }

        // Bounce back up
        this.tweens.add({
          targets: this.hammerContainer,
          y: HAMMER_REST_Y,
          scaleX: 1,
          scaleY: 1,
          duration: 350,
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
    const hitRange = HAMMER_HEAD_W * 0.8;
    let hitAny = false;

    this.moles.forEach((mole) => {
      if (mole.isUp && !mole.isHit) {
        const dist = Math.abs(mole.pos.x - hammerX);
        if (dist < hitRange) {
          mole.isHit = true;
          if (mole.hideTimer) mole.hideTimer.remove();
          this.combo++;
          playBonk();
          if (this.combo > 1) playCombo(this.combo);
          const multiplier = Math.min(this.combo, 5);
          const points = 10 * multiplier;
          this.score += points;
          this.updateScore();
          this.updateComboText();
          this.showHitEffect(mole, points);
          hitAny = true;
        }
      }
    });

    return hitAny;
  }

  showHitEffect(mole, points) {
    const c = this.colors;

    // Kill any wobble tween
    this.tweens.killTweensOf(mole.container);

    // Squish mole
    this.tweens.add({
      targets: mole.container,
      scaleY: 0.25,
      scaleX: 1.5,
      y: mole.pos.y + 5,
      duration: 80,
      onComplete: () => {
        // Star burst
        c.particles.forEach((color) => {
          for (let i = 0; i < 4; i++) {
            const star = this.add.star(
              mole.pos.x + Phaser.Math.Between(-15, 15),
              mole.pos.y - 20,
              5, 4, 11, hexToInt(color),
            );
            star.setDepth(99);
            star.setAlpha(0.9);
            this.tweens.add({
              targets: star,
              y: star.y - Phaser.Math.Between(50, 100),
              x: star.x + Phaser.Math.Between(-40, 40),
              alpha: 0,
              angle: Phaser.Math.Between(-200, 200),
              scale: 0.3,
              duration: 600,
              ease: 'Quad.easeOut',
              onComplete: () => star.destroy(),
            });
          }
        });

        // Score popup with combo color
        const comboColors = ['#FFD700', '#FF9FF3', '#FF6B6B', '#77DD77', '#87CEEB'];
        const colorIdx = Math.min(this.combo - 1, comboColors.length - 1);
        const label = this.combo > 1 ? `+${points} x${this.combo}` : `+${points}`;

        const popup = this.add.text(mole.pos.x, mole.pos.y - 35, label, {
          fontSize: this.combo > 1 ? '32px' : '26px',
          fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
          color: comboColors[colorIdx],
          stroke: '#3A3A5C',
          strokeThickness: 4,
        }).setOrigin(0.5).setDepth(101);

        this.tweens.add({
          targets: popup,
          y: popup.y - 60,
          alpha: 0,
          scale: 1.3,
          duration: 700,
          ease: 'Quad.easeOut',
          onComplete: () => popup.destroy(),
        });

        this.time.delayedCall(150, () => this.hideMole(mole));
      },
    });
  }

  showMissEffect() {
    const x = this.hammerContainer.x;
    const y = HAMMER_SMASH_Y + 5;
    const c = this.colors;

    // Dust puffs
    for (let i = 0; i < 6; i++) {
      const puff = this.add.circle(
        x + Phaser.Math.Between(-25, 25),
        y + Phaser.Math.Between(-5, 5),
        Phaser.Math.Between(4, 10),
        hexToInt(c.ground), 0.6,
      );
      puff.setDepth(98);
      this.tweens.add({
        targets: puff,
        y: puff.y - Phaser.Math.Between(20, 50),
        x: puff.x + Phaser.Math.Between(-20, 20),
        alpha: 0,
        scale: 2,
        duration: 400,
        ease: 'Quad.easeOut',
        onComplete: () => puff.destroy(),
      });
    }
  }

  // ─── UI ─────────────────────────────────────────────────

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

    // Combo text
    this.comboText = this.add.text(400, 16, '', {
      fontSize: '22px',
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      color: '#FF9FF3',
      stroke: c.ui.scoreShadow,
      strokeThickness: 3,
    }).setOrigin(0.5, 0).setDepth(200);

    // Timer bar bg
    this.add.rectangle(400, 578, 760, 20, hexToInt(c.ui.timerBarBg))
      .setOrigin(0.5).setDepth(200);

    // Timer bar
    this.timerBar = this.add.rectangle(24, 578, 752, 16, hexToInt(c.ui.timerBar))
      .setOrigin(0, 0.5).setDepth(201);

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
    // Bounce effect
    this.tweens.add({
      targets: this.scoreText,
      scaleX: 1.2, scaleY: 1.2,
      duration: 80,
      yoyo: true,
      ease: 'Quad.easeOut',
    });
  }

  updateComboText() {
    if (this.combo > 1) {
      this.comboText.setText(`${this.combo}x Combo!`);
      this.tweens.add({
        targets: this.comboText,
        scaleX: 1.3, scaleY: 1.3,
        duration: 100,
        yoyo: true,
        ease: 'Back.easeOut',
      });
    } else {
      this.comboText.setText('');
    }
  }

  // ─── TIMERS ─────────────────────────────────────────────

  startMoleTimer() {
    this.moleEvent = this.time.addEvent({
      delay: 1200,
      callback: () => {
        this.popUpMole();
        // Occasionally pop two at once later in the game
        const elapsed = GAME_DURATION - this.timeLeft;
        if (elapsed > 10 && Math.random() < 0.3) {
          this.time.delayedCall(150, () => this.popUpMole());
        }
        const newDelay = Math.max(350, 1200 - elapsed * 25);
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

        const pct = this.timeLeft / GAME_DURATION;
        this.timerBar.width = 752 * pct;

        if (this.timeLeft <= 5) {
          this.timerBar.fillColor = hexToInt('#FF6B6B');
          // Pulse timer text
          this.tweens.add({
            targets: this.timerText,
            scaleX: 1.3, scaleY: 1.3,
            duration: 150,
            yoyo: true,
          });
        }

        if (this.timeLeft <= 0) {
          this.endGame();
        }
      },
      repeat: GAME_DURATION - 1,
    });
  }

  // ─── GAME OVER ──────────────────────────────────────────

  endGame() {
    this.moleEvent.remove();
    this.moles.forEach((m) => {
      if (m.hideTimer) m.hideTimer.remove();
      if (m.isUp) this.hideMole(m);
    });

    const c = this.colors;

    playGameOver();

    // Overlay
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0)
      .setDepth(300);
    this.tweens.add({ targets: overlay, fillAlpha: 0.5, duration: 400 });

    // Title
    const title = this.add.text(400, 200, "Time's Up!", {
      fontSize: '56px',
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      color: c.ui.scoreText,
      stroke: c.ui.scoreShadow,
      strokeThickness: 6,
    }).setOrigin(0.5).setDepth(301).setScale(0);

    this.tweens.add({
      targets: title,
      scale: 1,
      duration: 400,
      delay: 300,
      ease: 'Back.easeOut',
    });

    // Score
    const scoreLabel = this.add.text(400, 290, `Score: ${this.score}`, {
      fontSize: '44px',
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      color: '#FFD700',
      stroke: c.ui.scoreShadow,
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(301).setAlpha(0);

    this.tweens.add({
      targets: scoreLabel,
      alpha: 1, y: 280,
      duration: 400,
      delay: 600,
    });

    // Rating
    const rating = this.score >= 200 ? 'Amazing!' :
                   this.score >= 100 ? 'Great job!' :
                   this.score >= 50 ? 'Nice try!' : 'Keep practicing!';

    const ratingText = this.add.text(400, 340, rating, {
      fontSize: '28px',
      fontFamily: 'Arial, sans-serif',
      color: '#FF9FF3',
      stroke: c.ui.scoreShadow,
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(301).setAlpha(0);

    this.tweens.add({
      targets: ratingText,
      alpha: 1,
      duration: 400,
      delay: 900,
    });

    // Replay button
    const replay = this.add.text(400, 410, '[ Play Again ]', {
      fontSize: '26px',
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      color: c.ui.buttonBg,
      stroke: c.ui.scoreShadow,
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(301).setAlpha(0);

    this.tweens.add({
      targets: replay,
      alpha: 1,
      duration: 400,
      delay: 1200,
      onComplete: () => {
        this.tweens.add({
          targets: replay,
          scaleX: 1.05, scaleY: 1.05,
          duration: 600,
          yoyo: true,
          repeat: -1,
        });
        this.input.once('pointerdown', () => this.scene.restart());
      },
    });
  }

  // ─── UPDATE ─────────────────────────────────────────────

  update() {
    if (this.hammerContainer && !this.isSmashing) {
      this.hammerContainer.x = Phaser.Math.Linear(
        this.hammerContainer.x,
        this.hammerX,
        0.18,
      );
    }
    // Shadow follows hammer
    if (this.hammerShadow) {
      this.hammerShadow.x = this.hammerContainer.x;
    }
  }
}
