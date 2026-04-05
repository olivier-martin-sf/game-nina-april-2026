import Phaser from 'phaser';
import { getCurrentPalette, hexToInt } from '../utils/colors.js';
import { resumeAudio, playBonk, playWhoosh, playPop, playMiss, playCombo, playGameOver } from '../utils/sounds.js';

// Hole positions — spread across the sandy area
const HOLE_POSITIONS_PCT = [
  { x: 0.12, y: 0.58 },
  { x: 0.38, y: 0.55 },
  { x: 0.62, y: 0.55 },
  { x: 0.88, y: 0.58 },
  { x: 0.24, y: 0.68 },
  { x: 0.50, y: 0.67 },
  { x: 0.76, y: 0.68 },
];

const MAX_PLAY_WIDTH = 700;
const HOLE_WIDTH = 100;
const HOLE_HEIGHT = 36;
const MOLE_SCALE = 0.7;
const RATTLE_SCALE = 0.8;
const GAME_DURATION = 60;

export class BeachGameScene extends Phaser.Scene {
  constructor() {
    super('BeachGame');
  }

  create() {
    this.colors = getCurrentPalette('beachOcean');
    this.score = 0;
    this.combo = 0;
    this.timeLeft = GAME_DURATION;
    this.isPushing = false;
    this.moles = [];

    const W = this.cameras.main.width;
    const H = this.cameras.main.height;
    this.W = W;
    this.H = H;

    this.playWidth = Math.min(W, MAX_PLAY_WIDTH);
    this.playLeft = (W - this.playWidth) / 2;

    this.holePositions = HOLE_POSITIONS_PCT.map(p => ({
      x: Math.round(this.playLeft + p.x * this.playWidth),
      y: Math.round(p.y * H),
    }));

    this.rattleX = W / 2;

    this.drawBackground();
    this.drawOcean();
    this.createHoleBacks();
    this.createMoles();
    this.createHoleFronts();
    this.createRattle();
    this.createUI();
    this.startMoleTimer();
    this.startGameTimer();

    this.input.on('pointermove', (pointer) => {
      this.rattleX = Phaser.Math.Clamp(pointer.x, this.playLeft + 30, this.playLeft + this.playWidth - 30);
    });

    this.input.on('pointerdown', () => {
      resumeAudio();
      this.pushRattle();
    });
  }

  // ─── BACKGROUND ─────────────────────────────────────────

  drawBackground() {
    const c = this.colors;
    const W = this.W;
    const H = this.H;
    const g = this.add.graphics();

    // Sky gradient
    const skyH = H * 0.35;
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
    this.drawCloud(g, W * 0.12, H * 0.08, 1.0);
    this.drawCloud(g, W * 0.55, H * 0.05, 0.7);
    this.drawCloud(g, W * 0.82, H * 0.1, 0.85);

    // Sand area — fills bottom portion
    g.fillStyle(hexToInt(c.sand.dry));
    g.fillRect(0, H * 0.45, W, H * 0.55);

    // Wet sand near shore
    g.fillStyle(hexToInt(c.sand.wet));
    g.fillRect(0, H * 0.45, W, H * 0.08);

    // Sand texture — little dots
    g.fillStyle(hexToInt(c.sand.dark), 0.15);
    for (let i = 0; i < 60; i++) {
      const sx = Math.random() * W;
      const sy = H * 0.50 + Math.random() * H * 0.45;
      g.fillCircle(sx, sy, 1 + Math.random() * 1.5);
    }

    // Shells scattered on sand
    this.drawShell(g, W * 0.15, H * 0.82, 0.8);
    this.drawShell(g, W * 0.72, H * 0.78, 0.6);
    this.drawShell(g, W * 0.45, H * 0.88, 1.0);
    this.drawShell(g, W * 0.88, H * 0.85, 0.7);
  }

