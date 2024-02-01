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
  let deckOfCards = buildDeck();

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

function checkBlackJackAndBanBan() {
  const playerPoints = calculateTotalPoints(deck.playerHand);
  const bankerPoints = calculateTotalPoints(deck.bankerHand);

  if (
    deck.bankerHand[0].point === 11 &&
    deck.bankerHand[1].point === 11 &&
    playerPoints === 21
  ) {
    revealBankerFirstHiddenCard();
    gameState.gameOver = true;
    results.resultMessage.textContent = messages.lose;
    results.bankerPoints.textContent = "ban ban";
    results.playerPoints.textContent = "blackjack";
    updateLosses(0);
    disableInGameChoices();
    setTimeout(nextRound, 5000);
  } else if (
    bankerPoints === 21 &&
    deck.playerHand[0].point === 11 &&
    deck.playerHand[1].point === 11
  ) {
    revealBankerFirstHiddenCard();
    gameState.gameOver = true;
    results.resultMessage.textContent = messages.win;
    results.bankerPoints.textContent = "blackjack";
    results.playerPoints.textContent = "ban ban";
    updateWinnings(2);
    disableInGameChoices();
    setTimeout(nextRound, 5000);
  } else {
    results.bankerPoints.textContent = "?";
    results.playerPoints.textContent = playerPoints;
  }
}

function checkBlackJack() {
  const playerPoints = calculateTotalPoints(deck.playerHand);
  const bankerPoints = calculateTotalPoints(deck.bankerHand);

  if (playerPoints === 21 && bankerPoints !== 21) {
    revealBankerFirstHiddenCard();
    gameState.playerBlackJack = true;
    gameState.gameOver = true;
    results.resultMessage.textContent = messages.playerBJ;
    results.bankerPoints.textContent = bankerPoints;
    results.playerPoints.textContent = "blackjack";
    updateWinnings(3);
    disableInGameChoices();
    setTimeout(nextRound, 5000);
  } else if (bankerPoints === 21 && playerPoints === 15) {
    revealBankerFirstHiddenCard();
    gameState.gameOver = true;
    results.resultMessage.textContent = "heng ah, zao! 🏃";
    results.bankerPoints.textContent = "blackjack";
    results.playerPoints.textContent = playerPoints;
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
    results.playerPoints.textContent = playerPoints;
    updateLosses(1);
    disableInGameChoices();
    setTimeout(nextRound, 5000);
  } else if (bankerPoints === 21 && playerPoints === 21) {
    revealBankerFirstHiddenCard();
    gameState.gameOver = true;
    gameState.playerBlackJack = true;
    results.resultMessage.textContent = messages.push;
    results.bankerPoints.textContent = "blackjack";
    results.playerPoints.textContent = "blackjack";
    updateNoLosses();
    disableInGameChoices();
    setTimeout(nextRound, 5000);
  } else {
    results.bankerPoints.textContent = "?";
    results.playerPoints.textContent = playerPoints;
  }
}

function checkBanBan() {
  const playerPoints = calculateTotalPoints(deck.playerHand);
  const bankerPoints = calculateTotalPoints(deck.bankerHand);

  if (
    deck.bankerHand[0].point === 11 &&
    deck.bankerHand[1].point === 11 &&
    deck.playerHand[0].point === 11 &&
    deck.playerHand[1].point === 11
  ) {
    revealBankerFirstHiddenCard();
    gameState.playerBanBan = true;
    gameState.gameOver = true;
    results.resultMessage.textContent = messages.push;
    results.bankerPoints.textContent = "ban ban";
    results.playerPoints.textContent = "ban ban";
    updateNoLosses();
    disableInGameChoices();
    setTimeout(nextRound, 5000);
  } else if (
    deck.playerHand[0].point === 11 &&
    deck.playerHand[1].point === 11 &&
    bankerPoints !== 21
  ) {
    revealBankerFirstHiddenCard();
    gameState.playerBanBan = true;
    gameState.gameOver = true;
    results.resultMessage.textContent = messages.playerBB;
    results.bankerPoints.textContent = bankerPoints;
    results.playerPoints.textContent = "ban ban";
    updateWinnings(4);
    disableInGameChoices();
    setTimeout(nextRound, 5000);
  } else if (
    deck.bankerHand[0].point === 11 &&
    deck.bankerHand[1].point === 11 &&
    playerPoints !== 21 &&
    playerPoints !== 15
  ) {
    revealBankerFirstHiddenCard();
    gameState.gameOver = true;
    results.resultMessage.textContent = messages.bankerBB;
    results.bankerPoints.textContent = "ban ban";
    results.playerPoints.textContent = playerPoints;
    updateLosses(2);
    disableInGameChoices();
    setTimeout(nextRound, 5000);
  } else if (
    deck.bankerHand[0].point === 11 &&
    deck.bankerHand[1].point === 11 &&
    playerPoints === 15
  ) {
    revealBankerFirstHiddenCard();
    gameState.gameOver = true;
    results.resultMessage.textContent = "heng ah, zao! 🏃";
    results.bankerPoints.textContent = "ban ban";
    results.playerPoints.textContent = playerPoints;
    updateNoLosses();
    disableInGameChoices();
    setTimeout(nextRound, 5000);
  } else {
    results.bankerPoints.textContent = "?";
    results.playerPoints.textContent = playerPoints;
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
    results.playerPoints.textContent = "trips 7";
    disableInGameChoices();
    updateWinnings(8);
    setTimeout(nextRound, 5000);
  } else if (
    deck.bankerHand.length === 3 &&
    deck.bankerHand[0].point === 7 &&
    deck.bankerHand[1].point === 7 &&
    deck.bankerHand[2].point === 7
  ) {
    revealBankerFirstHiddenCard();
    gameState.gameOver = true;
    results.resultMessage.textContent = messages.banker777;
    results.bankerPoints.textContent = "trips 7";
    disableInGameChoices();
    updateLosses(6);
    setTimeout(nextRound, 5000);
  }
}

