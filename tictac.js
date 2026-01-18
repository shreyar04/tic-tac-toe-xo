let boxes = document.querySelectorAll(".box");
let resetBtn = document.querySelector("#reset-btn");
let newGameBtn = document.querySelector("#new-btn");
let msgContainer = document.querySelector(".msg-container");
let msg = document.querySelector("#msg");
let scoreOElem = document.querySelector("#scoreO");
let scoreXElem = document.querySelector("#scoreX");
let timeElem = document.querySelector("#time");
let turnIndicator = document.querySelector("#turn-indicator");

let clickSound = document.querySelector("#click-sound");
let winSound = document.querySelector("#win-sound");
let drawSound = document.querySelector("#draw-sound");

const nameInputs = document.getElementById("name-inputs");
const gameArea = document.getElementById("game-area");
const playerOInput = document.getElementById("playerO");
const playerXInput = document.getElementById("playerX");
const startGameBtn = document.getElementById("start-game-btn");

let playerOName = "Player O";
let playerXName = "Player X";

let turnO = true;
let count = 0;
let scoreO = 0;
let scoreX = 0;
let timer = null;
let timeLeft = 5;
let gameOver = false;

const WIN_LIMIT = 2;

const winPatterns = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

/* ---------- UI HELPERS ---------- */

const updatePlayerNames = () => {
  if (playerOInput.value.trim()) playerOName = playerOInput.value.trim();
  if (playerXInput.value.trim()) playerXName = playerXInput.value.trim();

  document.getElementById("playerOName").innerText = playerOName;
  document.getElementById("playerXName").innerText = playerXName;
  updateTurnIndicator();
};

const updateTurnIndicator = () => {
  if (gameOver) return;
  const name = turnO ? playerOName : playerXName;
  const symbol = turnO ? "O" : "X";
  turnIndicator.innerText = `Current Turn: ${name} (${symbol})`;
};

/* ---------- TIMER ---------- */

const startTimer = () => {
  clearInterval(timer);
  timeLeft = 5;
  timeElem.innerText = timeLeft;
  timeElem.classList.remove("pulse");

  timer = setInterval(() => {
    if (gameOver) {
      clearInterval(timer);
      return;
    }

    timeLeft--;
    timeElem.innerText = timeLeft;

    if (timeLeft <= 5) timeElem.classList.add("pulse");

    if (timeLeft === 0) {
      turnO = !turnO;
      updateTurnIndicator();
      startTimer();
    }
  }, 1000);
};

const stopTimer = () => {
  clearInterval(timer);
  timer = null;
};

/* ---------- BOARD ---------- */

const enableBoxes = () => {
  boxes.forEach(box => {
    box.disabled = false;
    box.innerText = "";
    box.classList.remove("winning");
  });
};

const disableBoxes = () => {
  boxes.forEach(box => box.disabled = true);
};

const resetBoardOnly = () => {
  stopTimer();
  enableBoxes();
  count = 0;
  gameOver = false;
  turnO = true;
  msgContainer.classList.add("hide");
  updateTurnIndicator();
  startTimer();
};

/* ---------- GAME LOGIC ---------- */

boxes.forEach(box => {
  box.addEventListener("click", () => {
    if (box.innerText || gameOver) return;

    clickSound.play();

    box.innerText = turnO ? "O" : "X";
    box.style.color = turnO ? "#FFE0B5" : "#ffffc7";
    box.disabled = true;

    count++;

    if (checkWinner()) return;

    if (count === 9) {
      gameDraw();
      return;
    }

    turnO = !turnO;
    updateTurnIndicator();
    startTimer();
  });
});

const checkWinner = () => {
  for (let pattern of winPatterns) {
    const [a,b,c] = pattern;
    const v1 = boxes[a].innerText;
    if (v1 && v1 === boxes[b].innerText && v1 === boxes[c].innerText) {
      showWinner(v1);
      return true;
    }
  }
  return false;
};

const showWinner = (winner) => {
  gameOver = true;
  stopTimer();
  disableBoxes();

  const name = winner === "O" ? playerOName : playerXName;
  msg.innerText = `Congratulations, Winner is ${name} (${winner})`;
  msgContainer.classList.remove("hide");

  winSound.play();
  launchConfetti();

  if (winner === "O") {
    scoreO++;
    scoreOElem.innerText = scoreO;
  } else {
    scoreX++;
    scoreXElem.innerText = scoreX;
  }

  if (scoreO === WIN_LIMIT || scoreX === WIN_LIMIT) {
    setTimeout(() => {
      msg.innerText = `🏆 Match Winner: ${scoreO === WIN_LIMIT ? playerOName : playerXName}`;
      setTimeout(goToNameScreen, 2000);
    }, 800);
  }
};

const gameDraw = () => {
  gameOver = true;
  stopTimer();
  disableBoxes();
  msg.innerText = "It's a DRAW!";
  msgContainer.classList.remove("hide");
  drawSound.play();
};

/* ---------- NAVIGATION ---------- */

const goToNameScreen = () => {
  stopTimer();
  enableBoxes();
  gameOver = false;
  count = 0;
  turnO = true;

  nameInputs.classList.remove("hide");
  gameArea.classList.add("hide");
  msgContainer.classList.add("hide");

  playerOInput.value = "";
  playerXInput.value = "";

  scoreO = 0;
  scoreX = 0;
  scoreOElem.innerText = 0;
  scoreXElem.innerText = 0;
};

/* ---------- CONFETTI ---------- */

const launchConfetti = () => {
  const end = Date.now() + 1500;
  const interval = setInterval(() => {
    if (Date.now() > end) return clearInterval(interval);
    confetti({ particleCount: 40, spread: 360, origin: { x: Math.random(), y: Math.random() } });
  }, 250);
};

/* ---------- BUTTONS ---------- */

resetBtn.addEventListener("click", resetBoardOnly); // 🔥 SCORE NOT RESET
newGameBtn.addEventListener("click", goToNameScreen);

startGameBtn.addEventListener("click", () => {
  updatePlayerNames();
  nameInputs.classList.add("hide");
  gameArea.classList.remove("hide");
  resetBoardOnly();
});
