const stage = document.querySelector("#reelStage");
const slides = [...document.querySelectorAll(".slide")];
const progressFill = document.querySelector("#progressFill");
const soundToggle = document.querySelector("#soundToggle");
const restart = document.querySelector("#restart");
const answerCount = document.querySelector("#answerCount");

let currentSlide = 0;
let choicesMade = 0;
let audioContext;
let musicTimer;
let soundEnabled = true;
let beat = 0;

const melody = [220, 277.18, 329.63, 415.3, 329.63, 277.18, 246.94, 329.63];

function setupAudio() {
  if (audioContext) return;
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  startMusic();
}

function tone(frequency, duration = 0.12, type = "sine", volume = 0.08) {
  if (!audioContext || !soundEnabled) return;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const now = audioContext.currentTime;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.02);
}

function clickSound() {
  tone(740, 0.08, "square", 0.05);
  setTimeout(() => tone(980, 0.09, "triangle", 0.045), 55);
}

function transitionSound() {
  tone(180, 0.13, "sawtooth", 0.04);
  setTimeout(() => tone(420, 0.16, "sine", 0.05), 80);
}

function startMusic() {
  clearInterval(musicTimer);
  musicTimer = setInterval(() => {
    if (!soundEnabled || !audioContext) return;
    const note = melody[beat % melody.length];
    tone(note, 0.18, beat % 4 === 0 ? "triangle" : "sine", 0.025);
    if (beat % 4 === 0) tone(82.41, 0.11, "sine", 0.05);
    beat += 1;
  }, 260);
}

function showSlide(index) {
  currentSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === currentSlide);
  });
  stage.dataset.theme = slides[currentSlide].dataset.theme;
  progressFill.style.width = `${((currentSlide + 1) / slides.length) * 100}%`;
  answerCount.textContent = choicesMade;
  transitionSound();
}

function nextSlide() {
  showSlide(currentSlide + 1);
}

document.querySelectorAll("[data-next]").forEach((button) => {
  button.addEventListener("click", () => {
    setupAudio();
    clickSound();
    button.classList.add("pop");
    setTimeout(() => button.classList.remove("pop"), 360);
    nextSlide();
  });
});

document.querySelectorAll("[data-choice]").forEach((button) => {
  button.addEventListener("click", () => {
    setupAudio();
    clickSound();
    choicesMade += 1;
    button.classList.add("pop");
    setTimeout(nextSlide, 260);
  });
});

soundToggle.addEventListener("click", () => {
  setupAudio();
  soundEnabled = !soundEnabled;
  soundToggle.textContent = soundEnabled ? "Sound On" : "Sound Off";
  if (soundEnabled) tone(660, 0.1, "triangle", 0.06);
});

restart.addEventListener("click", () => {
  setupAudio();
  clickSound();
  choicesMade = 0;
  showSlide(0);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === " ") {
    setupAudio();
    clickSound();
    nextSlide();
  }
});

showSlide(0);
