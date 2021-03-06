/**
 * carddeck.js 0.0.2
 * author: Yosiya Hinosawa ( @kt3k )
 * license: MIT-license ( http://kt3k.mit-license.org/ )
 * dependency: div.js@2.0
 */

window.imgPool = new window.ImagePool()
.createCache('img/s62.png', 15, null, {position: 'absolute', top: '0px', left: '0px'})
.createCache('img/n62.png', 15, null, {position: 'absolute', top: '0px', left: '0px'})
.createCache('img/o62.png', 15, null, {position: 'absolute', top: '0px', left: '0px'})
.createCache('img/w62.png', 15, null, {position: 'absolute', top: '0px', left: '0px'});

window.card = window.div.branch(function (cardPrototype, parent, decorators) {
    'use strict';

    cardPrototype.init = function (args) {
        this.i = args.i;

        this.dur = args.duration || 0;
        this.width = 62;
        this.height = 62;
        this.screenWidth = args.screenWidth;
        this.screenHeight = args.screenHeight;
        this.swipeeHeight = args.swipeeHeight;
        this.deckHeight = args.deckHeight;
        this.popEvent = args.popEvent;
        this.targetDom = args.dom;

        this
        .css({
            position: 'absolute',
            width: this.width + 'px',
            height: this.height + 'px'
        })
        .setHue(args.color.hue)
        .setSat(args.color.sat)
        .setLum(args.color.lum)
        .setScale(0)
        .setX(this.screenWidth / 2 - this.width / 2)
        .setY(this.screenHeight - this.swipeeHeight - this.height / 2)
        .prependTo(this.targetDom)
        .commit();

        this.dom.appendChild(window.imgPool.get(args.color.imgSrc));

        this.__subscription__ = {
            pop: [this.dom, 'click']
        };

        this.__publication__ = {
            pop: this.popEvent
        };
    }
    .E(pubsub.InitSubscription)
    .E(pubsub.InitPublication)
    .E(decorators.Chainable);

    cardPrototype.pop = function () {
    };

    cardPrototype.appear = function () {
        this
        .transition()
        .duration(this.dur)
        .setScale(100)
        .addX((this.i - 1) * 100)
        .setY(this.screenHeight - this.swipeeHeight - this.deckHeight / 2 - this.height / 2)
        .transitionCommit();
    }
    .E(pubsub.Subscribe)
    .E(decorators.Chainable);

    cardPrototype.disappear = function () {
        this
        .setScale(0)
        .addRot(Math.random() * 720 - 360)
        .commit()
        .transition()
        .duration(this.dur)
        .delay(1000 - this.dur)
        .remove()
        .transitionCommit();
    }
    .E(pubsub.Unsubscribe)
    .E(decorators.Chainable);

    cardPrototype.shoot = function () {
        this
        .transition()
        .duration(this.dur)
        .setScale(0)
        .setX(this.screenWidth / 2 - this.width / 2)
        .setY(this.screenHeight - this.swipeeHeight - this.deckHeight - this.height / 2)
        .remove()
        .transitionCommitSync();
    }
    .E(pubsub.Unsubscribe);
});

this.Deck = Object.branch(function (deckPrototype, parent, decorators) {
    'use strict';

    deckPrototype.init = function (args) {
        this.popEvent = args.popEvent;
        this.dealEvent = args.dealEvent;
        this.codonEvent = args.codonEvent;
        this.screenHeight = args.screenHeight;
        this.screenWidth = args.screenWidth;
        this.swipeeHeight = args.swipeeHeight;
        this.deckHeight = args.deckHeight;
        this.targetDom = args.dom;

        this.__subscription__ = {
            pop: this.popEvent,
            dealCard: this.dealEvent,
            shoot: this.codonEvent
        };
    }
    .E(pubsub.InitSubscription)
    .E(decorators.Chainable);

    deckPrototype.appear = function () {
        this.deck = [];
    }
    .E(pubsub.Subscribe)
    .E(decorators.Chainable);

    deckPrototype.disappear = function () {
        this.deck.forEach(function (card) {
            card.disappear();
        });

        this.deck = null;
    }
    .E(pubsub.Unsubscribe)
    .E(decorators.Chainable);

    deckPrototype.dealCard = function (data) {
        this.deck.push(window.card().init({
            i: data.index,
            color: data.color,
            duration: 300,
            eventListener: this.popBroadcaster,
            targetDom: this.dom,
            screenWidth: this.screenWidth,
            screenHeight: this.screenHeight,
            swipeeHeight: this.swipeeHeight,
            deckHeight: this.deckHeight,
            popEvent: this.popEvent,
            dom: this.targetDom
        }).appear());
    };

    deckPrototype.shoot = function () {
        var prevDeck = this.deck;
        this.deck = [];

        window.elapsed(575)
        .then(function () {
            prevDeck.forEach(function (card) {
                card.shoot();
            });
        });
    };

    deckPrototype.pop = function () {
        this.deck.pop().disappear();
    };
});

