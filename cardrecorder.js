/**
 * cardrecorder.js v0.1
 * author: Yosiya Hinosawa ( @ktt3k )
 */

window.recorder = Object.branch(function (recorderPrototype, parent, decorators) {
    'use strict';

    var APP = 'card-recorder';

    recorderPrototype.constructor = function () {
        this.reset();
    };

    recorderPrototype.init = function (args) {
        this.popEvent = args.popEvent;
        this.baseEvent = args.baseEvent;

        this.__subscription__ = {
            pop: this.popEvent,
            record: this.baseEvent
        };
    }
    .E(pubsub.InitSubscription)
    .E(decorators.Chainable);

    recorderPrototype.appear = function () {
    }
    .E(pubsub.Subscribe)
    .E(decorators.Chainable);

    recorderPrototype.disappear = function () {
    }
    .E(pubsub.Unsubscribe)
    .E(decorators.Chainable);

    recorderPrototype.resetSerial = function () {
        this.serial = (new Date()).getTime();
    };

    recorderPrototype.reset = function () {
        this.list = [];
        this.resetSerial();
    };

    recorderPrototype.record = function (data) {
        this.list.push(data.cmd);
    };

    recorderPrototype.pop = function () {
        this.list.pop();
    };

    recorderPrototype.serialize = function () {
        return JSON.stringify({
            serial: this.serial,
            list: this.list
        });
    };

    recorderPrototype.storeLocalStorage = function () {
        window.localStorage[APP + this.serial] = this.serialize();
    };

    recorderPrototype.load = function (serial) {
        var json = JSON.parse(window.localStorage[APP + serial]);
        this.serial = json.serial;
        this.list = json.list;
    };

    recorderPrototype.replayWith = function (player, interval) {
        var replayList = this.list.slice(0);

        this.replayStop();

        var self = this;

        this.__replaying__ = true;

        var replay = function () {
            if (replayList.length === 0) {
                return;
            }
            player(replayList.shift());

            self.replayTimer = setTimeout(replay, replayList.length % 3 === 0 ? interval : 75);
        };

        replay();
    };

    recorderPrototype.replayStop = function () {
        window.clearInterval(this.replayTimer);
    };
});