  drawOcean() {
    const c = this.colors;
    const W = this.W;
    const H = this.H;

    // Ocean fills between sky and sand
    const oceanG = this.add.graphics();
    oceanG.setDepth(0);

    // Deep ocean
    oceanG.fillStyle(hexToInt(c.ocean.deep));
    oceanG.fillRect(0, H * 0.28, W, H * 0.20);

    // Mid ocean
    oceanG.fillStyle(hexToInt(c.ocean.mid));
    oceanG.fillRect(0, H * 0.36, W, H * 0.10);

    // Shore water
    oceanG.fillStyle(hexToInt(c.ocean.shore));
    oceanG.fillRect(0, H * 0.42, W, H * 0.05);

    // Foam line (wavy)
    oceanG.fillStyle(hexToInt(c.ocean.foam), 0.8);
    oceanG.beginPath();
    oceanG.moveTo(0, H * 0.46);
    for (let x = 0; x <= W; x += 8) {
      const wy = H * 0.455 + Math.sin(x * 0.04) * 3 + Math.sin(x * 0.02) * 2;
      oceanG.lineTo(x, wy);
    }
    oceanG.lineTo(W, H * 0.48);
    oceanG.lineTo(0, H * 0.48);
    oceanG.closePath();
    oceanG.fillPath();

    // Animate waves by adding a moving foam overlay
    this.foamLine = this.add.graphics();
    this.foamLine.setDepth(1);
    this.waveOffset = 0;
  }

  drawCloud(graphics, x, y, scale) {
    graphics.fillStyle(0xffffff, 0.7);
    graphics.fillCircle(x, y, 24 * scale);
    graphics.fillCircle(x + 22 * scale, y - 6 * scale, 20 * scale);
    graphics.fillCircle(x + 40 * scale, y, 18 * scale);
    graphics.fillCircle(x + 18 * scale, y + 5 * scale, 16 * scale);
  }

  drawShell(g, x, y, scale) {
    g.fillStyle(0xFFE4C4, 0.6);
    g.fillEllipse(x, y, 8 * scale, 6 * scale);
    g.lineStyle(1, 0xDEB887, 0.4);
    g.strokeEllipse(x, y, 8 * scale, 6 * scale);
  }

  // ─── HOLES ──────────────────────────────────────────────

  createHoleBacks() {
    const c = this.colors;
    this.holePositions.forEach((pos) => {
      const g = this.add.graphics();
      g.setDepth(5);

      // Dark sand hole interior
      g.fillStyle(hexToInt(c.hole.inside));
      g.fillEllipse(pos.x, pos.y, HOLE_WIDTH, HOLE_HEIGHT);

      // Lighter inner ring
      g.fillStyle(hexToInt(c.hole.inside), 0.6);
      g.fillEllipse(pos.x, pos.y - 1, HOLE_WIDTH - 8, HOLE_HEIGHT - 4);
    });
  }

