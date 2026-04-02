// french-numbers.js — Complete French number data for 0-100
// Each entry: { written, speech, acceptedSpeech[], group }

const FRENCH_NUMBERS = {
  0:   { written: "zéro",              speech: "zéro",              acceptedSpeech: ["zéro", "zero"],                                          group: "unités" },
  1:   { written: "un",                speech: "un",                acceptedSpeech: ["un", "1"],                                               group: "unités" },
  2:   { written: "deux",              speech: "deux",              acceptedSpeech: ["deux", "2"],                                              group: "unités" },
  3:   { written: "trois",             speech: "trois",             acceptedSpeech: ["trois", "3"],                                             group: "unités" },
  4:   { written: "quatre",            speech: "quatre",            acceptedSpeech: ["quatre", "4"],                                            group: "unités" },
  5:   { written: "cinq",              speech: "cinq",              acceptedSpeech: ["cinq", "5"],                                              group: "unités" },
  6:   { written: "six",               speech: "six",               acceptedSpeech: ["six", "6", "sis"],                                       group: "unités" },
  7:   { written: "sept",              speech: "sept",              acceptedSpeech: ["sept", "7", "set"],                                      group: "unités" },
  8:   { written: "huit",              speech: "huit",              acceptedSpeech: ["huit", "8"],                                              group: "unités" },
  9:   { written: "neuf",              speech: "neuf",              acceptedSpeech: ["neuf", "9"],                                              group: "unités" },
  10:  { written: "dix",               speech: "dix",               acceptedSpeech: ["dix", "10", "dis"],                                      group: "dizaines-spéciales" },
  11:  { written: "onze",              speech: "onze",              acceptedSpeech: ["onze", "11"],                                             group: "dizaines-spéciales" },
  12:  { written: "douze",             speech: "douze",             acceptedSpeech: ["douze", "12"],                                            group: "dizaines-spéciales" },
  13:  { written: "treize",            speech: "treize",            acceptedSpeech: ["treize", "13"],                                           group: "dizaines-spéciales" },
  14:  { written: "quatorze",          speech: "quatorze",          acceptedSpeech: ["quatorze", "14"],                                         group: "dizaines-spéciales" },
  15:  { written: "quinze",            speech: "quinze",            acceptedSpeech: ["quinze", "15"],                                           group: "dizaines-spéciales" },
  16:  { written: "seize",             speech: "seize",             acceptedSpeech: ["seize", "16"],                                            group: "dizaines-spéciales" },
  17:  { written: "dix-sept",          speech: "dix-sept",          acceptedSpeech: ["dix-sept", "dix sept", "17"],                             group: "dizaines-spéciales" },
  18:  { written: "dix-huit",          speech: "dix-huit",          acceptedSpeech: ["dix-huit", "dix huit", "18"],                             group: "dizaines-spéciales" },
  19:  { written: "dix-neuf",          speech: "dix-neuf",          acceptedSpeech: ["dix-neuf", "dix neuf", "19"],                             group: "dizaines-spéciales" },
  20:  { written: "vingt",             speech: "vingt",             acceptedSpeech: ["vingt", "20", "vin"],                                    group: "dizaines" },
  21:  { written: "vingt-et-un",       speech: "vingt-et-un",       acceptedSpeech: ["vingt-et-un", "vingt et un", "21"],                      group: "dizaines" },
  22:  { written: "vingt-deux",        speech: "vingt-deux",        acceptedSpeech: ["vingt-deux", "vingt deux", "22"],                        group: "dizaines" },
  23:  { written: "vingt-trois",       speech: "vingt-trois",       acceptedSpeech: ["vingt-trois", "vingt trois", "23"],                      group: "dizaines" },
  24:  { written: "vingt-quatre",      speech: "vingt-quatre",      acceptedSpeech: ["vingt-quatre", "vingt quatre", "24"],                    group: "dizaines" },
  25:  { written: "vingt-cinq",        speech: "vingt-cinq",        acceptedSpeech: ["vingt-cinq", "vingt cinq", "25"],                        group: "dizaines" },
  26:  { written: "vingt-six",         speech: "vingt-six",         acceptedSpeech: ["vingt-six", "vingt six", "26"],                          group: "dizaines" },
  27:  { written: "vingt-sept",        speech: "vingt-sept",        acceptedSpeech: ["vingt-sept", "vingt sept", "27"],                        group: "dizaines" },
  28:  { written: "vingt-huit",        speech: "vingt-huit",        acceptedSpeech: ["vingt-huit", "vingt huit", "28"],                        group: "dizaines" },
  29:  { written: "vingt-neuf",        speech: "vingt-neuf",        acceptedSpeech: ["vingt-neuf", "vingt neuf", "29"],                        group: "dizaines" },
  30:  { written: "trente",            speech: "trente",            acceptedSpeech: ["trente", "30"],                                           group: "dizaines" },
  31:  { written: "trente-et-un",      speech: "trente-et-un",      acceptedSpeech: ["trente-et-un", "trente et un", "31"],                    group: "dizaines" },
  32:  { written: "trente-deux",       speech: "trente-deux",       acceptedSpeech: ["trente-deux", "trente deux", "32"],                      group: "dizaines" },
  33:  { written: "trente-trois",      speech: "trente-trois",      acceptedSpeech: ["trente-trois", "trente trois", "33"],                    group: "dizaines" },
  34:  { written: "trente-quatre",     speech: "trente-quatre",     acceptedSpeech: ["trente-quatre", "trente quatre", "34"],                  group: "dizaines" },
  35:  { written: "trente-cinq",       speech: "trente-cinq",       acceptedSpeech: ["trente-cinq", "trente cinq", "35"],                      group: "dizaines" },
  36:  { written: "trente-six",        speech: "trente-six",        acceptedSpeech: ["trente-six", "trente six", "36"],                        group: "dizaines" },
  37:  { written: "trente-sept",       speech: "trente-sept",       acceptedSpeech: ["trente-sept", "trente sept", "37"],                      group: "dizaines" },
  38:  { written: "trente-huit",       speech: "trente-huit",       acceptedSpeech: ["trente-huit", "trente huit", "38"],                      group: "dizaines" },
  39:  { written: "trente-neuf",       speech: "trente-neuf",       acceptedSpeech: ["trente-neuf", "trente neuf", "39"],                      group: "dizaines" },
  40:  { written: "quarante",          speech: "quarante",          acceptedSpeech: ["quarante", "40"],                                         group: "dizaines" },
  41:  { written: "quarante-et-un",    speech: "quarante-et-un",    acceptedSpeech: ["quarante-et-un", "quarante et un", "41"],                group: "dizaines" },
  42:  { written: "quarante-deux",     speech: "quarante-deux",     acceptedSpeech: ["quarante-deux", "quarante deux", "42"],                  group: "dizaines" },
  43:  { written: "quarante-trois",    speech: "quarante-trois",    acceptedSpeech: ["quarante-trois", "quarante trois", "43"],                group: "dizaines" },
  44:  { written: "quarante-quatre",   speech: "quarante-quatre",   acceptedSpeech: ["quarante-quatre", "quarante quatre", "44"],              group: "dizaines" },
  45:  { written: "quarante-cinq",     speech: "quarante-cinq",     acceptedSpeech: ["quarante-cinq", "quarante cinq", "45"],                  group: "dizaines" },
  46:  { written: "quarante-six",      speech: "quarante-six",      acceptedSpeech: ["quarante-six", "quarante six", "46"],                    group: "dizaines" },
  47:  { written: "quarante-sept",     speech: "quarante-sept",     acceptedSpeech: ["quarante-sept", "quarante sept", "47"],                  group: "dizaines" },
  48:  { written: "quarante-huit",     speech: "quarante-huit",     acceptedSpeech: ["quarante-huit", "quarante huit", "48"],                  group: "dizaines" },
  49:  { written: "quarante-neuf",     speech: "quarante-neuf",     acceptedSpeech: ["quarante-neuf", "quarante neuf", "49"],                  group: "dizaines" },
  50:  { written: "cinquante",         speech: "cinquante",         acceptedSpeech: ["cinquante", "50"],                                        group: "dizaines" },
  51:  { written: "cinquante-et-un",   speech: "cinquante-et-un",   acceptedSpeech: ["cinquante-et-un", "cinquante et un", "51"],              group: "dizaines" },
  52:  { written: "cinquante-deux",    speech: "cinquante-deux",    acceptedSpeech: ["cinquante-deux", "cinquante deux", "52"],                group: "dizaines" },
  53:  { written: "cinquante-trois",   speech: "cinquante-trois",   acceptedSpeech: ["cinquante-trois", "cinquante trois", "53"],              group: "dizaines" },
  54:  { written: "cinquante-quatre",  speech: "cinquante-quatre",  acceptedSpeech: ["cinquante-quatre", "cinquante quatre", "54"],            group: "dizaines" },
  55:  { written: "cinquante-cinq",    speech: "cinquante-cinq",    acceptedSpeech: ["cinquante-cinq", "cinquante cinq", "55"],                group: "dizaines" },
  56:  { written: "cinquante-six",     speech: "cinquante-six",     acceptedSpeech: ["cinquante-six", "cinquante six", "56"],                  group: "dizaines" },
  57:  { written: "cinquante-sept",    speech: "cinquante-sept",    acceptedSpeech: ["cinquante-sept", "cinquante sept", "57"],                group: "dizaines" },
  58:  { written: "cinquante-huit",    speech: "cinquante-huit",    acceptedSpeech: ["cinquante-huit", "cinquante huit", "58"],                group: "dizaines" },
  59:  { written: "cinquante-neuf",    speech: "cinquante-neuf",    acceptedSpeech: ["cinquante-neuf", "cinquante neuf", "59"],                group: "dizaines" },
  60:  { written: "soixante",          speech: "soixante",          acceptedSpeech: ["soixante", "60"],                                         group: "dizaines" },
  61:  { written: "soixante-et-un",    speech: "soixante-et-un",    acceptedSpeech: ["soixante-et-un", "soixante et un", "61"],                group: "dizaines" },
  62:  { written: "soixante-deux",     speech: "soixante-deux",     acceptedSpeech: ["soixante-deux", "soixante deux", "62"],                  group: "dizaines" },
  63:  { written: "soixante-trois",    speech: "soixante-trois",    acceptedSpeech: ["soixante-trois", "soixante trois", "63"],                group: "dizaines" },
  64:  { written: "soixante-quatre",   speech: "soixante-quatre",   acceptedSpeech: ["soixante-quatre", "soixante quatre", "64"],              group: "dizaines" },
  65:  { written: "soixante-cinq",     speech: "soixante-cinq",     acceptedSpeech: ["soixante-cinq", "soixante cinq", "65"],                  group: "dizaines" },
  66:  { written: "soixante-six",      speech: "soixante-six",      acceptedSpeech: ["soixante-six", "soixante six", "66"],                    group: "dizaines" },
  67:  { written: "soixante-sept",     speech: "soixante-sept",     acceptedSpeech: ["soixante-sept", "soixante sept", "67"],                  group: "dizaines" },
  68:  { written: "soixante-huit",     speech: "soixante-huit",     acceptedSpeech: ["soixante-huit", "soixante huit", "68"],                  group: "dizaines" },
  69:  { written: "soixante-neuf",     speech: "soixante-neuf",     acceptedSpeech: ["soixante-neuf", "soixante neuf", "69"],                  group: "dizaines" },
  70:  { written: "soixante-dix",      speech: "soixante-dix",      acceptedSpeech: ["soixante-dix", "soixante dix", "70"],                    group: "soixante-dix" },
  71:  { written: "soixante-et-onze",  speech: "soixante-et-onze",  acceptedSpeech: ["soixante-et-onze", "soixante et onze", "71"],            group: "soixante-dix" },
  72:  { written: "soixante-douze",    speech: "soixante-douze",    acceptedSpeech: ["soixante-douze", "soixante douze", "72"],                group: "soixante-dix" },
  73:  { written: "soixante-treize",   speech: "soixante-treize",   acceptedSpeech: ["soixante-treize", "soixante treize", "73"],              group: "soixante-dix" },
  74:  { written: "soixante-quatorze", speech: "soixante-quatorze", acceptedSpeech: ["soixante-quatorze", "soixante quatorze", "74"],          group: "soixante-dix" },
  75:  { written: "soixante-quinze",   speech: "soixante-quinze",   acceptedSpeech: ["soixante-quinze", "soixante quinze", "75"],              group: "soixante-dix" },
  76:  { written: "soixante-seize",    speech: "soixante-seize",    acceptedSpeech: ["soixante-seize", "soixante seize", "76"],                group: "soixante-dix" },
  77:  { written: "soixante-dix-sept", speech: "soixante-dix-sept", acceptedSpeech: ["soixante-dix-sept", "soixante dix sept", "77"],          group: "soixante-dix" },
  78:  { written: "soixante-dix-huit", speech: "soixante-dix-huit", acceptedSpeech: ["soixante-dix-huit", "soixante dix huit", "78"],          group: "soixante-dix" },
  79:  { written: "soixante-dix-neuf", speech: "soixante-dix-neuf", acceptedSpeech: ["soixante-dix-neuf", "soixante dix neuf", "79"],          group: "soixante-dix" },
  80:  { written: "quatre-vingts",     speech: "quatre-vingts",     acceptedSpeech: ["quatre-vingts", "quatre vingts", "quatre vingt", "80"], group: "quatre-vingts" },
  81:  { written: "quatre-vingt-un",   speech: "quatre-vingt-un",   acceptedSpeech: ["quatre-vingt-un", "quatre vingt un", "81"],              group: "quatre-vingts" },
  82:  { written: "quatre-vingt-deux", speech: "quatre-vingt-deux", acceptedSpeech: ["quatre-vingt-deux", "quatre vingt deux", "82"],          group: "quatre-vingts" },
  83:  { written: "quatre-vingt-trois",speech: "quatre-vingt-trois",acceptedSpeech: ["quatre-vingt-trois", "quatre vingt trois", "83"],        group: "quatre-vingts" },
  84:  { written: "quatre-vingt-quatre",speech:"quatre-vingt-quatre",acceptedSpeech:["quatre-vingt-quatre","quatre vingt quatre","84"],        group: "quatre-vingts" },
  85:  { written: "quatre-vingt-cinq", speech: "quatre-vingt-cinq", acceptedSpeech: ["quatre-vingt-cinq", "quatre vingt cinq", "85"],          group: "quatre-vingts" },
  86:  { written: "quatre-vingt-six",  speech: "quatre-vingt-six",  acceptedSpeech: ["quatre-vingt-six", "quatre vingt six", "86"],            group: "quatre-vingts" },
  87:  { written: "quatre-vingt-sept", speech: "quatre-vingt-sept", acceptedSpeech: ["quatre-vingt-sept", "quatre vingt sept", "87"],          group: "quatre-vingts" },
  88:  { written: "quatre-vingt-huit", speech: "quatre-vingt-huit", acceptedSpeech: ["quatre-vingt-huit", "quatre vingt huit", "88"],          group: "quatre-vingts" },
  89:  { written: "quatre-vingt-neuf", speech: "quatre-vingt-neuf", acceptedSpeech: ["quatre-vingt-neuf", "quatre vingt neuf", "89"],          group: "quatre-vingts" },
  90:  { written: "quatre-vingt-dix",  speech: "quatre-vingt-dix",  acceptedSpeech: ["quatre-vingt-dix", "quatre vingt dix", "90"],            group: "quatre-vingt-dix" },
  91:  { written: "quatre-vingt-onze", speech: "quatre-vingt-onze", acceptedSpeech: ["quatre-vingt-onze", "quatre vingt onze", "91"],          group: "quatre-vingt-dix" },
  92:  { written: "quatre-vingt-douze",speech: "quatre-vingt-douze",acceptedSpeech: ["quatre-vingt-douze", "quatre vingt douze", "92"],        group: "quatre-vingt-dix" },
  93:  { written: "quatre-vingt-treize",speech:"quatre-vingt-treize",acceptedSpeech:["quatre-vingt-treize","quatre vingt treize","93"],        group: "quatre-vingt-dix" },
  94:  { written: "quatre-vingt-quatorze",speech:"quatre-vingt-quatorze",acceptedSpeech:["quatre-vingt-quatorze","quatre vingt quatorze","94"],group: "quatre-vingt-dix" },
  95:  { written: "quatre-vingt-quinze",speech:"quatre-vingt-quinze",acceptedSpeech:["quatre-vingt-quinze","quatre vingt quinze","95"],        group: "quatre-vingt-dix" },
  96:  { written: "quatre-vingt-seize",speech: "quatre-vingt-seize",acceptedSpeech: ["quatre-vingt-seize", "quatre vingt seize", "96"],        group: "quatre-vingt-dix" },
  97:  { written: "quatre-vingt-dix-sept",speech:"quatre-vingt-dix-sept",acceptedSpeech:["quatre-vingt-dix-sept","quatre vingt dix sept","97"],group: "quatre-vingt-dix" },
  98:  { written: "quatre-vingt-dix-huit",speech:"quatre-vingt-dix-huit",acceptedSpeech:["quatre-vingt-dix-huit","quatre vingt dix huit","98"],group: "quatre-vingt-dix" },
  99:  { written: "quatre-vingt-dix-neuf",speech:"quatre-vingt-dix-neuf",acceptedSpeech:["quatre-vingt-dix-neuf","quatre vingt dix neuf","99"],group: "quatre-vingt-dix" },
  100: { written: "cent",              speech: "cent",              acceptedSpeech: ["cent", "100", "sans"],                                   group: "cent" }
};

