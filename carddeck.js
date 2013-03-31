/**
 * carddeck.js 0.0.2
 * author: Yosiya Hinosawa ( @kt3k )
 * license: MIT-license ( http://kt3k.mit-license.org/ )
 * dependency: div.js@2.0
 */

window.card = (function () {
    'use strict';

    var card = function (args) {
        this.i = args.i;
        this.eventListener = args.eventListener;
        this.duration = args.duration || 0;

        this.div = window.div()
        .css({
            position: 'absolute',
            width: '75px',
            height: '95px',
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
        .commit();

        this.bindListener();

        document.body.insertBefore(this.div.dom, document.body.firstChild);
    };

    var pt = card.prototype;

    pt.appear = function () {
        var self = this;

        this.div
        .transition()
        .duration(this.duration)
        .setScale(100)
        .setX(100 * self.i + 15)
        .setY(245)
        .transitionCommit();
    };

    pt.disappear = function (args) {
        var div = this.div;

        var delay = args.delay || 0;

        this.unbindListener();

        this.div
        .transition()
        .duration(this.duration)
        .delay(delay)
        .setScale(0)
        .setX(110)
        .setY(150)
        .transitionCommit();

        window.elapsed(this.duration + delay).then(function () {
            div.remove();
        });
    };

    pt.disappear2 = function () {
        var dom = this.div.dom;

        this.unbindListener();

        this.div
        .setScale(0)
        .addRot(Math.random() * 720 - 360)
        .commit();

        window.elapsed(1000).then(function () {
            dom.parentElement.removeChild(dom);
        });
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


window.swipee = (function () {
    'use strict';

    var swipee = function () {
        this.div = window.div()
        .css({
            position: 'absolute',
            top: '0px',
            left: '0px',
            width: '250px',
            height: '120px',
            backgroundColor: 'gray',
            border: 'solid 1px white',
            opacity: '0'
        })
        .setY(580)
        .setX(25)
        .setSat(0)
        .commit()
        .appendTo(document.body)
        .transition()
        .css({opacity: 1})
        .transition()
        .addY(-200)
        .transition()
        .duration(200)
        .transitionCommit();
    };

    var pt = swipee.prototype;

    pt.fadeAwayAndRemove = function () {
        this.div
        .transition()
        .addY(200)
        .transition()
        .delay(400)
        .css({opacity: 0})
        .transitionCommit();

        var that = this;

        setTimeout(function () {
            that.remove;
        }, 1000);
    };

    pt.remove = function () {
        this.div.remove();
    };

    var exports = function (args) {
        return new swipee(args);
    };

    pt.constructor = exports;

    exports.prototype = pt;

    return exports;
}());


this.cardDeck = function (window) {
    'use strict';

    // --- module functions --- //

    var exports = function (signHook) {

        var swipeTarget = null;

        var deck = [];

        var colorMap = {
            S: {
                hue: Math.floor(Math.random() * 360),
                sat: 80,
                lum: 50
            },
            N: {
                hue: Math.floor(Math.random() * 360),
                sat: 40,
                lum: 50
            },
            O: {
                hue: Math.floor(Math.random() * 360),
                sat: 80,
                lum: 50
            },
            W: {
                hue: Math.floor(Math.random() * 360),
                sat: 80,
                lum: 50
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
                }
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
            .transitionCommit();
        };

        var codonHook = function (syms) {

            var prevDeck = deck;
            deck = [];

            prevDeck.forEach(function (card) {
                card.disappear({delay: 575});
            });

            window.elapsed(875).then(function () {
                signHook(syms.join(''));
            });
        };

        var pop = function () {
            machine.pop();
            deck.pop().disappear2();
        };

        var machine = window.codonBox(['S', 'N', 'O', 'W'], 3, monoHook, codonHook);

        window.documentReady(function () {

            swipeTarget = new window.swipee();

            var swipe = {
                target: swipeTarget.div.dom,

                end: {
                    up: function () {
                        machine.command('S');
                    },
                    down: function () {
                        machine.command('N');
                    },
                    left: function () {
                        machine.command('O');
                    },
                    right: function () {
                        machine.command('W');
                    }
                },

                progress: {
                    up: function () {
                        swipeTarget.div.css({backgroundColor: colorMap.S});
                    },
                    down: function () {
                        swipeTarget.div.css({backgroundColor: colorMap.N});
                    },
                    left: function () {
                        swipeTarget.div.css({backgroundColor: colorMap.O});
                    },
                    right: function () {
                        swipeTarget.div.css({backgroundColor: colorMap.W});
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