  createHoleFronts() {
    const c = this.colors;
    this.holePositions.forEach((pos) => {
      const front = this.add.graphics();
      front.setDepth(15);

      // Sand mound shadow
      front.fillStyle(0x000000, 0.06);
      front.fillEllipse(pos.x, pos.y + 14, HOLE_WIDTH + 28, 28);

      // Sand mound
      front.fillStyle(hexToInt(c.sand.dry));
      front.fillEllipse(pos.x, pos.y + 10, HOLE_WIDTH + 22, 24);

      // Lighter sand highlight
      front.fillStyle(hexToInt(c.sand.dry), 0.7);
      front.fillEllipse(pos.x, pos.y + 7, HOLE_WIDTH + 10, 14);

      // Sand grains on mound
      front.fillStyle(hexToInt(c.sand.dark), 0.25);
      front.fillCircle(pos.x - 18, pos.y + 10, 2);
      front.fillCircle(pos.x + 22, pos.y + 12, 1.5);
      front.fillCircle(pos.x - 6, pos.y + 14, 1.8);
      front.fillCircle(pos.x + 12, pos.y + 8, 2);

      // Sand fill below to clip mole
      front.fillStyle(hexToInt(c.sand.dry));
      front.fillRect(pos.x - HOLE_WIDTH / 2 - 20, pos.y + 18, HOLE_WIDTH + 40, 40);

      // Rim arc
      front.lineStyle(2, hexToInt(c.hole.rim), 0.4);
      front.beginPath();
      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        const angle = Math.PI + Math.PI * t;
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
    this.holePositions.forEach((pos, i) => {
      const sprite = this.add.sprite(pos.x, pos.y + 30, 'mole', 0);
      sprite.setDepth(10);
      sprite.setScale(MOLE_SCALE);
      sprite.setVisible(false);

      // Geometry mask at hole line
      const maskGraphics = this.make.graphics({ x: 0, y: 0 });
      maskGraphics.fillStyle(0xffffff);
      maskGraphics.fillRect(
        pos.x - HOLE_WIDTH,
        0,
        HOLE_WIDTH * 2,
        pos.y + HOLE_HEIGHT / 2 - 2,
      );
      const mask = maskGraphics.createGeometryMask();
      sprite.setMask(mask);

      this.moles.push({
        container: sprite,
        pos,
        isUp: false,
        isHit: false,
        hideTimer: null,
        index: i,
        mask,
        maskGraphics,
      });
    });
  }

  popUpMole() {
    const downMoles = this.moles.filter((m) => !m.isUp && !m.isHit);
    if (downMoles.length === 0) return;

    const mole = Phaser.Utils.Array.GetRandom(downMoles);
    mole.isUp = true;
    mole.isHit = false;

    mole.container.setVisible(true);
    mole.container.y = mole.pos.y + 30;
    mole.container.setScale(MOLE_SCALE);
    mole.container.setAlpha(1);
    mole.container.setFrame(0);

    playPop();

    // Sand burst on emerge
    this.spawnSandPuff(mole.pos.x, mole.pos.y, 4);

    this.tweens.add({
      targets: mole.container,
      y: mole.pos.y - 22,
      duration: 350,
      ease: 'Back.easeOut',
      onComplete: () => {
        mole.container.setFrame(1);

        this.tweens.add({
          targets: mole.container,
          y: mole.pos.y - 20,
          duration: 400,
          yoyo: true, repeat: -1,
          ease: 'Sine.easeInOut',
        });

        const stayTime = Phaser.Math.Between(3000, 5500);
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
    if (!mole.isHit) {
      mole.container.setFrame(0);
    }
    this.tweens.add({
      targets: mole.container,
      y: mole.pos.y + 30,
      scaleX: MOLE_SCALE,
      scaleY: MOLE_SCALE,
      duration: 200,
      ease: 'Quad.easeIn',
      onComplete: () => {
        mole.container.setVisible(false);
        mole.container.setFrame(0);
        mole.isUp = false;
        mole.isHit = false;
      },
    });
  }

  spawnSandPuff(x, y, count) {
    const c = this.colors;
    for (let i = 0; i < count; i++) {
      const puff = this.add.circle(
        x + Phaser.Math.Between(-20, 20),
        y + Phaser.Math.Between(-5, 5),
        Phaser.Math.Between(3, 8),
        hexToInt(c.sand.dark), 0.5,
      );
      puff.setDepth(98);
      this.tweens.add({
        targets: puff,
        y: puff.y - Phaser.Math.Between(15, 40),
        x: puff.x + Phaser.Math.Between(-15, 15),
        alpha: 0, scale: 1.8,
        duration: 400,
        ease: 'Quad.easeOut',
        onComplete: () => puff.destroy(),
      });
    }
  }

  // ─── RATTLE ─────────────────────────────────────────────

  createRattle() {
    const c = this.colors;

    // Aiming shadow on the sand
    this.aimTarget = this.add.container(this.W / 2, this.H * 0.60);
    this.aimTarget.setDepth(16);
    const aimGfx = this.add.graphics();
    aimGfx.fillStyle(hexToInt(c.rattle.head), 0.10);
    aimGfx.fillCircle(0, 0, 30);
    aimGfx.lineStyle(2, hexToInt(c.rattle.head), 0.25);
    aimGfx.strokeCircle(0, 0, 26);
    this.aimTarget.add(aimGfx);

    this.tweens.add({
      targets: this.aimTarget,
      scaleX: 1.08, scaleY: 1.08,
      duration: 800,
      yoyo: true, repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Push shadow
    this.rattleShadow = this.add.ellipse(this.W / 2, this.H * 0.62, 40, 12, 0x000000, 0.05);
    this.rattleShadow.setDepth(17);

    // Rattle sprite — resting at bottom of screen, facing player
    this.rattleSprite = this.add.sprite(this.W / 2, this.H * 0.88, 'rattle', 0);
    this.rattleSprite.setScale(RATTLE_SCALE);
    this.rattleSprite.setDepth(100);
  }

  pushRattle() {
    if (this.isPushing || this.timeLeft <= 0) return;
    this.isPushing = true;

    playWhoosh();

    // Phase 1: Quick push forward — rattle moves up (toward moles / away from player)
    this.rattleSprite.setFrame(1);
    this.tweens.add({
      targets: this.rattleSprite,
      y: this.H * 0.55,
      scaleX: RATTLE_SCALE * 0.85,
      scaleY: RATTLE_SCALE * 1.1,
      duration: 100,
      ease: 'Quad.easeIn',
      onComplete: () => {
        // Phase 2: Impact
        this.rattleSprite.setFrame(2);
        const didHit = this.checkHits();
        this.cameras.main.shake(60, 0.004);

        if (!didHit) {
          playMiss();
          this.spawnSandPuff(this.rattleSprite.x, this.H * 0.58, 5);
          this.combo = 0;
          this.updateComboText();
        }

        // Phase 3: Return to rest
        this.tweens.add({
          targets: this.rattleSprite,
          y: this.H * 0.88,
          scaleX: RATTLE_SCALE,
          scaleY: RATTLE_SCALE,
          duration: 350,
          delay: 60,
          ease: 'Back.easeOut',
          onComplete: () => {
            this.rattleSprite.setFrame(0);
            this.isPushing = false;
          },
        });
      },
    });
  }

  checkHits() {
    const rattleX = this.rattleSprite.x;
    const hitRange = 60;
    let hitAny = false;

    this.moles.forEach((mole) => {
      if (mole.isUp && !mole.isHit) {
        const dist = Math.abs(mole.pos.x - rattleX);
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
          this.showPushEffect(mole, points);
          hitAny = true;
        }
      }
    });
    return hitAny;
  }

  showPushEffect(mole, points) {
    const c = this.colors;
    this.tweens.killTweensOf(mole.container);

    // Mole gets pushed away — shrinks toward the ocean (perspective push)
    mole.container.setFrame(2); // whacked frame

    // Sand burst at impact point
    this.spawnSandPuff(mole.pos.x, mole.pos.y, 6);

    this.tweens.add({
      targets: mole.container,
      scaleX: MOLE_SCALE * 0.4,
      scaleY: MOLE_SCALE * 0.4,
      y: mole.pos.y - 80,
      alpha: 0.3,
      duration: 400,
      ease: 'Quad.easeOut',
      onComplete: () => {
        // Splash effect near the ocean
        this.showSplash(mole.container.x, this.H * 0.46);

        mole.container.setVisible(false);
        mole.container.setFrame(0);
        mole.container.setAlpha(1);
        mole.container.setScale(MOLE_SCALE);
        mole.isUp = false;
        mole.isHit = false;
      },
    });

    // Particles
    c.particles.forEach((color) => {
      for (let i = 0; i < 3; i++) {
        const star = this.add.star(
          mole.pos.x + Phaser.Math.Between(-10, 10),
          mole.pos.y - 15,
          5, 3, 9, hexToInt(color),
        );
        star.setDepth(99).setAlpha(0.9);
        this.tweens.add({
          targets: star,
          y: star.y - Phaser.Math.Between(40, 80),
          x: star.x + Phaser.Math.Between(-30, 30),
          alpha: 0,
          angle: Phaser.Math.Between(-180, 180),
          scale: 0.3,
          duration: 500,
          ease: 'Quad.easeOut',
          onComplete: () => star.destroy(),
        });
      }
    });

    // Score popup
    const comboColors = ['#FFD700', '#FF7F50', '#FF6B6B', '#5BC0EB', '#87CEEB'];
    const colorIdx = Math.min(this.combo - 1, comboColors.length - 1);
    const label = this.combo > 1 ? `+${points} x${this.combo}` : `+${points}`;

    const popup = this.add.text(mole.pos.x, mole.pos.y - 30, label, {
      fontSize: this.combo > 1 ? '32px' : '26px',
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      color: comboColors[colorIdx],
      stroke: '#2A4858',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(101);

    this.tweens.add({
      targets: popup,
      y: popup.y - 50,
      alpha: 0, scale: 1.3,
      duration: 600,
      ease: 'Quad.easeOut',
      onComplete: () => popup.destroy(),
    });
  }

  showSplash(x, y) {
    // Water splash droplets
    for (let i = 0; i < 5; i++) {
      const drop = this.add.circle(
        x + Phaser.Math.Between(-20, 20),
        y,
        Phaser.Math.Between(3, 7),
        hexToInt(this.colors.ocean.shore), 0.7,
      );
      drop.setDepth(2);
      this.tweens.add({
        targets: drop,
        y: drop.y - Phaser.Math.Between(20, 50),
        x: drop.x + Phaser.Math.Between(-15, 15),
        alpha: 0, scale: 0.3,
        duration: 500,
        ease: 'Quad.easeOut',
        onComplete: () => drop.destroy(),
      });
    }

    // Splash ring
    const ring = this.add.circle(x, y, 5, 0xffffff, 0);
    ring.setStrokeStyle(2, hexToInt(this.colors.ocean.foam), 0.6);
    ring.setDepth(2);
    this.tweens.add({
      targets: ring,
      radius: 25,
      alpha: 0,
      duration: 400,
      onComplete: () => ring.destroy(),
    });
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
      color: '#FF7F50',
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
      delay: 3200,
      callback: () => {
        this.popUpMole();
        const elapsed = GAME_DURATION - this.timeLeft;
        if (elapsed > 35 && Math.random() < 0.12) {
          this.time.delayedCall(500, () => this.popUpMole());
        }
        const newDelay = Math.max(2000, 3200 - elapsed * 10);
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
      color: '#FF7F50',
      stroke: c.ui.scoreShadow,
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(301).setAlpha(0);

    this.tweens.add({
      targets: ratingText, alpha: 1,
      duration: 400, delay: 900,
    });

    // Back to menu button
    const menu = this.add.text(cx, H * 0.67, '[ Back to Menu ]', {
      fontSize: '26px',
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      color: c.ui.buttonBg,
      stroke: c.ui.scoreShadow,
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(301).setAlpha(0);

    this.tweens.add({
      targets: menu, alpha: 1,
      duration: 400, delay: 1200,
      onComplete: () => {
        this.tweens.add({
          targets: menu,
          scaleX: 1.05, scaleY: 1.05,
          duration: 600,
          yoyo: true, repeat: -1,
        });
        this.input.once('pointerdown', () => {
          const bgMusic = this.registry.get('bgMusic');
          if (bgMusic) bgMusic.stop();
          this.scene.start('Boot');
        });
      },
    });
  }

  // ─── UPDATE ─────────────────────────────────────────────

  update() {
    // Rattle follows pointer X
    if (this.rattleSprite && !this.isPushing) {
      this.rattleSprite.x = Phaser.Math.Linear(
        this.rattleSprite.x,
        this.rattleX,
        0.18,
      );
    }

    // Aim target follows rattle
    if (this.aimTarget) {
      this.aimTarget.x = this.rattleSprite.x;
    }

    // Shadow follows rattle
    if (this.rattleShadow) {
      this.rattleShadow.x = this.rattleSprite.x;
      const push = 1 - (this.rattleSprite.y - this.H * 0.55) / (this.H * 0.88 - this.H * 0.55);
      const p = Phaser.Math.Clamp(push, 0, 1);
      this.rattleShadow.setAlpha(0.05 + 0.2 * p);
      this.rattleShadow.setScale(0.5 + 0.6 * p);
    }

    // Animate wave foam
    if (this.foamLine) {
      this.waveOffset += 0.02;
      this.foamLine.clear();
      this.foamLine.fillStyle(0xE8F8FF, 0.5);
      this.foamLine.beginPath();
      this.foamLine.moveTo(0, this.H * 0.46);
      for (let x = 0; x <= this.W; x += 6) {
        const wy = this.H * 0.455 + Math.sin(x * 0.04 + this.waveOffset) * 3 + Math.sin(x * 0.02 - this.waveOffset * 0.7) * 2;
        this.foamLine.lineTo(x, wy);
      }
      this.foamLine.lineTo(this.W, this.H * 0.47);
      this.foamLine.lineTo(0, this.H * 0.47);
      this.foamLine.closePath();
      this.foamLine.fillPath();
    }
  }
}
