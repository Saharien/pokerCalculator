/**
 * Created by mika on 06.09.2016.
 */

var cards = [];  // the currently chosen cards
var pcglob = {}; // poker Calculator globals

/**
 * Adds class 'cardred' to DOM element cardDOM if the supplied card is a (h)eart or a (d)iamond card or
 * class 'cardblack' if it is a (c)lub or a (s)pades card. The respective other class is removed.
 * If card is neither h/d nor c/s, both classes are removed (for status messages)
 * @param {Object} cardDOM The DOM object which should be changed.
 * @param {string} card The corresponding card
 */
var colorCard = function redCard(cardDOM, card) {
    if (card.charAt(1) === 'h' || card.charAt(1) === 'd') {
        cardDOM.classList.remove('cardblack');
        cardDOM.classList.add('cardred');
    } else if (card.charAt(1) === 'c' || card.charAt(1) === 's') {
        cardDOM.classList.remove('cardred');
        cardDOM.classList.add('cardblack');
    } else {
        cardDOM.classList.remove('cardred');
        cardDOM.classList.remove('cardblack');
    }
}

/**
 * Transforms heart/diamond/club/spade symbol to letter and vice versa
 * @param symbol One of the letters h, d, c, s or one of the symbols ♥, ♦, ♣, ♠
 * @returns {*} One of the letters h, d, c, s or one of the symbols ♥, ♦, ♣, ♠
 */
var transformSymbol = function transformSymbol(symbol) {
    switch(symbol) {
        case 'h':
            return '♥';
        case 'd':
            return '♦';
        case 'c':
            return '♣';
        case 's':
            return '♠';
        case '♥':
            return 'h';
        case '♦':
            return 'd';
        case '♣':
            return 'c';
        case '♠':
            return 's';
    }
}

/**
 * Replaces h/d/c/s by ♥/♦/♣/♠ and T by 10 for the output
 * @param {string} card Card in the format Th, Qd
 * @returns {string} Card in the format 10♥, Q♦
 */
var nicifyCard = function nicifyCard(card) {

    card = card.replaceAt(1, transformSymbol(card.charAt(1))); // replaces letter by symbol

    if (card.charAt(0) === 'T') {
        card = card.replace('T', '10');
    }
    return card;
}

/**
 * Updates the "Chosen cards" section on the screen. Currently they are hold in a global variable cards.
 */
var updateChosenCards = function update() {

    var card;

    for (var i = 0; i < cards.length; i++) {
        card = document.getElementById('card' + i);
        card.innerHTML = nicifyCard(cards[i]);
        colorCard(card, cards[i]);
    }
    if (cards.length === 0) {
        card = document.getElementById('card0');
        card.innerHTML = 'No card chosen yet.';
        colorCard(card, 'nn');
        for (var i = 1; i < 7; i++) {
            card = document.getElementById('card' + i);
            card.innerHTML = '';
        }
    }
}

/**
 * Sets the progress bar on the screen to a given value.
 * @param percentage The value the progress bar should be set to.
 */
var updateProgressBar = function updateProgressBar(percentage) {
    var progressBar = document.getElementById('progressbar');
    progressBar.innerHTML = percentage + '%';
    progressBar.setAttribute('aria-valuenow', percentage);
    progressBar.setAttribute('style', 'width:' + percentage + '%');
}

/**
 * Sets the display attribute for a given css class.
 * @param {string} cssclass The class which should be changed.
 * @param {string} display The target display attribute (e.g. 'block' or 'none')
 */
var setDisplay = function setDisplay(cssclass, display) {
    var progressBar = document.getElementsByClassName(cssclass);
    for (var i = 0; i < progressBar.length; i++) {
        progressBar[i].style.display = display;
    }
}

/**
 * This Event handler is assigned to every card button. It adds the chosen card to the global cards array and updates
 * the chosen cards display.
 */
var cardSelectorEventHandler = function cardSelectorEventHandler() {
    if (cards.length < 7) {
        cards.push(this.value);
        updateChosenCards();
    }
}

/**
 * This Event handler is assigned to every color selctor button. It changes all card selector buttons to the
 * selected color.
 */
var colorSelectorEventHandler = function colorSelectorEventHandler() {
    var toggleColor = false;
    var cardSelectorButtons = document.getElementsByClassName('card-selector');
    var oldSymbol =  cardSelectorButtons[0].innerHTML.charAt(1);
    var newSymbol=transformSymbol(this.value);

    if((cardSelectorButtons[0].classList.contains('red')&&(this.value==='c'||this.value==='s')) ||
       (cardSelectorButtons[0].classList.contains('black')&&(this.value==='d'||this.value==='h'))) {
        toggleColor = true;
    }
    for (var i = 0; i < cardSelectorButtons.length; i++) {
        if(toggleColor) {
            cardSelectorButtons[i].classList.toggle('black');
            cardSelectorButtons[i].classList.toggle('red');
        }
        cardSelectorButtons[i].innerHTML = cardSelectorButtons[i].innerHTML.replace(oldSymbol, newSymbol);
        cardSelectorButtons[i].setAttribute('value', cardSelectorButtons[i].innerHTML.charAt(0) + this.value);
    }

}

/**
 * This Event handler is assigned to the "Clear All Cards" button. It empties the global cards array and updates
 * the chosen cards display.
 */
