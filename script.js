/*----- constants -----*/
const suits = ["C", "D", "H", "S"];
const values = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];
const messages = {
  win: "dollar dollar bill 💰.",
  lose: "you win some, you lose some.",
  playerBJ: "you have just served a nice warm 🍽️ of blackjack to the banker.",
  playerBB: "you have won x 3 bet.",
  playerTrips7: "you have lost x 7 bet.",
  insufficientBal: "insufficient balance.",
  push: "good fight.",
  cannotDeal: "min. bet to play is $5",
};

/*----- state variables -----*/
const deck = {};
const handPoints = {};
const gameState = {};

const bettingInfo = {
  balance: 1000,
  betAmount: 0,
};

/*----- cached elements  -----*/
const stateEl = {
  bankerPoints: document.querySelector("#banker-points"),
  playerPoints: document.querySelector("#your-points"),
  resultMessage: document.querySelector("#result-message"),
};

const cardsEl = {
  banker: document.querySelector("#banker-points-container"),
  player: document.querySelector("#player-points-container"),
};

const chipEl = {
  bet5: document.querySelector("#bet-5"),
  bet10: document.querySelector("#bet-10"),
  bet25: document.querySelector("#bet-25"),
  bet50: document.querySelector("#bet-50"),
};

const bettingEl = {
  undo: document.querySelector("#undo-button"),
  repeat: document.querySelector("#repeat-button"),
  clear: document.querySelector("#clear-button"),
  deal: document.querySelector("#deal-button"),
};

const ingameEl = {
  double: document.querySelector("#double-button"),
  hit: document.querySelector("#hit-button"),
  stand: document.querySelector("#stand-button"),
  run: document.querySelector("#run-button"),
};

/*----- event listeners -----*/

/*----- functions -----*/
