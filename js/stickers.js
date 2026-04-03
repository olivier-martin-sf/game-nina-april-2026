// stickers.js — Backpack, sticker reward system, localStorage persistence

var StickerSystem = (function() {
  var STORAGE_KEY = 'mathgame_progress';
  var DEFAULT_THRESHOLD = 5;

  // Sticker pool (~50 emojis)
  var STICKER_POOL = [
    // Animals
    '🦄', '🐱', '🐶', '🦋', '🐬', '🦊', '🐼', '🐰', '🦁', '🐸', '🦜', '🐙',
    '🐨', '🐯', '🦩', '🐝',
    // Nature
    '🌈', '🌸', '🌻', '🌺', '⭐', '🌙', '☀️', '🍀', '🌷', '🌼',
    // Food
    '🍕', '🍦', '🧁', '🍓', '🍩', '🎂', '🍫', '🍭', '🍪', '🍰',
    // Fun
    '🎸', '🎨', '🎪', '🎠', '🎢', '🏰', '👑', '💎', '🎀', '🎈',
    // Space
    '🚀', '🛸', '🌍', '💫', '🪐', '✨'
  ];

  var state;

  // Load from server file first, fall back to localStorage
  function load() {
    // Start with localStorage synchronously so UI works immediately
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        state = JSON.parse(saved);
        state.stickers = state.stickers || [];
        state.totalCorrect = state.totalCorrect || 0;
        state.correctSinceLastSticker = state.correctSinceLastSticker || 0;
        state.stickerThreshold = state.stickerThreshold || DEFAULT_THRESHOLD;
        state.playerName = state.playerName || '';
      } else {
        state = createFreshState();
      }
    } catch(e) {
      state = createFreshState();
    }
    // Then try to load from server file (overwrites localStorage data if found)
    loadFromServer();
  }

  function loadFromServer() {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', '/api/stickers', true);
      xhr.onload = function() {
        if (xhr.status === 200) {
          try {
            var serverData = JSON.parse(xhr.responseText);
            if (serverData && serverData.stickers) {
              state = serverData;
              state.stickerThreshold = state.stickerThreshold || DEFAULT_THRESHOLD;
              localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
              updateBackpackUI();
            }
          } catch(e) { /* ignore parse errors */ }
        }
      };
      xhr.send();
    } catch(e) { /* server not available, use localStorage */ }
  }

  function createFreshState() {
    return {
      stickers: [],
      totalCorrect: 0,
      correctSinceLastSticker: 0,
      stickerThreshold: DEFAULT_THRESHOLD,
      playerName: ''
    };
  }

  // Save to localStorage and server file
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch(e) {
      // localStorage unavailable (private browsing, etc.)
    }
    saveToServer();
  }

  function saveToServer() {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/stickers', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(state));
    } catch(e) { /* server not available, localStorage is still saved */ }
  }

  // Register a correct answer. Returns the new sticker emoji if one was earned, otherwise null.
  function registerCorrect() {
    state.totalCorrect++;
    state.correctSinceLastSticker++;

    if (state.correctSinceLastSticker >= state.stickerThreshold) {
      state.correctSinceLastSticker = 0;
      var newSticker = pickNewSticker();
      state.stickers.push(newSticker);
      save();
      return newSticker;
    }

    save();
    return null;
  }

  // Pick a sticker not yet collected (or random if all collected)
  function pickNewSticker() {
    var uncollected = STICKER_POOL.filter(function(s) {
      return state.stickers.indexOf(s) === -1;
    });
    if (uncollected.length === 0) {
      // All collected! Pick any random one
      return STICKER_POOL[Math.floor(Math.random() * STICKER_POOL.length)];
    }
    return uncollected[Math.floor(Math.random() * uncollected.length)];
  }

  // Get current progress toward next sticker (0 to threshold-1)
  function getProgress() {
    return state.correctSinceLastSticker;
  }

  function getThreshold() {
    return state.stickerThreshold;
  }

  function setThreshold(n) {
    state.stickerThreshold = Math.max(1, n);
    save();
  }

  function getStickers() {
    return state.stickers;
  }

  function getTotalCorrect() {
    return state.totalCorrect;
  }

  function getPlayerName() {
    return state.playerName;
  }

  function setPlayerName(name) {
    state.playerName = name;
    save();
  }

  // Update the backpack UI elements
  function updateBackpackUI() {
    var badge = document.getElementById('backpack-badge');
    var progressBar = document.getElementById('backpack-progress-bar');
    var total = document.getElementById('backpack-total');
    var grid = document.getElementById('backpack-grid');
    var empty = document.getElementById('backpack-empty');

    if (badge) badge.textContent = state.stickers.length;
    if (progressBar) {
      var pct = (state.correctSinceLastSticker / state.stickerThreshold) * 100;
      progressBar.style.width = pct + '%';
    }
    if (total) total.textContent = state.stickers.length;

    if (grid) {
      grid.innerHTML = '';
      state.stickers.forEach(function(sticker, i) {
        var div = document.createElement('div');
        div.className = 'backpack-sticker';
        div.textContent = sticker;
        div.style.animationDelay = (i * 0.05) + 's';
        grid.appendChild(div);
      });
    }

    if (empty) {
      empty.classList.toggle('hidden', state.stickers.length > 0);
    }
    if (grid) {
      grid.classList.toggle('hidden', state.stickers.length === 0);
    }
  }

  // Show sticker award modal
  function showStickerModal(sticker) {
    var modal = document.getElementById('sticker-modal');
    var reveal = document.getElementById('sticker-reveal');
    if (modal && reveal) {
      reveal.textContent = sticker;
      modal.classList.remove('hidden');
    }
    // Also update backpack UI
    updateBackpackUI();
  }

  // Initialize
  load();

  return {
    registerCorrect: registerCorrect,
    getProgress: getProgress,
    getThreshold: getThreshold,
    setThreshold: setThreshold,
    getStickers: getStickers,
    getTotalCorrect: getTotalCorrect,
    getPlayerName: getPlayerName,
    setPlayerName: setPlayerName,
    updateBackpackUI: updateBackpackUI,
    showStickerModal: showStickerModal,
    getState: function() { return state; }
  };
})();

function closeStickerModal() {
  var modal = document.getElementById('sticker-modal');
  if (modal) modal.classList.add('hidden');
}
