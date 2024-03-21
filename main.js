const $container = document.querySelector(".container");
const $board = document.querySelector(".board");
const $keyboard = document.querySelector(".keyboard");
const $letterKeys = $keyboard.querySelectorAll(
  ".key:not(.backspace):not(.enter)"
);
const $backspaceKey = $keyboard.querySelector(".backspace");
const $enterKey = $keyboard.querySelector(".enter");

const $dialog = document.querySelector("dialog");
const $closeDialogButton = document.querySelector("dialog button");

$dialog.addEventListener("click", (event) => {
  const dimensions = $dialog.getBoundingClientRect();

  if (
    event.clientX < dimensions.left ||
    event.clientX > dimensions.right ||
    event.clientY < dimensions.top ||
    event.clientY > dimensions.bottom
  ) {
    $dialog.close();
  }
});

const hebrewLetters = "אבגדהוזחטיכלמנסעפצקרשתםןץףך";
const finalLetters = "מנצפכ";
const finalIndices = [4, 9, 14, 19, 24, 29];
const answer = "מבריס";

let index = 0;
let attempt = 1;
let word = "";

const EXACT_MATCH = "exact";
const INEXACT_MATCH = "inexact";
const BAD_MATCH = "bad";

const toFinalLetter = (letter) => {
  switch (letter) {
    case "מ":
      return "ם";
    case "נ":
      return "ן";
    case "צ":
      return "ץ";
    case "פ":
      return "ף";
    case "כ":
      return "ך";
  }
};

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
  const $answerSpan = document.createElement("span");
  const $textNode = document.createTextNode(answer);
  $answerSpan.append($textNode);
  $dialog.querySelector("h1").append($answerSpan);
  $dialog.showModal();
};

const typeLetter = (letter) => {
  if (finalIndices.includes(index) && finalLetters.includes(letter)) {
    letter = toFinalLetter(letter);
  }

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

  fetch("http://localhost:3000/check-word", {
    method: "POST",
    body: JSON.stringify({
      word,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.error(err);
    });

  fetch("http://localhost:3000/random-word", { method: "GET" })
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.error(err);
    });

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
