// pokerCalculator

/**
 * Created by mika on 09.08.2016.
 */

importScripts('node_modules/pokersolver/pokersolver.js');

// spade, heart, club, diamond, Ace, Jack, Queen, King
// 'Ad', 'As', 'Jc', '9h', '2d', '3c', 'Kd'

/**
 * Adds one suit of Cards to a given deck
 * @param {Array} deck - Already existing deck (can be empty also)
 * @param {string} suit - Which suit should be added ('s'|'h'|'c'|'d')
 * @returns {Array} The new deck
 */
var createSuitOfCards = function createSuitOfCards(deck, suit) {
    for (var i = 2; i < 10; i++) {
        deck.push(i + suit);
    }
    deck.push('T' + suit); // Tens
    deck.push('J' + suit); // Jack
    deck.push('Q' + suit); // Queen
    deck.push('K' + suit); // King
    deck.push('A' + suit); // Ace
    return (deck);
};

/**
 * Creates a full card deck (sorted, not shuffled!)
 * @returns {Array}
 */
var createDeck = function createDeck() {
    var deck = [];
    createSuitOfCards(deck, 's');
    createSuitOfCards(deck, 'h');
    createSuitOfCards(deck, 'c');
    createSuitOfCards(deck, 'd');
    return (deck);
};

/**
 * Removes given card from deck
 * @param deck - The deck
 * @param card - This card should be removed from the deck
 * @returns {Array} The remaining deck
 */
var removeFromDeck = function removeFromDeck(deck, card) {
    var index = deck.indexOf(card);
    if (index > -1) {
        deck.splice(index, 1);
    }
    return deck;
};

/**
 * Shuffles an array using the Fisher-Yates (aka Knuth) Shuffle
 * https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
 * @param array
 * @returns {Array} The shuffled array
 */
var shuffle = function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
};

/**
 * Removes a given number of Cards from a deck and returns the cards and the remaining deck.
 * @param {Array} deck - The deck
 * @param {number} numberOfCards - Number of Cards to deal
 * @returns {Object} An object with the remaining deck and the dealt cards where object.remainingDeck is the remaining deck and object.dealtCards are the dealt cards.
 */
var dealCards = function dealCards(deck, numberOfCards) {
    var dealtCards = deck.splice(0, numberOfCards);
    var dealResult;
    dealResult = {
        remainingDeck: deck,
        dealtCards: dealtCards
    };
    return dealResult;
};

/**
 * Deals for a given number of players. Returns
 * @param deck - Deck
 * @param numberOfPlayers - Number of players for which should be dealt
 * @param {Array} [playerCards] - which two cards does the player have (optional)
 * @param {Array} [flop] - what is the flop (optional)
 * @param {Array} [turn] - what is the trn (optional)
 * @param {Array} [river] - what is the river (optional)
 * @returns {Object} An object with an array for the communityCards and one array of arrays for the players cards and an array for the remainingDeck
 */
