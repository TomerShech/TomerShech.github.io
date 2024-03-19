const $container = document.querySelector(".container");
const $board = document.querySelector(".board");
const $keyboard = document.querySelector(".keyboard");
const $letterKeys = $keyboard.querySelectorAll(
  ".key:not(.backspace):not(.enter)"
);
const $backspaceKey = $keyboard.querySelector(".backspace");
const $enterKey = $keyboard.querySelector(".enter");
const hebrewLetters = "אבגדהוזחטיכלמנסעפצקרשתםןץףך";

const answer = "ניטור";

let index = 0;
let attempt = 1;
let word = "";

const EXACT_MATCH = "exact";
const INEXACT_MATCH = "inexact";
const BAD_MATCH = "bad";

const letterCb = (event) => {
  const letter = event.target.textContent;
  if (hebrewLetters.includes(letter) && index < 5 * attempt) {
    typeLetter(letter);
  }
};

const backspaceCb = () => {
  if (index > (attempt - 1) * 5) {
    removeLetter();
  }
};

const enterCb = () => {
  if (word.length === 5 && attempt <= 6) {
    checkWord();
  }
};

const showWinGreeting = () => {
  const $h1 = document.createElement("h1");
  const $textNode = document.createTextNode(`ניצחת! המילה הייתה: "${answer}"`);
  $h1.append($textNode);
  $h1.classList.add("win");
  $container.prepend($h1);
};

const typeLetter = (letter) => {
  $board.children[index].textContent = letter;
  index++;
  word = updateWord();
};

const removeLetter = () => {
  index--;
  $board.children[index].textContent = "";
  word = updateWord();
};

const updateWord = () =>
  Array.from($board.children)
    .slice((attempt - 1) * 5, index)
    .map((el) => el.textContent)
    .join("");

const checkWord = () => {
  if (word === answer) {
    showWinGreeting();
    document.removeEventListener("keydown", main);
    $letterKeys.forEach(($letterKey) =>
      $letterKey.removeEventListener("click", letterCb)
    );
    $backspaceKey.removeEventListener("click", backspaceCb);
    $enterKey.removeEventListener("click", enterCb);
  }

  const matches = [];

  for (let i = 0; i < answer.length; i++) {
    const j = (attempt - 1) * 5;
    const el = Array.from($board.children).slice(j, j + 5)[i];
    if (word[i] === answer[i]) {
      matches.push({
        el,
        type: EXACT_MATCH,
      });
    } else if (answer.indexOf(word[i]) !== -1) {
      matches.push({
        el,
        type: INEXACT_MATCH,
      });
    } else {
      matches.push({ el, type: BAD_MATCH });
    }
  }

  for (const match of matches) {
    match.el.classList.add(match.type);
  }

  attempt++;
  word = "";
};

const main = (event) => {
  if (
    (event.key === "Backspace" || event.key === "Delete") &&
    index > (attempt - 1) * 5
  ) {
    removeLetter();
  } else if (event.key === "Enter" && word.length === 5 && attempt <= 6) {
    checkWord();
  } else if (
    hebrewLetters.includes(event.key) &&
    index < 5 * attempt &&
    attempt <= 6
  ) {
    typeLetter(event.key);
  }
};

document.addEventListener("keydown", main);

$letterKeys.forEach(($letterKey) =>
  $letterKey.addEventListener("click", letterCb)
);
$backspaceKey.addEventListener("click", backspaceCb);
$enterKey.addEventListener("click", enterCb);
