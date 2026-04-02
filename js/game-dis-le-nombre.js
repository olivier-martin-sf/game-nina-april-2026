// game-dis-le-nombre.js — Game 1: See a number (70-100), say it in French

var Game1 = (function() {
  var numbers = getNumbersInRange(70, 100);
  var currentNumber = null;
  var score = 0;
  var isListening = false;
  var useFallback = !SpeechManager.hasRecognition;

  function init() {
    score = 0;
    updateScore();

    // Show fallback banner if no speech recognition
    if (useFallback) {
      var area = document.getElementById('game1-mic-area');
      if (area) area.classList.add('hidden');
      var fb = document.getElementById('game1-fallback');
      if (fb) fb.classList.remove('hidden');

      // Add banner
      var container = document.querySelector('#screen-game1 .game-container');
      if (container && !container.querySelector('.sr-banner')) {
        var banner = document.createElement('div');
        banner.className = 'sr-banner';
        banner.textContent = 'Pour utiliser ta voix, ouvre cette page dans Chrome ! En attendant, choisis la bonne réponse.';
        container.insertBefore(banner, container.querySelector('.game-instruction').nextSibling);
      }
    } else {
      var micArea = document.getElementById('game1-mic-area');
      if (micArea) micArea.classList.remove('hidden');
      var fallback = document.getElementById('game1-fallback');
      if (fallback) fallback.classList.add('hidden');
    }

    nextRound();
  }

  function nextRound() {
    currentNumber = numbers[Math.floor(Math.random() * numbers.length)];

    var numEl = document.getElementById('game1-number');
    var cardEl = document.getElementById('game1-card');
    var writtenEl = document.getElementById('game1-written');
    var feedbackEl = document.getElementById('game1-feedback');
    var nextBtn = document.getElementById('game1-next');

    if (numEl) numEl.textContent = currentNumber;
    if (cardEl) {
      cardEl.style.animation = 'none';
      cardEl.offsetHeight; // trigger reflow
      cardEl.style.animation = 'bounceIn 0.4s ease';
    }
    if (writtenEl) writtenEl.textContent = '';
    if (feedbackEl) {
      feedbackEl.textContent = '';
      feedbackEl.className = 'feedback';
    }
    if (nextBtn) nextBtn.classList.add('hidden');

    // Reset mic button
    var micBtn = document.getElementById('game1-mic-btn');
    if (micBtn) {
      micBtn.classList.remove('listening');
      micBtn.disabled = false;
    }
    var listeningIndicator = document.getElementById('game1-listening');
    if (listeningIndicator) listeningIndicator.classList.add('hidden');

    if (useFallback) {
      showFallbackChoices();
    }
  }

  function showFallbackChoices() {
    var grid = document.getElementById('game1-fallback');
    if (!grid) return;
    grid.innerHTML = '';
    grid.classList.remove('hidden');

    var data = getNumberData(currentNumber);
    var choices = [data.written];

    // Generate 3 distractors from nearby numbers
    var distractorPool = numbers.filter(function(n) { return n !== currentNumber; });
    shuffleArray(distractorPool);
    for (var i = 0; i < 3 && i < distractorPool.length; i++) {
      choices.push(getNumberData(distractorPool[i]).written);
    }
    shuffleArray(choices);

    choices.forEach(function(text) {
      var card = document.createElement('div');
      card.className = 'choice-card';
      card.style.fontSize = '20px';
      card.textContent = text;
      card.onclick = function() {
        handleFallbackChoice(text, card, grid);
      };
      grid.appendChild(card);
    });
  }

  function handleFallbackChoice(chosen, cardEl, grid) {
    var data = getNumberData(currentNumber);
    var correct = (chosen === data.written);

    // Disable all cards
    var cards = grid.querySelectorAll('.choice-card');
    cards.forEach(function(c) { c.classList.add('disabled'); });

    if (correct) {
      cardEl.classList.add('correct');
      handleCorrect();
    } else {
      cardEl.classList.add('wrong');
      // Highlight correct
      cards.forEach(function(c) {
        if (c.textContent === data.written) c.classList.add('correct');
      });
      handleWrong();
    }
  }

  function game1Listen() {
    if (isListening || useFallback) return;
    isListening = true;

    var micBtn = document.getElementById('game1-mic-btn');
    var listeningIndicator = document.getElementById('game1-listening');
    var feedbackEl = document.getElementById('game1-feedback');

    if (micBtn) micBtn.classList.add('listening');
    if (listeningIndicator) listeningIndicator.classList.remove('hidden');
    if (feedbackEl) {
      feedbackEl.textContent = '';
      feedbackEl.className = 'feedback';
    }

    SpeechManager.listen(8000).then(function(results) {
      isListening = false;
      if (micBtn) micBtn.classList.remove('listening');
      if (listeningIndicator) listeningIndicator.classList.add('hidden');

      var check = SpeechManager.checkSpeechResult(results, currentNumber);
      if (check.matched) {
        handleCorrect();
      } else {
        if (feedbackEl) {
          feedbackEl.className = 'feedback wrong';
          feedbackEl.textContent = 'J\'ai entendu : "' + check.transcript + '" — Essaie encore !';
        }
        SpeechManager.speakEncourage();
      }
    }).catch(function(err) {
      isListening = false;
      if (micBtn) micBtn.classList.remove('listening');
      if (listeningIndicator) listeningIndicator.classList.add('hidden');

      if (err.message === 'timeout' || err.message === 'no-speech') {
        if (feedbackEl) {
          feedbackEl.className = 'feedback wrong';
          feedbackEl.textContent = 'Je n\'ai pas entendu... Essaie encore ! 🎤';
        }
      } else if (err.message === 'not-allowed') {
        if (feedbackEl) {
          feedbackEl.className = 'feedback wrong';
          feedbackEl.textContent = 'Autorise le micro pour jouer ! 🎤';
        }
      }
    });
  }

  function handleCorrect() {
    var writtenEl = document.getElementById('game1-written');
    var feedbackEl = document.getElementById('game1-feedback');
    var nextBtn = document.getElementById('game1-next');

    var data = getNumberData(currentNumber);
    if (writtenEl) writtenEl.textContent = data.written;
    if (feedbackEl) {
      feedbackEl.className = 'feedback correct';
      feedbackEl.textContent = 'Bravo ! 🌟';
    }
    if (nextBtn) nextBtn.classList.remove('hidden');

    score++;
    updateScore();

    SpeechManager.speakBravo().then(function() {
      SpeechManager.speakNumber(currentNumber);
    });

    // Register correct answer for stickers
    var newSticker = StickerSystem.registerCorrect();
    if (newSticker) {
      StickerSystem.showStickerModal(newSticker);
    }
    StickerSystem.updateBackpackUI();
  }

  function handleWrong() {
    var writtenEl = document.getElementById('game1-written');
    var feedbackEl = document.getElementById('game1-feedback');
    var nextBtn = document.getElementById('game1-next');
    var data = getNumberData(currentNumber);

    if (writtenEl) writtenEl.textContent = data.written;
    if (feedbackEl) {
      feedbackEl.className = 'feedback wrong';
      feedbackEl.textContent = 'C\'est ' + data.written + ' !';
    }
    if (nextBtn) nextBtn.classList.remove('hidden');

    SpeechManager.speakEncourage().then(function() {
      SpeechManager.speakNumber(currentNumber);
    });
  }

  function updateScore() {
    var el = document.getElementById('game1-score');
    if (el) el.textContent = score;
  }

  // Expose for HTML onclick
  window.game1Listen = game1Listen;
  window.game1Next = function() {
    nextRound();
  };

  return {
    init: init
  };
})();

function shuffleArray(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}
