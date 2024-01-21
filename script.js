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
  playerBJ: "winner winner chicken dinner",
  playerBB: "you have won x 3 bet.",
  player777: "you have won x 7 bet.",
  bankerBJ: "you have been served a nice warm 🍽️ of blackjack from the banker.",
  bankerBB: "you have lost x 3 bet.",
  banker777: "you have lost x 7 bet.",
  insufficientBal: "insufficient balance.",
  push: "good fight.",
  cannotDeal: "min. bet to play is $5",
};

/*----- state variables -----*/
const deck = {
  shuffled: [],
  bankerCards: [],
  playerCards: [],
};

const handPoints = {
  playerHP: [],
  bankerHP: [],
};

const gameState = {
  gameOver: false,
  playerBlackJack: false,
  playerBanBan: false,
  playerTrips7: false,
};

const bettingInfo = {
  balance: 1000,
  betAmount: 0,
};

/*----- cached elements  -----*/
const results = {
  bankerPoints: document.querySelector("#banker-points"),
  playerPoints: document.querySelector("#your-points"),
  resultMessage: document.querySelector("#result-message"),
};

const points = {
  banker: document.querySelector("#banker-points-container"),
  player: document.querySelector("#player-points-container"),
};

const chips = {
  bet5: document.querySelector("#bet-5"),
  bet10: document.querySelector("#bet-10"),
  bet25: document.querySelector("#bet-25"),
  bet50: document.querySelector("#bet-50"),
};

const inputChoices = {
  undo: document.querySelector("#undo-button"),
  deal: document.querySelector("#deal-button"),
};

const inGameChoices = {
  double: document.querySelector("#double-button"),
  hit: document.querySelector("#hit-button"),
  stand: document.querySelector("#stand-button"),
  run: document.querySelector("#run-button"),
};
/*----- event listeners -----*/

/*----- functions -----*/

function buildDeck() {
  let deckOfCards = [];

  for (let suit of suits) {
    for (let value of values) {
      let point = parseInt(value);
      if (value === "A") {
        point = 11;
      } else if (isNaN(value)) {
        point = 10;
      }
      deckOfCards.push({
        face: `${value}-${suit}`,
        point: point,
      });
    }
  }
  return deckOfCards;
}

function shuffleDeck() {
  deckOfCards = buildDeck();

  while (deckOfCards.length > 0) {
    const randomIndex = Math.floor(Math.random() * deckOfCards.length);
    const [removedCard] = deckOfCards.splice(randomIndex, 1);
    deck.shuffled.push(removedCard);
  }
}

shuffleDeck();
