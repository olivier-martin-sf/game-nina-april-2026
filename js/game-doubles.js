// game-doubles.js — Game 4: Calculate doubles (1+1 through 20+20)

var Game4 = (function() {
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
    currentNumber = 1 + Math.floor(Math.random() * 20); // 1-20

    var numEl = document.getElementById('game4-num');
    var num2El = document.getElementById('game4-num2');
    var answerEl = document.getElementById('game4-answer');
    var feedbackEl = document.getElementById('game4-feedback');
    var nextBtn = document.getElementById('game4-next');
    var validateBtn = document.getElementById('game4-validate');

    if (numEl) numEl.textContent = currentNumber;
    if (num2El) num2El.textContent = currentNumber;
    if (answerEl) {
      answerEl.value = '';
      answerEl.className = 'answer-input';
      answerEl.disabled = false;
      setTimeout(function() { answerEl.focus(); }, 100);
    }
    if (feedbackEl) {
      feedbackEl.textContent = '';
      feedbackEl.className = 'feedback';
    }
    if (nextBtn) nextBtn.classList.add('hidden');
    if (validateBtn) validateBtn.classList.remove('hidden');
  }

  function handleAnswer() {
    if (answered) return;

    var answerEl = document.getElementById('game4-answer');
    var feedbackEl = document.getElementById('game4-feedback');
    var nextBtn = document.getElementById('game4-next');
    var validateBtn = document.getElementById('game4-validate');

    if (!answerEl) return;
    var value = answerEl.value.trim();
    if (value === '') return; // ignore empty submit

    answered = true;
    var userAnswer = parseInt(value, 10);
    var correctAnswer = currentNumber * 2;
    var correct = (userAnswer === correctAnswer);

    answerEl.disabled = true;
    if (validateBtn) validateBtn.classList.add('hidden');

    if (correct) {
      answerEl.className = 'answer-input correct';
      score++;
      updateScore();

      if (feedbackEl) {
        feedbackEl.className = 'feedback correct';
        feedbackEl.textContent = 'Bravo ! ' + currentNumber + ' + ' + currentNumber + ' = ' + correctAnswer + ' ! 🌟';
      }
      if (nextBtn) nextBtn.classList.remove('hidden');

      SpeechManager.speakBravo();

      var newSticker = StickerSystem.registerCorrect();
      if (newSticker) {
        StickerSystem.showStickerModal(newSticker);
      }
      StickerSystem.updateBackpackUI();
    } else {
      answerEl.className = 'answer-input wrong';

      if (feedbackEl) {
        feedbackEl.className = 'feedback wrong';
        feedbackEl.textContent = currentNumber + ' + ' + currentNumber + ' = ' + correctAnswer + ' !';
      }
      if (nextBtn) nextBtn.classList.remove('hidden');

      SpeechManager.speakEncourage();
    }
  }

  function updateScore() {
    var el = document.getElementById('game4-score');
    if (el) el.textContent = score;
  }

  // Expose for HTML onclick
  window.game4Submit = function() {
    handleAnswer();
  };

  window.game4Next = function() {
    nextRound();
  };

  // Listen for Enter key on the input
  document.addEventListener('DOMContentLoaded', function() {
    var answerEl = document.getElementById('game4-answer');
    if (answerEl) {
      answerEl.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          if (answered) {
            nextRound();
          } else {
            handleAnswer();
          }
        }
      });
    }
  });

  return {
    init: init
  };
})();
