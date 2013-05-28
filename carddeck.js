/**
 * carddeck.js 0.0.2
 * author: Yosiya Hinosawa ( @kt3k )
 * license: MIT-license ( http://kt3k.mit-license.org/ )
 * dependency: div.js@2.0
 */

window.imgPool = new window.ImagePool()
.createCache('img/x_.png', 15)
.createCache('img/l_.png', 15)
.createCache('img/m_.png', 15)
.createCache('img/s_.png', 15);

window.card = window.div.branch(function (cardPrototype, parent, decorators) {
    'use strict';

    cardPrototype.init = function (args) {
        this.i = args.i;
        this.eventListener = args.eventListener;
        this.dur = args.duration || 0;
        this.width = 62;
        this.height = 62;
        this.screenWidth = args.screenWidth;
        this.screenHeight = args.screenHeight;
        this.swipeeHeight = args.swipeeHeight;
        this.deckHeight = args.deckHeight;

        this
        .css({
            position: 'absolute',
            width: this.width + 'px',
            height: this.height + 'px',
            overflow: 'hidden'
        })
        .setHue(args.color.hue)
        .setSat(args.color.sat)
        .setLum(args.color.lum)
        .setScale(0)
        .setX(this.screenWidth / 2 - this.width / 2)
        .setY(this.screenHeight - this.swipeeHeight - this.height / 2)
        .prependTo(document.body)
        .commit();

        this.dom.appendChild(window.imgPool.get('img/' + args.color.symbol + '_.png'));

        this.bindListener();
    }
    .E(decorators.Chainable);

    cardPrototype.appear = function () {
        this
        .transition()
        .duration(this.dur)
        .setScale(100)
        .addX((this.i - 1) * 100)
        .setY(this.screenHeight - this.swipeeHeight - this.deckHeight / 2 - this.height / 2)
        .transitionCommit();

        return this;
    };

    cardPrototype.shoot = function () {
        this.unbindListener();

        this
        .transition()
        .duration(this.dur)
        .setScale(0)
        .setX(this.screenWidth / 2 - this.width / 2)
        .setY(this.screenHeight - this.swipeeHeight - this.deckHeight - this.height / 2)
        .remove()
        .transitionCommitSync();
    };

    cardPrototype.disappear = function () {
        this.unbindListener();

        this
        .setScale(0)
        .addRot(Math.random() * 720 - 360)
        .commit()
        .transition()
        .duration(this.dur)
        .delay(1000 - this.dur)
        .remove()
        .transitionCommit();
    };

    cardPrototype.bindListener = function () {
        this.dom.addEventListener('click', this.eventListener, false);
    };

    cardPrototype.unbindListener = function () {
        this.dom.removeEventListener('click', this.eventListener, false);
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
    }
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
            textAlign: 'center',
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

        this.dom.innerHTML = '<blink>&laquo; SWIPE HERE &raquo;</blink>';
    }
    .E(decorators.Chainable);

    swipeePrototype.disappear = function () {
        this
        .transition()
        .addY(this.targetHeight)
        .transition()
        .duration(1000)
        .remove()
        .transitionCommit();
    };

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
});

