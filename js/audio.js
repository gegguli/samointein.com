const audio = document.getElementById("audio");

const JUMP_TIME = 30; // seconds

function playAudio() {
  audio.play();
}

function pauseAudio() {
  audio.pause();
}

function togglePause() {
  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
}

function seekToPoint() {
  audio.currentTime = JUMP_TIME;
}

// Make functions globally accessible for ui.js
window.AudioController = {
  playAudio,
  togglePause,
  seekToPoint
};
