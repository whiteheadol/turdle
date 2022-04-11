// Global Variables
var winningWord = '';
var currentRow = 1;
var guess = '';
var words;

// Query Selectors
var inputs = document.querySelectorAll('input');
var guessButton = document.querySelector('#guess-button');
var keyLetters = document.querySelectorAll('span');
var errorMessage = document.querySelector('#error-message');
var gameEndMessage = document.querySelector('#game-end-message');
var viewRulesButton = document.querySelector('#rules-button');
var viewGameButton = document.querySelector('#play-button');
var viewStatsButton = document.querySelector('#stats-button');
var gameBoard = document.querySelector('#game-section');
var letterKey = document.querySelector('#key-section');
var rules = document.querySelector('#rules-section');
var stats = document.querySelector('#stats-section');

// Event Listeners
window.addEventListener('load', function() {
  let wordsPromise = fetch('http://localhost:3001/api/v1/words')
  .then(wordsPromise => wordsPromise.json())
  .then(data => {
    words = data;
    setGame();
  })
  .catch(err => console.log('error'))
});

for (var i = 0; i < inputs.length; i++) {
  inputs[i].addEventListener('keyup', function() { moveToNextInput(event) });
}

for (var i = 0; i < keyLetters.length; i++) {
  keyLetters[i].addEventListener('click', function() { clickLetter(event) });
}

guessButton.addEventListener('click', function() {
  submitGuess();
});

viewRulesButton.addEventListener('click', viewRules);

viewGameButton.addEventListener('click', viewGame);

viewStatsButton.addEventListener('click', viewStats);

// Functions
function setGame() {
  gameEndMessage.innerText = '';
  winningWord = getRandomWord();
  updateInputPermissions();
  resetKeyLetters();
}

// How do we have access to the words array?
function getRandomWord() {
  var randomIndex = Math.floor(Math.random() * 2500);
  return words[randomIndex];
}

// Inputs a node list
// Current row begins at 1
function updateInputPermissions() {
  for(var i = 0; i < inputs.length; i++) {
    if(!inputs[i].id.includes(`-${currentRow}-`)) {
      inputs[i].disabled = true;
    } else {
      inputs[i].disabled = false;
    }
  }

  inputs[0].focus();
}

function resetPermissions() {
  for(var i = 0; i < inputs.length; i++) {
    inputs[i].value = '';
    inputs[i].classList = '';
  }

  inputs[0].focus();
}

// What is e.keycode? or e.charCode?
// Not sure how this function works exaclty
// This is mvoing the 'focus'(?) to the next id down the row
function moveToNextInput(e) {
  var key = e.keyCode || e.charCode;

  if( key !== 8 && key !== 46 && e.target.id !== 'cell-6-29') {
    var indexOfNext = parseInt(e.target.id.split('-')[2]) + 1;
    inputs[indexOfNext].focus();
  }
}

function clickLetter(e) {
  var activeInput = null;
  var activeIndex = null;

  for (var i = 0; i < inputs.length; i++) {
    if(inputs[i].id.includes(`-${currentRow}-`) && !inputs[i].value && !activeInput) {
      activeInput = inputs[i];
      activeIndex = i;
    }
  }

  activeInput.value = e.target.innerText;
  inputs[activeIndex + 1].focus();
}

function submitGuess() {
  if (checkIsWord()) {
    errorMessage.innerText = '';
    gameEndMessage.innerText = '';
    compareGuess();
    if (checkForWin()) {
      declareWinner();
      currentRow = 1;
      setTimeout(resetPermissions, 4000);
      setTimeout(setGame, 4000);
    } else {
      console.log(currentRow);
      changeRow();
    }
  } else {
    errorMessage.innerText = 'Not a valid word. Try again!';
  }
}

function checkIsWord() {
  guess = '';

  for(var i = 0; i < inputs.length; i++) {
    if(inputs[i].id.includes(`-${currentRow}-`)) {
      guess += inputs[i].value;
    }
  }

  return words.includes(guess);
}

function compareGuess() {
  var guessLetters = guess.split('');

  for (var i = 0; i < guessLetters.length; i++) {

    if (winningWord.includes(guessLetters[i]) && winningWord.split('')[i] !== guessLetters[i]) {
      updateBoxColor(i, 'wrong-location');
      updateKeyColor(guessLetters[i], 'wrong-location-key');
    } else if (winningWord.split('')[i] === guessLetters[i]) {
      updateBoxColor(i, 'correct-location');
      updateKeyColor(guessLetters[i], 'correct-location-key');
    } else {
      updateBoxColor(i, 'wrong');
      updateKeyColor(guessLetters[i], 'wrong-key');
    }
  }
}

function updateBoxColor(letterLocation, className) {
  var row = [];

  for (var i = 0; i < inputs.length; i++) {
    if(inputs[i].id.includes(`-${currentRow}-`)) {
      row.push(inputs[i]);
    }
  }

  row[letterLocation].classList.add(className);
}

function updateKeyColor(letter, className) {
  var keyLetter = null;

  for (var i = 0; i < keyLetters.length; i++) {
    if (keyLetters[i].innerText === letter) {
      keyLetter = keyLetters[i];
    }
  }

  keyLetter.classList.add(className);
}

function resetKeyLetters() {
  keyLetters.forEach((keyLetter) => {
    keyLetter.className = '';
  })
}

function checkForWin() {
  return guess === winningWord;
}

function changeRow() {
  if (currentRow < 6) {
    currentRow++;
    updateInputPermissions();
  } else {
    gameEndMessage.innerText = 'Sorry! You lost.';
    currentRow = 1;
    setTimeout(resetPermissions, 4000);
    setTimeout(setGame, 4000);
  }
}

// There is already a function to determine winner, just need to
// make this obvious to player and restart game appropriately
function declareWinner() {
  console.log('winner!');
  gameEndMessage.innerText = `Congratulations! You won this game of Turdle in ${currentRow} tries!`;
}

function viewRules() {
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
  rules.classList.remove('collapsed');
  stats.classList.add('collapsed');
  viewGameButton.classList.remove('active');
  viewRulesButton.classList.add('active');
  viewStatsButton.classList.remove('active');
}

function viewGame() {
  letterKey.classList.remove('hidden');
  gameBoard.classList.remove('collapsed');
  rules.classList.add('collapsed');
  stats.classList.add('collapsed');
  viewGameButton.classList.add('active');
  viewRulesButton.classList.remove('active');
  viewStatsButton.classList.remove('active');
}

function viewStats() {
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
  rules.classList.add('collapsed');
  stats.classList.remove('collapsed');
  viewGameButton.classList.remove('active');
  viewRulesButton.classList.remove('active');
  viewStatsButton.classList.add('active');
}
