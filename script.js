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
  win: "dollar dollar bill 💰",
  lose: "you win some, you lose some 😊",
  playerBJ: "winner winner chicken dinner 🐤",
  playerBB: "you have won x 3 bet 👏🏼",
  player777: "you have won x 7 bet 👏🏼",
  bankerBJ: "banker 🏦 natural blackjack 🤑",
  bankerBB: "you have lost x 3 bet 😭",
  banker777: "you have lost x 7 bet 😭",
  insufficientBal: "insufficient balance 🤔",
  push: "good fight 💪🏽",
  cannotDeal: "min. bet to play is $5 🤬",
  cannotStand: "min. points to stand is 16 🤬",
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
  banker: document.querySelector(".banker-points-container"),
  player: document.querySelector(".player-points-container"),
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
inGameChoices.double.addEventListener("click", double);
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
init();

function init() {
  deck.shuffled = [];
  deck.bankerHand = [];
  deck.playerHand = [];
  gameState.gameOver = false;
  gameState.bankerFirstCardHidden = true;
  gameState.playerBlackJack = false;
  gameState.playerBanBan = false;
  gameState.playerTrips7 = false;
  bettingInfo.balance = 1000;
  bettingInfo.betAmount = 0;
  bettingInfo.history = [];
  deal();
  hideInGameChoices("none");
  hideBankerAndPlayerPoints("none");
  hideStarting4Cards("none");
  welcomeMessageandInstruction();
}

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

  if (playerPoints === 21 && bankerPoints !== 21) {
    gameState.playerBlackJack = true;
    gameState.gameOver = true;
    results.resultMessage.textContent = messages.playerBJ;
    results.playerPoints.textContent = "blackjack";
    updateWinnings(3);
    disableInGameChoices();
    setTimeout(nextRound, 5000);
  } else if (bankerPoints === 21 && playerPoints === 15) {
    revealBankerFirstHiddenCard();
    results.resultMessage.textContent = "great escape 🎢";
    updateNoLosses();
    disableInGameChoices();
    setTimeout(nextRound, 5000);
  } else if (
    bankerPoints === 21 &&
    playerPoints !== 15 &&
    playerPoints !== 21
  ) {
    revealBankerFirstHiddenCard();
    gameState.gameOver = true;
    results.resultMessage.textContent = messages.bankerBJ;
    results.bankerPoints.textContent = "blackjack";
    updateLosses(1);
    disableInGameChoices();
    setTimeout(nextRound, 5000);
  } else if (bankerPoints === 21 && playerPoints === 21) {
    revealBankerFirstHiddenCard();
    gameState.gameOver = true;
    results.resultMessage.textContent = messages.push;
    results.bankerPoints.textContent = "Both blackjack";
    results.playerPoints.textContent = "Both blackjack";
    updateNoLosses();
    disableInGameChoices();
    setTimeout(nextRound, 5000);
  } else {
    results.bankerPoints.textContent = "?";
    results.playerPoints.textContent = playerPoints;
  }

  if (playerPoints < 16) {
    inGameChoices.double.style.display = "none";
  } else {
    inGameChoices.double.style.display = "";
  }
}

function checkBanBan() {
  const playerPoints = calculateTotalPoints(deck.playerHand);
  const bankerPoints = calculateTotalPoints(deck.bankerHand);

  if (
    deck.playerHand[0].point === 11 &&
    deck.playerHand[1].point === 11 &&
    bankerPoints !== 21
  ) {
    gameState.playerBanBan = true;
    gameState.gameOver = true;
    results.resultMessage.textContent = messages.playerBB;
    results.playerPoints.textContent = "ban ban";
    updateWinnings(4);
    disableInGameChoices();
    setTimeout(nextRound, 5000);
  } else if (
    deck.bankerHand[0].point === 11 &&
    deck.bankerHand[1].point === 11 &&
    playerPoints !== 21
  ) {
    gameState.gameOver = true;
    results.resultMessage.textContent = messages.bankerBB;
    results.bankerPoints.textContent = "ban ban";
    revealBankerFirstHiddenCard();
    updateLosses(2);
    disableInGameChoices();
    setTimeout(nextRound, 5000);
  } else if (
    deck.bankerHand[0].point === 11 &&
    deck.bankerHand[1].point === 11 &&
    playerPoints === 15
  ) {
    revealBankerFirstHiddenCard();
    results.resultMessage.textContent = "great escape 🎢";
    updateNoLosses();
    disableInGameChoices();
    setTimeout(nextRound, 5000);
  } else if (
    deck.bankerHand[0].point === 11 &&
    deck.bankerHand[1].point === 11 &&
    deck.playerHand[0].point === 11 &&
    deck.playerHand[1].point === 11
  ) {
    revealBankerFirstHiddenCard();
    results.resultMessage.textContent = messages.push;
    updateNoLosses();
    disableInGameChoices();
    setTimeout(nextRound, 5000);
  } else {
    results.bankerPoints.textContent = "?";
    results.playerPoints.textContent = playerPoints;
  }

  if (playerPoints < 16) {
    inGameChoices.double.style.display = "none";
  } else {
    inGameChoices.double.style.display = "";
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
    updateWinnings(8);
    setTimeout(nextRound, 5000);
  } else if (
    deck.bankerHand.length === 3 &&
    deck.bankerHand[0].point === 7 &&
    deck.bankerHand[1].point === 7 &&
    deck.bankerHand[2].point === 7
  ) {
    gameState.gameOver = true;
    results.resultMessage.textContent = messages.banker777;
    results.bankerPoints.textContent = "triple 7";
    updateLosses(6);
    setTimeout(nextRound, 5000);
  }
}

