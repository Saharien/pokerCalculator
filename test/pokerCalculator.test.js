/**
 * Created by mika on 15.08.2016.
 */

var expect = chai.expect;
chai.should();

describe('pokerCalculator', function() {
    describe('#dealCompletely()', function() {
        it('should return a remaining deck of 35 cards when called for 6 players', function() {
            var deck = shuffle(createDeck());
            var dealResult = dealCompletely(deck, 6);
            dealResult.remainingDeck.should.have.length(35);
        });
        it('should return a remaining deck of 43 cards when called for 2 players', function() {
            var deck = shuffle(createDeck());
            var dealResult = dealCompletely(deck, 2);
            dealResult.remainingDeck.should.have.length(43);
        });
        it('non of the community cards should be within the remaining deck', function() {
            var deck = shuffle(createDeck());
            var dealResult = dealCompletely(deck, 6);
            var contained = false;
            for(var i=0; i<5; i++) {
                if (dealResult.remainingDeck.indexOf(dealResult.communityCards[i]) !== -1) {
                    contained = true;
                }
            }
            expect(contained).to.equal(false);
        });
        it('non of the players cards should be within the remaining deck', function() {
            var deck = shuffle(createDeck());
            var dealResult = dealCompletely(deck, 6);
            var contained = false;
            for(var i=0; i<5; i++) {
                if (dealResult.remainingDeck.indexOf(dealResult.playerCards[i][0]) !== -1 ||
                    dealResult.remainingDeck.indexOf(dealResult.playerCards[i][1]) !== -1) {
                    contained = true;
                }
            }
        });
    });
});