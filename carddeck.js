/**
 * carddeck.js 0.0.2
 * author: Yosiya Hinosawa ( @kt3k )
 * license: MIT-license ( http://kt3k.mit-license.org/ )
 * dependency: div.js@2.0
 */

window.imgPool = new ImagePool()
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
    };

    pt.disappear = function () {

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

    swipeePrototype.init = function (targetDom, targetWidth, targetHeight, screenWidth, screenHeight) {
        this.targetHeight = targetHeight;
        this.targetWidth = targetWidth;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;

        this
        .css({
            position: 'absolute',
            top: '0px',
            left: '0px',
            width: this.targetWidth + 'px',
            height: this.targetHeight + 'px',
            backgroundColor: 'gray',
            opacity: '0',
            lineHeight: this.targetHeight + 'px',
            textAlign: 'center',
            fontFamily: 'menlo, monospace',
            fontWeight: 'bold'
        })
        .setY(this.screenHeight)
        .setX((this.screenWidth - this.targetWidth) / 2)
        .setSat(0)
        .commit()
        .appendTo(targetDom)
        .transition()
        .css({opacity: 1})
        .transition()
        .addY(-this.targetHeight)
        .transition()
        .duration(200)
        .transitionCommitSync()
        .transitionUnlock();

        this.dom.textContent = 'SWIPE HERE';
    }
    .E(decorators.Chainable);

    swipeePrototype.fadeAwayAndRemove = function () {
        this
        .transition()
        .addY(this.targetHeight)
        .transition()
        .delay(400)
        .css({opacity: 0})
        .transition()
        .duration(1000)
        .remove()
        .transitionCommit();
    };

});


this.cardDeck = function (window) {
    'use strict';

    // --- module functions --- //

    var exports = function (signHook, dom) {

        var swipeTarget = null;

        var deck = [];

        var colorMap = {
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

        var monoHook = function (n, cmd) {

            var color = colorMap[cmd];

            var card = window.card({
                i: n,
                color: color,
                duration: 300,
                eventListener: function () {
                    pop();
                },
                targetDom: dom
            });

            deck.push(card);
            card.appear();

            swipeTarget.div
            .setHue(color.hue)
            .setSat(color.sat)
            .setLum(color.lum)
            .commit()
            .transition()
            .delay(400)
            .setHue(colorMap.NONE.hue)
            .setSat(colorMap.NONE.sat)
            .setLum(colorMap.NONE.lum)
            .transitionCommitSync()
            .transitionUnlock();
        };

        var codonHook = function (syms) {

            var prevDeck = deck;
            deck = [];

            window.elapsed(575)
            .then(function () {
                prevDeck.forEach(function (card) {
                    card.disappear({});
                });
            });

            window.elapsed(875)
            .then(function () {
                signHook(syms.join(''));
            });
        };

        var pop = function () {
            machine.pop();
            recorder.pop();
            deck.pop().disappear2();
        };

        var machine = window.ribosome = window.codonBox(['S', 'N', 'O', 'W'], 3, monoHook, codonHook);
        var recorder = window.rec = window.recorder();

        window.documentReady(function () {

            swipeTarget = new window.swipee().init(dom, 190, 80, 320, 414);

            var swipe = {
                target: swipeTarget.dom,

                end: {
                    up: function () {
                        recorder.record('S');
                        machine.command('S');
                    },
                    down: function () {
                        recorder.record('N');
                        machine.command('N');
                    },
                    left: function () {
                        recorder.record('O');
                        machine.command('O');
                    },
                    right: function () {
                        recorder.record('W');
                        machine.command('W');
                    }
                },

                progress: {
                    up: function () {
                        var color = colorMap.S;
                        swipeTarget.div.setHue(color.hue).setSat(color.sat).setLum(color.lum).commit();
                    },
                    down: function () {
                        var color = colorMap.N;
                        swipeTarget.div.setHue(color.hue).setSat(color.sat).setLum(color.lum).commit();
                    },
                    left: function () {
                        var color = colorMap.O;
                        swipeTarget.div.setHue(color.hue).setSat(color.sat).setLum(color.lum).commit();
                    },
                    right: function () {
                        var color = colorMap.W;
                        swipeTarget.div.setHue(color.hue).setSat(color.sat).setLum(color.lum).commit();
                    }
                }
            };

            window.swipe4(swipe);

            window.arrowkeys(swipe.end);
        });

        return { // return a deck object which only has 'clear method'
            clear: function () {
                window.arrowkeys.clear();
                window.swipe4.clear();


                deck.forEach(function (card) {
                    card.disappear2();
                });

                deck = [];

                swipeTarget.fadeAwayAndRemove();
            }
        };
    };

    return exports;

}(window);