function hitMe() {
  inGameChoices.double.disabled = true;
  deck.playerHand.push(deck.shuffled.pop());
  renderCards(deck.playerHand, cardContainer.playerCard, false);
  checkTrips7();

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
      results.playerPoints.textContent = playerPoints;
      revealBankerFirstHiddenAndPoints();
      updateNoLosses();
      disableInGameChoices();
      setTimeout(nextRound, 5000);
    } else {
      results.resultMessage.textContent = messages.lose;
      results.playerPoints.textContent = playerPoints;
      updateLossesForHit();
      disableInGameChoices();
      revealBankerFirstHiddenAndPoints();
      setTimeout(nextRound, 5000);
    }
  }
}

function nextRound() {
  gameState.gameOver = false;
  deck.playerHand = [];
  deck.bankerHand = [];
  gameState.bankerFirstCardHidden = true;
  shuffleDeck();
  hideInGameChoices("none");
  hideBankerAndPlayerPoints("none");
  hideStarting4Cards("none");
  revertErrorMessage();
  hideChips("");
  revealInputChoices();
  enableInGameChoices();
  checkForBrokeInstances();
}

function disableChips() {
  for (const chip in chips) {
    if (chips.hasOwnProperty(chipKey)) {
      chips[chip].disabled = true;
    }
  }
}

function disableInputChoices() {
  inputChoices.undo.disabled = true;
  inputChoices.clear.disabled = true;
  inputChoices.deal.disabled = true;
}

function disableInGameChoices() {
  inGameChoices.double.disabled = true;
  inGameChoices.hit.disabled = true;
  inGameChoices.stand.disabled = true;
  inGameChoices.run.disabled = true;
}

function enableInGameChoices() {
  inGameChoices.double.disabled = false;
  inGameChoices.hit.disabled = false;
  inGameChoices.stand.disabled = false;
  inGameChoices.run.disabled = false;
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

  revealBankerFirstHiddenAndPoints();
  whoWins();
}

function whoWins() {
  const playerPoints = calculateTotalPoints(deck.playerHand);
  const bankerPoints = calculateTotalPoints(deck.bankerHand);

  if (playerPoints > 21) {
    results.resultMessage.textContent = messages.lose;
    updateLossesForHit();
    disableInGameChoices();
    setTimeout(nextRound, 5000);
  } else if (bankerPoints > 21 || playerPoints > bankerPoints) {
    results.resultMessage.textContent = messages.win;
    updateWinnings(2);
    disableInGameChoices();
    setTimeout(nextRound, 5000);
  } else if (playerPoints < bankerPoints) {
    results.resultMessage.textContent = messages.lose;
    updateLossesForHit();
    disableInGameChoices();
    setTimeout(nextRound, 5000);
  } else {
    results.resultMessage.textContent = messages.push;
    updateNoLosses();
    disableInGameChoices();
    setTimeout(nextRound, 5000);
  }

  results.playerPoints.textContent = playerPoints;
  results.bankerPoints.textContent = bankerPoints;
}

function zao() {
  const playerPoints = calculateTotalPoints(deck.playerHand);

  if (deck.playerHand.length === 2 && playerPoints === 15) {
    results.resultMessage.textContent = messages.push;
    updateNoLosses();
    disableInGameChoices();
    setTimeout(nextRound, 5000);
  } else {
    results.resultMessage.textContent =
      "There's no backing out now. Keep playing! 😅";
  }
}

function double() {
  if (bettingInfo.balance < bettingInfo.betAmount) {
    results.resultMessage.textContent = "You're too broke to double down! 😓";
    return;
  }

  bettingInfo.balance -= bettingInfo.betAmount;
  bettingInfo.betAmount += bettingInfo.betAmount;
  showBet();

  deck.playerHand.push(deck.shuffled.pop());
  renderCards(deck.playerHand, cardContainer.playerCard, false);

  const playerPoints = calculateTotalPoints(deck.playerHand);
  results.playerPoints.textContent = playerPoints;

  stand();
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
}

