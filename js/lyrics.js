const audio = window.AudioController.audio;
const lyricsContainer = document.getElementById("lyrics");

let lyrics = [];
let currentIndex = -1;

// Load LRC file
fetch("assets/kolahtaa.lrc")
  .then(response => response.text())
  .then(text => {
    lyrics = parseLRC(text);
    renderLyrics();
  });

function parseLRC(text) {
  const lines = text.split("\n");
  const result = [];

  lines.forEach(line => {
    const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseFloat(match[2]);
      const time = minutes * 60 + seconds;
      const content = match[3].trim();

      result.push({ time, text: content });
    }
  });

  return result.sort((a, b) => a.time - b.time);
}

function renderLyrics() {
  lyrics.forEach((line, index) => {
    const div = document.createElement("div");
    div.className = "line";
    div.id = "line-" + index;
    div.textContent = line.text;
    lyricsContainer.appendChild(div);
  });
}

audio.addEventListener("timeupdate", () => {
  const time = audio.currentTime;

  for (let i = 0; i < lyrics.length; i++) {
    if (
      time >= lyrics[i].time &&
      (i === lyrics.length - 1 || time < lyrics[i + 1].time)
    ) {
      if (currentIndex !== i) {
        setActiveLine(i);
        currentIndex = i;
      }
      break;
    }
  }
});

function setActiveLine(index) {
  document.querySelectorAll(".line").forEach(line =>
    line.classList.remove("active")
  );

  const activeLine = document.getElementById("line-" + index);
  if (activeLine) {
    activeLine.classList.add("active");
    activeLine.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }
}
