// game-ecoute.js — Game 2: Hear a number in French, pick the correct card from 4

var Game2 = (function() {
  var currentNumber = null;
  var score = 0;
  var answered = false;

  function init() {
    score = 0;
    updateScore();
    nextRound();
  }

  function nextRound() {
    answered = false;
    currentNumber = Math.floor(Math.random() * 101); // 0-100

    var feedbackEl = document.getElementById('game2-feedback');
    var nextBtn = document.getElementById('game2-next');
    if (feedbackEl) {
      feedbackEl.textContent = '';
      feedbackEl.className = 'feedback';
    }
    if (nextBtn) nextBtn.classList.add('hidden');

    // Generate choices: 1 correct + 3 distractors
    var choices = [currentNumber];
    var distractors = generateDistractors(currentNumber, 3);
    choices = choices.concat(distractors);
    shuffleArray(choices);

    renderChoices(choices);

    // Auto-speak the number after a short delay
    setTimeout(function() {
      SpeechManager.speakNumber(currentNumber);
    }, 500);
  }

  function generateDistractors(correct, count) {
    var result = [];
    var tried = {};
    tried[correct] = true;

    // Strategy 1: same decade neighbors
    var decade = Math.floor(correct / 10) * 10;
    var sameDecade = [];
    for (var i = decade; i < decade + 10 && i <= 100; i++) {
      if (i !== correct) sameDecade.push(i);
    }
    shuffleArray(sameDecade);

    // Strategy 2: confusing pairs (70s ↔ 60s, 90s ↔ 80s)
    var confusing = [];
    if (correct >= 70 && correct <= 79) {
      confusing.push(correct - 10); // 60s equivalent
    } else if (correct >= 60 && correct <= 69) {
      confusing.push(correct + 10); // 70s equivalent
    } else if (correct >= 90 && correct <= 99) {
      confusing.push(correct - 10); // 80s equivalent
    } else if (correct >= 80 && correct <= 89) {
      confusing.push(correct + 10); // 90s equivalent
    }

    // Strategy 3: off-by-one
    var offByOne = [];
    if (correct > 0) offByOne.push(correct - 1);
    if (correct < 100) offByOne.push(correct + 1);

    // Combine: try confusing first, then same decade, then off-by-one
    var pool = confusing.concat(sameDecade).concat(offByOne);

    for (var j = 0; j < pool.length && result.length < count; j++) {
      var n = pool[j];
      if (n >= 0 && n <= 100 && !tried[n]) {
        result.push(n);
        tried[n] = true;
      }
    }

    // Fill remaining with random if needed
    while (result.length < count) {
      var rand = Math.floor(Math.random() * 101);
      if (!tried[rand]) {
        result.push(rand);
        tried[rand] = true;
      }
    }

    return result;
  }

  function renderChoices(choices) {
    var grid = document.getElementById('game2-choices');
    if (!grid) return;
    grid.innerHTML = '';

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

  function handleChoice(chosen, cardEl, grid) {
    answered = true;
    var correct = (chosen === currentNumber);
    var cards = grid.querySelectorAll('.choice-card');
    cards.forEach(function(c) { c.classList.add('disabled'); });

    var feedbackEl = document.getElementById('game2-feedback');
    var nextBtn = document.getElementById('game2-next');

    if (correct) {
      cardEl.classList.add('correct');
      score++;
      updateScore();

      var data = getNumberData(currentNumber);
      if (feedbackEl) {
        feedbackEl.className = 'feedback correct';
        feedbackEl.textContent = 'Bravo ! C\'est ' + data.written + ' ! 🌟';
      }
      if (nextBtn) nextBtn.classList.remove('hidden');

      SpeechManager.speakBravo();

      var newSticker = StickerSystem.registerCorrect();
      if (newSticker) {
        StickerSystem.showStickerModal(newSticker);
      }
      StickerSystem.updateBackpackUI();
    } else {
      cardEl.classList.add('wrong');
      // Show correct card
      cards.forEach(function(c) {
        if (parseInt(c.textContent) === currentNumber) {
          c.classList.add('correct');
        }
      });

      var wrongData = getNumberData(currentNumber);
      if (feedbackEl) {
        feedbackEl.className = 'feedback wrong';
        feedbackEl.textContent = 'C\'était ' + currentNumber + ' — ' + wrongData.written + ' !';
      }
      if (nextBtn) nextBtn.classList.remove('hidden');

      SpeechManager.speakEncourage().then(function() {
        SpeechManager.speakNumber(currentNumber);
      });
    }
  }

  function updateScore() {
    var el = document.getElementById('game2-score');
    if (el) el.textContent = score;
  }

  // Expose for HTML onclick
  window.game2Speak = function() {
    SpeechManager.speakNumber(currentNumber);
  };

  window.game2Next = function() {
    nextRound();
  };

  return {
    init: init
  };
})();
