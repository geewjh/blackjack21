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
  playerBJ: "winner winner chicken dinner 🐤",
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
  bankerHand: [],
  playerHand: [],
};

const gameState = {
  gameOver: false,
  bankerFirstCardHidden: true,
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
  clear: document.querySelector("#clear-button"),
  deal: document.querySelector("#deal-button"),
};

const inGameChoices = {
  double: document.querySelector("#double-button"),
  hit: document.querySelector("#hit-button"),
  stand: document.querySelector("#stand-button"),
  run: document.querySelector("#run-button"),
};

const cardContainer = {
  bankerCard: document.querySelector(".banker-card-container"),
  playerCard: document.querySelector(".player-card-container"),
};

const balanceAndBettingAmt = {
  balanceAmount: document.querySelector("#balance-amount"),
  bettingAmount: document.querySelector("#current-bet-amount"),
};

/*----- event listeners -----*/
inGameChoices.hit.addEventListener("click", hitMe);

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

function renderCards(hand, container, firstCardHidden) {
  container.innerHTML = "";
  hand.forEach((card, index) => {
    const cardImg = document.createElement("img");
    cardImg.src =
      firstCardHidden && index === 0
        ? "./cards/BACK.png"
        : `./cards/${card.face}.png`;
    container.appendChild(cardImg);
  });
}

//To be called when it's time to reveal.
function revealBankerFirstHiddenCard() {
  gameState.firstCardHidden = false;
  renderCards(deck.bankerHand, cardContainer.bankerCard, false);
}

function calculateTotalPoints(hand) {
  let points = 0;
  let numberOfAces = 0;

  hand.forEach((card) => {
    if (card.face.startsWith("A")) {
      numberOfAces += 1;
      points += 11;
    } else {
      points += card.point;
    }
  });

  while (points > 21 && numberOfAces > 0) {
    points -= 10;
    numberOfAces -= 1;
  }
  return points;
}

function checkBlackJack() {
  const playerPoints = calculateTotalPoints(deck.playerHand);
  const bankerPoints = calculateTotalPoints(deck.bankerHand);

  if (playerPoints === 21) {
    gameState.playerBlackJack = true;
    results.resultMessage.textContent = messages.playerBJ;
  }

  if (bankerPoints === 21) {
    gameState.gameOver = true;
    results.resultMessage.textContent = messages.bankerBJ;
  }

  results.playerPoints.textContent = playerPoints;
  results.bankerPoints.textContent = bankerPoints;
}

function checkBanBan() {
  if (deck.playerHand[0].point === 11 && deck.playerHand[1].point === 11) {
    gameState.playerBanBan = true;
    results.resultMessage.textContent = messages.playerBB;
    gameState.gameOver = true;
  }

  if (
    !gameState.gameOver &&
    deck.bankerHand[0].point === 11 &&
    deck.bankerHand[1].point === 11
  ) {
    gameState.gameOver = true;
    results.resultMessage.textContent = messages.bankerBB;
  }
}

function checkTrips7() {
  if (
    deck.playerHand.length === 3 &&
    deck.playerHand[0].point === 7 &&
    deck.playerHand[1].point === 7 &&
    deck.playerHand[2].point === 7
  ) {
    gameState.playerTrips7 = true;
    results.resultMessage.textContent = messages.player777;
    gameState.gameOver = true;
  }

  if (
    !gameState.gameOver &&
    deck.bankerHand.length === 3 &&
    deck.bankerHand[0].point === 7 &&
    deck.bankerHand[1].point === 7 &&
    deck.bankerHand[2].point === 7
  ) {
    gameState.gameOver = true;
    results.resultMessage.textContent = messages.banker777;
  }
}

function hitMe() {
  deck.playerHand.push(deck.shuffled.pop());
  renderCards(deck.playerHand, cardContainer.playerCard, false);

  const playerPoints = calculateTotalPoints(deck.playerHand);
  results.playerPoints.textContent = playerPoints;

  if (playerPoints > 21) {
    gameState.gameOver = true;
    results.resultMessage.textContent = messages.lose;
    revealBankerFirstHiddenAndPoints();
  }
}

function revealBankerFirstHiddenAndPoints() {
  if (gameState.bankerFirstCardHidden) {
    revealBankerFirstHiddenCard();
  }

  const bankerPoints = calculateTotalPoints(deck.bankerHand);
  results.bankerPoints.textContent = bankerPoints;
}

function deal() {
  shuffleDeck();

  deck.bankerHand = [deck.shuffled.pop(), deck.shuffled.pop()];
  deck.playerHand = [deck.shuffled.pop(), deck.shuffled.pop()];

  renderCards(
    deck.bankerHand,
    cardContainer.bankerCard,
    gameState.bankerFirstCardHidden
  );
  renderCards(deck.playerHand, cardContainer.playerCard, false);

  checkBlackJack();
  checkBanBan();
  checkTrips7();
}

deal();