function hitMe() {
  inGameChoices.double.disabled = true;
  deck.playerHand.push(deck.shuffled.pop());
  renderCards(deck.playerHand, cardContainer.playerCard, false);

  const playerPoints = calculateTotalPoints(deck.playerHand);
  results.playerPoints.textContent = playerPoints;

  if (playerPoints > 21) {
    let bankerPoints = calculateTotalPoints(deck.bankerHand);

    while (bankerPoints < 16) {
      deck.bankerHand.push(deck.shuffled.pop());
      renderCards(deck.bankerHand, cardContainer.bankerCard, false);
      checkTrips7();
      bankerPoints = calculateTotalPoints(deck.bankerHand);
      results.bankerPoints.textContent = bankerPoints;
    }

    if (bankerPoints > 21 && playerPoints > 21) {
      revealBankerFirstHiddenCard();
      gameState.gameOver = true;
      results.resultMessage.textContent = messages.push;
      results.bankerPoints.textContent = bankerPoints;
      results.playerPoints.textContent = playerPoints;
      updateNoLosses();
      disableInGameChoices();
      setTimeout(nextRound, 5000);
    } else if (bankerPoints <= 21) {
      revealBankerFirstHiddenCard();
      gameState.gameOver = true;
      results.resultMessage.textContent = messages.lose;
      results.bankerPoints.textContent = bankerPoints;
      results.playerPoints.textContent = playerPoints;
      updateLosses(0);
      disableInGameChoices();
      setTimeout(nextRound, 5000);
    }
  }
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
    checkTrips7();
    bankerPoints = calculateTotalPoints(deck.bankerHand);
  }

  whoWins();
}

function double() {
  if (bettingInfo.balance < bettingInfo.betAmount) {
    results.resultMessage.textContent = "You're too broke to double down! 😓";
    return;
  } else {
    bettingInfo.balance -= bettingInfo.betAmount;
    bettingInfo.betAmount += bettingInfo.betAmount;
    showBet();
  }

  deck.playerHand.push(deck.shuffled.pop());
  renderCards(deck.playerHand, cardContainer.playerCard, false);
  checkTrips7();

  standForDouble();
}

function standForDouble() {
  let bankerPoints = calculateTotalPoints(deck.bankerHand);

  while (bankerPoints < 16) {
    deck.bankerHand.push(deck.shuffled.pop());
    renderCards(deck.bankerHand, cardContainer.bankerCard, false);
    checkTrips7();
    bankerPoints = calculateTotalPoints(deck.bankerHand);
  }

  whoWins();
}

