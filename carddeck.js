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
        this.radio = args.radio;

        this.dom = args.dom;

        this.deck = [];

        var self = this;

        var monoHook = function (n, cmd) {

            self.deck.push(window.card().init({
                i: n,
                color: self.colorMap[cmd],
                duration: 300,
                eventListener: pop,
                targetDom: self.dom,
                screenWidth: self.screenWidth,
                screenHeight: self.screenHeight,
                swipeeHeight: self.swipeeHeight,
                deckHeight: self.deckHeight
            }).appear());

            self.swipeTarget.lightUp(self.colorMap[cmd]);
        };

        var codonHook = function (syms) {

            var prevDeck = self.deck;
            self.deck = [];

            window.elapsed(575)
            .then(function () {
                prevDeck.forEach(function (card) {
                    card.shoot();
                });
            });

            window.elapsed(875)
            .then(function () {
                self.radio(self.opEvent).broadcast({codon: syms.join('')});
            });
        };

        var pop = function () {
            self.machine.pop();
            self.recorder.pop();
            self.deck.pop().disappear();
        };

        var machine = this.machine = window.ribosome = window.codonBox(['S', 'N', 'O', 'W'], 3, monoHook, codonHook);
        this.boxCmdListener = function (data) {
            machine.command(data.cmd);
        }
        this.radio(this.baseEvent).subscribe(this.boxCmdListener);

        var recorder = this.recorder = window.rec = window.recorder();
        this.recorderCmdListener = function (data) {
            recorder.record(data.cmd)
        }
        this.radio(this.baseEvent).subscribe(this.recorderCmdListener);

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

        this.deck.forEach(function (card) {
            card.disappear();
        });

        this.deck = [];

        this.swipeTarget.disappear();

        return this;
    };

});
