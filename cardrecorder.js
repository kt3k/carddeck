/**
 * cardrecorder.js v0.1
 * author: Yosiya Hinosawa ( @ktt3k )
 */

window.recorder = (function () {
    'use strict';

    var exports = function () {
        return new recorder();
    };

    var recorder = function () {
        this.reset();
    };

    exports.APP = 'card-recorder';

    var recorderPrototype = recorder.prototype = exports.prototype = {constructor: exports};

    recorderPrototype.resetSerial = function () {
        this.serial = (new Date()).getTime();
    };

    recorderPrototype.reset = function () {
        this.list = [];
        this.resetSerial();
    }

    recorderPrototype.record = function (symbol) {
        this.list.push(symbol);
    };

    recorderPrototype.pop = function () {
        this.list.pop();
    };

    recorderPrototype.serialize = function (symbol) {
        return JSON.stringify({
            serial: this.serial,
            list: this.list
        });
    };

    recorderPrototype.storeLocalStorage = function () {
        window.localStorage[exports.APP + this.serial] = this.serialize();
    };

    recorderPrototype.load = function (serial) {
        var json = JSON.parse(window.localStorage[exports.APP + serial]);
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

    return exports;
}());