this.Deck = Object.branch(function (deckPrototype) {
    'use strict';

    deckPrototype.InitSubscription = function () {
        this.__listeners__ = {};

        var self = this;

        Object.keys(this.__subscription__).forEach(function (key) {
            this.__listeners__[key] = function () {
                self[key].apply(self, arguments);
            };
        }, this);
    };

    deckPrototype.Subscribe = function () {
        Object.keys(this.__listeners__).forEach(function (key) {
            this.radio(this.__subscription__[key]).subscribe(this.__listeners__[key]);
        }, this);
    };

    deckPrototype.Unsubscribe = function () {
        Object.keys(this.__listeners__).forEach(function (key) {
            this.radio(this.__subscription__[key]).unsubscribe(this.__listeners__[key]);
        }, this);
    };

    deckPrototype.init = function (args) {
        this.radio = args.radio;
        this.popEvent = args.popEvent;
        this.dealEvent = args.dealEvent;
        this.shootEvent = args.shootEvent;
        this.screenHeight = args.screenHeight;
        this.screenWidth = args.screenWidth;
        this.swipeeHeight = args.swipeeHeight;
        this.deckHeight = args.deckHeight;

        var self = this;

        this.dealListener = function (data) {
            self.dealCard(data)
        };

        this.popListener = function () {
            self.pop();
        };

        this.shootListener = function () {
            self.shoot();
        };

        this.popBroadcaster = function () {
            self.radio(self.popEvent).broadcast();
        };

        this.__subscription__ = {
            pop: this.popEvent,
            dealCard: this.dealEvent,
            shoot: this.shootEvent
        };

        this.InitSubscription();

        return this;
    };

    deckPrototype.appear = function () {
        this.deck = [];

        this.Subscribe();

        return this;
    };

    deckPrototype.disappear = function () {
        this.deck.forEach(function (card) {
            card.disappear();
        });

        this.deck = null;

        this.Unsubscribe();

        /*this.radio(this.popEvent).unsubscribe(this.popListener);
        this.radio(this.shootEvent).unsubscribe(this.shootListener);
        this.radio(this.dealEvent).unsubscribe(this.dealListener);*/

        return this;
    };

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
            deckHeight: this.deckHeight
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

this.cardDeck = Object.branch(function (deckPrototype) {
    'use strict';

    deckPrototype.colorMap = {
        S: {
            hue: Math.floor(Math.random() * 360),
            sat: 80,
            lum: 50,
            symbol: 'x'
        },
        N: {
            hue: Math.floor(Math.random() * 360),
            sat: 40,
            lum: 50,
            symbol: 'm'
        },
        O: {
            hue: Math.floor(Math.random() * 360),
            sat: 80,
            lum: 50,
            symbol: 'l'
        },
        W: {
            hue: Math.floor(Math.random() * 360),
            sat: 80,
            lum: 50,
            symbol: 's'
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
        this.radio = args.radio;

        this.dom = args.dom;

        var self = this;

        var monoHook = function (n, cmd) {
            self.radio(self.dealEvent).broadcast({
                index: n,
                command: cmd,
                color: self.colorMap[cmd]
            });

            self.swipeTarget.lightUp(self.colorMap[cmd]);
        };

        var codonHook = function (syms) {

            self.radio(self.shootEvent).broadcast();

            window.elapsed(875)
            .then(function () {
                self.radio(self.opEvent).broadcast({codon: syms.join('')});
            });
        };

        var machine = this.machine = window.ribosome = window.codonBox(['S', 'N', 'O', 'W'], 3, monoHook, codonHook);


        this.boxCmdListener = function (data) {
            machine.command(data.cmd);
        }
        this.radio(this.baseEvent).subscribe(this.boxCmdListener);


        this.boxPopListener = function (data) {
            machine.pop();
        };
        this.radio(this.popEvent).subscribe(this.boxPopListener);


        var recorder = this.recorder = window.rec = window.recorder().init({
            radio: this.radio,
            popEvent: this.popEvent,
            baseEvent: this.baseEvent
        }).appear();

        this.deck = window.Deck().init({
            popEvent: this.popEvent,
            shootEvent: this.shootEvent,
            dealEvent: this.dealEvent,
            radio: this.radio,
            screenHeight: this.screenHeight,
            screenWidth: this.screenWidth,
            deckHeight: this.deckHeight,
            swipeeHeight: this.swipeeHeight
        }).appear();

        this.swipeTarget = window.swipee().init({
            dom: this.dom,
            targetWidth: this.swipeeWidth,
            targetHeight: this.swipeeHeight,
            screenWidth: this.screenWidth,
            screenHeight: this.screenHeight,
            defaultColor: this.colorMap.NONE
        });

        return this;
    };

    deckPrototype.appear = function () {
        var self = this;

        this.swipeTarget.appear();

        var swipe = {
            target: this.swipeTarget.dom,

            end: {
                up: function () {
                    self.radio(self.baseEvent).broadcast({cmd: 'S'});
                },
                down: function () {
                    self.radio(self.baseEvent).broadcast({cmd: 'N'});
                },
                left: function () {
                    self.radio(self.baseEvent).broadcast({cmd: 'O'});
                },
                right: function () {
                    self.radio(self.baseEvent).broadcast({cmd: 'W'});
                }
            },

            progress: {
                up: function () {
                    self.swipeTarget.setColor(self.colorMap.S).commit();
                },
                down: function () {
                    self.swipeTarget.setColor(self.colorMap.N).commit();
                },
                left: function () {
                    self.swipeTarget.setColor(self.colorMap.O).commit();
                },
                right: function () {
                    self.swipeTarget.setColor(self.colorMap.W).commit();
                }
            }
        };

        window.swipe4(swipe);

        window.arrowkeys(swipe.end);

        return this;
    };

    deckPrototype.disappear = function () {
        window.arrowkeys.clear();
        window.swipe4.clear();

        this.radio(this.baseEvent).unsubscribe(this.boxCmdListener);
        this.radio(this.baseEvent).unsubscribe(this.recorderCmdListener);

        this.radio(this.popEvent).unsubscribe(this.boxPopListener);
        this.radio(this.popEvent).unsubscribe(this.recorderPopListener);

        this.deck.disappear();
        this.recorder.disappear();

        this.swipeTarget.disappear();

        return this;
    };

});
