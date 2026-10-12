
"use strict";

// Game settings
const ANSWER = "YEARS";
const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;

let currentRow = 0;
let currentGuess = "";
let gameOver = false;

const board = document.getElementById("board");
const keyboard = document.getElementById("keyboard");
const message = document.getElementById("message");
const anniversaryDialog = document.getElementById("anniversary-dialog");
const closeDialogButton = document.getElementById("close-dialog");

const keyStatus = {};

// Build the game board
function createBoard() {
  board.innerHTML = "";

  for (let r = 0; r < MAX_ATTEMPTS; r++) {
    const row = document.createElement("div");
    row.className = "row";

    for (let c = 0; c < WORD_LENGTH; c++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.id = `tile-${r}-${c}`;
      row.appendChild(tile);
    }

    board.appendChild(row);
  }
}

// Build the on-screen keyboard
function createKeyboard() {
  keyboard.innerHTML = "";

  const rows = [
    "QWERTYUIOP",
    "ASDFGHJKL",
    "ZXCVBNM"
  ];

  rows.forEach((letters, index) => {
    const row = document.createElement("div");
    row.className = "key-row";

    if (index === 2) {
      addKey(row, "ENTER", "wide");
    }

    for (const letter of letters) {
      addKey(row, letter);
    }

    if (index === 2) {
      addKey(row, "⌫", "wide");
    }

    keyboard.appendChild(row);
  });
}

function addKey(row, value, extraClass = "") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `key ${extraClass}`;
  button.textContent = value;

  button.setAttribute(
    "aria-label",
    value === "⌫" ? "Backspace" : value
  );

  button.addEventListener("click", () => handleInput(value));
  row.appendChild(button);
}

// Display the letters currently entered
function updateBoard() {
  for (let c = 0; c < WORD_LENGTH; c++) {
    const tile = document.getElementById(
      `tile-${currentRow}-${c}`
    );

    tile.textContent = currentGuess[c] || "";
    tile.classList.toggle("filled", Boolean(currentGuess[c]));
  }
}

// Handle both physical and on-screen keyboard input
function handleInput(key) {
  if (gameOver) return;

  if (key === "ENTER") {
    submitGuess();
    return;
  }

  if (key === "⌫" || key === "BACKSPACE") {
    currentGuess = currentGuess.slice(0, -1);
    updateBoard();
    return;
  }

  if (/^[A-Z]$/.test(key) &&
      currentGuess.length < WORD_LENGTH) {
    currentGuess += key;
    updateBoard();
  }
}

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.altKey || event.metaKey) return;

  if (event.key === "Enter") {
    handleInput("ENTER");
  } else if (event.key === "Backspace") {
    handleInput("BACKSPACE");
  } else if (/^[a-zA-Z]$/.test(event.key)) {
    handleInput(event.key.toUpperCase());
  }
});

// Evaluate the guess, accounting for repeated letters
function evaluateGuess(guess) {
  const result = Array(WORD_LENGTH).fill("absent");
  const remaining = ANSWER.split("");

  // First pass: identify exact matches
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === ANSWER[i]) {
      result[i] = "correct";
      remaining[i] = null;
    }
  }

  // Second pass: identify letters in other positions
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] === "correct") continue;

    const index = remaining.indexOf(guess[i]);

    if (index !== -1) {
      result[i] = "present";
      remaining[index] = null;
    }
  }

  return result;
}

// Submit and check the current guess
function submitGuess() {
  if (currentGuess.length !== WORD_LENGTH) {
    showMessage("Enter a full five-letter word!");
    return;
  }

  const result = evaluateGuess(currentGuess);

  for (let i = 0; i < WORD_LENGTH; i++) {
    const tile = document.getElementById(
      `tile-${currentRow}-${i}`
    );

    tile.classList.remove("filled");
    tile.classList.add(result[i]);

    updateKey(currentGuess[i], result[i]);
  }

  if (currentGuess === ANSWER) {
    gameOver = true;
    showMessage("Amazing! You guessed the word! 🎉");
    anniversaryDialog.showModal();
    return;
  }

  currentRow++;
  currentGuess = "";

  if (currentRow >= MAX_ATTEMPTS) {
    gameOver = true;
    showMessage(`Game over! The answer was ${ANSWER}.`);
  } else {
    showMessage("Not quite! Try another word.");
    updateBoard();
  }
}

// Update keyboard colors without downgrading a correct letter
function updateKey(letter, status) {
  const priority = {
    absent: 1,
    present: 2,
    correct: 3
  };

  if (
    !keyStatus[letter] ||
    priority[status] > priority[keyStatus[letter]]
  ) {
    keyStatus[letter] = status;
  }

  document.querySelectorAll(".key").forEach((key) => {
    if (key.textContent === letter) {
      key.classList.remove("correct", "present", "absent");
      key.classList.add(keyStatus[letter]);
    }
  });
}

function showMessage(text) {
  message.textContent = text;
}

closeDialogButton.addEventListener("click", () => {
  anniversaryDialog.close();
});

// Initialize the game
createBoard();
createKeyboard();