var dealCompletely = function dealCompletely(deck, numberOfPlayers, playerCards, flop, turn, river) {

    var returnObject = {};
    var dealResult;

    returnObject.remainingDeck = deck;
    returnObject.playerCards = [];

    if (playerCards !== undefined) {
        returnObject.playerCards[0] = playerCards;
        returnObject.remainingDeck = removeFromDeck(returnObject.remainingDeck, playerCards[0]);
        returnObject.remainingDeck = removeFromDeck(returnObject.remainingDeck, playerCards[1]);
    } else {
        dealResult = dealCards(returnObject.remainingDeck, 2);
        returnObject.remainingDeck = dealResult.remainingDeck;
        returnObject.playerCards[0] = dealResult.dealtCards;
    }

    if (flop !== undefined) {
        returnObject.communityCards = flop.slice();
        returnObject.remainingDeck = removeFromDeck(returnObject.remainingDeck, flop[0]);
        returnObject.remainingDeck = removeFromDeck(returnObject.remainingDeck, flop[1]);
        returnObject.remainingDeck = removeFromDeck(returnObject.remainingDeck, flop[2]);
    } else {
        dealResult = dealCards(returnObject.remainingDeck, 3);
        returnObject.remainingDeck = dealResult.remainingDeck;
        returnObject.communityCards = dealResult.dealtCards;
    }

    if (turn !== undefined) {
        returnObject.communityCards.push(turn);
        returnObject.remainingDeck = removeFromDeck(returnObject.remainingDeck, turn);
    } else {
        dealResult = dealCards(returnObject.remainingDeck, 1);
        returnObject.remainingDeck = dealResult.remainingDeck;
        returnObject.communityCards.push(dealResult.dealtCards[0]);
    }

    if (river !== undefined) {
        returnObject.communityCards.push(river);
        returnObject.remainingDeck = removeFromDeck(returnObject.remainingDeck, river);
    } else {
        dealResult = dealCards(returnObject.remainingDeck, 1);
        returnObject.remainingDeck = dealResult.remainingDeck;
        returnObject.communityCards.push(dealResult.dealtCards[0]);
    }

    for (var i = 1; i < numberOfPlayers; i++) {
        dealResult = dealCards(returnObject.remainingDeck, 2);
        returnObject.playerCards.push(dealResult.dealtCards);
        returnObject.remainingDeck = dealResult.remainingDeck;
    }

    return returnObject;
};

/**
 * Simulates one round of texas holdem with given cards and
 * @param numberOfPlayers - how many players including the one with given cards
 * @param {Array} [playerCards] - which two cards does the player have (optional)
 * @param {Array} [flop] - what is the flop (optional)
 * @param {Array} [turn] - what is the trn (optional)
 * @param {Array} [river] - what is the river (optional)
 * @returns {string} Did the player win or not (returns 'win', 'loose' or 'draw')
 */
var simulateRound = function simulateRound(numberOfPlayers, playerCards, flop, turn, river) {

    var deck = shuffle(createDeck());
    var dealResult = dealCompletely(deck, numberOfPlayers, playerCards, flop, turn, river);
    var allHands = [];

    var completeHand;
    for (var i = 0; i < dealResult.playerCards.length; i++) {
        completeHand = dealResult.communityCards.slice(0);
        completeHand.push.apply(completeHand, dealResult.playerCards[i]);
        allHands.push(Hand.solve(completeHand));
    }

    var winner = Hand.winners(allHands);

    for (var j = 0; j < winner.length; j++) {
        if (winner[j] === allHands[0]) {
            if (winner.length > 1) {
                return 'draw';
            } else {
                return 'win';
            }
        }
    }

    return 'loose';
};

/**
 * Simulates one round of texas holdem with given cards and
 * @param {number} numberOfPlayers - how many players including the one with given cards
 * @param {Array} [playerCards] - which two cards does the player have (optional)
 * @param {Array} [flop] - what is the flop (optional)
 * @param {Array} [turn] - what is the trn (optional)
 * @param {Array} [river] - what is the river (optional)
 * @param {number} numberOfRounds - how many rounds should be simulated
 * @returns {Object} Did the player win or not (returns 'win', 'loose' or 'draw')
 */
var simulateRounds = function simulateRounds(numberOfPlayers, playerCards, flop, turn, river, numberOfRounds, workerID, updateStatus) {

    var percentage = 0;

    var result = {
        win: 0,
        loose: 0,
        draw: 0
    };

    for (var i = 0; i < numberOfRounds; i++) {
        switch (simulateRound(numberOfPlayers, playerCards, flop, turn, river)) {
            case 'win':
                result.win++;
                break;
            case 'loose':
                result.loose++;
                break;
            case 'draw':
                result.draw++;
        }

        if(i%20===0) {
            updateStatus({type: 'status', workerID: workerID, rounds: i});
        }

    }

    return result;

};

self.addEventListener('message', function (e) {

    var result = simulateRounds(e.data.numberOfPlayers, e.data.playerCards, e.data.flop, e.data.turn, e.data.river, Math.round(e.data.numberOfRounds/e.data.numberOfWorkers), e.data.workerID, self.postMessage);

    result.type = 'result';
    result.workerID = e.data.workerID;

    self.postMessage(result);

}, false);













