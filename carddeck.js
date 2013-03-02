/**
 * carddeck.js 0.0.2
 * author: kt3k
 * license: Copyrighted
 * dependency: div.js@1.0
 */

window.card = (function () {
    'use strict';

    var card = function (args) {
        this.i = args.i;
        this.eventListener = args.eventListener;

        this.div = window.div({
            position: 'absolute',
            width: '75px',
            height: '95px',
            webkitTransitionDuration: '300ms',
            webkitTransitionTimingFunction: 'ease-out',
            border: 'solid 1px white'
        });

        this.div.setHue(args.color.hue).setSat(args.color.sat).setLum(args.color.lum);

        this.div.setScale(0).setX(110).setY(380).commit();

        this.div.dom.wrapper = this;

        this.bindListener();

        document.body.insertBefore(this.div.dom, document.body.firstChild);
    };

    var pt = card.prototype;

    pt.appear = function () {
        var self = this;

        window.elapsed(10).then(function () {
            self.div.setScale(100).setX(100 * self.i + 15).setY(245).commit();
        });
    };

    pt.disappear = function (args) {
        var div = this.div;
        var dom = div.dom;

        var delay = args.delay || 0;

        this.unbindListener();

        window.elapsed(delay).then(function () {
            div.setScale(0).setX(110).setY(150).commit();
        });

        window.elapsed(1000 + args.delay).then(function () {
            delete dom.wrapper;
            dom.parentElement.removeChild(dom);
        });
    };

    pt.disappear2 = function () {
        var dom = this.div.dom;

        this.unbindListener();

        this.div.setScale(0);
        this.div.addRot(Math.random() * 720 - 360);
        this.div.commit();

        window.elapsed(1000).then(function () {
            delete dom.wrapper;
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

    pt.contructor = exports;

    exports.prototype = pt;

    return exports;
}());



this.cardDeck = function (window) {
    'use strict';

    // --- module functions --- //

    var call = function (func) {
        return typeof func === 'function' ? func() : undefined;
    };

    var createSwipeTarget = function () {
        window.div.sat = 0;
        var div = window.div({
            position: 'absolute',
            top: '0px',
            left: '0px',
            width: '250px',
            height: '120px',
            backgroundColor: 'gray',
            border: 'solid 1px white',
            opacity: '0',
            webkitTransitionDuration: '500ms'
        });

        div.setY(580);
        div.setX(25);
        div.commit();

        document.body.appendChild(div.dom);

        window.elapsed(0).then(function () {
            div.css({opacity: 1}).commit();

            window.elapsed(500).then(function () {
                div.addY(-200);
                div.commit();

                window.elapsed(0).then(function () {
                    div.css({webkitTransitionDuration: '200ms'}).commit();
                });
            });
        });

        return div;
    };

    var exports = function (signHooks) {

        var swipeTarget = null;

        var deck = [];

        var colorMap = {
            S: {
                hue: 60,
                sat: 80,
                lum: 50
            },
            N: {
                hue: 120,
                sat: 40,
                lum: 50
            },
            O: {
                hue: 180,
                sat: 80,
                lum: 50
            },
            W: {
                hue: 220,
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
                eventListener: function () {
                    pop();
                }
            });

            deck.push(card);
            card.appear();

            swipeTarget.setHue(color.hue).setSat(color.sat).setLum(color.lum).commit();

            window.elapsed(400).then(function () {
                var color = colorMap.NONE;
                swipeTarget.setHue(color.hue).setSat(color.sat).setLum(color.lum).commit();
            });
        };

        var codonHook = function (syms) {

            var prevDeck = deck;
            deck = [];

            prevDeck.forEach(function (card) {
                card.disappear({delay: 575});
            });

            window.elapsed(875).then(function () {
                proteinHook(syms);
            });
        };

        var proteinHook = function (acids) {
            call(signHooks[acids.join('')]);
        };

        var pop = function () {
            machine.pop();
            deck.pop().disappear2();
        };

        var machine = window.codonBox(['S', 'N', 'O', 'W'], 3, monoHook, codonHook);

        window.documentReady(function () {

            swipeTarget = createSwipeTarget();

            var swipe = {
                target: swipeTarget.dom,
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
                        swipeTarget.css({backgroundColor: colorMap.S});
                    },
                    down: function () {
                        swipeTarget.css({backgroundColor: colorMap.N});
                    },
                    left: function () {
                        swipeTarget.css({backgroundColor: colorMap.O});
                    },
                    right: function () {
                        swipeTarget.css({backgroundColor: colorMap.W});
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

                swipeTarget.css({webkitTransitionDuration: '500ms'}).addY(200);
                swipeTarget.commit();

                window.elapsed(400).then(function () {
                    swipeTarget.css({webkitTransitionDuration: '500ms', opacity: 0}).commit();

                    window.elapsed(1000).then(function () {
                        swipeTarget.dom.parentElement.removeChild(swipeTarget.dom);
                    });
                });
            }
        };
    };

    return exports;

}(window);
