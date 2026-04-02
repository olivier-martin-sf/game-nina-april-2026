// game-descente.js — Game 3: Rocket descent (decrementing mastery)

var Game3 = (function() {
  var score = 0;
  var sequence = [];     // full descending sequence of numbers
  var currentIdx = 0;    // which step we're on
  var level = null;      // 'easy', 'medium', 'hard'
  var answered = false;

  var LEVELS = {
    easy: {
      title: '🐣 Petit pas — Compte de 10 à 0',
      from: 10,
      to: 0,
      step: 1,
      choiceCount: 3
    },
    medium: {
      title: '🦊 Les grands nombres — De 85 à 70',
      from: 85,
      to: 70,
      step: 1,
      choiceCount: 3
    },
    hard: {
      title: '🦅 Sauts de fusée',
      from: 100,
      to: 0,
      step: null, // random: 2, 5, or 10
      choiceCount: 3
    }
  };

  function init() {
    score = 0;
    updateScore();
    showLevels();
  }

  function showLevels() {
    var levels = document.getElementById('game3-levels');
    var play = document.getElementById('game3-play');
    var blastoff = document.getElementById('game3-blastoff');
    if (levels) levels.classList.remove('hidden');
    if (play) play.classList.add('hidden');
    if (blastoff) blastoff.classList.add('hidden');
  }

  function start(levelKey) {
    level = LEVELS[levelKey];
    if (!level) return;

    // Generate sequence
    if (levelKey === 'hard') {
      var steps = [2, 5, 10];
      var chosenStep = steps[Math.floor(Math.random() * steps.length)];
      level.step = chosenStep;
      level.title = '🦅 Sauts de fusée — Saute de ' + chosenStep + ' en ' + chosenStep;
      sequence = [];
      for (var i = level.from; i >= level.to; i -= chosenStep) {
        sequence.push(i);
      }
      // Make sure 0 is included if we land on it
      if (sequence[sequence.length - 1] !== level.to && sequence[sequence.length - 1] > level.to) {
        // Adjust to to end at last reachable number
      }
    } else {
      sequence = [];
      for (var j = level.from; j >= level.to; j -= level.step) {
        sequence.push(j);
      }
    }

    currentIdx = 0;

    var levels = document.getElementById('game3-levels');
    var play = document.getElementById('game3-play');
    var blastoff = document.getElementById('game3-blastoff');
    var titleEl = document.getElementById('game3-level-title');

    if (levels) levels.classList.add('hidden');
    if (play) play.classList.remove('hidden');
    if (blastoff) blastoff.classList.add('hidden');
    if (titleEl) titleEl.textContent = level.title;

    renderStaircase();
    renderChoices();
  }

  function renderStaircase() {
    var container = document.getElementById('game3-staircase');
    if (!container) return;
    container.innerHTML = '';

    // Show a window of steps around currentIdx
    var windowSize = 7;
    var startShow = Math.max(0, currentIdx - 2);
    var endShow = Math.min(sequence.length - 1, startShow + windowSize - 1);
    startShow = Math.max(0, endShow - windowSize + 1);

    for (var i = startShow; i <= endShow; i++) {
      var step = document.createElement('div');
      step.className = 'stair-step';

      if (i < currentIdx) {
        // Already answered
        step.classList.add('filled');
        step.innerHTML =
          '<span class="step-check">✅</span>' +
          '<span class="step-number">' + sequence[i] + '</span>' +
          '<span class="step-check" style="visibility:hidden">✅</span>';
      } else if (i === currentIdx) {
        // Current step
        step.classList.add('current');
        step.innerHTML =
          '<span class="step-rocket">🚀</span>' +
          '<span class="step-number">❓</span>' +
          '<span class="step-rocket" style="visibility:hidden">🚀</span>';
      } else {
        // Upcoming
        step.classList.add('upcoming');
        step.innerHTML =
          '<span class="step-number">• • •</span>';
      }

      container.appendChild(step);
    }

    // Show the destination
    if (endShow < sequence.length - 1) {
      var dest = document.createElement('div');
      dest.className = 'stair-step';
      dest.style.background = 'var(--color-orange-light)';
      dest.style.borderColor = 'var(--color-orange)';
      dest.style.border = '2px solid var(--color-orange)';
      dest.innerHTML = '<span class="step-rocket">🔥</span><span class="step-number">Décollage !</span>';
      container.appendChild(dest);
    }
  }

  function renderChoices() {
    var grid = document.getElementById('game3-choices');
    var feedbackEl = document.getElementById('game3-feedback');
    if (!grid) return;
    grid.innerHTML = '';
    answered = false;

    if (feedbackEl) {
      feedbackEl.textContent = '';
      feedbackEl.className = 'feedback';
    }

    if (currentIdx >= sequence.length) {
      triggerBlastoff();
      return;
    }

    var correctNumber = sequence[currentIdx];
    var choices = [correctNumber];
    var distractors = generateDescentDistractors(correctNumber, level.choiceCount - 1);
    choices = choices.concat(distractors);
    shuffleArray(choices);

    choices.forEach(function(num) {
      var card = document.createElement('div');
      card.className = 'choice-card';
      card.textContent = num;
      card.onclick = function() {
        if (answered) return;
        handleChoice(num, card, grid);
      };
      grid.appendChild(card);
    });
  }

  function generateDescentDistractors(correct, count) {
    var result = [];
    var tried = {};
    tried[correct] = true;

    // Off-by-one in sequence direction
    var candidates = [];
    if (level.step === 1) {
      // For step=1, nearby numbers are the most confusing
      if (correct > 0) candidates.push(correct - 1);
      if (correct < 100) candidates.push(correct + 1);
      if (correct > 1) candidates.push(correct - 2);
      if (correct < 99) candidates.push(correct + 2);

      // For 70-99, add confusing decade swaps
      if (correct >= 70 && correct <= 79) {
        candidates.push(correct - 10); // 60s
        candidates.push(correct + 10); // 80s
      }
      if (correct >= 90 && correct <= 99) {
        candidates.push(correct - 10); // 80s
      }
      if (correct >= 80 && correct <= 89) {
        candidates.push(correct + 10); // 90s
      }
    } else {
      // For larger steps, off-by-step and off-by-one-step
      candidates.push(correct - level.step);
      candidates.push(correct + level.step);
      candidates.push(correct - 1);
      candidates.push(correct + 1);
      candidates.push(correct - level.step * 2);
      candidates.push(correct + level.step * 2);
    }

    for (var i = 0; i < candidates.length && result.length < count; i++) {
      var n = candidates[i];
      if (n >= 0 && n <= 100 && !tried[n]) {
        result.push(n);
        tried[n] = true;
      }
    }

    // Fill remaining
    while (result.length < count) {
      var rand = Math.max(0, Math.min(100, correct + (Math.floor(Math.random() * 11) - 5)));
      if (!tried[rand]) {
        result.push(rand);
        tried[rand] = true;
      }
    }

    return result;
  }

  function handleChoice(chosen, cardEl, grid) {
    answered = true;
    var correctNumber = sequence[currentIdx];
    var correct = (chosen === correctNumber);
    var cards = grid.querySelectorAll('.choice-card');
    var feedbackEl = document.getElementById('game3-feedback');

    cards.forEach(function(c) { c.classList.add('disabled'); });

    if (correct) {
      cardEl.classList.add('correct');
      score++;
      updateScore();

      var data = getNumberData(correctNumber);
      if (feedbackEl) {
        feedbackEl.className = 'feedback correct';
        feedbackEl.textContent = 'Bravo ! ' + data.written + ' ! 🌟';
      }

      SpeechManager.speakBravo().then(function() {
        return SpeechManager.speakNumber(correctNumber);
      });

      var newSticker = StickerSystem.registerCorrect();
      if (newSticker) {
        StickerSystem.showStickerModal(newSticker);
      }
      StickerSystem.updateBackpackUI();

      // Advance after a delay
      setTimeout(function() {
        currentIdx++;
        renderStaircase();
        renderChoices();
      }, 1200);
    } else {
      cardEl.classList.add('wrong');
      // Highlight correct
      cards.forEach(function(c) {
        if (parseInt(c.textContent) === correctNumber) c.classList.add('correct');
      });

      var wrongData = getNumberData(correctNumber);
      if (feedbackEl) {
        feedbackEl.className = 'feedback wrong';
        feedbackEl.textContent = 'C\'était ' + correctNumber + ' — ' + wrongData.written + ' !';
      }

      SpeechManager.speakEncourage().then(function() {
        return SpeechManager.speakNumber(correctNumber);
      });

      // Allow retry after delay
      setTimeout(function() {
        // Move on anyway (don't get stuck)
        currentIdx++;
        renderStaircase();
        renderChoices();
      }, 2000);
    }
  }

  function triggerBlastoff() {
    var play = document.getElementById('game3-play');
    var blastoff = document.getElementById('game3-blastoff');
    var grid = document.getElementById('game3-choices');
    var feedbackEl = document.getElementById('game3-feedback');

    if (play) play.classList.add('hidden');
    if (blastoff) blastoff.classList.remove('hidden');
    if (grid) grid.innerHTML = '';
    if (feedbackEl) feedbackEl.textContent = '';

    // Confetti!
    launchConfetti();

    SpeechManager.speak('Décollage ! Bravo, tu es un champion !', { rate: 1, pitch: 1.2 });
  }

  function launchConfetti() {
    var container = document.getElementById('confetti-container');
    if (!container) return;
    container.innerHTML = '';

    var colors = ['#FF6B9D', '#C479FF', '#4FC3F7', '#66BB6A', '#FFA726', '#FFD54F', '#EF5350'];

    for (var i = 0; i < 60; i++) {
      var piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDuration = (1.5 + Math.random() * 2) + 's';
      piece.style.animationDelay = (Math.random() * 0.8) + 's';
      piece.style.width = (6 + Math.random() * 10) + 'px';
      piece.style.height = (6 + Math.random() * 10) + 'px';
      container.appendChild(piece);
    }

    // Clean up after animation
    setTimeout(function() {
      container.innerHTML = '';
    }, 5000);
  }

  function updateScore() {
    var el = document.getElementById('game3-score');
    if (el) el.textContent = score;
  }

  // Expose
  window.game3Start = function(levelKey) { start(levelKey); };
  window.game3BackToLevels = function() {
    showLevels();
    // Also check if we came from menu
    var play = document.getElementById('game3-play');
    var blastoff = document.getElementById('game3-blastoff');
    var levels = document.getElementById('game3-levels');
    if (play && !play.classList.contains('hidden')) {
      // In game, go to level selection
      play.classList.add('hidden');
      levels.classList.remove('hidden');
    } else if (blastoff && !blastoff.classList.contains('hidden')) {
      blastoff.classList.add('hidden');
      levels.classList.remove('hidden');
    } else {
      // Already on levels, go to menu
      showScreen('menu');
    }
  };

  return {
    init: init
  };
})();
