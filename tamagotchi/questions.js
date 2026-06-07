// TamaLern - Fragendatenbank
// Kategorien: mathe, deutsch, englisch

const QUESTIONS = {
  mathe: [
    { q: "Was ist 7 × 8?", o: ["54", "56", "64", "48"], a: 1 },
    { q: "Was ist 9 × 9?", o: ["81", "72", "90", "79"], a: 0 },
    { q: "Was ist 6 × 7?", o: ["36", "42", "48", "54"], a: 1 },
    { q: "Was ist 8 × 8?", o: ["56", "72", "64", "70"], a: 2 },
    { q: "Was ist 144 ÷ 12?", o: ["10", "14", "12", "11"], a: 2 },
    { q: "Was ist 56 ÷ 8?", o: ["6", "9", "7", "8"], a: 2 },
    { q: "Was ist 63 ÷ 9?", o: ["6", "8", "9", "7"], a: 3 },
    { q: "Was ist 23 + 48?", o: ["61", "71", "81", "91"], a: 1 },
    { q: "Was ist 37 + 58?", o: ["85", "95", "75", "105"], a: 1 },
    { q: "Was ist 100 - 37?", o: ["63", "67", "53", "73"], a: 0 },
    { q: "Was ist 200 - 83?", o: ["107", "127", "117", "97"], a: 2 },
    { q: "Wie viel ist ¼ von 100?", o: ["20", "40", "25", "50"], a: 2 },
    { q: "Wie viel ist ½ von 80?", o: ["30", "40", "20", "50"], a: 1 },
    { q: "Wie viel ist ¾ von 60?", o: ["45", "30", "40", "35"], a: 0 },
    { q: "Was ist 3² (3 hoch 2)?", o: ["6", "8", "9", "12"], a: 2 },
    { q: "Was ist 2³ (2 hoch 3)?", o: ["6", "9", "8", "16"], a: 2 },
    { q: "Was ist 250 + 375?", o: ["600", "625", "615", "635"], a: 1 },
    { q: "Was ist 15% von 200?", o: ["20", "25", "30", "35"], a: 2 },
    { q: "Was ist 10% von 350?", o: ["25", "35", "40", "30"], a: 1 },
    { q: "Was ist 4 × 25?", o: ["80", "100", "90", "120"], a: 1 },
    { q: "Was ist das Doppelte von 37?", o: ["63", "74", "76", "84"], a: 1 },
    { q: "Was ist das Dreifache von 15?", o: ["30", "50", "45", "60"], a: 2 },
    { q: "Welche Zahl ist eine Primzahl?", o: ["4", "6", "7", "9"], a: 2 },
    { q: "Was ist 1000 - 456?", o: ["534", "554", "544", "564"], a: 2 },
    { q: "Wie viele cm hat 1 Meter?", o: ["10", "100", "1000", "50"], a: 1 },
    { q: "Wie viele Minuten hat 1 Stunde?", o: ["30", "100", "60", "90"], a: 2 },
    { q: "Wie viele Sekunden hat 1 Minute?", o: ["100", "50", "60", "30"], a: 2 },
    { q: "Was ist 2/3 von 90?", o: ["45", "60", "30", "75"], a: 1 },
    { q: "Welches ist die größte Zahl?", o: ["3/4", "2/3", "1/2", "5/8"], a: 0 },
    { q: "Was ergibt 3/4 + 1/4?", o: ["4/8", "1 Ganzes", "6/8", "1/2"], a: 1 },
  ],

  deutsch: [
    { q: "Welches Wort ist ein Nomen?", o: ["laufen", "schnell", "Haus", "aber"], a: 2 },
    { q: "Welches Wort ist ein Verb?", o: ["Hund", "rennen", "blau", "weil"], a: 1 },
    { q: "Welches Wort ist ein Adjektiv?", o: ["schreiben", "Apfel", "fröhlich", "und"], a: 2 },
    { q: "Was ist die Mehrzahl von 'Kind'?", o: ["Kinder", "Kinds", "Kinden", "Kindern"], a: 0 },
    { q: "Was ist die Mehrzahl von 'Haus'?", o: ["Hauser", "Häuser", "Hausen", "Hauses"], a: 1 },
    { q: "Welcher Artikel gehört zu 'Tisch'?", o: ["die", "das", "der", "den"], a: 2 },
    { q: "Welcher Artikel gehört zu 'Sonne'?", o: ["der", "das", "den", "die"], a: 3 },
    { q: "Welcher Artikel gehört zu 'Auto'?", o: ["der", "die", "das", "den"], a: 2 },
    { q: "Was ist das Gegenteil von 'groß'?", o: ["klein", "alt", "warm", "lang"], a: 0 },
    { q: "Was ist das Gegenteil von 'schnell'?", o: ["laut", "langsam", "kalt", "dünn"], a: 1 },
    { q: "Wie schreibt man es richtig?", o: ["fahrrad", "Fahr-Rad", "Fahrrad", "fahrRad"], a: 2 },
    { q: "Wie schreibt man es richtig?", o: ["Schmetterling", "schmetterling", "Schmetter-ling", "Schmetterling"], a: 0 },
    { q: "Was ist die Vergangenheit von 'laufen'?", o: ["laufte", "läufte", "lief", "laufte"], a: 2 },
    { q: "Was ist die Vergangenheit von 'schreiben'?", o: ["schrieb", "schreibte", "schrieben", "schreib"], a: 0 },
    { q: "'Ich ___ zur Schule.' Was fehlt?", o: ["gehen", "geht", "gehe", "gehst"], a: 2 },
    { q: "'Er ___ gerne Fußball.' Was fehlt?", o: ["spielen", "spielst", "spiele", "spielt"], a: 3 },
    { q: "Was bedeutet 'fröhlich'?", o: ["traurig", "müde", "glücklich", "ängstlich"], a: 2 },
    { q: "Was ist ein Synonym für 'schnell'?", o: ["langsam", "flink", "groß", "laut"], a: 1 },
    { q: "Welcher Satz ist korrekt?", o: ["Das Kind spielen.", "Das Kind spielt.", "Das Kinder spielt.", "Die Kind spielt."], a: 1 },
    { q: "Was ist 'Hund' auf Latein?", o: ["felis", "canis", "equus", "porcus"], a: 1 },
    { q: "Wie heißt der Verfasser eines Buches?", o: ["Leser", "Dichter", "Autor", "Verleger"], a: 2 },
    { q: "Was ist das Gegenteil von 'hell'?", o: ["kalt", "dunkel", "leer", "nass"], a: 1 },
    { q: "Welches Wort hat 3 Silben?", o: ["Haus", "Schule", "Elefant", "Auto"], a: 2 },
    { q: "Was ist die richtige Steigerung von 'gut'?", o: ["guter, am gutest", "besser, am besten", "mehr gut, am gutesten", "gut, am gut"], a: 1 },
    { q: "Was ist eine Konjunktion?", o: ["laufen", "schön", "und", "Baum"], a: 2 },
  ],

  englisch: [
    { q: "Was bedeutet 'beautiful'?", o: ["klein", "schön", "groß", "schnell"], a: 1 },
    { q: "Was bedeutet 'excited'?", o: ["müde", "traurig", "aufgeregt", "wütend"], a: 2 },
    { q: "Wie sagt man 'Hund' auf Englisch?", o: ["cat", "bird", "fish", "dog"], a: 3 },
    { q: "Wie sagt man 'Apfel' auf Englisch?", o: ["orange", "apple", "grape", "lemon"], a: 1 },
    { q: "Was bedeutet 'to write'?", o: ["lesen", "malen", "schreiben", "sprechen"], a: 2 },
    { q: "Was bedeutet 'to run'?", o: ["schlafen", "essen", "rennen", "singen"], a: 2 },
    { q: "'I ___ a student.' Was fehlt?", o: ["is", "are", "am", "be"], a: 2 },
    { q: "'She ___ every day.' (spielen) Was fehlt?", o: ["play", "playing", "played", "plays"], a: 3 },
    { q: "'I ___ to school yesterday.' Was fehlt?", o: ["go", "goes", "went", "gone"], a: 2 },
    { q: "Was ist das Plural von 'child'?", o: ["childs", "children", "childes", "childern"], a: 1 },
    { q: "Welche Farbe ist 'yellow'?", o: ["rot", "blau", "gelb", "grün"], a: 2 },
    { q: "Wie viele Tage hat eine Woche?", o: ["5", "6", "8", "7"], a: 3 },
    { q: "Was bedeutet 'hungry'?", o: ["müde", "krank", "hungrig", "durstig"], a: 2 },
    { q: "Was ist das Gegenteil von 'hot'?", o: ["warm", "cool", "cold", "nice"], a: 2 },
    { q: "Welche Jahreszeit ist 'summer'?", o: ["Frühling", "Herbst", "Winter", "Sommer"], a: 3 },
    { q: "'___ is your name?' Was fehlt?", o: ["How", "Where", "What", "Who"], a: 2 },
    { q: "Was bedeutet 'always'?", o: ["manchmal", "nie", "immer", "oft"], a: 2 },
    { q: "Wie sagt man 'Schule' auf Englisch?", o: ["church", "school", "shop", "house"], a: 1 },
    { q: "Was bedeutet 'difficult'?", o: ["einfach", "schwierig", "langweilig", "lustig"], a: 1 },
    { q: "Welches Verb ist unregelmäßig?", o: ["play - played", "jump - jumped", "go - went", "walk - walked"], a: 2 },
    { q: "Was bedeutet 'between'?", o: ["über", "unter", "neben", "zwischen"], a: 3 },
    { q: "'She has ___ cat.' Was fehlt?", o: ["a", "an", "the", "some"], a: 0 },
    { q: "Was ist die Vergangenheit von 'see'?", o: ["seed", "sawed", "saw", "seen"], a: 2 },
    { q: "Was bedeutet 'together'?", o: ["alleine", "zusammen", "manchmal", "sofort"], a: 1 },
    { q: "Wie sagt man '2. Februar' auf Englisch?", o: ["the second of January", "the second of February", "the two February", "February two"], a: 1 },
  ],
};

// Gibt eine zufällige, noch nicht gesehene Frage zurück
const _seenIdx = { mathe: new Set(), deutsch: new Set(), englisch: new Set() };

function getQuestion(subject) {
  const pool = QUESTIONS[subject];
  if (_seenIdx[subject].size >= pool.length) _seenIdx[subject].clear();
  let idx;
  do { idx = Math.floor(Math.random() * pool.length); }
  while (_seenIdx[subject].has(idx));
  _seenIdx[subject].add(idx);
  return { ...pool[idx], subject };
}
