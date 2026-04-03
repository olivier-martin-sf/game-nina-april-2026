import Phaser from 'phaser';
import { getCurrentPalette, hexToInt } from '../utils/colors.js';
import { resumeAudio, playBonk, playWhoosh, playPop, playMiss, playCombo, playGameOver } from '../utils/sounds.js';

// Hole positions as fractions within the play area (x%) and screen (y%)
const HOLE_POSITIONS_PCT = [
  { x: 0.10, y: 0.65 },
  { x: 0.37, y: 0.62 },
  { x: 0.63, y: 0.62 },
  { x: 0.90, y: 0.65 },
  { x: 0.22, y: 0.76 },
  { x: 0.50, y: 0.75 },
  { x: 0.78, y: 0.76 },
];

const MAX_PLAY_WIDTH = 700;

const HOLE_WIDTH = 74;
const HOLE_HEIGHT = 30;
const MOLE_BODY_W = 44;
const MOLE_BODY_H = 54;
const HAMMER_HEAD_W = 70;
const HAMMER_HEAD_H = 48;
const HAMMER_HANDLE_W = 14;
const HAMMER_HANDLE_H = 90;
const GAME_DURATION = 45;

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

    const W = this.cameras.main.width;
    const H = this.cameras.main.height;
    this.W = W;
    this.H = H;

    // Cap play area width so holes stay reachable on wide screens
    this.playWidth = Math.min(W, MAX_PLAY_WIDTH);
    this.playLeft = (W - this.playWidth) / 2;

    this.holePositions = HOLE_POSITIONS_PCT.map(p => ({
      x: Math.round(this.playLeft + p.x * this.playWidth),
      y: Math.round(p.y * H),
    }));

    // Hammer rests at the top, drops down on click
    this.hammerRestY = H * 0.08;
    this.hammerSmashY = H * 0.52; // pivot drops to here, then head rotates to hit moles
    this.hammerX = W / 2;

    this.drawBackground();
    this.createHoleBacks();
    this.createMoles();
    this.createHoleFronts();
    this.createHammer();
    this.createUI();
    this.startMoleTimer();
    this.startGameTimer();

    this.input.on('pointermove', (pointer) => {
      this.hammerX = Phaser.Math.Clamp(pointer.x, this.playLeft + 30, this.playLeft + this.playWidth - 30);
    });

    this.input.on('pointerdown', () => {
      resumeAudio();
      this.smashHammer();
    });
  }

  // ─── BACKGROUND ─────────────────────────────────────────

  drawBackground() {
    const c = this.colors;
    const W = this.W;
    const H = this.H;
    const g = this.add.graphics();

    // Sky gradient
    const skyH = H * 0.6;
    const top = Phaser.Display.Color.HexStringToColor(c.sky.top);
    const bot = Phaser.Display.Color.HexStringToColor(c.sky.bottom);
    for (let y = 0; y < skyH; y++) {
      const t = y / skyH;
      g.fillStyle(Phaser.Display.Color.GetColor(
        Phaser.Math.Linear(top.red, bot.red, t),
        Phaser.Math.Linear(top.green, bot.green, t),
        Phaser.Math.Linear(top.blue, bot.blue, t),
      ));
      g.fillRect(0, y, W, 1);
    }

    // Clouds
    this.drawCloud(g, W * 0.15, H * 0.1, 1.0);
    this.drawCloud(g, W * 0.6, H * 0.07, 0.8);
    this.drawCloud(g, W * 0.85, H * 0.15, 0.6);

    // Far hills
    g.fillStyle(hexToInt(c.hills.far));
    this.drawHill(g, -W * 0.06, H * 0.48, W * 0.38, H * 0.22);
    this.drawHill(g, W * 0.31, H * 0.45, W * 0.44, H * 0.25);
    this.drawHill(g, W * 0.75, H * 0.47, W * 0.38, H * 0.23);

    // Mid hills
    g.fillStyle(hexToInt(c.hills.mid));
    this.drawHill(g, W * 0.06, H * 0.55, W * 0.35, H * 0.2);
    this.drawHill(g, W * 0.44, H * 0.52, W * 0.4, H * 0.22);
    this.drawHill(g, W * 0.81, H * 0.54, W * 0.31, H * 0.2);

    // Near hill (main play area)
    g.fillStyle(hexToInt(c.hills.near));
    this.drawHill(g, -W * 0.12, H * 0.6, W * 1.25, H * 0.3);

    // Ground fill
    g.fillStyle(hexToInt(c.ground));
    g.fillRect(0, H * 0.85, W, H * 0.15);

    // Grass tufts
    g.fillStyle(hexToInt(c.grass));
    for (let x = 0; x < W + 20; x += 12) {
      const h = 6 + Math.sin(x * 0.3) * 3;
      g.fillTriangle(x, H * 0.85, x + 6, H * 0.85 - h, x + 12, H * 0.85);
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

  // ─── HOLES ──────────────────────────────────────────────

  createHoleBacks() {
    const c = this.colors;
    const g = this.add.graphics();
    g.setDepth(5);

    this.holePositions.forEach((pos) => {
      g.fillStyle(hexToInt(c.hole.inside));
      g.fillEllipse(pos.x, pos.y, HOLE_WIDTH, HOLE_HEIGHT);
    });
  }

  createHoleFronts() {
    const c = this.colors;

    this.holePositions.forEach((pos) => {
      const front = this.add.graphics();
      front.setDepth(15);

      front.fillStyle(hexToInt(c.hills.near));
      front.fillEllipse(pos.x, pos.y + 10, HOLE_WIDTH + 16, 24);

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

    this.holePositions.forEach((pos, i) => {
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
    g.fillStyle(0x000000, 0.1);
    g.fillEllipse(0, 2, MOLE_BODY_W + 4, MOLE_BODY_H);

    g.fillStyle(hexToInt(c.mole.body));
    g.fillEllipse(0, -4, MOLE_BODY_W, MOLE_BODY_H);

    g.fillStyle(hexToInt(c.mole.cheeks));
    g.fillEllipse(0, 6, MOLE_BODY_W - 14, MOLE_BODY_H - 20);

    g.fillStyle(hexToInt(c.mole.body));
    g.fillCircle(-16, -30, 8);
    g.fillCircle(16, -30, 8);
    g.fillStyle(hexToInt(c.mole.nose));
    g.fillCircle(-16, -30, 4);
    g.fillCircle(16, -30, 4);

    g.fillStyle(0xffffff);
    g.fillCircle(-9, -20, 8);
    g.fillCircle(9, -20, 8);
    g.fillStyle(0x2a2a3a);
    g.fillCircle(-8, -19, 5);
    g.fillCircle(10, -19, 5);
    g.fillStyle(0xffffff);
    g.fillCircle(-6, -22, 2.5);
    g.fillCircle(12, -22, 2.5);

    g.fillStyle(hexToInt(c.mole.nose));
    g.fillEllipse(0, -10, 10, 7);
    g.fillStyle(0xffffff, 0.4);
    g.fillCircle(-1, -12, 2);

    g.lineStyle(2, 0x8B6F4E);
    g.beginPath();
    g.arc(0, -6, 5, 0, Math.PI, false);
    g.strokePath();

    g.fillStyle(hexToInt(c.mole.cheeks), 0.5);
    g.fillCircle(-16, -12, 6);
    g.fillCircle(16, -12, 6);

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

    this.tweens.add({
      targets: mole.container,
      y: mole.pos.y - 22,
      duration: 250,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: mole.container,
          y: mole.pos.y - 20,
          duration: 400,
          yoyo: true, repeat: -1,
          ease: 'Sine.easeInOut',
        });

        const stayTime = Phaser.Math.Between(2000, 4000);
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

    // Aiming target on the ground — always visible, follows hammer X
    this.aimTarget = this.add.container(this.W / 2, this.H * 0.68);
    this.aimTarget.setDepth(3);
    const aimGfx = this.add.graphics();
    // Soft glowing circle
    aimGfx.fillStyle(0xFFD700, 0.12);
    aimGfx.fillCircle(0, 0, 32);
    aimGfx.lineStyle(2.5, 0xFFD700, 0.35);
    aimGfx.strokeCircle(0, 0, 28);
    aimGfx.lineStyle(1.5, 0xFFD700, 0.2);
    aimGfx.lineBetween(-14, 0, 14, 0);
    aimGfx.lineBetween(0, -14, 0, 14);
    this.aimTarget.add(aimGfx);

    // Pulse the aim target gently
    this.tweens.add({
      targets: this.aimTarget,
      scaleX: 1.1, scaleY: 1.1,
      duration: 800,
      yoyo: true, repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Impact shadow (grows when hammer drops)
    this.hammerShadow = this.add.ellipse(this.W / 2, this.H * 0.70, 50, 14, 0x000000, 0.05);
    this.hammerShadow.setDepth(4);

    // Hammer container — pivot at TOP of handle (grip point)
    // Starts at the top of the screen
    this.hammerContainer = this.add.container(this.W / 2, this.hammerRestY);
    this.hammerContainer.setDepth(100);

    const g = this.add.graphics();

    // Handle — drawn downward from origin (grip at 0,0)
    g.fillStyle(hexToInt(c.hammer.handle));
    g.fillRoundedRect(-HAMMER_HANDLE_W / 2, 0, HAMMER_HANDLE_W, HAMMER_HANDLE_H, 5);
    g.lineStyle(1, 0x000000, 0.08);
    for (let i = 10; i < HAMMER_HANDLE_H; i += 12) {
      g.lineBetween(-HAMMER_HANDLE_W / 2 + 3, i, HAMMER_HANDLE_W / 2 - 3, i);
    }

    // Head — at BOTTOM of handle (this is what hits the moles)
    const headY = HAMMER_HANDLE_H - 4;
    g.fillStyle(hexToInt(c.hammer.head));
    g.fillRoundedRect(-HAMMER_HEAD_W / 2, headY, HAMMER_HEAD_W, HAMMER_HEAD_H, 10);

    // Head top highlight
    g.fillStyle(0xffffff, 0.3);
    g.fillRoundedRect(-HAMMER_HEAD_W / 2 + 4, headY + 4, HAMMER_HEAD_W - 8, 14, 6);

    // Head bottom darker edge
    g.fillStyle(0x000000, 0.15);
    g.fillRoundedRect(-HAMMER_HEAD_W / 2, headY + HAMMER_HEAD_H - 12, HAMMER_HEAD_W, 12, { tl: 0, tr: 0, bl: 10, br: 10 });

    // Head side bands
    g.fillStyle(0x000000, 0.08);
    g.fillRect(-HAMMER_HEAD_W / 2 + 6, headY + 4, 4, HAMMER_HEAD_H - 8);
    g.fillRect(HAMMER_HEAD_W / 2 - 10, headY + 4, 4, HAMMER_HEAD_H - 8);

    this.hammerContainer.add(g);

    // Rest pose: upright at top of screen
    this.hammerContainer.setAngle(0);
  }

  smashHammer() {
    if (this.isSmashing || this.timeLeft <= 0) return;
    this.isSmashing = true;

    playWhoosh();

    // Phase 1: Drop straight down from top to near the moles
    this.tweens.add({
      targets: this.hammerContainer,
      y: this.hammerSmashY,
      duration: 120,
      ease: 'Quad.easeIn',
      onComplete: () => {
        // Phase 2: Quick rotation to smash (head swings forward)
        this.tweens.add({
          targets: this.hammerContainer,
          angle: 25,
          scaleX: 1.1, scaleY: 0.95,
          duration: 60,
          ease: 'Quad.easeIn',
          onComplete: () => {
            // Impact!
            const didHit = this.checkHits();
            this.cameras.main.shake(80, 0.006);

            if (!didHit) {
              playMiss();
              this.showMissEffect();
              this.combo = 0;
              this.updateComboText();
            }

            // Phase 3: Rise back up
            this.tweens.add({
              targets: this.hammerContainer,
              y: this.hammerRestY,
              angle: 0,
              scaleX: 1, scaleY: 1,
              duration: 400,
              ease: 'Back.easeOut',
              onComplete: () => {
                this.isSmashing = false;
              },
            });
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
    this.tweens.killTweensOf(mole.container);

    this.tweens.add({
      targets: mole.container,
      scaleY: 0.25, scaleX: 1.5,
      y: mole.pos.y + 5,
      duration: 80,
      onComplete: () => {
        c.particles.forEach((color) => {
          for (let i = 0; i < 4; i++) {
            const star = this.add.star(
              mole.pos.x + Phaser.Math.Between(-15, 15),
              mole.pos.y - 20,
              5, 4, 11, hexToInt(color),
            );
            star.setDepth(99).setAlpha(0.9);
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
          alpha: 0, scale: 1.3,
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
    const y = this.H * 0.70;
    const c = this.colors;

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
        alpha: 0, scale: 2,
        duration: 400,
        ease: 'Quad.easeOut',
        onComplete: () => puff.destroy(),
      });
    }
  }

  // ─── UI ─────────────────────────────────────────────────

  createUI() {
    const c = this.colors;
    const W = this.W;
    const H = this.H;

    this.scoreText = this.add.text(20, 16, 'Score: 0', {
      fontSize: '28px',
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      color: c.ui.scoreText,
      stroke: c.ui.scoreShadow,
      strokeThickness: 4,
    }).setDepth(200);

    this.comboText = this.add.text(W / 2, 16, '', {
      fontSize: '22px',
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      color: '#FF9FF3',
      stroke: c.ui.scoreShadow,
      strokeThickness: 3,
    }).setOrigin(0.5, 0).setDepth(200);

    const barW = W - 48;
    this.add.rectangle(W / 2, H - 22, barW + 8, 20, hexToInt(c.ui.timerBarBg))
      .setOrigin(0.5).setDepth(200);

    this.timerBar = this.add.rectangle(24, H - 22, barW, 16, hexToInt(c.ui.timerBar))
      .setOrigin(0, 0.5).setDepth(201);
    this.timerBarFullW = barW;

    this.timerText = this.add.text(W - 20, 16, `${GAME_DURATION}s`, {
      fontSize: '28px',
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      color: c.ui.scoreText,
      stroke: c.ui.scoreShadow,
      strokeThickness: 4,
    }).setOrigin(1, 0).setDepth(200);
  }

  updateScore() {
    this.scoreText.setText(`Score: ${this.score}`);
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
      delay: 2500,
      callback: () => {
        this.popUpMole();
        const elapsed = GAME_DURATION - this.timeLeft;
        if (elapsed > 25 && Math.random() < 0.15) {
          this.time.delayedCall(300, () => this.popUpMole());
        }
        const newDelay = Math.max(1200, 2500 - elapsed * 15);
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
        this.timerBar.width = this.timerBarFullW * pct;

        if (this.timeLeft <= 5) {
          this.timerBar.fillColor = hexToInt('#FF6B6B');
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

    playGameOver();

    const c = this.colors;
    const W = this.W;
    const H = this.H;
    const cx = W / 2;

    const overlay = this.add.rectangle(cx, H / 2, W, H, 0x000000, 0).setDepth(300);
    this.tweens.add({ targets: overlay, fillAlpha: 0.5, duration: 400 });

    const title = this.add.text(cx, H * 0.33, "Time's Up!", {
      fontSize: '56px',
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      color: c.ui.scoreText,
      stroke: c.ui.scoreShadow,
      strokeThickness: 6,
    }).setOrigin(0.5).setDepth(301).setScale(0);

    this.tweens.add({
      targets: title, scale: 1,
      duration: 400, delay: 300,
      ease: 'Back.easeOut',
    });

    const scoreLabel = this.add.text(cx, H * 0.48, `Score: ${this.score}`, {
      fontSize: '44px',
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      color: '#FFD700',
      stroke: c.ui.scoreShadow,
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(301).setAlpha(0);

    this.tweens.add({
      targets: scoreLabel,
      alpha: 1, y: H * 0.46,
      duration: 400, delay: 600,
    });

    const rating = this.score >= 150 ? 'Amazing!' :
                   this.score >= 80 ? 'Great job!' :
                   this.score >= 30 ? 'Nice try!' : 'Keep practicing!';

    const ratingText = this.add.text(cx, H * 0.56, rating, {
      fontSize: '28px',
      fontFamily: 'Arial, sans-serif',
      color: '#FF9FF3',
      stroke: c.ui.scoreShadow,
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(301).setAlpha(0);

    this.tweens.add({
      targets: ratingText, alpha: 1,
      duration: 400, delay: 900,
    });

    const replay = this.add.text(cx, H * 0.67, '[ Play Again ]', {
      fontSize: '26px',
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      color: c.ui.buttonBg,
      stroke: c.ui.scoreShadow,
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(301).setAlpha(0);

    this.tweens.add({
      targets: replay, alpha: 1,
      duration: 400, delay: 1200,
      onComplete: () => {
        this.tweens.add({
          targets: replay,
          scaleX: 1.05, scaleY: 1.05,
          duration: 600,
          yoyo: true, repeat: -1,
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

    // Aim target follows hammer X at mole level
    if (this.aimTarget) {
      this.aimTarget.x = this.hammerContainer.x;
    }

    // Impact shadow — grows as hammer drops closer to ground
    if (this.hammerShadow) {
      this.hammerShadow.x = this.hammerContainer.x;
      const drop = (this.hammerContainer.y - this.hammerRestY) / (this.hammerSmashY - this.hammerRestY);
      const p = Phaser.Math.Clamp(drop, 0, 1);
      this.hammerShadow.setAlpha(0.05 + 0.25 * p);
      this.hammerShadow.setScale(0.4 + 0.8 * p);
    }
  }
}
