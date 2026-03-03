const lyricsAudio = document.getElementById("audio");
const lyricsContainer = document.getElementById("lyrics");
const lyricsJSON = "assets/kolahtaa.json";
const extraHighlight = new Set(["Kuolleet shotit", "Eräkoira,"]); // modify as needed

// time (in seconds) when lyrics should appear
const lyricsAppearTime = 5;

// ======== VARIABLES ========
let paragraphs = []; 
let wordsInfo = [];            // flat list of all words with timing and indices
let currentWordIndex = -1;    // pointer into wordsInfo
let currentParagraphIndex = -1; // track for external use
let currentLineIndex = -1;      // track for external use
fetchJSONData(lyricsJSON);

async function fetchJSONData(JSON) {
  const response = await fetch(JSON);
  const json = await response.json();
  const result = groupWords(json);     // returns both structures
  paragraphs = result.paragraphs;
  wordsInfo = result.wordsInfo;
  renderLyrics(paragraphs);
}


function groupWords(json) {
  const lyricsWords = json.words;
  const paragraphs = [];
  const lineIndexMap = {};
  const wordsInfo = [];

  lyricsWords.forEach(word => {
    const { pIndex, lIndex } = word;

    if (!paragraphs[pIndex]) {
      paragraphs[pIndex] = [];
      lineIndexMap[pIndex] = {};
    }

    if (lineIndexMap[pIndex][lIndex] === undefined) {
      lineIndexMap[pIndex][lIndex] = paragraphs[pIndex].length;
    }

    const normalizedLIndex = lineIndexMap[pIndex][lIndex];

    if (!paragraphs[pIndex][normalizedLIndex]) {
      paragraphs[pIndex][normalizedLIndex] = [];
    }

    const wIndex = paragraphs[pIndex][normalizedLIndex].push(word) - 1;
    wordsInfo.push({ ...word, pIndex, lIndex: normalizedLIndex, wIndex });
  });

  wordsInfo.sort((a, b) => a.start - b.start);
  return { paragraphs, wordsInfo };
}

function renderLyrics(paragraphs) {
  lyricsContainer.innerHTML = "";
  const frag = document.createDocumentFragment();

  paragraphs.forEach((lines, pIndex) => {
    const paragraphDiv = document.createElement("p");
    paragraphDiv.className = "paragraph";
    paragraphDiv.id = `paragraph-${pIndex}`;

    lines.forEach((words, lIndex) => {
      const lineDiv = document.createElement("div");
      lineDiv.className = "line";
      lineDiv.id = `paragraph-${pIndex}-line-${lIndex}`;

      words.forEach((word, wIndex) => {
        const span = document.createElement("span");
        span.className = "word";
        span.id = `paragraph-${pIndex}-line-${lIndex}-word-${wIndex}`;
        span.dataset.text = word.text;                        // store text for later
        span.textContent = word.text + " ";
        lineDiv.appendChild(span);
      });

      paragraphDiv.appendChild(lineDiv);
    });

    frag.appendChild(paragraphDiv);
  });

  lyricsContainer.appendChild(frag);
}

// ======== LYRICS SYNC ========
let rafId = null;

// start high‑frequency polling when playback begins
audio.addEventListener("play", startSync);
audio.addEventListener("pause", stopSync);
audio.addEventListener("ended", stopSync);

function startSync() {
  if (rafId !== null) return;
  function tick() {
    syncWord(audio.currentTime);
    rafId = requestAnimationFrame(tick);
  }
  tick();
}

function stopSync() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

// central update logic exported so it can also be used by timeupdate if desired
function syncWord(time) {
  // show or hide lyrics based on threshold
  if (time >= lyricsAppearTime) {
    lyricsContainer.classList.add("visible");
  } else {
    lyricsContainer.classList.remove("visible");
    return;
  }

  if (!wordsInfo.length) return;

  // quick check: still inside same word?
  if (
    currentWordIndex !== -1 &&
    time >= wordsInfo[currentWordIndex].start &&
    time < wordsInfo[currentWordIndex].end
  ) {
    return; // nothing changed
  }

  // attempt to advance linearly from last index to catch words
  let idx = currentWordIndex;
  if (idx !== -1) {
    while (
      idx + 1 < wordsInfo.length &&
      time >= wordsInfo[idx + 1].start
    ) {
      idx++;
    }
    if (idx !== currentWordIndex) {
      setActiveByIndex(idx);
      return;
    }
  }

  // binary search fallback (handles seeks/jumps)
  let low = 0,
    high = wordsInfo.length - 1,
    found = -1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const w = wordsInfo[mid];
    if (time < w.start) {
      high = mid - 1;
    } else if (time >= w.end) {
      low = mid + 1;
    } else {
      found = mid;
      break;
    }
  }

  if (found !== -1) {
    setActiveByIndex(found);
  }
}

// helper to avoid duplicating the DOM work
function setActiveByIndex(index) {
  const w = wordsInfo[index];
  setActiveWord(w.pIndex, w.lIndex, w.wIndex);
  currentWordIndex = index;
  currentParagraphIndex = w.pIndex;
  currentLineIndex = w.lIndex;
}

// fall back in case some browsers still fire timeupdate sparsely
// (not strictly necessary but harmless)
audio.addEventListener("timeupdate", () => {
  syncWord(audio.currentTime);
});

// ======== HIGHLIGHT CURRENT WORD ========
function setActiveWord(pIndex, lIndex, wIndex) {
  // Remove active (and special) from all words
  document.querySelectorAll(".word").forEach(w => {
    w.classList.remove("active", "extra");
  });

  const wordObj = paragraphs[pIndex][lIndex][wIndex];
  if (!wordObj) return;
  const wordSpan = document.getElementById(
    `paragraph-${pIndex}-line-${lIndex}-word-${wIndex}`
  );
  if (wordSpan) {
    wordSpan.classList.add("active");
    // if the text appears in the extraHighlight set, add extra highlight
    if (extraHighlight.has(wordObj.text)) {
      wordSpan.classList.add("extra");
    }
    // Scroll current line into view
    const lineDiv = document.getElementById(`paragraph-${pIndex}-line-${lIndex}`);
    lineDiv.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}