function whoWins() {
  const playerPoints = calculateTotalPoints(deck.playerHand);
  const bankerPoints = calculateTotalPoints(deck.bankerHand);

  if (playerPoints > 21 && bankerPoints > 21) {
    //this condition is applicable for standForDouble
    revealBankerFirstHiddenCard();
    gameState.gameOver = true;
    results.playerPoints.textContent = playerPoints;
    results.bankerPoints.textContent = bankerPoints;
    results.resultMessage.textContent = messages.push;
    updateNoLosses();
    disableInGameChoices();
    setTimeout(nextRound, 5000);
  } else if (playerPoints > bankerPoints && playerPoints <= 21) {
    revealBankerFirstHiddenCard();
    gameState.gameOver = true;
    results.playerPoints.textContent = playerPoints;
    results.bankerPoints.textContent = bankerPoints;
    results.resultMessage.textContent = messages.win;
    updateWinnings(2);
    disableInGameChoices();
    setTimeout(nextRound, 5000);
  } else if (bankerPoints > playerPoints && bankerPoints <= 21) {
    revealBankerFirstHiddenCard();
    gameState.gameOver = true;
    results.playerPoints.textContent = playerPoints;
    results.bankerPoints.textContent = bankerPoints;
    results.resultMessage.textContent = messages.lose;
    updateLosses(0);
    disableInGameChoices();
    setTimeout(nextRound, 5000);
  } else if (playerPoints > 21 && bankerPoints <= 21) {
    revealBankerFirstHiddenCard();
    gameState.gameOver = true;
    results.playerPoints.textContent = playerPoints;
    results.bankerPoints.textContent = bankerPoints;
    results.resultMessage.textContent = messages.lose;
    updateLosses(0);
    disableInGameChoices();
    setTimeout(nextRound, 5000);
  } else if (bankerPoints > 21 && playerPoints <= 21) {
    revealBankerFirstHiddenCard();
    gameState.gameOver = true;
    results.playerPoints.textContent = playerPoints;
    results.bankerPoints.textContent = bankerPoints;
    results.resultMessage.textContent = messages.win;
    updateWinnings(2);
    disableInGameChoices();
    setTimeout(nextRound, 5000);
  } else if (playerPoints === bankerPoints) {
    revealBankerFirstHiddenCard();
    gameState.gameOver = true;
    results.playerPoints.textContent = playerPoints;
    results.bankerPoints.textContent = bankerPoints;
    results.resultMessage.textContent = messages.push;
    updateNoLosses();
    disableInGameChoices();
    setTimeout(nextRound, 5000);
  }
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

  checkBlackJackAndBanBan();
  if (gameState.gameOver === false) {
    checkBlackJack();
  }

  if (gameState.gameOver === false) {
    checkBanBan();
  }
}

function checkForBrokeInstances() {
  if (bettingInfo.balance <= 0) {
    let playAgain = confirm(
      "Thank you for playing. If your balance is negative, make sure to clear your debt with Ah Huat 👴🏼 first!"
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
      disableInputChoices();
    }
  }
}

/*----- other functions -----*/

function disableChips() {
  for (const key in chips) {
    if (chips.hasOwnProperty(key)) {
      chips[key].disabled = true;
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

/*----- betting functions -----*/

function bet(amount) {
  if (bettingInfo.balance >= amount) {
    bettingInfo.balance -= amount;
    bettingInfo.betAmount += amount;
    bettingInfo.history.push(amount);
    showBet();
  } else {
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

//Testing

// function testForBanBan() {
//   deck.playerHand = [
//     { face: "10-C", point: 10 },
//     { face: "6-H", point: 6 },
//   ];
//   deck.bankerHand = [
//     { face: "A-C", point: 11 },
//     { face: "A-D", point: 11 },
//   ];

//   renderCards(
//     deck.bankerHand,
//     cardContainer.bankerCard,
//     gameState.bankerFirstCardHidden
//   );
//   renderCards(deck.playerHand, cardContainer.playerCard, false);
// }

// function testForBlackJack() {
//   deck.playerHand = [
//     { face: "10-C", point: 10 },
//     { face: "6-H", point: 6 },
//   ];
//   deck.bankerHand = [
//     { face: "A-C", point: 11 },
//     { face: "10-D", point: 10 },
//   ];

//   renderCards(
//     deck.bankerHand,
//     cardContainer.bankerCard,
//     gameState.bankerFirstCardHidden
//   );
//   renderCards(deck.playerHand, cardContainer.playerCard, false);
// }

// function testForZao() {
//   deck.playerHand = [
//     { face: "10-C", point: 10 },
//     { face: "5-H", point: 5 },
//   ];
//   deck.bankerHand = [
//     { face: "A-C", point: 11 },
//     { face: "10-D", point: 10 },
//   ];

//   renderCards(
//     deck.bankerHand,
//     cardContainer.bankerCard,
//     gameState.bankerFirstCardHidden
//   );
//   renderCards(deck.playerHand, cardContainer.playerCard, false);
// }