// Helper: get number data
function getNumberData(n) {
  return FRENCH_NUMBERS[n];
}

// Helper: get all numbers in a range
function getNumbersInRange(from, to) {
  const result = [];
  const step = from <= to ? 1 : -1;
  for (let i = from; step > 0 ? i <= to : i >= to; i += step) {
    result.push(i);
  }
  return result;
}

// Helper: normalize speech text for comparison
function normalizeSpeech(text) {
  return text.toLowerCase().replace(/[-]/g, ' ').replace(/\s+/g, ' ').trim();
}

// Helper: check if spoken text matches a number
function matchesNumber(spokenText, number) {
  const normalized = normalizeSpeech(spokenText);
  const data = FRENCH_NUMBERS[number];
  if (!data) return false;
  return data.acceptedSpeech.some(variant => normalizeSpeech(variant) === normalized);
}

// Helper: Levenshtein distance for fuzzy matching
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    }
  }
  return dp[m][n];
}

// Fuzzy match: returns true if spoken text is close enough to any accepted variant
function fuzzyMatchesNumber(spokenText, number, maxDistance) {
  maxDistance = maxDistance || 3;
  const normalized = normalizeSpeech(spokenText);
  const data = FRENCH_NUMBERS[number];
  if (!data) return false;
  // Exact match first
  if (matchesNumber(spokenText, number)) return true;
  // Fuzzy match
  return data.acceptedSpeech.some(variant => {
    return levenshtein(normalized, normalizeSpeech(variant)) <= maxDistance;
  });
}
