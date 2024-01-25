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
  lose: "you win some, you lose some 😊.",
  playerBJ: "winner winner chicken dinner 🐤.",
  playerBB: "you have won x 3 bet 👏🏼.",
  player777: "you have won x 7 bet 👏🏼.",
  bankerBJ: "banker 🏦 natural blackjack 🤑.",
  bankerBB: "you have lost x 3 bet 😭.",
  banker777: "you have lost x 7 bet 😭.",
  insufficientBal: "insufficient balance 🤔.",
  push: "good fight 💪🏽.",
  cannotDeal: "min. bet to play is $5 🤬.",
  cannotStand: "min. points to stand is 16 🤬.",
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
  history: [],
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
inGameChoices.stand.addEventListener("click", stand);
inGameChoices.run.addEventListener("click", zao);

chips.bet5.addEventListener("click", () => bet(5));
chips.bet10.addEventListener("click", () => bet(10));
chips.bet25.addEventListener("click", () => bet(25));
chips.bet50.addEventListener("click", () => bet(50));

inputChoices.undo.addEventListener("click", undoPreviousBet);
inputChoices.clear.addEventListener("click", clearBet);
inputChoices.deal.addEventListener("click", startGame);

/*----- inGame functions -----*/
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
    results.playerPoints.textContent = "blackjack";
    updateWinnings(2);
  } else {
    results.playerPoints.textContent = playerPoints;
  }

  if (bankerPoints === 21) {
    gameState.gameOver = true;
    results.resultMessage.textContent = messages.bankerBJ;
    results.bankerPoints.textContent = "blackjack";
    revealBankerFirstHiddenCard();
    updateLosses(2);
  } else {
    results.bankerPoints.textContent = "?";
  }
}

function checkBanBan() {
  if (deck.playerHand[0].point === 11 && deck.playerHand[1].point === 11) {
    gameState.playerBanBan = true;
    gameState.gameOver = true;
    results.resultMessage.textContent = messages.playerBB;
    results.playerPoints.textContent = "ban ban";
    updateWinnings(3);
  }

  if (
    !gameState.gameOver &&
    deck.bankerHand[0].point === 11 &&
    deck.bankerHand[1].point === 11
  ) {
    gameState.gameOver = true;
    results.resultMessage.textContent = messages.bankerBB;
    results.bankerPoints.textContent = "ban ban";
    revealBankerFirstHiddenCard();
    updateLosses(3);
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
    gameState.gameOver = true;
    results.resultMessage.textContent = messages.player777;
    results.playerPoints.textContent = "triple 7";
    updateWinnings(7);
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
    results.bankerPoints.textContent = "triple 7";
    updateLosses(7);
  }
}

function hitMe() {
  deck.playerHand.push(deck.shuffled.pop());
  renderCards(deck.playerHand, cardContainer.playerCard, false);

  const playerPoints = calculateTotalPoints(deck.playerHand);
  results.playerPoints.textContent = playerPoints;

  if (playerPoints > 21) {
    let bankerPoints = calculateTotalPoints(deck.bankerHand);

    while (bankerPoints < 16) {
      deck.bankerHand.push(deck.shuffled.pop());
      renderCards(
        deck.bankerHand,
        cardContainer.bankerCard,
        gameState.bankerFirstCardHidden
      );
      bankerPoints = calculateTotalPoints(deck.bankerHand);
    }

    if (bankerPoints > 21) {
      results.resultMessage.textContent = messages.push;
    } else {
      results.resultMessage.textContent = messages.lose;
      updateLosses(1);
    }

    revealBankerFirstHiddenAndPoints();
    gameState.gameOver = true;
    inGameChoices.hit.disabled = true;
    inGameChoices.run.disabled = true;
    inGameChoices.stand.disabled = true;
  }
}

function revealBankerFirstHiddenCard() {
  gameState.bankerFirstCardHidden = false;
  renderCards(deck.bankerHand, cardContainer.bankerCard, false);
}

function revealBankerFirstHiddenAndPoints() {
  if (gameState.bankerFirstCardHidden) {
    revealBankerFirstHiddenCard();
  }

  const bankerPoints = calculateTotalPoints(deck.bankerHand);
  results.bankerPoints.textContent = bankerPoints;
}

