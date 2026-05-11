const GAME_SECONDS = 60;
const OPTIONS_PER_ROUND = 4;

const vocabulary = [
  {
    label: "Hice fotos",
    translation: "I took pictures",
    image: "images/hacer-fotos.jpg",
    color: "#2f80ed",
  },
  {
    label: "Vamos a hacer fotos",
    translation: "We are going to take pictures",
    image: "images/hacer-fotos.jpg",
    color: "#2f80ed",
  },
  {
    label: "Descansé",
    translation: "I rested",
    image: "images/descansar.jpg",
    color: "#19a974",
  },
  {
    label: "Vamos a descansar",
    translation: "We are going to rest",
    image: "images/descansar.jpg",
    color: "#19a974",
  },
  {
    label: "Fui a la playa",
    translation: "I went to the beach",
    image: "images/ir-a-la-playa.jpg",
    color: "#ef6f6c",
  },
  {
    label: "Vamos a la playa",
    translation: "We are going to the beach",
    image: "images/ir-a-la-playa.jpg",
    color: "#ef6f6c",
  },
  {
    label: "Fui a un museo",
    translation: "I went to a museum",
    image: "images/ir-a-un-museo.jpg",
    color: "#7c5cff",
  },
  {
    label: "Vamos a un museo",
    translation: "We are going to a museum",
    image: "images/ir-a-un-museo.jpg",
    color: "#7c5cff",
  },
  {
    label: "Fui de excursión",
    translation: "I went for a hike",
    image: "images/ir-de-excursion.jpg",
    color: "#f2b84b",
  },
  {
    label: "Vamos de excursión",
    translation: "We are going for a hike",
    image: "images/ir-de-excursion.jpg",
    color: "#f2b84b",
  },
  {
    label: "Fui a un concierto",
    translation: "I went to a concert",
    image: "images/ir-a-un-concierto.jpg",
    color: "#d94f45",
  },
  {
    label: "Vamos a un concierto",
    translation: "We are going to a concert",
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
const translationPromptElement = document.querySelector("#translationPrompt");
const feedbackElement = document.querySelector("#feedback");
const optionsElement = document.querySelector("#options");
const initialStartLabel = startButton.textContent;

let score = 0;
let timeLeft = GAME_SECONDS;
let currentAnswer = null;
let timerId = null;
let isAnswerLocked = false;
let isImagePreloadComplete = false;
const imageCache = new Map();

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

async function preloadImage(src) {
  const image = new Image();
  image.src = src;

  if (image.decode) {
    await image.decode();
  } else if (!image.complete) {
    await new Promise((resolve, reject) => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", reject, { once: true });
    });
  }

  imageCache.set(src, image);
}

async function preloadImages() {
  const imagePaths = [...new Set(vocabulary.map((item) => item.image))];
  await Promise.all(imagePaths.map(preloadImage));
  isImagePreloadComplete = true;
}

function prepareGame() {
  startButton.disabled = true;
  startButton.textContent = "Loading images...";

  preloadImages()
    .catch(() => {
      isImagePreloadComplete = true;
    })
    .finally(() => {
      startButton.disabled = false;
      startButton.textContent = initialStartLabel;
    });
}

function loadImage(item) {
  const cachedImage = imageCache.get(item.image);
  imageElement.hidden = false;
  imageElement.alt = "Vocabulary image";
  imageElement.src = cachedImage ? cachedImage.src : item.image;
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
  translationPromptElement.textContent = currentAnswer.translation;
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
    feedbackElement.textContent = "Correct";
    feedbackElement.classList.add("is-correct");
    selectedButton.classList.add("is-correct");
  } else {
    feedbackElement.textContent = `Answer: ${currentAnswer.label}`;
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
  if (!isImagePreloadComplete) {
    return;
  }

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
  imageElement.hidden = false;
});

imageElement.addEventListener("error", () => {
  imageElement.hidden = true;
});

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);

showScreen("start");
prepareGame();
