// game-presque-doubles.js — Game 5: Near-doubles addition strategy

var Game5 = (function() {
  var currentPair = null; // { a, b, small, big }
  var score = 0;
  var answered = false;
  var currentLevel = null; // 'guided', 'semi', 'independent'
  var warmupLeft = 0; // warmup doubles rounds remaining (Level 1 only)
  var animTimers = []; // track animation timeouts for cleanup

  function init() {
    score = 0;
    updateScore();
    showLevels();
  }

  function clearTimers() {
    animTimers.forEach(function(t) { clearTimeout(t); });
    animTimers = [];
  }

  function showLevels() {
    clearTimers();
    var levels = document.getElementById('game5-levels');
    var play = document.getElementById('game5-play');
    if (levels) levels.classList.remove('hidden');
    if (play) play.classList.add('hidden');
  }

  function startLevel(levelKey) {
    currentLevel = levelKey;
    warmupLeft = (levelKey === 'guided') ? 3 : 0;

    var levels = document.getElementById('game5-levels');
    var play = document.getElementById('game5-play');
    var titleEl = document.getElementById('game5-level-title');

    if (levels) levels.classList.add('hidden');
    if (play) play.classList.remove('hidden');

    var titles = {
      guided: '🐣 Avec aide',
      semi: '🦊 Un peu d\'aide',
      independent: '🦅 Tout seul !'
    };
    if (titleEl) titleEl.textContent = titles[levelKey] || '';

    nextRound();
  }

  function generatePair() {
    var small = 1 + Math.floor(Math.random() * 9); // 1-9
    var big = small + 1;
    if (Math.random() < 0.5) {
      return { a: big, b: small, small: small, big: big };
    }
    return { a: small, b: big, small: small, big: big };
  }

  function nextRound() {
    clearTimers();
    answered = false;

    var feedbackEl = document.getElementById('game5-feedback');
    var nextBtn = document.getElementById('game5-next');
    var validateBtn = document.getElementById('game5-validate');

    if (feedbackEl) { feedbackEl.textContent = ''; feedbackEl.className = 'feedback'; }
    if (nextBtn) nextBtn.classList.add('hidden');
    if (validateBtn) validateBtn.classList.remove('hidden');

    if (warmupLeft > 0) {
      setupWarmup();
    } else {
      currentPair = generatePair();
      if (currentLevel === 'guided') setupGuided();
      else if (currentLevel === 'semi') setupSemi();
      else setupIndependent();
    }
  }

  // ─── Warmup: pure doubles ───
  function setupWarmup() {
    var num = 1 + Math.floor(Math.random() * 10); // 1-10
    currentPair = { a: num, b: num, small: num, big: num, isWarmup: true };

    var cubeArea = document.getElementById('game5-cube-area');
    var eqArea = document.getElementById('game5-equation-area');
    var decompArea = document.getElementById('game5-decomp-area');
    var inputArea = document.getElementById('game5-input-area');

    if (cubeArea) { cubeArea.innerHTML = ''; cubeArea.classList.remove('hidden'); }
    if (decompArea) { decompArea.innerHTML = ''; decompArea.classList.add('hidden'); }

    // Build cubes for both numbers (same count = double)
    if (cubeArea) {
      cubeArea.innerHTML = renderCubeArea(num, num, false);
    }

    // Equation
    if (eqArea) {
      eqArea.innerHTML =
        '<span class="eq-num eq-blue">' + num + '</span>' +
        '<span class="eq-op">+</span>' +
        '<span class="eq-num eq-blue">' + num + '</span>' +
        '<span class="eq-op">=</span>';
    }

    // Single input
    if (inputArea) {
      inputArea.innerHTML =
        '<input id="game5-answer" class="answer-input" type="number" min="0" max="40" placeholder="?">';
      var inp = document.getElementById('game5-answer');
      if (inp) setTimeout(function() { inp.focus(); }, 150);
    }

    // Instruction
    var instrEl = document.getElementById('game5-instruction');
    if (instrEl) instrEl.textContent = 'Calcule le double ! (' + (4 - warmupLeft) + '/3)';
  }

  // ─── Level 1: Guided ───
  function setupGuided() {
    var small = currentPair.small;
    var big = currentPair.big;

    var cubeArea = document.getElementById('game5-cube-area');
    var eqArea = document.getElementById('game5-equation-area');
    var decompArea = document.getElementById('game5-decomp-area');
    var inputArea = document.getElementById('game5-input-area');
    var instrEl = document.getElementById('game5-instruction');

    if (instrEl) instrEl.textContent = 'Regarde bien la décomposition, puis donne le résultat !';

    // Step 1: Show cubes + equation
    if (cubeArea) {
      cubeArea.classList.remove('hidden');
      cubeArea.innerHTML = renderCubeArea(currentPair.a, currentPair.b, false);
    }

    if (eqArea) {
      eqArea.innerHTML =
        '<span class="eq-num eq-blue">' + currentPair.a + '</span>' +
        '<span class="eq-op">+</span>' +
        '<span class="eq-num eq-blue">' + currentPair.b + '</span>' +
        '<span class="eq-op">=</span>' +
        '<span class="eq-num eq-placeholder">?</span>';
    }

    if (decompArea) {
      decompArea.innerHTML = '';
      decompArea.classList.remove('hidden');
    }

    if (inputArea) { inputArea.innerHTML = ''; }

    // Step 2: After 1.2s — show tree decomposition
    animTimers.push(setTimeout(function() {
      if (decompArea) {
        decompArea.innerHTML = renderTreeDecomp(big, small);
      }
      // Animate cube separation
      if (cubeArea) {
        cubeArea.innerHTML = renderCubeArea(currentPair.a, currentPair.b, true);
      }
    }, 1200));

    // Step 3: After 2.8s — show red rectangle + double result
    animTimers.push(setTimeout(function() {
      // Add red rectangle to cube area
      var cubeRect = cubeArea ? cubeArea.querySelector('.cube-group-left') : null;
      var cubeRect2 = cubeArea ? cubeArea.querySelector('.cube-group-right-main') : null;
      if (cubeRect) cubeRect.classList.add('cube-highlighted');
      if (cubeRect2) cubeRect2.classList.add('cube-highlighted');

      // Add highlight to decomp
      var decompDouble = decompArea ? decompArea.querySelector('.tree-left') : null;
      if (decompDouble) decompDouble.classList.add('tree-highlighted');

      // Update equation with double result
      if (eqArea) {
        var doubleResult = small * 2;
        eqArea.innerHTML =
          '<span class="eq-num eq-blue">' + currentPair.a + '</span>' +
          '<span class="eq-op">+</span>' +
          '<span class="eq-num eq-blue">' + currentPair.b + '</span>' +
          '<span class="eq-op">=</span>' +
          '<span class="eq-num eq-blue eq-fade-in">' + doubleResult + '</span>' +
          '<span class="eq-op eq-fade-in">+</span>' +
          '<span class="eq-num eq-orange eq-fade-in">1</span>' +
          '<span class="eq-op eq-fade-in">=</span>';
      }
    }, 2800));

    // Step 4: After 4s — show answer input
    animTimers.push(setTimeout(function() {
      if (inputArea) {
        inputArea.innerHTML =
          '<input id="game5-answer" class="answer-input" type="number" min="0" max="40" placeholder="?">';
        var inp = document.getElementById('game5-answer');
        if (inp) setTimeout(function() { inp.focus(); }, 100);
      }
    }, 4000));
  }

  // ─── Level 2: Semi-guided ───
  function setupSemi() {
    var small = currentPair.small;
    var big = currentPair.big;

    var cubeArea = document.getElementById('game5-cube-area');
    var eqArea = document.getElementById('game5-equation-area');
    var decompArea = document.getElementById('game5-decomp-area');
    var inputArea = document.getElementById('game5-input-area');
    var instrEl = document.getElementById('game5-instruction');

    if (instrEl) instrEl.textContent = 'Trouve le double, puis le résultat !';

    // Show cubes with separation
    if (cubeArea) {
      cubeArea.classList.remove('hidden');
      cubeArea.innerHTML = renderCubeArea(currentPair.a, currentPair.b, true);
    }

    // Show tree decomposition
    if (decompArea) {
      decompArea.classList.remove('hidden');
      decompArea.innerHTML = renderTreeDecomp(big, small);
    }

    // Show equation
    if (eqArea) {
      eqArea.innerHTML =
        '<span class="eq-num eq-blue">' + currentPair.a + '</span>' +
        '<span class="eq-op">+</span>' +
        '<span class="eq-num eq-blue">' + currentPair.b + '</span>' +
        '<span class="eq-op">=</span>';
    }

    // Show two inputs: double result + final answer
    if (inputArea) {
      inputArea.innerHTML =
        '<div class="semi-inputs">' +
          '<div class="semi-input-group">' +
            '<label class="semi-label">' + small + ' + ' + small + ' =</label>' +
            '<input id="game5-double" class="answer-input answer-input-small" type="number" min="0" max="40" placeholder="?">' +
          '</div>' +
          '<div class="semi-input-group">' +
            '<label class="semi-label eq-fade-in">+ <span class="eq-orange">1</span> =</label>' +
            '<input id="game5-final" class="answer-input answer-input-small" type="number" min="0" max="40" placeholder="?">' +
          '</div>' +
        '</div>';
      var doubleInp = document.getElementById('game5-double');
      if (doubleInp) setTimeout(function() { doubleInp.focus(); }, 150);

      // Auto-advance from first to second input on Enter
      if (doubleInp) {
        doubleInp.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            var finalInp = document.getElementById('game5-final');
            if (finalInp) finalInp.focus();
          }
        });
      }
    }
  }

  // ─── Level 3: Independent ───
  function setupIndependent() {
    var cubeArea = document.getElementById('game5-cube-area');
    var eqArea = document.getElementById('game5-equation-area');
    var decompArea = document.getElementById('game5-decomp-area');
    var inputArea = document.getElementById('game5-input-area');
    var instrEl = document.getElementById('game5-instruction');

    if (instrEl) instrEl.textContent = 'À toi de jouer !';

    // Show cubes without separation (child must recognize the near-double)
    if (cubeArea) {
      cubeArea.classList.remove('hidden');
      cubeArea.innerHTML = renderCubeArea(currentPair.a, currentPair.b, false);
    }

    // Simple equation
    if (eqArea) {
      eqArea.innerHTML =
        '<span class="eq-num eq-blue">' + currentPair.a + '</span>' +
        '<span class="eq-op">+</span>' +
        '<span class="eq-num eq-blue">' + currentPair.b + '</span>' +
        '<span class="eq-op">=</span>';
    }

    // Hide decomposition
    if (decompArea) { decompArea.innerHTML = ''; decompArea.classList.add('hidden'); }

    // Single input
    if (inputArea) {
      inputArea.innerHTML =
        '<input id="game5-answer" class="answer-input" type="number" min="0" max="40" placeholder="?">';
      var inp = document.getElementById('game5-answer');
      if (inp) setTimeout(function() { inp.focus(); }, 150);
    }
  }

  // ─── Answer handling ───
  function handleAnswer() {
    if (answered) return;

    var feedbackEl = document.getElementById('game5-feedback');
    var nextBtn = document.getElementById('game5-next');
    var validateBtn = document.getElementById('game5-validate');
    var correct = false;

    if (currentPair && currentPair.isWarmup) {
      // Warmup: pure double
      var inp = document.getElementById('game5-answer');
      if (!inp || inp.value.trim() === '') return;
      answered = true;
      var userVal = parseInt(inp.value, 10);
      var expected = currentPair.small * 2;
      correct = (userVal === expected);
      inp.disabled = true;
      inp.className = 'answer-input ' + (correct ? 'correct' : 'wrong');

      if (correct) {
        warmupLeft--;
        if (feedbackEl) {
          feedbackEl.className = 'feedback correct';
          feedbackEl.textContent = 'Bravo ! ' + currentPair.small + ' + ' + currentPair.small + ' = ' + expected + ' ! 🌟';
        }
      } else {
        if (feedbackEl) {
          feedbackEl.className = 'feedback wrong';
          feedbackEl.textContent = currentPair.small + ' + ' + currentPair.small + ' = ' + expected + ' !';
        }
      }
    } else if (currentLevel === 'semi') {
      // Two inputs
      var doubleInp = document.getElementById('game5-double');
      var finalInp = document.getElementById('game5-final');
      if (!doubleInp || !finalInp) return;
      if (doubleInp.value.trim() === '' || finalInp.value.trim() === '') return;
      answered = true;

      var userDouble = parseInt(doubleInp.value, 10);
      var userFinal = parseInt(finalInp.value, 10);
      var expectedDouble = currentPair.small * 2;
      var expectedFinal = expectedDouble + 1;

      doubleInp.disabled = true;
      finalInp.disabled = true;

      var doubleCorrect = (userDouble === expectedDouble);
      var finalCorrect = (userFinal === expectedFinal);
      correct = doubleCorrect && finalCorrect;

      doubleInp.className = 'answer-input answer-input-small ' + (doubleCorrect ? 'correct' : 'wrong');
      finalInp.className = 'answer-input answer-input-small ' + (finalCorrect ? 'correct' : 'wrong');

      if (correct) {
        // Show red rectangle highlight on cubes
        highlightDoubles();
        if (feedbackEl) {
          feedbackEl.className = 'feedback correct';
          feedbackEl.textContent = 'Bravo ! ' + currentPair.a + ' + ' + currentPair.b + ' = ' + expectedFinal + ' ! 🌟';
        }
      } else {
        if (feedbackEl) {
          feedbackEl.className = 'feedback wrong';
          feedbackEl.textContent = currentPair.small + ' + ' + currentPair.small + ' = ' + expectedDouble + ', donc ' + expectedDouble + ' + 1 = ' + expectedFinal + ' !';
        }
      }
    } else {
      // Guided or independent: single input
      var inp2 = document.getElementById('game5-answer');
      if (!inp2 || inp2.value.trim() === '') return;
      answered = true;

      var userVal2 = parseInt(inp2.value, 10);
      var expected2 = currentPair.small * 2 + 1;
      correct = (userVal2 === expected2);
      inp2.disabled = true;
      inp2.className = 'answer-input ' + (correct ? 'correct' : 'wrong');

      if (correct) {
        highlightDoubles();
        if (feedbackEl) {
          feedbackEl.className = 'feedback correct';
          feedbackEl.textContent = 'Bravo ! ' + currentPair.a + ' + ' + currentPair.b + ' = ' + expected2 + ' ! 🌟';
        }
      } else {
        if (feedbackEl) {
          feedbackEl.className = 'feedback wrong';
          feedbackEl.textContent = currentPair.a + ' + ' + currentPair.b + ' = ' + currentPair.small + ' + ' + currentPair.small + ' + 1 = ' + (currentPair.small * 2) + ' + 1 = ' + expected2 + ' !';
        }
        // Independent: show full animation as reminder
        if (currentLevel === 'independent') {
          showReminderAnimation();
        }
      }
    }

    if (validateBtn) validateBtn.classList.add('hidden');
    if (nextBtn) nextBtn.classList.remove('hidden');

    if (correct) {
      score++;
      updateScore();
      SpeechManager.speakBravo();
      var newSticker = StickerSystem.registerCorrect();
      if (newSticker) StickerSystem.showStickerModal(newSticker);
      StickerSystem.updateBackpackUI();
    } else {
      SpeechManager.speakEncourage();
    }
  }

  function highlightDoubles() {
    var cubeArea = document.getElementById('game5-cube-area');
    if (cubeArea) {
      var left = cubeArea.querySelector('.cube-group-left');
      var rightMain = cubeArea.querySelector('.cube-group-right-main');
      if (left) left.classList.add('cube-highlighted');
      if (rightMain) rightMain.classList.add('cube-highlighted');
    }
  }

  function showReminderAnimation() {
    var decompArea = document.getElementById('game5-decomp-area');
    var cubeArea = document.getElementById('game5-cube-area');
    var eqArea = document.getElementById('game5-equation-area');

    // Show decomposition tree
    if (decompArea) {
      decompArea.classList.remove('hidden');
      decompArea.innerHTML = '<p class="reminder-label">Regarde bien !</p>' +
        renderTreeDecomp(currentPair.big, currentPair.small);
    }

    // Separate cubes
    if (cubeArea) {
      cubeArea.innerHTML = renderCubeArea(currentPair.a, currentPair.b, true);
    }

    // Update equation
    animTimers.push(setTimeout(function() {
      highlightDoubles();
      var doubleResult = currentPair.small * 2;
      var finalResult = doubleResult + 1;
      if (eqArea) {
        eqArea.innerHTML =
          '<span class="eq-num eq-blue">' + currentPair.a + '</span>' +
          '<span class="eq-op">+</span>' +
          '<span class="eq-num eq-blue">' + currentPair.b + '</span>' +
          '<span class="eq-op">=</span>' +
          '<span class="eq-num eq-blue eq-fade-in">' + doubleResult + '</span>' +
          '<span class="eq-op eq-fade-in">+</span>' +
          '<span class="eq-num eq-orange eq-fade-in">1</span>' +
          '<span class="eq-op eq-fade-in">=</span>' +
          '<span class="eq-num eq-green eq-fade-in">' + finalResult + '</span>';
      }
    }, 800));
  }

  // ─── Cube rendering ───
  function renderCubeArea(a, b, separated) {
    var small = Math.min(a, b);
    var big = Math.max(a, b);
    var isNearDouble = (big === small + 1);

    var html = '<div class="cube-display">';

    // Left group (first number displayed)
    html += '<div class="cube-group cube-group-left">';
    html += renderCubeGrid(a, 'blue');
    html += '</div>';

    html += '<span class="cube-op">+</span>';

    if (isNearDouble && separated) {
      // Right: show small cubes + 1 extra separated
      html += '<div class="cube-group cube-group-right-main">';
      html += renderCubeGrid(small, 'blue');
      html += '</div>';
      html += '<div class="cube-group cube-group-extra cube-separate-anim">';
      html += '<div class="cube cube-orange"></div>';
      html += '</div>';
    } else {
      // Right: show all cubes together
      html += '<div class="cube-group cube-group-right-main">';
      html += renderCubeGrid(b, 'blue');
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  function renderCubeGrid(n, color) {
    var html = '<div class="cube-grid">';
    for (var i = 0; i < n; i++) {
      html += '<div class="cube cube-' + color + '" style="animation-delay:' + (i * 0.05) + 's"></div>';
    }
    html += '</div>';
    return html;
  }

  // ─── Tree decomposition rendering ───
  function renderTreeDecomp(big, small) {
    return '<div class="tree-decomp">' +
      '<div class="tree-top">' +
        '<span class="tree-number">' + big + '</span>' +
      '</div>' +
      '<div class="tree-branches">' +
        '<div class="tree-branch-left"></div>' +
        '<div class="tree-branch-right"></div>' +
      '</div>' +
      '<div class="tree-bottom">' +
        '<span class="tree-child tree-left">' + small + '</span>' +
        '<span class="tree-child tree-right eq-orange">1</span>' +
      '</div>' +
    '</div>';
  }

  function updateScore() {
    var el = document.getElementById('game5-score');
    if (el) el.textContent = score;
  }

  // ─── Expose for HTML onclick ───
  window.game5Submit = function() { handleAnswer(); };
  window.game5Next = function() { nextRound(); };
  window.game5Start = function(level) { startLevel(level); };
  window.game5BackToLevels = function() {
    var play = document.getElementById('game5-play');
    var levels = document.getElementById('game5-levels');
    if (play && !play.classList.contains('hidden')) {
      play.classList.add('hidden');
      if (levels) levels.classList.remove('hidden');
    } else {
      showScreen('menu');
    }
  };

  // Enter key handling
  document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('keydown', function(e) {
      // Only handle when game5 screen is active
      var screen = document.getElementById('screen-game5');
      if (!screen || !screen.classList.contains('active')) return;

      if (e.key === 'Enter') {
        // Check if we're on the semi level with two inputs
        var finalInp = document.getElementById('game5-final');
        if (finalInp && document.activeElement === finalInp) {
          if (!answered) handleAnswer();
          else nextRound();
          return;
        }
        var doubleInp = document.getElementById('game5-double');
        if (doubleInp && document.activeElement === doubleInp) {
          // Move to final input instead of submitting
          if (finalInp) finalInp.focus();
          return;
        }
        // Single input mode
        if (!answered) handleAnswer();
        else nextRound();
      }
    });
  });

  return {
    init: init
  };
})();
