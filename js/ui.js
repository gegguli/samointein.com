const wrapper = document.getElementById("wrapper");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const seekBtn = document.getElementById("seekBtn");

playBtn.addEventListener("click", () => {
  window.AudioController.playAudio();
  wrapper.classList.add("active");
});

pauseBtn.addEventListener("click", () => {
  window.AudioController.togglePause();
});

seekBtn.addEventListener("click", () => {
  window.AudioController.seekToPoint();
});
