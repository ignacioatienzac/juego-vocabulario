const GAME_SECONDS = 60;
const OPTIONS_PER_ROUND = 4;

const vocabulary = [
  {
    label: "hacer fotos",
    image: "images/hacer-fotos.jpg",
    color: "#2f80ed",
  },
  {
    label: "descansar",
    image: "images/descansar.jpg",
    color: "#19a974",
  },
  {
    label: "ir a la playa",
    image: "images/ir-a-la-playa.jpg",
    color: "#ef6f6c",
  },
  {
    label: "ir a un museo",
    image: "images/ir-a-un-museo.jpg",
    color: "#7c5cff",
  },
  {
    label: "ir de excursión",
    image: "images/ir-de-excursion.jpg",
    color: "#f2b84b",
  },
  {
    label: "ir a un concierto",
    image: "images/ir-a-un-concierto.jpg",
    color: "#d94f45",
  },
];

const startScreen = document.querySelector("#startScreen");
const gameScreen = document.querySelector("#gameScreen");
const endScreen = document.querySelector("#endScreen");
const startButton = document.querySelector("#startButton");
const restartButton = document.querySelector("#restartButton");
const timerElement = document.querySelector("#timer");
const scoreElement = document.querySelector("#score");
const finalScoreElement = document.querySelector("#finalScore");
const imageElement = document.querySelector("#vocabularyImage");
const imageFallback = document.querySelector("#imageFallback");
const fallbackText = document.querySelector("#fallbackText");
const feedbackElement = document.querySelector("#feedback");
const optionsElement = document.querySelector("#options");

let score = 0;
let timeLeft = GAME_SECONDS;
let currentAnswer = null;
let timerId = null;
let isAnswerLocked = false;

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function showScreen(screen) {
  startScreen.classList.toggle("is-hidden", screen !== "start");
  gameScreen.classList.toggle("is-hidden", screen !== "game");
  endScreen.classList.toggle("is-hidden", screen !== "end");
}

function updateStats() {
  timerElement.textContent = formatTime(timeLeft);
  scoreElement.textContent = score;
}

function loadImage(item) {
  imageElement.hidden = false;
  imageFallback.hidden = false;
  imageFallback.style.setProperty("--placeholder-color", item.color);
  fallbackText.textContent = "Imagen";
  imageElement.alt = "Imagen de vocabulario";
  imageElement.src = item.image;
}

function createOptions(answer) {
  const distractors = shuffle(vocabulary.filter((item) => item.label !== answer.label))
    .slice(0, OPTIONS_PER_ROUND - 1);
  return shuffle([answer, ...distractors]);
}

function renderRound() {
  currentAnswer = shuffle(vocabulary)[0];
  isAnswerLocked = false;
  feedbackElement.textContent = "";
  feedbackElement.className = "feedback";
  loadImage(currentAnswer);

  optionsElement.replaceChildren();
  createOptions(currentAnswer).forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option-button";
    button.textContent = item.label;
    button.addEventListener("click", () => handleAnswer(item, button));
    optionsElement.append(button);
  });
}

function handleAnswer(selectedItem, selectedButton) {
  if (isAnswerLocked) {
    return;
  }

  isAnswerLocked = true;
  const isCorrect = selectedItem.label === currentAnswer.label;

  if (isCorrect) {
    score += 1;
    feedbackElement.textContent = "Correcto";
    feedbackElement.classList.add("is-correct");
    selectedButton.classList.add("is-correct");
  } else {
    feedbackElement.textContent = `Era: ${currentAnswer.label}`;
    feedbackElement.classList.add("is-wrong");
    selectedButton.classList.add("is-wrong");
  }

  updateStats();
  window.setTimeout(renderRound, 650);
}

function startTimer() {
  clearInterval(timerId);
  timerId = window.setInterval(() => {
    timeLeft -= 1;
    updateStats();

    if (timeLeft <= 0) {
      finishGame();
    }
  }, 1000);
}

function startGame() {
  score = 0;
  timeLeft = GAME_SECONDS;
  updateStats();
  renderRound();
  showScreen("game");
  startTimer();
}

function finishGame() {
  clearInterval(timerId);
  timerId = null;
  finalScoreElement.textContent = score;
  showScreen("end");
}

imageElement.addEventListener("load", () => {
  imageFallback.hidden = true;
});

imageElement.addEventListener("error", () => {
  imageElement.hidden = true;
  imageFallback.hidden = false;
});

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);

showScreen("start");
