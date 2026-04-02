// speech.js — Web Speech API wrapper for French TTS and STT

const SpeechManager = (function() {
  let frenchVoice = null;
  let voicesLoaded = false;
  const hasSynthesis = 'speechSynthesis' in window;
  const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
  const hasRecognition = !!SpeechRecognitionAPI;

  // Load French voice
  function loadVoices() {
    if (!hasSynthesis) return;
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      // Prefer a French female voice
      frenchVoice = voices.find(v => v.lang.startsWith('fr') && v.name.toLowerCase().includes('female'))
        || voices.find(v => v.lang.startsWith('fr'))
        || null;
      voicesLoaded = true;
    }
  }

  if (hasSynthesis) {
    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  // Speak text in French
  function speak(text, options) {
    options = options || {};
    return new Promise(function(resolve) {
      if (!hasSynthesis) {
        resolve();
        return;
      }
      // Cancel any pending speech
      speechSynthesis.cancel();

      var utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = options.rate || 0.85;
      utterance.pitch = options.pitch || 1.1;
      utterance.volume = options.volume || 1;
      if (frenchVoice) utterance.voice = frenchVoice;
      utterance.onend = function() { resolve(); };
      utterance.onerror = function() { resolve(); };

      // Chrome bug: sometimes speech doesn't start without a tiny delay
      setTimeout(function() {
        speechSynthesis.speak(utterance);
      }, 50);
    });
  }

  // Speak a number in French
  function speakNumber(num) {
    var data = getNumberData(num);
    if (data) {
      return speak(data.speech);
    }
    return speak(String(num));
  }

  // Speak encouragement
  function speakBravo() {
    var phrases = ['Bravo !', 'Super !', 'Génial !', 'Très bien !', 'Excellent !'];
    var phrase = phrases[Math.floor(Math.random() * phrases.length)];
    return speak(phrase, { rate: 1, pitch: 1.2 });
  }

  function speakEncourage() {
    var phrases = ['Essaie encore !', 'Presque !', 'Tu peux le faire !', 'Allez, encore un essai !'];
    var phrase = phrases[Math.floor(Math.random() * phrases.length)];
    return speak(phrase, { rate: 0.9, pitch: 1.0 });
  }

  // Listen for French speech, returns { transcript, confidence }
  function listen(timeoutMs) {
    timeoutMs = timeoutMs || 8000;
    return new Promise(function(resolve, reject) {
      if (!hasRecognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      var recognition = new SpeechRecognitionAPI();
      recognition.lang = 'fr-FR';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 3;

      var timer = setTimeout(function() {
        recognition.abort();
        reject(new Error('timeout'));
      }, timeoutMs);

      recognition.onresult = function(event) {
        clearTimeout(timer);
        var results = [];
        for (var i = 0; i < event.results[0].length; i++) {
          results.push({
            transcript: event.results[0][i].transcript.toLowerCase().trim(),
            confidence: event.results[0][i].confidence
          });
        }
        resolve(results);
      };

      recognition.onerror = function(event) {
        clearTimeout(timer);
        reject(new Error(event.error));
      };

      recognition.onnomatch = function() {
        clearTimeout(timer);
        reject(new Error('no-match'));
      };

      recognition.start();
    });
  }

  // Check if any result matches the expected number
  function checkSpeechResult(results, expectedNumber) {
    // Check exact match first
    for (var i = 0; i < results.length; i++) {
      if (matchesNumber(results[i].transcript, expectedNumber)) {
        return { matched: true, transcript: results[i].transcript };
      }
    }
    // Fuzzy match
    for (var j = 0; j < results.length; j++) {
      if (fuzzyMatchesNumber(results[j].transcript, expectedNumber, 3)) {
        return { matched: true, transcript: results[j].transcript };
      }
    }
    return { matched: false, transcript: results[0] ? results[0].transcript : '' };
  }

  return {
    hasSynthesis: hasSynthesis,
    hasRecognition: hasRecognition,
    speak: speak,
    speakNumber: speakNumber,
    speakBravo: speakBravo,
    speakEncourage: speakEncourage,
    listen: listen,
    checkSpeechResult: checkSpeechResult
  };
})();
