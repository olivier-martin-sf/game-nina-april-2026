// speech.js — ElevenLabs TTS + Web Speech Recognition wrapper

const SpeechManager = (function() {
  const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
  const hasRecognition = !!SpeechRecognitionAPI;

  // ─── ElevenLabs TTS Configuration ───
  // Replace these with your own ElevenLabs API key and voice ID.
  // Get your API key at: https://elevenlabs.io/app/settings/api-keys
  // Find voice IDs at: https://elevenlabs.io/app/voice-library
  const XI_KEY = "your_elevenlabs_api_key_here";
  const XI_VOICE = "your_voice_id_here";

  const audioCache = new Map();
  let currentAudio = null;

  // Speak text in French using ElevenLabs
  function speak(text) {
    return new Promise(function(resolve) {
      (async function() {
        try {
          // Stop any currently playing audio
          if (currentAudio) { currentAudio.pause(); currentAudio = null; }

          var url = audioCache.get(text);
          if (!url) {
            var res = await fetch(
              'https://api.elevenlabs.io/v1/text-to-speech/' + XI_VOICE,
              {
                method: 'POST',
                headers: {
                  'xi-api-key': XI_KEY,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  text: text,
                  model_id: 'eleven_multilingual_v2',
                  language_code: 'fr',
                  apply_text_normalization: 'on',
                  voice_settings: {
                    stability: 0.55,
                    similarity_boost: 0.8,
                    speed: 0.85
                  }
                })
              }
            );
            if (!res.ok) throw new Error('ElevenLabs API error ' + res.status);
            var blob = await res.blob();
            url = URL.createObjectURL(blob);
            audioCache.set(text, url);
          }

          var audio = new Audio(url);
          currentAudio = audio;
          audio.onended = function() { currentAudio = null; resolve(); };
          audio.onerror = function() { currentAudio = null; resolve(); };
          audio.play();
        } catch (e) {
          console.error('TTS error:', e);
          currentAudio = null;
          resolve();
        }
      })();
    });
  }

  // Stop any currently playing audio
  function stopSpeaking() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
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
    return speak(phrase);
  }

  function speakEncourage() {
    var phrases = ['Essaie encore !', 'Presque !', 'Tu peux le faire !', 'Allez, encore un essai !'];
    var phrase = phrases[Math.floor(Math.random() * phrases.length)];
    return speak(phrase);
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
    hasRecognition: hasRecognition,
    speak: speak,
    speakNumber: speakNumber,
    speakBravo: speakBravo,
    speakEncourage: speakEncourage,
    stopSpeaking: stopSpeaking,
    listen: listen,
    checkSpeechResult: checkSpeechResult
  };
})();
