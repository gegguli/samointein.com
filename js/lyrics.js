const lyricsAudio = document.getElementById("audio");
const lyricsContainer = document.getElementById("lyrics");

// ======== VARIABLES ========
let lyrics = [];         // Array of {time, text, lineIndex, wordIndex}
let currentWordIndex = -1;

// ======== FETCH & PARSE LRC ========
fetch("assets/kolahtaa.lrc")
  .then(res => res.text())
  .then(text => {
    lyrics = parseWordLRC(text);
    console.log(lyrics)
    renderWordLyrics(lyrics);
  });

// ======== PARSE WORD-LEVEL LRC ========
function parseWordLRC(text) {
  const lines = text.split("\n");
  const result = [];
  lines.forEach((line, lineIndex) => {
    // Match all [mm:ss.xx]WORD pairs
    const regex = /\[(\d+):(\d+\.\d+)\](.*?)(?=\[|$)/g;
    let match, wordIndex = 0;
    while ((match = regex.exec(line)) !== null) {
      const minutes = parseInt(match[1]);
      const seconds = parseFloat(match[2]);
      const time = minutes * 60 + seconds;
      const word = match[3].trim();
      result.push({ time, text: word, lineIndex, wordIndex });
      wordIndex++;
    }
  });
  return result.sort((a, b) => a.time - b.time);
}

// ======== RENDER LYRICS ========
function renderWordLyrics(lyrics) {
  lyricsContainer.innerHTML = "";

  // Group words by lineIndex
  const linesMap = {};
  lyrics.forEach(wordObj => {
    if (!linesMap[wordObj.lineIndex]) linesMap[wordObj.lineIndex] = [];
    linesMap[wordObj.lineIndex].push(wordObj);
  });

  Object.keys(linesMap).forEach(lineIndex => {
    const lineDiv = document.createElement("div");
    lineDiv.className = "line";
    lineDiv.id = `line-${lineIndex}`;

    linesMap[lineIndex].forEach(wordObj => {
      const span = document.createElement("span");
      span.className = "word";
      span.id = `line-${wordObj.lineIndex}-word-${wordObj.wordIndex}`;
      span.textContent = wordObj.text + " ";
      lineDiv.appendChild(span);
    });

    lyricsContainer.appendChild(lineDiv);
  });
}

// ======== LYRICS SYNC ========
audio.addEventListener("timeupdate", () => {
  const time = audio.currentTime;

  for (let i = 0; i < lyrics.length; i++) {
    if (time >= lyrics[i].time && (i === lyrics.length - 1 || time < lyrics[i + 1].time)) {
      if (currentWordIndex !== i) {
        setActiveWord(i);
        currentWordIndex = i;
      }
      break;
    }
  }
});

// ======== HIGHLIGHT CURRENT WORD ========
function setActiveWord(index) {
  // Remove active from all words
  document.querySelectorAll(".word").forEach(w => w.classList.remove("active"));

  const wordObj = lyrics[index];
  if (!wordObj) return;

  const wordSpan = document.getElementById(
    `line-${wordObj.lineIndex}-word-${wordObj.wordIndex}`
  );
  if (wordSpan) {
    wordSpan.classList.add("active");
    // Scroll current line into view
    const lineDiv = document.getElementById(`line-${wordObj.lineIndex}`);
    lineDiv.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}
