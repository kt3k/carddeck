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

window.card = (function () {
    'use strict';

    var card = function (args) {
        this.i = args.i;
        this.eventListener = args.eventListener;
        this.duration = args.duration || 0;

        this.div = window.div()
        .css({
            position: 'absolute',
            width: '62px',
            height: '100px',
            webkitTransitionDuration: this.duration + 'ms',
            webkitTransitionTimingFunction: 'ease-out',
            border: 'solid 1px white'
        })
        .setHue(args.color.hue)
        .setSat(args.color.sat)
        .setLum(args.color.lum)
        .setScale(0)
        .setX(110)
        .setY(380)
        .prependTo(document.body)
        .commit();

        this.div.dom.appendChild(window.imgPool.get('img/' + args.color.symbol + '_.png'));

        this.bindListener();
    };

    var pt = card.prototype;

    pt.appear = function () {
        this.div
        .transition()
        .duration(this.duration)
        .setScale(100)
        .setX(100 * this.i + 15)
        .setY(245)
        .transitionCommit();

        return this;
    };

    pt.shoot = function () {

        this.unbindListener();

        this.div
        .transition()
        .duration(this.duration)
        .setScale(0)
        .setX(110)
        .setY(150)
        .remove()
        .transitionCommitSync();
    };

    pt.disappear2 = function () {
        this.unbindListener();

        this.div
        .setScale(0)
        .addRot(Math.random() * 720 - 360)
        .commit()
        .transition()
        .duration(this.duration)
        .delay(1000 - this.duration)
        .remove()
        .transitionCommit();
    };

    pt.bindListener = function () {
        this.div.dom.addEventListener('click', this.eventListener, false);
    };

    pt.unbindListener = function () {
        this.div.dom.removeEventListener('click', this.eventListener, false);
    };

    var exports = function (args) {
        return new card(args);
    };

    pt.constructor = exports;

    exports.prototype = pt;

    return exports;
}());


window.swipee = window.div.branch(function (swipeePrototype, parent, decorators) {
    'use strict';

    swipeePrototype.init = function (targetDom, targetWidth, targetHeight, screenWidth, screenHeight, defaultColor) {
        this.targetHeight = targetHeight;
        this.targetWidth = targetWidth;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.defaultColor = defaultColor;

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
        .setColor(defaultColor)
        .commit()
        .appendTo(targetDom)
        .transition()
        .delay(500)
        .addY(-this.targetHeight)
        .transition()
        .duration(200)
        .transitionCommitSync()
        .transitionUnlock();

        this.dom.textContent = 'SWIPE HERE';
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

        var self = this;

        this.deck = [];

        this.opEvent = args.opEvent;

        this.dom = args.dom;

        this.radio = args.radio;

        var monoHook = function (n, cmd) {

            self.deck.push(new window.card({
                i: n,
                color: self.colorMap[cmd],
                duration: 300,
                eventListener: function () {
                    pop();
                },
                targetDom: self.dom
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
            self.deck.pop().disappear2();
        };

        this.machine = window.codonBox(['S', 'N', 'O', 'W'], 3, monoHook, codonHook);
        this.recorder = window.recorder();

        return this;
    };

    deckPrototype.appear = function () {
        var self = this;

        this.swipeTarget = new window.swipee().init(this.dom, 190, 80, 320, 414, this.colorMap.NONE);

        var swipe = {
            target: this.swipeTarget.dom,

            end: {
                up: function () {
                    self.recorder.record('S');
                    self.machine.command('S');
                },
                down: function () {
                    self.recorder.record('N');
                    self.machine.command('N');
                },
                left: function () {
                    self.recorder.record('O');
                    self.machine.command('O');
                },
                right: function () {
                    self.recorder.record('W');
                    self.machine.command('W');
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


        this.deck.forEach(function (card) {
            card.disappear2();
        });

        this.deck = [];

        this.swipeTarget.disappear();

        return this;
    };

});