/*----- betting functions -----*/

function bet(amount) {
  if (bettingInfo.balance >= amount) {
    bettingInfo.balance -= amount;
    bettingInfo.betAmount += amount;
    bettingInfo.history.push(amount);
    showBet();
  } else {
    results.resultMessage.style.marginTop = "280px";
    results.resultMessage.textContent = messages.insufficientBal;
  }
}

function showBet() {
  balanceAndBettingAmt.balanceAmount.textContent = bettingInfo.balance;
  balanceAndBettingAmt.bettingAmount.textContent = bettingInfo.betAmount;
}

function undoPreviousBet() {
  if (bettingInfo.history.length > 0 && bettingInfo.betAmount > 0) {
    const previousBetAmount = bettingInfo.history.pop();
    bettingInfo.balance += previousBetAmount;
    bettingInfo.betAmount -= previousBetAmount;
    showBet();
  }
}

function clearBet() {
  bettingInfo.history = [];
  bettingInfo.balance += bettingInfo.betAmount;
  bettingInfo.betAmount = 0;
  showBet();
}

function updateWinnings(numberOfTimes) {
  const winAmount = bettingInfo.betAmount * numberOfTimes;
  bettingInfo.balance += winAmount;
  bettingInfo.betAmount = 0;
  showBet();
}

function updateLosses(numberOfTimes) {
  const lossAmount = bettingInfo.betAmount * numberOfTimes;
  bettingInfo.balance -= lossAmount;
  bettingInfo.betAmount = 0;
  showBet();
}

function updateLossesForHit() {
  bettingInfo.betAmount = 0;
  showBet();
}

function updateNoLosses() {
  bettingInfo.balance += bettingInfo.betAmount;
  bettingInfo.betAmount = 0;
  showBet();
}

function hideInGameChoices(displayStyle) {
  for (const key in inGameChoices) {
    if (inGameChoices.hasOwnProperty(key)) {
      inGameChoices[key].style.display = displayStyle;
    }
  }
}

function hideStarting4Cards(displayStyle) {
  let cards = [cardContainer.playerCard, cardContainer.bankerCard];

  for (let i = 0; i < cards.length; i++) {
    cards[i].style.display = displayStyle;
  }
}

function hideBankerAndPlayerPoints(displayStyle) {
  let pointsElToHide = [points.banker, points.player];

  pointsElToHide.forEach((el) => {
    el.style.display = displayStyle;
  });
}

function hideChips(displayStyle) {
  for (const key in chips) {
    if (chips.hasOwnProperty(key)) {
      chips[key].style.display = displayStyle;
    }
  }
}

function hideStarting4Cards(displayStyle) {
  let cards = [cardContainer.playerCard, cardContainer.bankerCard];

  for (let i = 0; i < cards.length; i++) {
    cards[i].style.display = displayStyle;
  }
}

function hideInputChoices() {
  inputChoices.undo.style.display = "none";
  inputChoices.clear.style.display = "none";
  inputChoices.deal.style.display = "none";
}

function revealInputChoices() {
  inputChoices.undo.style.display = "";
  inputChoices.clear.style.display = "";
  inputChoices.deal.style.display = "";
}

function displayAndCenterErrorMessage() {
  results.resultMessage.style.marginTop = "280px";
  results.resultMessage.textContent = messages.cannotDeal;
}

function revertErrorMessage() {
  results.resultMessage.textContent = "";
  results.resultMessage.style.marginTop = "0px";
}

function welcomeMessageandInstruction() {
  results.resultMessage.style.marginTop = "280px";
  results.resultMessage.textContent =
    "welcome to the world of 🌍 blackjack, please place a bet amount of at least $5 💵.";
}

function startGame() {
  if (bettingInfo.betAmount < 5) {
    displayAndCenterErrorMessage();
    return;
  }
  deal();
  hideInGameChoices("");
  hideBankerAndPlayerPoints("");
  hideStarting4Cards("");
  revertErrorMessage();
  hideChips("none");
  hideInputChoices();

  checkBlackJack();
  checkBanBan();
}

function checkForBrokeInstances() {
  if (bettingInfo.balance <= 0) {
    let playAgain = confirm(
      "Nearest ATM 🏦 is just across the street. If your balance is negative, make sure to clear your debt with Ah Huat 👴🏼 first!"
    );
    if (playAgain) {
      bettingInfo.balance = 1000;
      bettingInfo.betAmount = 0;
      showBet();
      init();
    } else {
      results.resultMessage.style.marginTop = "280px";
      results.resultMessage.textContent =
        "Thank you for playing. If your balance is negative, remember to clear your debt with Ah Huat 👴🏼 first, before refreshing the page to play again.";
      disableInGameChoices();
      disableChips();
      disableInputChoices;
    }
  }
}
