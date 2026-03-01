const lyricsAudio = document.getElementById("audio");
const lyricsContainer = document.getElementById("lyrics");
const lyricsJSON = "assets/kolahtaa.json"

// ======== VARIABLES ========
let paragraphs = []; 
let currentWordIndex = -1;
fetchJSONData(lyricsJSON)

async function fetchJSONData(JSON) {
  const response = await fetch(JSON);
  const json = await response.json();
  paragraphs = groupWords(json);
  renderLyrics(paragraphs);
}

function groupWords(json) {
  const lyricsWords = json.words;
  const paragraphs = [];
  const lineIndexMap = {};

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

    paragraphs[pIndex][normalizedLIndex].push(word);
  });

  return paragraphs;
}

function renderLyrics(paragraphs) {
  lyricsContainer.innerHTML = "";

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
        span.id = `paragraph-${pIndex}-line-${lIndex}-word-${wIndex}`
        span.textContent = word.text + " ";
        lineDiv.appendChild(span);
      });

      paragraphDiv.appendChild(lineDiv);
    });

    lyricsContainer.appendChild(paragraphDiv);
  });
}

// ======== LYRICS SYNC ========
audio.addEventListener("timeupdate", () => {
  if (!paragraphs || paragraphs.length === 0) return;
  const time = audio.currentTime;
  //console.log(paragraphs)
  for (let i = 0; i < paragraphs.length; i++) {
    const pStartTime = paragraphs[i][0][0].start
    const pEndTime = paragraphs[i][paragraphs[i].length - 1][paragraphs[i][paragraphs[i].length - 1].length - 1].end    
    if ( (time >= pStartTime) && (time < pEndTime) ) {
      for (let j = 0; j < paragraphs[i].length; j++) {
        const lStartTime = paragraphs[i][j][0].start
        const lEndTime = paragraphs[i][j][paragraphs[i][j].length - 1].end
        if ( ( time >= lStartTime) && (time < lEndTime) ) {
          for (let k = 0; k < paragraphs[i][j].length; k++) {
            const wStartTime = paragraphs[i][j][k].start
            const wEndTime = paragraphs[i][j][k].end
            if ( ( time >= wStartTime) && (time < wEndTime) ) {
              setActiveWord(i, j, k);
              currentParagraphIndex = i;
              currentLineIndex = j;
              currentWordIndex = k;
              
            }
          }
        }
      }

    }


    //if (time >= lyrics[i].time && (i === lyrics.length - 1 || time < lyrics[i + 1].time)) {
    //  if (currentWordIndex !== i) {
    //    setActiveWord(i);
    //    currentWordIndex = i;
    //  }
    //  break;
    //}

  }
});

// ======== HIGHLIGHT CURRENT WORD ========
function setActiveWord(pIndex, lIndex, wIndex) {
  // Remove active from all words
  document.querySelectorAll(".word").forEach(w => w.classList.remove("active"));

  const wordObj = paragraphs[pIndex][lIndex][wIndex];
  //console.log("p" + pIndex + " l" + lIndex + " w" + wIndex + ": " + wordObj.text)
  
  if (!wordObj) return;
  const wordSpan = document.getElementById(
    `paragraph-${pIndex}-line-${lIndex}-word-${wIndex}`
  );
  if (wordSpan) {
    wordSpan.classList.add("active");
    // Scroll current line into view
    const lineDiv = document.getElementById(`paragraph-${pIndex}-line-${lIndex}`);
    lineDiv.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}