var clearAllCardsEventHandler = function clearAllCardsEventHandler() {
    cards = [];
    updateChosenCards();
}

/**
 * Gets and preps input data and puts it in return object.
 */
var getInputData = function getInputData() {

    var returnObject = {};

    returnObject.numberOfPlayers = document.getElementById('numberOfPlayers').value;

    returnObject.numberOfRounds = document.getElementById('numberOfRounds').value;

    returnObject.playerCards = cards.slice(0, 2);

    returnObject.flop = cards.slice(2, 5);
    if (returnObject.flop.length === 0) {
        returnObject.flop = undefined;
    }

    returnObject.turn = cards[5];
    if (returnObject.turn != undefined && returnObject.turn.length === 0) {
        returnObject.turn = undefined;
    }

    returnObject.river = cards[6];
    if (returnObject.river != undefined && returnObject.river.length === 0) {
        returnObject.river = undefined;
    }

    returnObject.numberOfWorkers = 4;

    return returnObject;

}

var verifyInputData = function verifyInputData(inputData) {

    if (inputData.playerCards.length !== 2) {
        alert('Please enter your own cards')
        return false;
    }

    if (inputData.flop !== undefined && inputData.flop.length !== 3 && inputData.flop.length !== 0) {
        alert('Please enter either three or no cards for flop');
        return false;
    }

    if (typeof(Worker) === "undefined") {
        alert('Your Browser cannot run pokerCalculator - HTML5 Web Worker is not supported.');
        return false;
    }

    for (var i=0; i<cards.length; i++) {
        for (var j=0; j<cards.length; j++) {
            if(cards[i]===cards[j] && i!==j) {
                alert('One and the same card may only occur once (' + nicifyCard(cards[i]) + ').');
                return false;
            }
        }
    }

}

/**
 * Sets progress bar to 0
 * Hides the result paragraph
 * Shows progress bar
 */
var initializeScreen = function initializeScreen() {
    updateProgressBar(0);
    setDisplay('result', 'none');
    setDisplay('progr', 'block');
};

/**
 * This event handler is assigned to the callback from the webworker. It handles the result.
 */
var webWorkerResultEventHandler = function webWorkerResultEventHandler(e) {

    var roundsDone = 0;
    var result;
    var resultSum = {
        games: 0,
        win: 0,
        draw: 0,
        loose: 0
    };

    if (e.data.type === 'status') {
        pcglob.progress[e.data.workerID] = e.data.rounds;
        pcglob.progress.forEach(function (currentValue) {
            roundsDone += currentValue;
        });
        updateProgressBar(Math.round(roundsDone / pcglob.inputData.numberOfRounds * 100));
    } else {
        result = e.data;
        result.games = result.win + result.loose + result.draw;
        pcglob.result.push(result);
        if (pcglob.result.length === pcglob.inputData.numberOfWorkers) {
            pcglob.result.forEach(function (currentValue) {
                resultSum.games += currentValue.games;
                resultSum.win += currentValue.win;
                resultSum.draw += currentValue.draw;
                resultSum.loose += currentValue.loose;
            });
            resultSum.winchance = Math.round((resultSum.win / resultSum.games) * 100);
            resultSum.drawchance = Math.round((resultSum.draw / resultSum.games) * 100);
            resultSum.looserisk = Math.round((resultSum.loose / resultSum.games) * 100);
            resultSum.prosa = '<strong>Your chance to win is ' + resultSum.winchance + '%,</strong> your chance for draw is ' + resultSum.drawchance + '%, your risk to loose is ' + resultSum.looserisk + '%.';
            document.getElementById('result').innerHTML = resultSum.prosa;
            setDisplay('result', 'block');
            setDisplay('progr', 'none');
            console.timeEnd('Messung');
        }
    }
}


/**
 * This Event handler is assigned to the "Go" button. It starts a Worker which simulates the poker rounds
 * and returns the result. Then it updates the screen with the result.
 */
var goEventHandler = function goEventHandler() {

    console.time('Messung');

    pcglob.progress = [];
    pcglob.result = [];

    var workers = [];

    var inputData = getInputData();
    pcglob.inputData = inputData;
    initializeScreen();
    if (verifyInputData(inputData) === false) return false;

    for (var i = 0; i < inputData.numberOfWorkers; i++) {
        workers[i] = new Worker("webworker.js");
        workers[i].addEventListener('message', webWorkerResultEventHandler, false);
        inputData.workerID = i;
        workers[i].postMessage(inputData); // Send data to our worker.
    }

    return false;
}

var assignUIEventHandlers = function assignUIEventHandlers() {

    // Event handler per card button
    var cardSelectorButtons = document.getElementsByClassName('card-selector');
    for (var i = 0; i < cardSelectorButtons.length; i++) cardSelectorButtons[i].onclick = cardSelectorEventHandler;

    // Event handler per color selector button
    var colorSelectorButtons = document.getElementsByClassName('color-selector');
    for (i = 0; i < colorSelectorButtons.length; i++) colorSelectorButtons[i].onclick = colorSelectorEventHandler;

    // Clear all cards button
    document.getElementById('clearAllCards').onclick = clearAllCardsEventHandler;

    // Go button
    document.getElementById('startform').onsubmit = goEventHandler;

}

assignUIEventHandlers();
