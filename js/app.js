// app.js — Main application: screen routing, initialization

var currentScreen = 'welcome';

function showScreen(screenId) {
  // Hide all screens
  var screens = document.querySelectorAll('.screen');
  screens.forEach(function(s) { s.classList.remove('active'); });

  // Show requested screen
  var target = document.getElementById('screen-' + screenId);
  if (target) {
    target.classList.add('active');
    currentScreen = screenId;
  }

  // Initialize games when entering
  if (screenId === 'game1') {
    Game1.init();
  } else if (screenId === 'game2') {
    Game2.init();
  } else if (screenId === 'game3') {
    Game3.init();
  } else if (screenId === 'game4') {
    Game4.init();
  } else if (screenId === 'backpack') {
    StickerSystem.updateBackpackUI();
  } else if (screenId === 'menu') {
    updateMenuGreeting();
  }

  // Cancel any ongoing speech when leaving a game
  SpeechManager.stopSpeaking();
}

function startGame() {
  var nameInput = document.getElementById('player-name');
  var name = nameInput ? nameInput.value.trim() : '';
  if (name) {
    StickerSystem.setPlayerName(name);
  }
  showScreen('menu');
}

function updateMenuGreeting() {
  var greetingEl = document.getElementById('menu-greeting');
  var name = StickerSystem.getPlayerName();
  if (greetingEl) {
    if (name) {
      var greetings = [
        'Salut ' + name + ' ! Prête à jouer ? 🌟',
        'Coucou ' + name + ' ! On s\'amuse avec les nombres ? 🎉',
        'Bonjour ' + name + ' ! C\'est parti ! 🚀'
      ];
      greetingEl.textContent = greetings[Math.floor(Math.random() * greetings.length)];
    } else {
      greetingEl.textContent = 'Choisis un jeu pour commencer ! 🌟';
    }
  }
}

// On page load
document.addEventListener('DOMContentLoaded', function() {
  // Restore player name if saved
  var savedName = StickerSystem.getPlayerName();
  if (savedName) {
    var nameInput = document.getElementById('player-name');
    if (nameInput) nameInput.value = savedName;
  }

  // Update backpack UI
  StickerSystem.updateBackpackUI();

  // Allow Enter key on name input
  var nameInput = document.getElementById('player-name');
  if (nameInput) {
    nameInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        startGame();
      }
    });
  }
});