window.swipee = window.div.branch(function (swipeePrototype, parent, decorators) {
    'use strict';

    swipeePrototype.init = function (args) {
        this.targetDom = args.dom;
        this.targetHeight = args.targetHeight;
        this.targetWidth = args.targetWidth;
        this.screenWidth = args.screenWidth;
        this.screenHeight = args.screenHeight;
        this.defaultColor = args.defaultColor;

        this.__subscription__ = {
            dealListener: args.dealEvent,
            progressListener: args.progressEvent
        };
    }
    .E(pubsub.InitSubscription)
    .E(decorators.Chainable);

    swipeePrototype.appear = function () {
        this
        .css({
            position: 'absolute',
            top: '0px',
            left: '0px',
            width: this.targetWidth + 'px',
            height: this.targetHeight + 'px',
            lineHeight: this.targetHeight + 'px',
            fontFamily: 'menlo, monospace',
            fontWeight: 'bold'
        })
        .setY(this.screenHeight)
        .setX((this.screenWidth - this.targetWidth) / 2)
        .setColor(this.defaultColor)
        .commit()
        .appendTo(this.targetDom)
        .transition()
        .delay(500)
        .addY(-this.targetHeight)
        .transition()
        .duration(200)
        .transitionCommitSync()
        .transitionUnlock();

        var img = new Image();
        img.src = 'img/swipe.png';

        this.dom.appendChild(img);
    }
    .E(pubsub.Subscribe)
    .E(decorators.Chainable);

    swipeePrototype.disappear = function () {
        this
        .transition()
        .addY(this.targetHeight)
        .transition()
        .duration(1000)
        .remove()
        .transitionCommit();
    }
    .E(pubsub.Unsubscribe)
    .E(decorators.Chainable);

    swipeePrototype.setColor = function (color) {
        this
        .setHue(color.hue)
        .setSat(color.sat)
        .setLum(color.lum);
    }
    .E(decorators.Chainable);

    swipeePrototype.lightUp = function (color) {
        this
        .setColor(color)
        .commit()
        .transition()
        .delay(400)
        .setColor(this.defaultColor)
        .transitionCommitSync()
        .transitionUnlock();
    };

    swipeePrototype.dealListener = function (data) {
        this.lightUp(data.color);
    };

    swipeePrototype.progressListener = function (data) {
        this.setColor(data.color).commit();
    };
});

