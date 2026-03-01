const player = document.getElementById("player");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const seekBtn = document.getElementById("seekBtn");

const audio = document.getElementById("audio");
const JUMP_TIME = 64.6; // seconds

function playAudio() {
  audio.play();
}

function pauseAudio() {
  audio.pause();
}

function seekToPoint() {
  audio.currentTime = JUMP_TIME;
}

window.AudioController = {
  playAudio,
  pauseAudio,
  seekToPoint
};


mainBtn.addEventListener("click", () => {
  if (audio.paused) {
    audio.play();
    mainIcon.classList.remove("mdi-cup");
    mainIcon.classList.add("mdi-cup-off");
    player.classList.add("active"); // expand wrapper + show seek
  } else {
    audio.pause();
    mainIcon.classList.remove("mdi-cup-off");
    mainIcon.classList.add("mdi-cup");
    player.classList.remove("active"); // collapse wrapper + hide seek
  }
});



seekBtn.addEventListener("click", () => {
  window.AudioController.seekToPoint();
});


// Sync buttons with audio state
audio.addEventListener("play", () => {
  mainIcon.classList.remove("mdi-cup");
  mainIcon.classList.add("mdi-cup-off");
  player.classList.add("active");
});

audio.addEventListener("pause", () => {
  mainIcon.classList.remove("mdi-cup-off");
  mainIcon.classList.add("mdi-cup");
  player.classList.remove("active");
});