function stand() {
  const playerPoints = calculateTotalPoints(deck.playerHand);
  let bankerPoints = calculateTotalPoints(deck.bankerHand);

  if (playerPoints < 16) {
    results.resultMessage.textContent = messages.cannotStand;
    return;
  }

  while (bankerPoints < 16) {
    deck.bankerHand.push(deck.shuffled.pop());
    renderCards(deck.bankerHand, cardContainer.bankerCard, false);
    bankerPoints = calculateTotalPoints(deck.bankerHand);
  }

  revealBankerFirstHiddenCard();
  whoWins();
  gameState.gameOver = true;
}

function whoWins() {
  const playerPoints = calculateTotalPoints(deck.playerHand);
  const bankerPoints = calculateTotalPoints(deck.bankerHand);

  if (playerPoints > 21) {
    results.resultMessage.textContent = messages.lose;
    updateLosses(1);
  } else if (bankerPoints > 21 || playerPoints > bankerPoints) {
    results.resultMessage.textContent = messages.win;
    updateWinnings(1);
  } else if (playerPoints < bankerPoints) {
    results.resultMessage.textContent = messages.lose;
    updateLosses(1);
  } else {
    results.resultMessage.textContent = messages.push;
    updateNoLosses();
  }

  results.playerPoints.textContent = playerPoints;
  results.bankerPoints.textContent = bankerPoints;
}

function zao() {
  const playerPoints = calculateTotalPoints(deck.playerHand);

  if (deck.playerHand.length === 2 && playerPoints === 15) {
    restart();
  } else {
    results.resultMessage.textContent = `There's no backing out now. Keep playing! 😅`;
  }
}

function restart() {
  deck.bankerHand = [];
  deck.playerHand = [];

  gameState.gameOver = false;
  gameState.bankerFirstCardHidden = true;
  gameState.playerBlackJack = false;
  gameState.playerBanBan = false;
  gameState.playerTrips7 = false;

  results.playerPoints.textContent = "";
  results.playerPoints.textContent = "";
  results.resultMessage.textContent = "";

  deal();
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

/*----- betting functions -----*/

function bet(amount) {
  if (bettingInfo.balance >= amount) {
    bettingInfo.balance -= amount;
    bettingInfo.betAmount += amount;
    bettingInfo.history.push(amount);
    showBet();
    inputChoices.undo.disabled = false;
  } else {
    results.resultMessage.textContent = messages.insufficientBal;
  }
}

function showBet() {
  balanceAndBettingAmt.balanceAmount.textContent = bettingInfo.balance;
  balanceAndBettingAmt.bettingAmount.textContent = bettingInfo.betAmount;
}

function undoPreviousBet() {
  if (bettingInfo.history.length > 0) {
    const previousBetAmount = bettingInfo.history.pop();
    bettingInfo.balance += previousBetAmount;
    bettingInfo.betAmount -= previousBetAmount;
    inputChoices.undo.disabled = false;
  } else {
    inputChoices.undo.disabled = true;
  }
  showBet();
}

function clearBet() {
  bettingInfo.balance += bettingInfo.betAmount;
  bettingInfo.betAmount = 0;
  showBet();
}

function updateWinnings(numberOfTimes) {
  const winAmount = bettingInfo.betAmount * numberOfTimes;
  bettingInfo.balance += winAmount;
  showBet();
}

function updateLosses(numberOfTimes) {
  const lossAmount = bettingInfo.betAmount * numberOfTimes;
  bettingInfo.balance -= lossAmount;
  bettingInfo.balance -= lossAmount;
  showBet();
}

function updateNoLosses() {
  bettingInfo.balance += bettingInfo.betAmount;
  bettingInfo.betAmount = 0;
  showBet();
}

function startGame() {
  if (bettingInfo.betAmount < 5) {
    results.resultMessage.textContent = messages.cannotDeal;
    return;
  }
  deal();

  results.resultMessage.textContent = "";

  chips.bet5.disabled = true;
  chips.bet10.disabled = true;
  chips.bet25.disabled = true;
  chips.bet50.disabled = true;

  inputChoices.undo.disabled = true;
  inputChoices.clear.disabled = true;
  inputChoices.deal.disabled = true;
}