this.cardDeck = Object.branch(function (deckPrototype, parent, decorators) {
    'use strict';

    deckPrototype.colorMap = {
        S: {
            hue: Math.floor(Math.random() * 360),
            sat: 80,
            lum: 50,
            imgSrc: 'img/s62.png'
        },
        N: {
            hue: Math.floor(Math.random() * 360),
            sat: 40,
            lum: 50,
            imgSrc: 'img/n62.png'
        },
        O: {
            hue: Math.floor(Math.random() * 360),
            sat: 80,
            lum: 50,
            imgSrc: 'img/o62.png'
        },
        W: {
            hue: Math.floor(Math.random() * 360),
            sat: 80,
            lum: 50,
            imgSrc: 'img/w62.png'
        },
        NONE: {
            hue: 0,
            sat: 0,
            lum: 50
        }
    };

    deckPrototype.init = function (args) {

        this.screenWidth = 320;
        this.screenHeight = 414;
        this.swipeeHeight = 80;
        this.swipeeWidth = 190;
        this.deckHeight = 104;

        this.opEvent = args.opEvent;
        this.baseEvent = args.baseEvent;
        this.popEvent = args.popEvent;
        this.shootEvent = args.shootEvent;
        this.dealEvent = args.dealEvent;
        this.progressEvent = args.progressEvent;
        this.monoEvent = args.monoEvent;
        this.codonEvent = args.codonEvent;

        this.dom = args.dom;

        var machine = this.ribosome = window.ribosome = window.CodonBox().init({
            bases: ['S', 'N', 'O', 'W'],
            commandLength: 3,
            monoEvent: this.monoEvent,
            codonEvent: this.codonEvent,
            baseEvent: this.baseEvent,
            popEvent: this.popEvent
        });

        this.__subscription__ = {
            codonEventListener: this.codonEvent,
            monoEventListener: this.monoEvent
        };

        this.__publication__ = {
            opEventPublisher: this.opEvent,
            dealEventPublisher: this.dealEvent
        };

        this.recorder = window.rec = window.recorder().init({
            popEvent: this.popEvent,
            baseEvent: this.baseEvent
        });

        this.deck = window.Deck().init({
            popEvent: this.popEvent,
            codonEvent: this.codonEvent,
            dealEvent: this.dealEvent,
            screenHeight: this.screenHeight,
            screenWidth: this.screenWidth,
            deckHeight: this.deckHeight,
            swipeeHeight: this.swipeeHeight,
            dom: this.dom
        });

        this.swipeTarget = window.swipee().init({
            dom: this.dom,
            targetWidth: this.swipeeWidth,
            targetHeight: this.swipeeHeight,
            screenWidth: this.screenWidth,
            screenHeight: this.screenHeight,
            defaultColor: this.colorMap.NONE,
            dealEvent: this.dealEvent,
            progressEvent: this.progressEvent
        });
    }
    .E(pubsub.Init)
    .E(decorators.Chainable);

    deckPrototype.appear = function () {
        var self = this;

        this.deck.appear();
        this.recorder.appear();
        this.swipeTarget.appear();
        this.ribosome.appear();

        var swipe = {
            target: this.swipeTarget.dom,

            end: {
                up: function () {
                    window.radio(self.baseEvent).broadcast({cmd: 'S'});
                },
                down: function () {
                    window.radio(self.baseEvent).broadcast({cmd: 'N'});
                },
                left: function () {
                    window.radio(self.baseEvent).broadcast({cmd: 'O'});
                },
                right: function () {
                    window.radio(self.baseEvent).broadcast({cmd: 'W'});
                }
            },

            progress: {
                up: function () {
                    window.radio(self.progressEvent).broadcast({cmd: 'S', color: self.colorMap.S});
                },
                down: function () {
                    window.radio(self.progressEvent).broadcast({cmd: 'N', color: self.colorMap.N});
                },
                left: function () {
                    window.radio(self.progressEvent).broadcast({cmd: 'O', color: self.colorMap.O});
                },
                right: function () {
                    window.radio(self.progressEvent).broadcast({cmd: 'W', color: self.colorMap.W});
                }
            }
        };

        window.arrowkeys(swipe.end);
        window.swipe4(swipe);
    }
    .E(pubsub.Subscribe)
    .E(decorators.Chainable);

    deckPrototype.disappear = function () {
        this.deck.disappear();
        this.recorder.disappear();
        this.swipeTarget.disappear();
        this.ribosome.disappear();

        window.arrowkeys.clear();
        window.swipe4.clear();
    }
    .E(pubsub.Unsubscribe)
    .E(decorators.Chainable);

    deckPrototype.monoEventListener = function (data) {
        this.dealEventPublisher(data);
    };

    deckPrototype.codonEventListener = function (data) {
        var self = this;

        window.elapsed(875)
        .then(function () {
            self.opEventPublisher(data.syms.join(''));
        });
    };

    deckPrototype.dealEventPublisher = function (data) {
        return {
            index: data.index,
            command: data.command,
            color: this.colorMap[data.command]
        }
    };

    deckPrototype.opEventPublisher = function (codon) {
        return {codon: codon};
    };
});
